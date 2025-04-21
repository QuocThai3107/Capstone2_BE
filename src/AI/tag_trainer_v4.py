import json
import numpy as np
import tensorflow as tf
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import MultiLabelBinarizer
import joblib
import os
import logging
from datetime import datetime
from typing import List, Dict, Tuple
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, Conv1D, MaxPooling1D, Flatten, LSTM, Bidirectional, Input, Concatenate, GlobalAveragePooling1D, GlobalMaxPooling1D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from scipy.sparse import csr_matrix, vstack, hstack
from imblearn.over_sampling import SMOTE
from tensorflow.keras.regularizers import l1_l2
from sklearn.metrics import precision_score, recall_score, roc_auc_score

class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25):
        super(FocalLoss, self).__init__()
        self.gamma = gamma
        self.alpha = alpha
        
    def call(self, y_true, y_pred):
        # Chuyển đổi y_true sang float32
        y_true = tf.cast(y_true, tf.float32)
        
        # Clip predictions to prevent division by zero
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        
        # Calculate focal loss
        p_t = (y_true * y_pred) + ((1 - y_true) * (1 - y_pred))
        alpha_factor = y_true * self.alpha + (1 - y_true) * (1 - self.alpha)
        modulating_factor = tf.pow((1.0 - p_t), self.gamma)
        
        # Calculate binary crossentropy
        ce_loss = -y_true * tf.math.log(y_pred) - (1 - y_true) * tf.math.log(1 - y_pred)
        
        # Apply focal loss formula
        focal_loss = alpha_factor * modulating_factor * ce_loss
        
        # Reduce mean across all dimensions
        return tf.reduce_mean(focal_loss)

