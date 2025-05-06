from flask import Flask, request, jsonify
from predict_tags import TagPredictor
import os
import random

app = Flask(__name__)

# Đường dẫn đến các file cần thiết
model_path = "tag_model/model.h5"
vectorizer_path = "tag_model/vectorizer.joblib"
tags_path = "tag_model/tags_info.json"

# Khởi tạo predictor
print("Đang khởi tạo TagPredictor...")
predictor = TagPredictor(model_path, vectorizer_path, tags_path)
print("Đã khởi tạo xong TagPredictor")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({
                'status': 'error',
                'message': 'Văn bản không được để trống'
            }), 400
            
        results = predictor.predict_tags(text)
        
        return jsonify({
            'status': 'success',
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/predict-from-health', methods=['POST'])
def predict_from_health():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        health_info = data.get('healthInfo', '')
        illness = data.get('illness', 'none')
        
        if not health_info:
            return jsonify({
                'status': 'error',
                'message': 'Thông tin sức khỏe không được để trống'
            }), 400
        
        # Chuyển đổi health_info thành text để predict
        text = f"Health Information: {health_info}, Illness: {illness}"
        print(f"Processing text: {text}")
        
        # Sử dụng predictor để dự đoán tags từ text
        tag_results = predictor.predict_tags(text)
        print(f"Prediction results: {tag_results}")
        
        # Xử lý kết quả để chia thành recommendTags và excludeTags
        recommended_tags = []
        exclude_tags = []
        
        # Sắp xếp kết quả theo xác suất giảm dần
        sorted_results = sorted(tag_results, key=lambda x: x['probability'], reverse=True)
        
        # Xử lý đặc biệt cho illness
        has_chest_problem = illness and any('chest' in i.lower() for i in illness.split(','))
        has_leg_problem = illness and any('leg' in i.lower() for i in illness.split(','))
        
        # Các tag loại trừ dựa trên bệnh lý
        if has_chest_problem:
            chest_exclude = ['Chest', 'HIIT', 'Push-ups']
            for tag in chest_exclude:
                if tag not in exclude_tags:
                    exclude_tags.append(tag)
                    
        if has_leg_problem:
            leg_exclude = ['Quads', 'Hamstrings', 'Calves', 'Running', 'Leg Day']
            for tag in leg_exclude:
                if tag not in exclude_tags:
                    exclude_tags.append(tag)
        
        # Lấy top tags có xác suất cao nhất cho recommendTags
        for item in sorted_results:
            tag = item['tag']
            # Không thêm vào recommended nếu đã trong exclude
            if tag in exclude_tags:
                continue
                
            if len(recommended_tags) < 3:
                recommended_tags.append(tag)
        
        # Đảm bảo có ít nhất 3 recommended tags
        if len(recommended_tags) < 3:
            default_tags = ['Cardio', 'Strength Training', 'Flexibility']
            for tag in default_tags:
                if tag not in recommended_tags and tag not in exclude_tags and len(recommended_tags) < 3:
                    recommended_tags.append(tag)
        
        # Giới hạn số lượng tags
        recommended_tags = recommended_tags[:3]
        exclude_tags = exclude_tags[:5]
        
        response_data = {
            'status': 'success',
            'data': {
                'recommendTags': recommended_tags,
                'excludeTags': exclude_tags
            }
        }
        print(f"Returning response: {response_data}")
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in predict_from_health: {str(e)}")
        print(f"Error details: {error_details}")
        
        # Sử dụng fallback nếu có lỗi
        try:
            # Fallback - sử dụng logic đơn giản thay vì model
            recommended_tags = []
            exclude_tags = []
            
            # Phân tích illness để xác định tags
            if illness and illness.lower() != 'none':
                illnesses = [i.strip().lower() for i in illness.split(',')]
                
                # Xử lý đau ngực
                if any('chest' in ill for ill in illnesses):
                    exclude_tags.extend(['Chest', 'HIIT', 'Heavy Lifting'])
                    recommended_tags.extend(['Core', 'Back', 'Low Intensity'])
                
                # Xử lý đau chân
                if any('leg' in ill for ill in illnesses):
                    exclude_tags.extend(['Leg Day', 'Quads', 'Calves', 'Running'])
                    recommended_tags.extend(['Upper Body', 'Stretching', 'Mobility'])
                
                # Xử lý đau tay
                if any('hand' in ill for ill in illnesses or 'arm' in ill for ill in illnesses):
                    exclude_tags.extend(['Push-ups', 'Pull-ups', 'Biceps', 'Triceps'])
                    recommended_tags.extend(['Core', 'Lower Body', 'Legs'])
            
            # Xác định experience level từ health_info
            if 'beginner' in health_info.lower():
                recommended_tags.append('Beginner')
            elif 'intermediate' in health_info.lower():
                recommended_tags.append('Intermediate')
            elif 'expert' in health_info.lower() or 'advanced' in health_info.lower():
                recommended_tags.append('Expert')
            else:
                # Mặc định là beginner nếu không xác định được
                recommended_tags.append('Beginner')
                
            # Đảm bảo có đủ recommened tags
            if len(recommended_tags) < 3:
                default_tags = ['Cardio', 'Strength Training', 'Flexibility', 'Mobility', 'Balance']
                for tag in default_tags:
                    if tag not in recommended_tags and len(recommended_tags) < 3:
                        recommended_tags.append(tag)
            
            # Loại bỏ trùng lặp
            recommended_tags = list(dict.fromkeys(recommended_tags))[:3]  # Giữ tối đa 3 tags
            exclude_tags = list(dict.fromkeys(exclude_tags))[:5]  # Giữ tối đa 5 tags
            
            response_data = {
                'status': 'success',
                'data': {
                    'recommendTags': recommended_tags,
                    'excludeTags': exclude_tags
                }
            }
            print(f"Returning fallback response: {response_data}")
            return jsonify(response_data)
        except Exception as fallback_error:
            return jsonify({
                'status': 'error',
                'message': f"Original error: {str(e)}. Fallback error: {str(fallback_error)}",
                'details': error_details
            }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'API is running'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 