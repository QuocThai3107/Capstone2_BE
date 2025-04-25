# Tag Recommendation API

API này cung cấp các endpoint để dự đoán tags dựa trên văn bản hoặc thông tin sức khỏe của người dùng.

## Cài đặt

1. Cài đặt các dependencies:

```bash
npm install @tensorflow/tfjs-node joblib
```

2. Đảm bảo các file model đã được đặt trong thư mục `tag_model`:
   - `model.keras` - model chính
   - `recommend_model.keras` - model gợi ý
   - `exclude_model.keras` - model loại trừ
   - `vectorizer.joblib` - bộ chuyển đổi text
   - `tags.json` và `tags_info.json` - thông tin tags
   - `mlb.joblib` - MultiLabelBinarizer

## API Endpoints

### 1. Dự đoán tags từ văn bản

```http
POST /tags/predict
Content-Type: application/json

{
  "text": "Tôi muốn tập bài tập giảm mỡ bụng và tăng cơ"
}
```

Response:
```json
{
  "recommendTags": ["Abs", "Fat Burn", "Core"],
  "excludeTags": ["Yoga", "Relaxation"]
}
```

### 2. Dự đoán tags từ thông tin sức khỏe

```http
POST /tags/predict-from-health
Content-Type: application/json

{
  "healthInfo": "Age:43,Gender:Female,Weight:63,Height:1.66,Max_BPM:173,Avg_BPM:132,Resting_BPM:72,Session_Duration:1.9,Calories_Burned:665,Experience_Level:Expert,Fat_Percentage:24,Water_Intake:2.7,Workout_Frequency:4,BMI:22.9",
  "illness": "none"
}
```

Response:
```json
{
  "recommendTags": ["Abs", "Fat Burn", "Core", "Strength Training"],
  "excludeTags": ["Yoga", "Relaxation"]
}
```

### 3. Dự đoán tags từ ID người dùng

```http
GET /tags/predict-for-user/123
```

Response:
```json
{
  "recommendTags": ["Abs", "Fat Burn", "Core", "Strength Training"],
  "excludeTags": ["Yoga", "Relaxation"]
}
```

### 4. Lấy thông tin tags

```http
GET /tags/info
```

Response:
```json
{
  "tags": ["Abs", "Back", "Beginner", "Biceps", "Breath Control", "Calves", "Cardio", "Chest", "Core", "Endurance", "Expert", "Fat Burn", "Full Body", "Glutes", "HIIT", "Hamstrings", "Intermediate", "Mobility", "Quads", "Relaxation", "Shoulders", "Strength Training", "Triceps", "Yoga"],
  "tagsInfo": {
    "Abs": "Bài tập cơ bụng",
    "Back": "Bài tập lưng",
    "Beginner": "Người mới bắt đầu",
    "Biceps": "Bài tập cơ tay trước",
    "Breath Control": "Kiểm soát hơi thở",
    "Calves": "Bài tập cơ bắp chân",
    "Cardio": "Bài tập tim mạch",
    "Chest": "Bài tập ngực",
    "Core": "Bài tập cơ trung tâm",
    "Endurance": "Bài tập sức bền",
    "Expert": "Người tập lâu năm",
    "Fat Burn": "Bài tập đốt mỡ",
    "Full Body": "Bài tập toàn thân",
    "Glutes": "Bài tập mông",
    "HIIT": "Bài tập cường độ cao ngắt quãng",
    "Hamstrings": "Bài tập cơ đùi sau",
    "Intermediate": "Người tập trung bình",
    "Mobility": "Bài tập linh hoạt",
    "Quads": "Bài tập cơ đùi trước",
    "Relaxation": "Bài tập thư giãn",
    "Shoulders": "Bài tập vai",
    "Strength Training": "Bài tập tăng sức mạnh",
    "Triceps": "Bài tập cơ tay sau",
    "Yoga": "Bài tập yoga"
  }
}
```

## Lưu ý

- Đảm bảo thư mục `tag_model` được copy vào thư mục build
- Cấu hình đường dẫn tới model files phù hợp với môi trường deploy
- Xử lý lỗi và logging phù hợp
- Cân nhắc sử dụng caching để tăng hiệu suất 