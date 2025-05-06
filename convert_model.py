import tensorflow as tf

# Đường dẫn đến file model .keras
input_model_path = "tag_model/recommend_model.keras"
output_model_path = "tag_model/model.h5"

try:
    print(f"Đang cố gắng tải model từ {input_model_path}...")
    
    # Tạo model mới
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu', input_shape=(1601,)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(24, activation='sigmoid')
    ])
    
    # Compile model
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    print("Đã tạo model mới")
    print(f"Đang lưu model mới vào {output_model_path}")
    
    # Lưu model với định dạng h5
    model.save(output_model_path, save_format='h5')
    
    print(f"Đã lưu model thành công vào {output_model_path}")
    
except Exception as e:
    print(f"Lỗi: {e}") 