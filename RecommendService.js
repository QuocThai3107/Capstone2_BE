import axios from 'axios';

const API_URL = 'http://localhost:3000';
const TAG_PREDICT_URL = `${API_URL}/tags/predict-for-user`;
const EXERCISE_URL = `${API_URL}/exercise-post`;

class RecommendService {
  /**
   * Lấy dự đoán tags theo user ID
   * @param {number} userId - ID của user cần dự đoán tag
   * @returns {Promise<Object>} - Kết quả dự đoán tags (recommend và exclude tags)
   */
  async getPredictTagsForUser(userId) {
    try {
      const response = await axios.get(`${TAG_PREDICT_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting tag predictions for user:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm bài tập theo danh sách tags
   * @param {string[]} includeTags - Danh sách tags muốn tìm (logic OR)
   * @param {string[]} excludeTags - Danh sách tags muốn loại trừ (logic AND)
   * @returns {Promise<Object>} - Danh sách bài tập phù hợp
   */
  async searchExercisesByTags(includeTags = [], excludeTags = []) {
    try {
      // Chỉ truyền các tags không rỗng
      const validIncludeTags = includeTags.filter(tag => tag && tag.trim() !== '');
      const validExcludeTags = excludeTags.filter(tag => tag && tag.trim() !== '');
      
      // Tạo tham số query
      const params = new URLSearchParams();
      if (validIncludeTags.length > 0) {
        params.append('includeTags', validIncludeTags.join(','));
      }
      if (validExcludeTags.length > 0) {
        params.append('excludeTags', validExcludeTags.join(','));
      }
      
      // Gửi request tìm kiếm
      const response = await axios.get(`${EXERCISE_URL}/search/bytags`, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching exercises by tags:', error);
      throw error;
    }
  }

  /**
   * Kết hợp dự đoán tags cho người dùng và tìm bài tập phù hợp
   * @param {number} userId - ID của user cần đề xuất bài tập
   * @returns {Promise<Object>} - Kết quả đề xuất bài tập dựa trên tags được dự đoán
   */
  async getRecommendedExercisesForUser(userId) {
    try {
      // Bước 1: Lấy dự đoán tags cho user
      const tagPredictions = await this.getPredictTagsForUser(userId);
      
      // Kiểm tra nếu có kết quả dự đoán
      if (!tagPredictions || !tagPredictions.data) {
        throw new Error('Không thể lấy dự đoán tags cho người dùng');
      }
      
      const { recommendTags, excludeTags } = tagPredictions.data;
      
      // Bước 2: Tìm kiếm bài tập phù hợp
      const exercises = await this.searchExercisesByTags(recommendTags, excludeTags);
      
      // Bước 3: Trả về kết quả
      return {
        status: 'success',
        tags: tagPredictions.data,
        exercises: exercises.data
      };
    } catch (error) {
      console.error('Error getting recommended exercises for user:', error);
      return {
        status: 'error',
        message: 'Có lỗi khi đề xuất bài tập cho người dùng',
        error: error.message
      };
    }
  }
}

export default new RecommendService(); 