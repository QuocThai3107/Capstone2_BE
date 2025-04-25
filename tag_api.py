from flask import Flask, request, jsonify
from predict_tags import TagPredictor
import os

app = Flask(__name__)

# Khởi tạo predictor
model_path = "tag_model/model.h5"
vectorizer_path = "tag_model/vectorizer.joblib"
tags_path = "tag_model/tags.json"

predictor = TagPredictor(model_path, vectorizer_path, tags_path)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 