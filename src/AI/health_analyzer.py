import re
from typing import Dict, List, Tuple, TypedDict

class HealthAnalysisResult(TypedDict):
    recommended_tags: List[str]
    exclude_tags: List[str]
    message: str

class HealthAnalyzer:
    def __init__(self):
        # Định nghĩa các từ khóa cho workout tags
        self.workout_keywords = {
            'Chest': ['chest', 'pectoral', 'bench press', 'push up'],
            'Back': ['back', 'lat', 'pull up', 'row'],
            'Legs': ['leg', 'squat', 'deadlift', 'calf'],
            'Arms': ['arm', 'bicep', 'tricep', 'curl'],
            'Shoulders': ['shoulder', 'deltoid', 'press'],
            'Core': ['core', 'ab', 'plank', 'crunch'],
            'Cardio': ['cardio', 'run', 'jog', 'bike', 'swim'],
            'Flexibility': ['stretch', 'yoga', 'flexibility'],
            'High Intensity': ['hiit', 'high intensity', 'sprint', 'burpee'],
            'Low Impact': ['low impact', 'walk', 'swim', 'elliptical'],
            'Strength': ['strength', 'power', 'heavy', 'max'],
            'Endurance': ['endurance', 'long distance', 'marathon'],
            'Balance': ['balance', 'stability', 'coordination'],
            'Mobility': ['mobility', 'range of motion', 'joint health']
        }

        # Định nghĩa các từ khóa cho recovery tags
        self.recovery_keywords = {
            'Recovery': ['recovery', 'rest', 'ice', 'gentle stretching', 'physical therapy'],
            'Rest': ['rest', 'sleep', 'relax'],
            'Ice': ['ice', 'cold', 'compression'],
            'Gentle Stretching': ['gentle stretching', 'light stretch', 'mobility'],
            'Physical Therapy': ['physical therapy', 'rehab', 'rehabilitation']
        }

        # Định nghĩa các từ khóa cho health info tags
        self.health_info_keywords = {
            'Weight Loss': ['slim', 'weight loss', 'lose weight', 'diet'],
            'Weight Gain': ['gain weight', 'bulk', 'muscle mass'],
            'Maintenance': ['maintain', 'normal', 'healthy'],
            'Muscle Building': ['muscle', 'strength', 'hypertrophy'],
            'Fat Loss': ['fat loss', 'lean', 'cut'],
            'Endurance': ['endurance', 'stamina', 'cardio'],
            'Flexibility': ['flexibility', 'mobility', 'stretch'],
            'Rehabilitation': ['rehab', 'recovery', 'injury'],
            'Sports Specific': ['sport', 'athlete', 'performance'],
            'General Fitness': ['fitness', 'health', 'wellness'],
            'Normal Diet': ['normal diet', 'balanced', 'healthy eating'],
            'Special Diet': ['special diet', 'restricted', 'allergy']
        }

        # Định nghĩa các từ khóa cho illness tags
        self.illness_keywords = {
            'Back Pain': ['back pain', 'spinal', 'disc'],
            'Knee Pain': ['knee pain', 'patella', 'meniscus'],
            'Shoulder Pain': ['shoulder pain', 'rotator cuff', 'impingement'],
            'Neck Pain': ['neck pain', 'cervical', 'whiplash'],
            'Chest Pain': ['chest pain', 'heart', 'cardiac'],
            'Joint Pain': ['joint pain', 'arthritis', 'rheumatoid'],
            'Muscle Strain': ['muscle strain', 'pull', 'tear'],
            'Tendonitis': ['tendonitis', 'tendon', 'inflammation'],
            'Sprain': ['sprain', 'ligament', 'twist'],
            'Fracture': ['fracture', 'break', 'bone'],
            'Chronic Pain': ['chronic pain', 'long term', 'persistent'],
            'Post-Surgery': ['post surgery', 'recovery', 'operation'],
            'Respiratory': ['respiratory', 'lung', 'breathing'],
            'Cardiovascular': ['cardiovascular', 'heart', 'blood pressure'],
            'Diabetes': ['diabetes', 'blood sugar', 'insulin'],
            'Hypertension': ['hypertension', 'high blood pressure'],
            'Osteoporosis': ['osteoporosis', 'bone density', 'fragile bones'],
            'Obesity': ['obesity', 'overweight', 'bmi'],
            'Arthritis': ['arthritis', 'joint inflammation', 'rheumatoid'],
            'Asthma': ['asthma', 'breathing difficulty', 'respiratory']
        }

        # Định nghĩa các tag cần loại trừ dựa trên bệnh tật
        self.exclude_tags = {
            'Back Pain': ['Back', 'Deadlift', 'Squat', 'High Intensity'],
            'Knee Pain': ['Legs', 'Squat', 'High Intensity', 'Jump'],
            'Shoulder Pain': ['Shoulders', 'Push up', 'Bench press', 'High Intensity'],
            'Neck Pain': ['Neck', 'High Intensity', 'Heavy lifting'],
            'Chest Pain': ['Chest', 'High Intensity', 'Cardio', 'HIIT'],
            'Joint Pain': ['High Intensity', 'Heavy lifting', 'Impact'],
            'Muscle Strain': ['High Intensity', 'Heavy lifting', 'Impact'],
            'Tendonitis': ['High Intensity', 'Heavy lifting', 'Repetitive'],
            'Sprain': ['High Intensity', 'Impact', 'Heavy lifting'],
            'Fracture': ['High Intensity', 'Impact', 'Heavy lifting'],
            'Chronic Pain': ['High Intensity', 'Impact', 'Heavy lifting'],
            'Post-Surgery': ['High Intensity', 'Impact', 'Heavy lifting'],
            'Respiratory': ['High Intensity', 'Cardio', 'HIIT'],
            'Cardiovascular': ['High Intensity', 'HIIT', 'Heavy lifting'],
            'Diabetes': ['High Intensity', 'HIIT', 'Heavy lifting'],
            'Hypertension': ['High Intensity', 'HIIT', 'Heavy lifting'],
            'Osteoporosis': ['High Impact', 'Heavy lifting', 'Jump'],
            'Obesity': ['High Impact', 'Jump', 'High Intensity'],
            'Arthritis': ['High Impact', 'Heavy lifting', 'High Intensity'],
            'Asthma': ['High Intensity', 'HIIT', 'Cardio']
        }

    def clean_text(self, text: str) -> str:
        """Làm sạch văn bản."""
        if not text:
            return ""
        # Chuyển đổi thành chữ thường
        text = text.lower()
        # Loại bỏ các ký tự đặc biệt
        text = re.sub(r'[^\w\s]', ' ', text)
        # Loại bỏ khoảng trắng thừa
        text = ' '.join(text.split())
        return text

    def find_matching_tags(self, text: str, keyword_dict: Dict[str, List[str]]) -> List[str]:
        """Tìm các tag phù hợp với văn bản."""
        text = self.clean_text(text)
        matching_tags = []
        for tag, keywords in keyword_dict.items():
            if any(keyword in text for keyword in keywords):
                matching_tags.append(tag)
        return matching_tags

    def get_exclude_tags(self, illness: str) -> List[str]:
        """Lấy các tag cần loại trừ dựa trên bệnh tật."""
        illness = self.clean_text(illness)
        exclude_tags = []
        for condition, tags in self.exclude_tags.items():
            if condition.lower() in illness:
                exclude_tags.extend(tags)
        return list(set(exclude_tags))  # Loại bỏ các tag trùng lặp

    def analyze_health_info(self, health_info: str, illness: str) -> HealthAnalysisResult:
        """Phân tích thông tin sức khỏe và bệnh tật."""
        try:
            # Tìm các tag phù hợp
            workout_tags = self.find_matching_tags(health_info + " " + illness, self.workout_keywords)
            recovery_tags = self.find_matching_tags(health_info + " " + illness, self.recovery_keywords)
            health_info_tags = self.find_matching_tags(health_info, self.health_info_keywords)
            illness_tags = self.find_matching_tags(illness, self.illness_keywords)
            
            # Lấy các tag cần loại trừ
            exclude_tags = self.get_exclude_tags(illness)
            
            # Loại bỏ các tag trùng lặp
            workout_tags = list(set(workout_tags))
            recovery_tags = list(set(recovery_tags))
            health_info_tags = list(set(health_info_tags))
            illness_tags = list(set(illness_tags))
            exclude_tags = list(set(exclude_tags))

            # Kết hợp tất cả các tag được đề xuất
            recommended_tags = list(set(workout_tags + recovery_tags + health_info_tags + illness_tags))

            return {
                "recommended_tags": recommended_tags,
                "exclude_tags": exclude_tags,
                "message": "Successfully analyzed health information"
            }
        except Exception as e:
            return {
                "recommended_tags": [],
                "exclude_tags": [],
                "message": f"Error analyzing health information: {str(e)}"
            } 