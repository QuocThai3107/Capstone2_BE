import json
import random
from typing import List, Dict

# Định nghĩa các nhóm tag
TAG_GROUPS = {
    'Workout Type': ['Yoga', 'Cardio', 'HIIT', 'Strength Training'],
    'Difficulty': ['Beginner', 'Intermediate', 'Expert'],
    'Muscle Group': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
                    'Abs', 'Core', 'Glutes', 'Quads', 'Hamstrings', 'Calves'],
    'Training Focus': ['Fat Burn', 'Relaxation', 'Breath Control', 
                      'Endurance', 'Mobility', 'Full Body']
}

# Mapping giữa tình trạng sức khỏe và các tag cần tránh
HEALTH_CONDITIONS = {
    'none': {
        'Workout Type': [],
        'Muscle Group': [],
        'Training Focus': []
    },
    'knee_pain': {
        'Workout Type': ['HIIT'],
        'Muscle Group': ['Quads', 'Hamstrings'],
        'Training Focus': ['Fat Burn']
    },
    'shoulder_injury': {
        'Workout Type': ['Strength Training'],
        'Muscle Group': ['Shoulders', 'Chest', 'Back'],
        'Training Focus': ['Full Body']
    },
    'back_pain': {
        'Workout Type': ['Strength Training', 'HIIT'],
        'Muscle Group': ['Back', 'Core'],
        'Training Focus': ['Full Body']
    },
    'wrist_injury': {
        'Workout Type': ['Yoga', 'Strength Training'],
        'Muscle Group': ['Biceps', 'Triceps'],
        'Training Focus': ['Mobility']
    },
    'ankle_sprain': {
        'Workout Type': ['HIIT', 'Cardio'],
        'Muscle Group': ['Calves'],
        'Training Focus': ['Endurance']
    },
    'asthma': {
        'Workout Type': ['HIIT', 'Cardio'],
        'Muscle Group': [],
        'Training Focus': ['Fat Burn', 'Endurance']
    }
}

def generate_health_info() -> Dict[str, str]:
    age = random.randint(20, 50)
    gender = random.choice(['Male', 'Female'])
    weight = random.randint(50, 90)
    height = round(random.uniform(1.5, 1.9), 2)
    max_bpm = random.randint(170, 190)
    avg_bpm = random.randint(130, 160)
    resting_bpm = random.randint(60, 80)
    session_duration = round(random.uniform(1, 2), 1)
    calories_burned = random.randint(400, 900)
    experience_level = random.choice(['Beginner', 'Intermediate', 'Expert'])
    fat_percentage = random.randint(12, 25)
    water_intake = round(random.uniform(2, 3), 1)
    workout_frequency = random.randint(3, 5)
    bmi = round(weight / (height * height), 1)
    
    return {
        'Age': str(age),
        'Gender': gender,
        'Weight': str(weight),
        'Height': str(height),
        'Max_BPM': str(max_bpm),
        'Avg_BPM': str(avg_bpm),
        'Resting_BPM': str(resting_bpm),
        'Session_Duration': str(session_duration),
        'Calories_Burned': str(calories_burned),
        'Experience_Level': experience_level,
        'Fat_Percentage': str(fat_percentage),
        'Water_Intake': str(water_intake),
        'Workout_Frequency': str(workout_frequency),
        'BMI': str(bmi)
    }

def format_health_info(info: Dict[str, str]) -> str:
    return ','.join([f"{k}:{v}" for k, v in info.items()])

def get_recommended_tags(health_info: Dict[str, str], illness: str) -> List[str]:
    level = health_info['Experience_Level']
    tags = []
    
    # Thêm Workout Type phù hợp
    if illness == 'none':
        if level == 'Beginner':
            tags.append(random.choice(['Yoga', 'Cardio']))
        elif level == 'Intermediate':
            tags.append(random.choice(['Yoga', 'Cardio', 'Strength Training']))
        else:
            tags.append(random.choice(['HIIT', 'Strength Training']))
    else:
        # Chọn workout type an toàn cho illness
        safe_workouts = [w for w in TAG_GROUPS['Workout Type'] 
                        if w not in HEALTH_CONDITIONS[illness].get('Workout Type', [])]
        if safe_workouts:
            tags.append(random.choice(safe_workouts))
    
    # Thêm Difficulty
    tags.append(level)
    
    # Thêm Muscle Group
    if illness == 'none':
        # Chọn ngẫu nhiên 2-3 nhóm cơ
        num_muscles = random.randint(2, 3)
        tags.extend(random.sample(TAG_GROUPS['Muscle Group'], num_muscles))
    else:
        # Chọn nhóm cơ an toàn
        safe_muscles = [m for m in TAG_GROUPS['Muscle Group'] 
                       if m not in HEALTH_CONDITIONS[illness].get('Muscle Group', [])]
        if safe_muscles:
            tags.extend(random.sample(safe_muscles, min(2, len(safe_muscles))))
    
    # Thêm Training Focus
    if illness == 'none':
        # Chọn ngẫu nhiên 1-2 mục tiêu
        num_focus = random.randint(1, 2)
        tags.extend(random.sample(TAG_GROUPS['Training Focus'], num_focus))
    else:
        # Chọn mục tiêu phù hợp
        safe_focus = [f for f in TAG_GROUPS['Training Focus'] 
                     if f not in HEALTH_CONDITIONS[illness].get('Training Focus', [])]
        if safe_focus:
            tags.append(random.choice(safe_focus))
    
    return list(set(tags))  # Loại bỏ trùng lặp

