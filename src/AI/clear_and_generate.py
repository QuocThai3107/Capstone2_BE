import os
import shutil

def clear_old_data():
    # Xóa file training data cũ
    if os.path.exists('src/AI/training_data.json'):
        os.remove('src/AI/training_data.json')
        print("Đã xóa file training_data.json cũ")
    
    # Xóa thư mục model cũ
    if os.path.exists('tag_model'):
        shutil.rmtree('tag_model')
        print("Đã xóa thư mục tag_model cũ")

def main():
    # Xóa dữ liệu cũ
    clear_old_data()
    
    # Tạo dữ liệu mới
    print("\nĐang tạo dữ liệu mới...")
    os.system('python src/AI/generate_training_data.py')
    
    # Train model mới
    print("\nĐang train model mới...")
    os.system('python src/AI/tag_trainer.py')

if __name__ == "__main__":
    main() 