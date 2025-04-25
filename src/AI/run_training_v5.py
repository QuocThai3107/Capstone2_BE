import os
import sys
import logging
from datetime import datetime
from tag_trainer_v5 import TagTrainerV5

def setup_logging():
    if not os.path.exists('logs'):
        os.makedirs('logs')
        
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = f'logs/training_run_{timestamp}.log'
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def main():
    logger = setup_logging()
    logger.info("Bắt đầu quá trình training với TagTrainerV5")
    
    try:
        # Khởi tạo trainer
        trainer = TagTrainerV5()
        
        # Load và train dữ liệu
        logger.info("Đang load dữ liệu training...")
        X_text, X_features, y_recommend, y_exclude = trainer.load_data('src/AI/training_data.json')
        
        logger.info("Bắt đầu quá trình training...")
        trainer.train(X_text, X_features, y_recommend, y_exclude)
        
        # Lưu model
        logger.info("Đang lưu models...")
        trainer.save_model('tag_model')
        
        logger.info("Hoàn thành quá trình training!")
        
    except Exception as e:
        logger.error(f"Lỗi trong quá trình training: {str(e)}")
        raise

if __name__ == "__main__":
    main() 