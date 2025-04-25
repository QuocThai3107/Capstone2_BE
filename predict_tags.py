import tensorflow as tf
import numpy as np
import json
import joblib
import os

class TagPredictor:
    def __init__(self, model_path, vectorizer_path, tags_path):
        """Khởi tạo TagPredictor với đường dẫn đến các file cần thiết"""
        print(f"Đang tải mô hình từ {model_path}...")
        self.model = tf.keras.models.load_model(model_path, compile=False)
        
        print(f"Đang tải vectorizer từ {vectorizer_path}...")
        self.vectorizer = joblib.load(vectorizer_path)
        
        print(f"Đang tải danh sách tags từ {tags_path}...")
        with open(tags_path, 'r', encoding='utf-8') as f:
            tags_data = json.load(f)
            self.tags = tags_data["valid_tags"]
            
        print("Đã tải xong tất cả các thành phần cần thiết")
    
    def predict_tags(self, text, top_k=5):
        """Dự đoán tags cho văn bản đầu vào"""
        # Chuyển đổi văn bản thành vector
        text_vector = self.vectorizer.transform([text])
        
        # Chuyển đổi sparse matrix thành dense array
        text_vector_dense = text_vector.toarray()
        
        # Kiểm tra và điều chỉnh kích thước đầu vào
        expected_size = 1601  # Kích thước mong đợi của mô hình
        current_size = text_vector_dense.shape[1]
        
        if current_size < expected_size:
            # Thêm padding nếu cần
            padding = np.zeros((1, expected_size - current_size))
            text_vector_dense = np.hstack((text_vector_dense, padding))
        elif current_size > expected_size:
            # Cắt bớt nếu quá lớn
            text_vector_dense = text_vector_dense[:, :expected_size]
        
        # Dự đoán xác suất cho mỗi tag
        predictions = self.model.predict(text_vector_dense)[0]
        
        # Lấy top k tags có xác suất cao nhất
        top_indices = np.argsort(predictions)[-top_k:][::-1]
        
        # Tạo kết quả với tên tag và xác suất
        results = []
        for idx in top_indices:
            if idx < len(self.tags):  # Kiểm tra chỉ số có hợp lệ không
                tag = self.tags[idx]
                probability = float(predictions[idx])
                results.append({
                    "tag": tag,
                    "probability": probability
                })
        
        return results

def main():
    # Đường dẫn đến các file cần thiết
    model_path = "tag_model/model.h5"
    vectorizer_path = "tag_model/vectorizer.joblib"
    tags_path = "tag_model/tags.json"
    
    # Khởi tạo predictor
    predictor = TagPredictor(model_path, vectorizer_path, tags_path)
    
    # Ví dụ sử dụng
    test_text = "Tôi bị đau đầu và mất ngủ"
    results = predictor.predict_tags(test_text)
    
    print("\nKết quả dự đoán tags cho văn bản:", test_text)
    for result in results:
        print(f"Tag: {result['tag']}, Xác suất: {result['probability']:.4f}")

if __name__ == "__main__":
    main() 