def get_exclude_tags(health_info: Dict[str, str], illness: str, recommended_tags: List[str]) -> List[str]:
    exclude_tags = []
    
    # Thêm các tag cần tránh dựa trên tình trạng sức khỏe
    if illness in HEALTH_CONDITIONS:
        for group, tags in HEALTH_CONDITIONS[illness].items():
            exclude_tags.extend(tags)
    
    # Thêm các tag không phù hợp với trình độ
    level = health_info['Experience_Level']
    if level == 'Beginner':
        exclude_tags.extend(['Expert', 'HIIT'])
    elif level == 'Intermediate':
        exclude_tags.append('Expert')
    
    # Loại bỏ các tag đã được recommend
    exclude_tags = [tag for tag in exclude_tags if tag not in recommended_tags]
    
    # Nếu chưa đủ, thêm ngẫu nhiên từ các nhóm khác
    if len(exclude_tags) < 2:
        for group, tags in TAG_GROUPS.items():
            available = [t for t in tags if t not in recommended_tags and t not in exclude_tags]
            if available:
                exclude_tags.append(random.choice(available))
                if len(exclude_tags) >= 5:
                    break
    
    return exclude_tags[:5]  # Giới hạn 5 tag

def generate_training_data(num_samples: int = 2000) -> List[Dict]:
    training_data = []
    
    # Tăng số lượng mẫu cho các trường hợp hiếm
    illness_distribution = {
        'none': 0.3,  # Giảm tỷ lệ không có bệnh
        'knee_pain': 0.15,
        'shoulder_injury': 0.15,
        'back_pain': 0.15,
        'wrist_injury': 0.1,
        'ankle_sprain': 0.1,
        'asthma': 0.05
    }
    
    # Tạo dữ liệu theo phân phối
    for illness, ratio in illness_distribution.items():
        num_illness_samples = int(num_samples * ratio)
        for _ in range(num_illness_samples):
            # Tạo thông tin sức khỏe
            health_info = generate_health_info()
            
            # Điều chỉnh thông tin sức khỏe dựa trên illness
            if illness != 'none':
                health_info = adjust_health_info_for_illness(health_info, illness)
            
            # Lấy các tag được recommend và exclude
            recommended_tags = get_recommended_tags(health_info, illness)
            exclude_tags = get_exclude_tags(health_info, illness, recommended_tags)
            
            # Đảm bảo có ít nhất 3 tag recommend và 2 tag exclude
            while len(recommended_tags) < 3:
                additional_tag = random.choice(list(set(TAG_GROUPS['Training Focus']) - set(recommended_tags)))
                recommended_tags.append(additional_tag)
            
            while len(exclude_tags) < 2:
                additional_tag = random.choice(list(set(TAG_GROUPS['Muscle Group']) - set(recommended_tags) - set(exclude_tags)))
                exclude_tags.append(additional_tag)
            
            # Tạo mẫu dữ liệu
            sample = {
                'health_info': format_health_info(health_info),
                'illness': illness,
                'recommended_tags': list(set(recommended_tags)),  # Loại bỏ trùng lặp
                'exclude_tags': list(set(exclude_tags))  # Loại bỏ trùng lặp
            }
            
            training_data.append(sample)
    
    return training_data

def adjust_health_info_for_illness(health_info: Dict[str, str], illness: str) -> Dict[str, str]:
    """Điều chỉnh thông tin sức khỏe dựa trên illness"""
    adjusted_info = health_info.copy()
    
    if illness == 'knee_pain':
        # Giảm workout frequency và session duration
        adjusted_info['Workout_Frequency'] = str(random.randint(2, 3))
        adjusted_info['Session_Duration'] = str(round(random.uniform(0.5, 1.0), 1))
    elif illness == 'shoulder_injury':
        # Giảm max BPM và calories burned
        adjusted_info['Max_BPM'] = str(random.randint(150, 170))
        adjusted_info['Calories_Burned'] = str(random.randint(300, 500))
    elif illness == 'back_pain':
        # Giảm session duration và tăng resting BPM
        adjusted_info['Session_Duration'] = str(round(random.uniform(0.5, 1.0), 1))
        adjusted_info['Resting_BPM'] = str(random.randint(70, 85))
    elif illness == 'wrist_injury':
        # Giảm workout frequency và calories burned
        adjusted_info['Workout_Frequency'] = str(random.randint(2, 3))
        adjusted_info['Calories_Burned'] = str(random.randint(300, 500))
    elif illness == 'ankle_sprain':
        # Giảm session duration và max BPM
        adjusted_info['Session_Duration'] = str(round(random.uniform(0.5, 1.0), 1))
        adjusted_info['Max_BPM'] = str(random.randint(150, 170))
    elif illness == 'asthma':
        # Giảm max BPM và tăng resting BPM
        adjusted_info['Max_BPM'] = str(random.randint(150, 170))
        adjusted_info['Resting_BPM'] = str(random.randint(70, 85))
    
    return adjusted_info

def main():
    # Tạo dữ liệu mới
    data = generate_training_data()
    
    # Lưu dữ liệu
    with open('src/AI/training_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Đã tạo {len(data)} mẫu dữ liệu")

if __name__ == "__main__":
    main() 