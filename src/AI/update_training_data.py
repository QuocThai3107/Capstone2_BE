import json
import os
import shutil
import requests
from generate_training_data import generate_training_data, TAG_GROUPS, HEALTH_CONDITIONS
from datetime import datetime

def update_tag_groups():
    """
    Cập nhật TAG_GROUPS dựa trên danh sách tags mới nhất từ database
    """
    # Lấy danh sách tags từ API
    try:
        response = requests.get('http://localhost:3000/exercise-post-tag/tag')
        if response.status_code == 200:
            tags = response.json()
            valid_tags = [tag['tag_name'] for tag in tags]
            
            # Cập nhật file tags_info.json
            tags_info = {
                'valid_tags': valid_tags,
                'last_updated': datetime.now().isoformat(),
                'required_tags': {
                    'Workout Type': ['Yoga', 'Cardio', 'HIIT', 'Strength Training'],
                    'Difficulty': ['Beginner', 'Intermediate', 'Expert'],
                    'Training Focus': ['Fat Burn', 'Relaxation', 'Breath Control', 'Endurance', 'Mobility', 'Full Body']
                }
            }
            
            # Đảm bảo thư mục tag_model tồn tại
            os.makedirs('tag_model', exist_ok=True)
            
            # Lưu vào file tags_info.json
            with open('tag_model/tags_info.json', 'w', encoding='utf-8') as f:
                json.dump(tags_info, f, ensure_ascii=False, indent=2)
            print("Đã cập nhật file tags_info.json")
            
        else:
            print("Không thể lấy tags từ API. Sử dụng danh sách tags mặc định.")
            valid_tags = [
                "Abs", "Back", "Beginner", "Biceps", "Breath Control", "Calves", "Cardio", 
                "Chest", "Core", "Endurance", "Expert", "Fat Burn", "Full Body", "Glutes", 
                "HIIT", "Hamstrings", "Intermediate", "Mobility", "Quads", "Relaxation", 
                "Shoulders", "Strength Training", "Triceps", "Yoga"
            ]
    except Exception as e:
        print(f"Lỗi khi lấy tags từ API: {str(e)}. Sử dụng danh sách tags mặc định.")
        valid_tags = [
            "Abs", "Back", "Beginner", "Biceps", "Breath Control", "Calves", "Cardio", 
            "Chest", "Core", "Endurance", "Expert", "Fat Burn", "Full Body", "Glutes", 
            "HIIT", "Hamstrings", "Intermediate", "Mobility", "Quads", "Relaxation", 
            "Shoulders", "Strength Training", "Triceps", "Yoga"
        ]
    
    # Phân loại tags theo nhóm
    updated_tag_groups = {
        'Workout Type': [],
        'Difficulty': [],
        'Muscle Group': [],
        'Training Focus': []
    }
    
    # Phân loại tags
    for tag in valid_tags:
        if tag in ['Yoga', 'Cardio', 'HIIT', 'Strength Training']:
            updated_tag_groups['Workout Type'].append(tag)
        elif tag in ['Beginner', 'Intermediate', 'Expert']:
            updated_tag_groups['Difficulty'].append(tag)
        elif tag in ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
                    'Abs', 'Core', 'Glutes', 'Quads', 'Hamstrings', 'Calves']:
            updated_tag_groups['Muscle Group'].append(tag)
        elif tag in ['Fat Burn', 'Relaxation', 'Breath Control', 
                    'Endurance', 'Mobility', 'Full Body']:
            updated_tag_groups['Training Focus'].append(tag)
    
    # Cập nhật TAG_GROUPS
    global TAG_GROUPS
    TAG_GROUPS = updated_tag_groups
    
    print("Đã cập nhật TAG_GROUPS:")
    for group, tags in TAG_GROUPS.items():
        print(f"- {group}: {tags}")
    
    return TAG_GROUPS

def clear_old_data():
    """
    Xóa dữ liệu training cũ
    """
    # Xóa file training data cũ
    if os.path.exists('src/AI/training_data.json'):
        os.remove('src/AI/training_data.json')
        print("Đã xóa file training_data.json cũ")
    
    # Xóa thư mục model cũ
    if os.path.exists('tag_model'):
        shutil.rmtree('tag_model')
        print("Đã xóa thư mục tag_model cũ")

def main():
    # Cập nhật TAG_GROUPS
    update_tag_groups()
    
    # Xóa dữ liệu cũ
    clear_old_data()
    
    # Tạo dữ liệu mới
    print("\nĐang tạo dữ liệu mới...")
    data = generate_training_data()
    
    # Lưu dữ liệu mới
    with open('src/AI/training_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Đã tạo {len(data)} mẫu dữ liệu training mới")
    print("Dữ liệu đã được lưu vào file src/AI/training_data.json")
    
    # Train model mới
    print("\nĐang train model mới...")
    os.system('python src/AI/run_training_v5.py')

if __name__ == "__main__":
    main() 