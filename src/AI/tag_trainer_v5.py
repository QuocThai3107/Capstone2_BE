import json
import numpy as np
import tensorflow as tf
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler
import joblib
import os
import logging
from datetime import datetime
from typing import List, Dict, Tuple
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, Input, Concatenate
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from scipy.sparse import csr_matrix, vstack, hstack
from imblearn.over_sampling import SMOTE
from tensorflow.keras.regularizers import l1_l2
from sklearn.metrics import precision_score, recall_score, roc_auc_score
from tensorflow.keras.preprocessing.sequence import pad_sequences
from flask import Flask, request, jsonify
import re

class FocalLoss(tf.keras.losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25, reduction=tf.keras.losses.Reduction.AUTO, name='focal_loss'):
        super(FocalLoss, self).__init__(reduction=reduction, name=name)
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

class TagTrainerV5:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            min_df=5,
            max_df=0.95
        )
        self.feature_scaler = StandardScaler()
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

    def parse_health_info(self, health_info):
        """Tách health_info thành các features riêng biệt"""
        features = {}
        
        # Tách các cặp key-value
        for item in health_info.split(','):
            if ':' in item:
                key, value = item.split(':')
                # Chuyển đổi giá trị sang kiểu dữ liệu phù hợp
                if key in ['Age', 'Weight', 'Height', 'Max_BPM', 'Avg_BPM', 'Resting_BPM', 
                          'Session_Duration', 'Calories_Burned', 'Fat_Percentage', 
                          'Water_Intake', 'Workout_Frequency', 'BMI']:
                    try:
                        features[key] = float(value)
                    except ValueError:
                        features[key] = 0.0
                else:
                    features[key] = value
        
        return features

    def create_interaction_features(self, features):
        """Tạo các features tương tác từ health information"""
        interaction_features = {}
        
        # Tỷ lệ BPM (nhịp tim) so với BMI
        if 'BMI' in features and 'Resting_BPM' in features and features['BMI'] > 0:
            interaction_features['BMI_BPM_Ratio'] = features['Resting_BPM'] / features['BMI']
        else:
            interaction_features['BMI_BPM_Ratio'] = 0.0
        
        # Hiệu quả đốt cháy calo (calories per kg)
        if 'Calories_Burned' in features and 'Weight' in features and features['Weight'] > 0:
            interaction_features['Calories_per_Kg'] = features['Calories_Burned'] / features['Weight']
        else:
            interaction_features['Calories_per_Kg'] = 0.0
        
        # Cường độ tập luyện (BPM tăng so với thời gian)
        if 'Avg_BPM' in features and 'Resting_BPM' in features and 'Session_Duration' in features and features['Session_Duration'] > 0:
            interaction_features['Workout_Intensity'] = (features['Avg_BPM'] - features['Resting_BPM']) / features['Session_Duration']
        else:
            interaction_features['Workout_Intensity'] = 0.0
        
        # Tỷ lệ mỡ trên BMI
        if 'Fat_Percentage' in features and 'BMI' in features and features['BMI'] > 0:
            interaction_features['Fat_BMI_Ratio'] = features['Fat_Percentage'] / features['BMI']
        else:
            interaction_features['Fat_BMI_Ratio'] = 0.0
        
        return interaction_features

    def encode_categorical_features(self, features):
        """Mã hóa các features phân loại"""
        encoded_features = {}
        
        # Mã hóa giới tính
        if 'Gender' in features:
            encoded_features['Gender_Male'] = 1 if features['Gender'] == 'Male' else 0
            encoded_features['Gender_Female'] = 1 if features['Gender'] == 'Female' else 0
        else:
            encoded_features['Gender_Male'] = 0
            encoded_features['Gender_Female'] = 0
        
        # Mã hóa trình độ
        if 'Experience_Level' in features:
            level = features['Experience_Level']
            encoded_features['Level_Beginner'] = 1 if level == 'Beginner' else 0
            encoded_features['Level_Intermediate'] = 1 if level == 'Intermediate' else 0
            encoded_features['Level_Expert'] = 1 if level == 'Expert' else 0
        else:
            encoded_features['Level_Beginner'] = 0
            encoded_features['Level_Intermediate'] = 0
            encoded_features['Level_Expert'] = 0
        
        return encoded_features

    def create_domain_features(self, features):
        """Tạo features dựa trên kiến thức chuyên ngành"""
        domain_features = {}
        
        # Phân loại BMI
        if 'BMI' in features:
            bmi = features['BMI']
            domain_features['BMI_Underweight'] = 1 if bmi < 18.5 else 0
            domain_features['BMI_Normal'] = 1 if 18.5 <= bmi < 25 else 0
            domain_features['BMI_Overweight'] = 1 if 25 <= bmi < 30 else 0
            domain_features['BMI_Obese'] = 1 if bmi >= 30 else 0
        else:
            domain_features['BMI_Underweight'] = 0
            domain_features['BMI_Normal'] = 0
            domain_features['BMI_Overweight'] = 0
            domain_features['BMI_Obese'] = 0
        
        # Phân loại nhịp tim
        if 'Resting_BPM' in features:
            bpm = features['Resting_BPM']
            domain_features['BPM_Low'] = 1 if bpm < 60 else 0
            domain_features['BPM_Normal'] = 1 if 60 <= bpm <= 100 else 0
            domain_features['BPM_High'] = 1 if bpm > 100 else 0
        else:
            domain_features['BPM_Low'] = 0
            domain_features['BPM_Normal'] = 0
            domain_features['BPM_High'] = 0
        
        # Phân loại cường độ tập luyện
        if 'Workout_Frequency' in features:
            freq = features['Workout_Frequency']
            domain_features['Frequency_Low'] = 1 if freq < 3 else 0
            domain_features['Frequency_Moderate'] = 1 if 3 <= freq <= 5 else 0
            domain_features['Frequency_High'] = 1 if freq > 5 else 0
        else:
            domain_features['Frequency_Low'] = 0
            domain_features['Frequency_Moderate'] = 0
            domain_features['Frequency_High'] = 0
        
        return domain_features

    def extract_all_features(self, health_info_str):
        """Trích xuất tất cả các features từ health info string"""
        features = {}
        
        try:
            # Parse health info string
            parts = health_info_str.split(',')
            for part in parts:
                if ':' in part:
                    key, value = part.split(':', 1)  # Split only on first occurrence
                    key = key.strip()
                    value = value.strip()
                    
                    # Xử lý BMI
                    if key == 'BMI':
                        try:
                            bmi = float(value.split()[0])  # Lấy số đầu tiên
                            features['bmi'] = bmi
                            # Set BMI status
                            features['is_underweight'] = 1 if bmi < 18.5 else 0
                            features['is_normal'] = 1 if 18.5 <= bmi < 25 else 0
                            features['is_overweight'] = 1 if 25 <= bmi < 30 else 0
                            features['is_obese'] = 1 if bmi >= 30 else 0
                        except ValueError:
                            features['bmi'] = 0.0
                            features['is_underweight'] = 0
                            features['is_normal'] = 0
                            features['is_overweight'] = 0
                            features['is_obese'] = 0
                    
                    # Xử lý Height và Weight
                    elif key in ['Height', 'Weight']:
                        try:
                            value = float(value.replace('cm', '').replace('kg', '').strip())
                            features[key.lower()] = value
                        except ValueError:
                            features[key.lower()] = 0.0
                    
                    # Xử lý Status
                    elif key == 'Status':
                        status = value.lower()
                        features['is_underweight'] = 1 if status == 'underweight' else 0
                        features['is_normal'] = 1 if status == 'normal' else 0
                        features['is_overweight'] = 1 if status == 'overweight' else 0
                        features['is_obese'] = 1 if status == 'obese' else 0
                    
                    # Xử lý Health Tags
                    elif key == 'Health Tags':
                        tags = [tag.strip() for tag in value.split(',')]
                        for tag in self.valid_tags:
                            features[f'has_tag_{tag}'] = 1 if tag in tags else 0
            
            # Đảm bảo tất cả các features cần thiết đều có mặt
            required_features = [
                'bmi', 'is_underweight', 'is_normal', 'is_overweight', 'is_obese'
            ]
            
            # Thêm các features còn thiếu với giá trị mặc định
            for feature in required_features:
                if feature not in features:
                    features[feature] = 0
                    
            # Thêm các tag features còn thiếu
            for tag in self.valid_tags:
                tag_feature = f'has_tag_{tag}'
                if tag_feature not in features:
                    features[tag_feature] = 0
            
            return features
            
        except Exception as e:
            print(f"Error parsing health info: {e}")
            # Trả về features mặc định nếu có lỗi
            default_features = {
                'bmi': 0.0,
                'is_underweight': 0,
                'is_normal': 0,
                'is_overweight': 0,
                'is_obese': 0
            }
            for tag in self.valid_tags:
                default_features[f'has_tag_{tag}'] = 0
            return default_features

    def build_hybrid_model(self, text_input_dim, feature_input_dim, n_classes):
        """Xây dựng model kết hợp cả text và features"""
        # Input cho text
        text_input = Input(shape=(text_input_dim,))
        text_dense = Dense(256, activation='relu')(text_input)
        text_dense = BatchNormalization()(text_dense)
        text_dense = Dropout(0.3)(text_dense)
        
        # Input cho features
        feature_input = Input(shape=(feature_input_dim,))
        feature_dense = Dense(128, activation='relu')(feature_input)
        feature_dense = BatchNormalization()(feature_dense)
        feature_dense = Dropout(0.2)(feature_dense)
        
        # Kết hợp hai input
        combined = Concatenate()([text_dense, feature_dense])
        
        # Các lớp tiếp theo
        dense = Dense(256, activation='relu')(combined)
        dense = BatchNormalization()(dense)
        dense = Dropout(0.3)(dense)
        
        output = Dense(n_classes, activation='sigmoid')(dense)
        
        # Tạo model
        model = Model(inputs=[text_input, feature_input], outputs=output)
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss=FocalLoss(gamma=2.0, alpha=0.25),
            metrics=['accuracy', 'Precision', 'Recall', 'AUC']
        )
        
        return model

    def load_data(self, data_path: str) -> Tuple[List[str], List[List[float]], List[List[int]], List[List[int]]]:
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
            X_text = []  # Input text
            X_features = []  # Input features
            y_recommend = []  # Recommend tags
            y_exclude = []  # Exclude tags
            
            for item in data:
                # Sử dụng health_info trực tiếp vì nó đã là string
                text = item['health_info']
                if item.get('illness') and item['illness'] != 'none':
                    text += f" illness:{item['illness']}"
                
                X_text.append(text)
                
                # Trích xuất features từ health_info
                features = self.extract_all_features(item['health_info'])
                
                # Chuyển đổi features thành vector
                feature_vector = []
                for key in sorted(features.keys()):
                    if isinstance(features[key], (int, float)):
                        feature_vector.append(features[key])
                    elif isinstance(features[key], bool):
                        feature_vector.append(1 if features[key] else 0)
                
                X_features.append(feature_vector)
                
                # Chuẩn bị nhãn
                recommend_tags = [1 if tag in item['recommended_tags'] else 0 for tag in self.valid_tags]
                exclude_tags = [1 if tag in item['exclude_tags'] else 0 for tag in self.valid_tags]
                
                y_recommend.append(recommend_tags)
                y_exclude.append(exclude_tags)
            
            # Chuyển đổi sang numpy array
            X_features = np.array(X_features)
            y_recommend = np.array(y_recommend)
            y_exclude = np.array(y_exclude)
            
            self.logger.info(f"Đã load {len(X_text)} mẫu training")
            self.logger.info(f"Số lượng tags: {self.n_classes}")
            self.logger.info(f"Danh sách tags: {self.valid_tags}")
            
            return X_text, X_features, y_recommend, y_exclude
            
        except Exception as e:
            self.logger.error(f"Lỗi khi load dữ liệu: {str(e)}")
            raise

    def train(self, X_text: List[str], X_features: List[List[float]], y_recommend: List[List[int]], y_exclude: List[List[int]]):
        try:
            # Vectorize input text
            X_text_vectorized = self.vectorizer.fit_transform(X_text)
            
            # Chuẩn hóa features
            X_features_scaled = self.feature_scaler.fit_transform(X_features)
            
            # Sắp xếp indices của sparse matrix
            X_text_vectorized.sort_indices()
            
            # Split data
            X_text_train, X_text_test, X_features_train, X_features_test, y_recommend_train, y_recommend_test, y_exclude_train, y_exclude_test = train_test_split(
                X_text_vectorized, X_features_scaled, y_recommend, y_exclude, test_size=0.2, random_state=42
            )
            
            # Log số lượng mẫu
            self.logger.info("Số mẫu dữ liệu:")
            self.logger.info(f"- Train gốc: {X_text_train.shape[0]}")
            
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
            recommend_model = self.build_hybrid_model(X_text_train.shape[1], X_features_train.shape[1], y_recommend_train.shape[1])
            exclude_model = self.build_hybrid_model(X_text_train.shape[1], X_features_train.shape[1], y_exclude_train.shape[1])
            
            # KFold cross validation
            n_splits = 5
            kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
            
            # Train recommend model
            self.logger.info("\nHuấn luyện model cho recommend tags...")
            recommend_models = []
            recommend_scores = []
            
            for fold, (train_idx, val_idx) in enumerate(kf.split(X_text_train), 1):
                self.logger.info("\n" + "="*50)
                self.logger.info(f"Bắt đầu training recommend model fold {fold}/{n_splits}")
                self.logger.info("="*50)
                
                X_text_fold_train = X_text_train[train_idx]
                X_features_fold_train = X_features_train[train_idx]
                y_fold_train = y_recommend_train[train_idx]
                
                X_text_fold_val = X_text_train[val_idx]
                X_features_fold_val = X_features_train[val_idx]
                y_fold_val = y_recommend_train[val_idx]
                
                # Callbacks
                callbacks = [
                    EarlyStopping(
                        monitor='val_loss',
                        patience=15,
                        restore_best_weights=True
                    ),
                    ReduceLROnPlateau(
                        monitor='val_loss',
                        factor=0.5,
                        patience=7,
                        min_lr=1e-7
                    )
                ]
                
                # Train model
                history = recommend_model.fit(
                    [X_text_fold_train, X_features_fold_train],
                    y_fold_train,
                    validation_data=([X_text_fold_val, X_features_fold_val], y_fold_val),
                    epochs=200,
                    batch_size=16,
                    callbacks=callbacks,
                    class_weight=recommend_class_weights,
                    verbose=1
                )
                
                # Đánh giá model
                scores = recommend_model.evaluate([X_text_fold_val, X_features_fold_val], y_fold_val, verbose=0)
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
            
            for fold, (train_idx, val_idx) in enumerate(kf.split(X_text_train), 1):
                self.logger.info("\n" + "="*50)
                self.logger.info(f"Bắt đầu training exclude model fold {fold}/{n_splits}")
                self.logger.info("="*50)
                
                X_text_fold_train = X_text_train[train_idx]
                X_features_fold_train = X_features_train[train_idx]
                y_fold_train = y_exclude_train[train_idx]
                
                X_text_fold_val = X_text_train[val_idx]
                X_features_fold_val = X_features_train[val_idx]
                y_fold_val = y_exclude_train[val_idx]
                
                # Callbacks
                callbacks = [
                    EarlyStopping(
                        monitor='val_loss',
                        patience=15,
                        restore_best_weights=True
                    ),
                    ReduceLROnPlateau(
                        monitor='val_loss',
                        factor=0.5,
                        patience=7,
                        min_lr=1e-7
                    )
                ]
                
                # Train model
                history = exclude_model.fit(
                    [X_text_fold_train, X_features_fold_train],
                    y_fold_train,
                    validation_data=([X_text_fold_val, X_features_fold_val], y_fold_val),
                    epochs=200,
                    batch_size=16,
                    callbacks=callbacks,
                    class_weight=exclude_class_weights,
                    verbose=1
                )
                
                # Đánh giá model
                scores = exclude_model.evaluate([X_text_fold_val, X_features_fold_val], y_fold_val, verbose=0)
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
            recommend_test_scores = self.recommend_model.evaluate([X_text_test, X_features_test], y_recommend_test, verbose=0)
            self.logger.info("\nRecommend Model:")
            self.logger.info(f"- Loss: {recommend_test_scores[0]:.4f}")
            self.logger.info(f"- Accuracy: {recommend_test_scores[1]:.4f}")
            self.logger.info(f"- Precision: {recommend_test_scores[2]:.4f}")
            self.logger.info(f"- Recall: {recommend_test_scores[3]:.4f}")
            self.logger.info(f"- AUC: {recommend_test_scores[4]:.4f}")
            
            # Exclude model
            exclude_test_scores = self.exclude_model.evaluate([X_text_test, X_features_test], y_exclude_test, verbose=0)
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
            
            # Lưu feature scaler
            joblib.dump(self.feature_scaler, os.path.join(model_dir, 'feature_scaler.joblib'))
            
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
            
            # Load feature scaler
            self.feature_scaler = joblib.load(os.path.join(model_dir, 'feature_scaler.joblib'))
            
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

    def predict_tags(self, text, min_tags_per_group=1):
        """
        Dự đoán tags cho văn bản đầu vào
        Args:
            text: Văn bản cần dự đoán tags
            min_tags_per_group: Số lượng tag tối thiểu cần có cho mỗi nhóm yêu cầu
        Returns:
            List các tags được đề xuất
        """
        # Chuẩn bị dữ liệu đầu vào
        text_sequence = self.tokenizer.texts_to_sequences([text])
        text_padded = pad_sequences(text_sequence, maxlen=self.max_sequence_length)
        
        # Dự đoán xác suất cho mỗi tag
        recommend_probs = self.recommend_model.predict(text_padded)[0]
        exclude_probs = self.exclude_model.predict(text_padded)[0]
        
        # Lấy danh sách tags yêu cầu từ file tags_info.json
        with open(os.path.join(self.model_dir, 'tags_info.json'), 'r', encoding='utf-8') as f:
            tags_info = json.load(f)
            required_tags = tags_info.get('required_tags', {})
        
        # Khởi tạo danh sách tags được đề xuất
        recommended_tags = []
        
        # Đảm bảo có ít nhất 1 tag từ mỗi nhóm yêu cầu
        for group, tags in required_tags.items():
            group_probs = []
            for tag in tags:
                tag_idx = self.tag_to_index[tag]
                # Tính điểm cho tag dựa trên cả recommend và exclude
                score = recommend_probs[tag_idx] * (1 - exclude_probs[tag_idx])
                group_probs.append((tag, score))
            
            # Sắp xếp theo điểm số giảm dần
            group_probs.sort(key=lambda x: x[1], reverse=True)
            
            # Thêm tag có điểm cao nhất vào danh sách
            if group_probs:
                recommended_tags.append(group_probs[0][0])
        
        # Thêm các tag khác có điểm cao
        all_probs = []
        for tag, idx in self.tag_to_index.items():
            # Bỏ qua các tag đã được chọn
            if tag in recommended_tags:
                continue
            # Tính điểm cho tag
            score = recommend_probs[idx] * (1 - exclude_probs[idx])
            all_probs.append((tag, score))
        
        # Sắp xếp theo điểm số giảm dần
        all_probs.sort(key=lambda x: x[1], reverse=True)
        
        # Thêm các tag có điểm cao vào danh sách
        for tag, score in all_probs:
            if score > 0.5:  # Ngưỡng điểm để chọn tag
                recommended_tags.append(tag)
        
        return recommended_tags