class TagTrainerV4:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,  # Giảm xuống 1000 features
            ngram_range=(1, 2),
            min_df=5,
            max_df=0.95
        )
        self.recommend_model = None
        self.exclude_model = None
        self.tags = None
        self.valid_tags = None
        self.n_classes = None
        self.setup_logging()
        self.setup_checkpoint_dir()

    def setup_logging(self, run_count: int = 1):
        if not os.path.exists('logs'):
            os.makedirs('logs')
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_file = f'logs/training_{timestamp}_run{run_count}.log'
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_checkpoint_dir(self):
        if not os.path.exists('checkpoints'):
            os.makedirs('checkpoints')
        self.checkpoint_dir = 'checkpoints'

    def build_model(self, input_dim: int) -> Tuple[tf.keras.Model, tf.keras.Model]:
        self.logger.info("Đang xây dựng models...")
        
        # Kết hợp L1 và L2 regularization
        l1l2_reg = l1_l2(l1=0.0005, l2=0.0005)
        
        # Kiến trúc đơn giản hơn cho recommend model (chỉ 2 lớp Dense)
        recommend_input = Input(shape=(input_dim,))
        
        # Dense layers
        dense1 = Dense(256, activation='relu', kernel_regularizer=l1l2_reg)(recommend_input)
        dense1 = BatchNormalization()(dense1)
        dense1 = Dropout(0.3)(dense1)
        
        recommend_output = Dense(self.n_classes, activation='sigmoid')(dense1)
        
        recommend_model = Model(inputs=recommend_input, outputs=recommend_output)
        
        # Kiến trúc tương tự cho exclude model (chỉ 2 lớp Dense)
        exclude_input = Input(shape=(input_dim,))
        
        # Dense layers
        dense1 = Dense(256, activation='relu', kernel_regularizer=l1l2_reg)(exclude_input)
        dense1 = BatchNormalization()(dense1)
        dense1 = Dropout(0.3)(dense1)
        
        exclude_output = Dense(self.n_classes, activation='sigmoid')(dense1)
        
        exclude_model = Model(inputs=exclude_input, outputs=exclude_output)
        
        # Sử dụng Adam với learning rate cao hơn
        optimizer = tf.keras.optimizers.legacy.Adam(
            learning_rate=0.001,
            beta_1=0.9,
            beta_2=0.999,
            epsilon=1e-07
        )
        
        # Compile models với binary crossentropy thay vì focal loss
        recommend_model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=[
                'accuracy',
                tf.keras.metrics.Precision(name='precision_1'),
                tf.keras.metrics.Recall(name='recall_1'),
                tf.keras.metrics.AUC(name='auc_1', multi_label=True)
            ]
        )
        
        exclude_model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=[
                'accuracy',
                tf.keras.metrics.Precision(name='precision_1'),
                tf.keras.metrics.Recall(name='recall_1'),
                tf.keras.metrics.AUC(name='auc_1', multi_label=True)
            ]
        )
        
        return recommend_model, exclude_model

    def load_data(self, data_path: str) -> Tuple[List[str], List[List[int]], List[List[int]]]:
        """Load và chuẩn bị dữ liệu training"""
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Lấy tất cả các tags duy nhất từ dữ liệu
            all_tags = set()
            for item in data:
                all_tags.update(item['recommended_tags'])
                all_tags.update(item['exclude_tags'])
            
            self.valid_tags = sorted(list(all_tags))
            self.n_classes = len(self.valid_tags)
            
            # Chuẩn bị dữ liệu training
            X = []  # Input text
            y_recommend = []  # Recommend tags
            y_exclude = []  # Exclude tags
            
            for item in data:
                # Sử dụng health_info trực tiếp vì nó đã là string
                text = item['health_info']
                if item.get('illness') and item['illness'] != 'none':
                    text += f" illness:{item['illness']}"
                
                X.append(text)
                
                # Chuẩn bị nhãn
                recommend_tags = [1 if tag in item['recommended_tags'] else 0 for tag in self.valid_tags]
                exclude_tags = [1 if tag in item['exclude_tags'] else 0 for tag in self.valid_tags]
                
                y_recommend.append(recommend_tags)
                y_exclude.append(exclude_tags)
            
            # Chuyển đổi sang numpy array
            y_recommend = np.array(y_recommend)
            y_exclude = np.array(y_exclude)
            
            self.logger.info(f"Đã load {len(X)} mẫu training")
            self.logger.info(f"Số lượng tags: {self.n_classes}")
            self.logger.info(f"Danh sách tags: {self.valid_tags}")
            
            return X, y_recommend, y_exclude
            
        except Exception as e:
            self.logger.error(f"Lỗi khi load dữ liệu: {str(e)}")
            raise

    def train(self, X: List[str], y_recommend: List[List[int]], y_exclude: List[List[int]]):
        try:
            # Vectorize input text
            X_vectorized = self.vectorizer.fit_transform(X)
            
            # Sắp xếp indices của sparse matrix
            X_vectorized.sort_indices()
            
            # Split data
            X_train, X_test, y_recommend_train, y_recommend_test, y_exclude_train, y_exclude_test = train_test_split(
                X_vectorized, y_recommend, y_exclude, test_size=0.2, random_state=42
            )
            
            # Log số lượng mẫu
            self.logger.info("Số mẫu dữ liệu:")
            self.logger.info(f"- Train gốc: {X_train.shape[0]}")
            
            # Tính toán class weights cho recommend model với hệ số điều chỉnh
            recommend_class_weights = {}
            for i in range(y_recommend_train.shape[1]):
                pos_count = int(np.sum(y_recommend_train[:, i]))
                neg_count = y_recommend_train.shape[0] - pos_count
                if pos_count > 0 and neg_count > 0:
                    # Tính tỷ lệ cơ bản
                    ratio = neg_count / pos_count
                    # Áp dụng hệ số điều chỉnh và giới hạn giá trị
                    weight = min(ratio * 0.5, 5.0)  # Giới hạn tối đa là 5.0
                    recommend_class_weights[i] = weight
                    self.logger.info(f"Recommend tag {i}: pos={pos_count}, neg={neg_count}, weight={weight:.2f}")
            
            # Tính toán class weights cho exclude model với hệ số điều chỉnh
            exclude_class_weights = {}
            for i in range(y_exclude_train.shape[1]):
                pos_count = int(np.sum(y_exclude_train[:, i]))
                neg_count = y_exclude_train.shape[0] - pos_count
                if pos_count > 0 and neg_count > 0:
                    # Tính tỷ lệ cơ bản
                    ratio = neg_count / pos_count
                    # Áp dụng hệ số điều chỉnh và giới hạn giá trị
                    weight = min(ratio * 0.5, 5.0)  # Giới hạn tối đa là 5.0
                    exclude_class_weights[i] = weight
                    self.logger.info(f"Exclude tag {i}: pos={pos_count}, neg={neg_count}, weight={weight:.2f}")
            
            # Xây dựng models
            recommend_model, exclude_model = self.build_model(X_train.shape[1])
            
            # KFold cross validation
            n_splits = 5
            kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
            
            # Train recommend model
            self.logger.info("\nHuấn luyện model cho recommend tags...")
            recommend_models = []
            recommend_scores = []
            
            for fold, (train_idx, val_idx) in enumerate(kf.split(X_train), 1):
                self.logger.info("\n" + "="*50)
                self.logger.info(f"Bắt đầu training recommend model fold {fold}/{n_splits}")
                self.logger.info("="*50)
                
                X_fold_train = X_train[train_idx]
                y_fold_train = y_recommend_train[train_idx]
                X_fold_val = X_train[val_idx]
                y_fold_val = y_recommend_train[val_idx]
                
                # Callbacks
                callbacks = [
                    EarlyStopping(
                        monitor='val_loss',
                        patience=5,
                        restore_best_weights=True
                    ),
                    ReduceLROnPlateau(
                        monitor='val_loss',
                        factor=0.5,
                        patience=3,
                        min_lr=1e-6
                    )
                ]
                
                # Train model
                history = recommend_model.fit(
                    X_fold_train,
                    y_fold_train,
                    validation_data=(X_fold_val, y_fold_val),
                    epochs=30,
                    batch_size=128,
                    callbacks=callbacks,
                    class_weight=recommend_class_weights,
                    verbose=1
                )
                
                # Đánh giá model
                scores = recommend_model.evaluate(X_fold_val, y_fold_val, verbose=0)
                recommend_scores.append(scores)
                
                self.logger.info(f"\nKết quả recommend model fold {fold}:")
                self.logger.info(f"- Loss: {scores[0]:.4f}")
                self.logger.info(f"- Accuracy: {scores[1]:.4f}")
                self.logger.info(f"- Precision: {scores[2]:.4f}")
                self.logger.info(f"- Recall: {scores[3]:.4f}")
                self.logger.info(f"- AUC: {scores[4]:.4f}")
                
                recommend_models.append(recommend_model)
            
            # Train exclude model
            self.logger.info("\nHuấn luyện model cho exclude tags...")
            exclude_models = []
            exclude_scores = []
            
            for fold, (train_idx, val_idx) in enumerate(kf.split(X_train), 1):
                self.logger.info("\n" + "="*50)
                self.logger.info(f"Bắt đầu training exclude model fold {fold}/{n_splits}")
                self.logger.info("="*50)
                
                X_fold_train = X_train[train_idx]
                y_fold_train = y_exclude_train[train_idx]
                X_fold_val = X_train[val_idx]
                y_fold_val = y_exclude_train[val_idx]
                
                # Callbacks
                callbacks = [
                    EarlyStopping(
                        monitor='val_loss',
                        patience=5,
                        restore_best_weights=True
                    ),
                    ReduceLROnPlateau(
                        monitor='val_loss',
                        factor=0.5,
                        patience=3,
                        min_lr=1e-6
                    )
                ]
                
                # Train model
                history = exclude_model.fit(
                    X_fold_train,
                    y_fold_train,
                    validation_data=(X_fold_val, y_fold_val),
                    epochs=30,
                    batch_size=128,
                    callbacks=callbacks,
                    class_weight=exclude_class_weights,
                    verbose=1
                )
                
                # Đánh giá model
                scores = exclude_model.evaluate(X_fold_val, y_fold_val, verbose=0)
                exclude_scores.append(scores)
                
                self.logger.info(f"\nKết quả exclude model fold {fold}:")
                self.logger.info(f"- Loss: {scores[0]:.4f}")
                self.logger.info(f"- Accuracy: {scores[1]:.4f}")
                self.logger.info(f"- Precision: {scores[2]:.4f}")
                self.logger.info(f"- Recall: {scores[3]:.4f}")
                self.logger.info(f"- AUC: {scores[4]:.4f}")
                
                exclude_models.append(exclude_model)
            
            # Chọn model tốt nhất dựa trên validation loss
            recommend_best_idx = np.argmin([s[0] for s in recommend_scores])
            exclude_best_idx = np.argmin([s[0] for s in exclude_scores])
            
            self.recommend_model = recommend_models[recommend_best_idx]
            self.exclude_model = exclude_models[exclude_best_idx]
            
            # Đánh giá trên tập test
            self.logger.info("\nKết quả trên tập test:")
            
            # Recommend model
            recommend_test_scores = self.recommend_model.evaluate(X_test, y_recommend_test, verbose=0)
            self.logger.info("\nRecommend Model:")
            self.logger.info(f"- Loss: {recommend_test_scores[0]:.4f}")
            self.logger.info(f"- Accuracy: {recommend_test_scores[1]:.4f}")
            self.logger.info(f"- Precision: {recommend_test_scores[2]:.4f}")
            self.logger.info(f"- Recall: {recommend_test_scores[3]:.4f}")
            self.logger.info(f"- AUC: {recommend_test_scores[4]:.4f}")
            
            # Exclude model
            exclude_test_scores = self.exclude_model.evaluate(X_test, y_exclude_test, verbose=0)
            self.logger.info("\nExclude Model:")
            self.logger.info(f"- Loss: {exclude_test_scores[0]:.4f}")
            self.logger.info(f"- Accuracy: {exclude_test_scores[1]:.4f}")
            self.logger.info(f"- Precision: {exclude_test_scores[2]:.4f}")
            self.logger.info(f"- Recall: {exclude_test_scores[3]:.4f}")
            self.logger.info(f"- AUC: {exclude_test_scores[4]:.4f}")
            
            # Lưu models
            self.save_model()
            
        except Exception as e:
            self.logger.error(f"Lỗi khi training: {str(e)}")
            raise

    def save_model(self, model_dir: str = 'tag_model'):
        """Lưu cả hai model và các thành phần liên quan"""
        try:
            if not os.path.exists(model_dir):
                os.makedirs(model_dir)
            
            # Lưu recommend model
            self.recommend_model.save(os.path.join(model_dir, 'recommend_model.keras'))
            
            # Lưu exclude model
            self.exclude_model.save(os.path.join(model_dir, 'exclude_model.keras'))
            
            # Lưu vectorizer
            joblib.dump(self.vectorizer, os.path.join(model_dir, 'vectorizer.joblib'))
            
            # Lưu thông tin về tags
            tags_info = {
                'tags': self.tags,
                'valid_tags': self.valid_tags,
                'n_classes': self.n_classes
            }
            with open(os.path.join(model_dir, 'tags_info.json'), 'w', encoding='utf-8') as f:
                json.dump(tags_info, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"Models đã được lưu thành công vào thư mục {model_dir}")
            
        except Exception as e:
            self.logger.error(f"Lỗi khi lưu models: {str(e)}")
            raise

    def load_model(self, model_dir: str):
        """Load cả hai model và các thành phần liên quan"""
        try:
            # Load recommend model
            self.recommend_model = tf.keras.models.load_model(os.path.join(model_dir, 'recommend_model.keras'))
            
            # Load exclude model
            self.exclude_model = tf.keras.models.load_model(os.path.join(model_dir, 'exclude_model.keras'))
            
            # Load vectorizer
            self.vectorizer = joblib.load(os.path.join(model_dir, 'vectorizer.joblib'))
            
            # Load thông tin về tags
            with open(os.path.join(model_dir, 'tags_info.json'), 'r', encoding='utf-8') as f:
                tags_info = json.load(f)
                self.tags = tags_info['tags']
                self.valid_tags = tags_info['valid_tags']
                self.n_classes = tags_info['n_classes']
            
            self.logger.info(f"Models đã được load thành công từ thư mục {model_dir}")
            
        except Exception as e:
            self.logger.error(f"Lỗi khi load models: {str(e)}")
            raise

def main():
    trainer = TagTrainerV4()
    
    # Load và train dữ liệu
    X, y_recommend, y_exclude = trainer.load_data('src/AI/training_data.json')
    trainer.train(X, y_recommend, y_exclude)
    
    # Lưu model
    trainer.save_model('tag_model')
    trainer.logger.info("Models đã được lưu vào thư mục tag_model")

if __name__ == "__main__":
    main() 