app = Flask(__name__)
trainer = TagTrainerV5()

@app.route('/predict-from-health', methods=['POST'])
def predict_from_health():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'recommended_tags': [],
                'exclude_tags': []
            })
            
        health_info = data.get('healthInfo')
        illness = data.get('illness', 'none')
        
        # Nếu không có healthInfo và illness, trả về mảng rỗng
        if not health_info and illness == 'none':
            return jsonify({
                'recommended_tags': [],
                'exclude_tags': []
            })
            
        print("Received health_info:", health_info)
        print("Received illness:", illness)
        
        recommended_tags = []
        exclude_tags = []
        
        # Xử lý exclude tags dựa trên illness
        if illness and illness != 'none':
            # Mapping giữa illness và tags cần tránh
            illness_exclude_map = {
                'knee_pain': ['HIIT', 'Jumping', 'Squats', 'Running', 'Plyometrics'],
                'leg_pain': ['HIIT', 'Jumping', 'Squats', 'Running', 'Plyometrics'],
                'back_pain': ['Deadlifts', 'Heavy Lifting', 'Twisting', 'Core'],
                'shoulder_injury': ['Overhead Press', 'Pull-ups', 'Push-ups', 'Shoulders'],
                'wrist_injury': ['Push-ups', 'Planks', 'Handstands', 'Biceps', 'Triceps'],
                'ankle_sprain': ['Running', 'Jumping', 'Plyometrics', 'Calves'],
                'asthma': ['HIIT', 'Long Distance Running', 'High Intensity', 'Cardio'],
                'chest_pain': ['High Intensity', 'Heavy Lifting', 'HIIT', 'Chest']
            }
            
            # Xử lý nhiều illness được phân tách bằng dấu phẩy
            illnesses = [i.strip() for i in illness.split(',')]
            for i in illnesses:
                if i in illness_exclude_map:
                    exclude_tags.extend(illness_exclude_map[i])
        
        # Nếu có healthInfo, thực hiện dự đoán tags
        if health_info:
            # Trích xuất features từ health info
            features = trainer.extract_all_features(health_info)
            print("Extracted features:", features)
            
            # Chuyển đổi features thành vector
            feature_vector = []
            for key in sorted(features.keys()):
                if isinstance(features[key], (int, float)):
                    feature_vector.append(features[key])
                elif isinstance(features[key], bool):
                    feature_vector.append(1 if features[key] else 0)
            
            print("Feature vector:", feature_vector)
            
            feature_vector = np.array(feature_vector).reshape(1, -1)
            
            # Chuẩn hóa features
            feature_vector = trainer.feature_scaler.transform(feature_vector)
            
            # Dự đoán tags
            recommend_predictions = trainer.recommend_model.predict([np.zeros((1, 1000)), feature_vector])[0]
            exclude_predictions = trainer.exclude_model.predict([np.zeros((1, 1000)), feature_vector])[0]
            
            print("Recommend predictions:", recommend_predictions)
            print("Exclude predictions:", exclude_predictions)
            
            # Lấy top recommended tags với ngưỡng thấp hơn
            recommend_indices = np.argsort(recommend_predictions)[::-1][:10]
            for i in recommend_indices:
                # Tính điểm dựa trên cả recommend và exclude
                score = recommend_predictions[i] * (1 - exclude_predictions[i])
                if score > 0.2:  # Hạ ngưỡng xuống 0.2
                    recommended_tags.append(trainer.valid_tags[i])
            
            # Thêm các tags có xác suất exclude cao từ model
            exclude_indices = np.argsort(exclude_predictions)[::-1][:5]
            for i in exclude_indices:
                if exclude_predictions[i] > 0.3 and trainer.valid_tags[i] not in exclude_tags:
                    exclude_tags.append(trainer.valid_tags[i])
        
        # Loại bỏ các tags trùng lặp
        exclude_tags = list(set(exclude_tags))
        
        print("Recommended tags:", recommended_tags)
        print("Exclude tags:", exclude_tags)
        
        return jsonify({
            'recommended_tags': recommended_tags,
            'exclude_tags': exclude_tags
        })
        
    except Exception as e:
        print("Error in predict_from_health:", str(e))
        return jsonify({
            'recommended_tags': [],
            'exclude_tags': []
        })

if __name__ == '__main__':
    # Load model khi khởi động
    trainer.load_model('tag_model')
    app.run(host='0.0.0.0', port=5000) 