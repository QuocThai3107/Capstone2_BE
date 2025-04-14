import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const EXERCISE_POST_URL = `${BASE_URL}/exercise-post`;
const TAG_URL = `${BASE_URL}/exercise-post-tag/tag`;

class ExerciseService {
  // CRUD cơ bản cho ExercisePost
  
  // Lấy tất cả bài tập
  async getAll() {
    return axios.get(EXERCISE_POST_URL);
  }

  // Tìm bài tập theo tên tag (chỉ lấy bài tập có tag A và KHÔNG có tag B)
  async searchByTagNames(includeTags = [], excludeTags = []) {
    try {
      const response = await axios.get(`${EXERCISE_POST_URL}/search/bytags`, {
        params: { 
          includeTags: includeTags.join(','),
          excludeTags: excludeTags.join(','),
          strict: true // Thêm flag để backend biết là cần lọc nghiêm ngặt
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching exercises by tag names:', error);
      throw error;
    }
  }

  // Lấy chi tiết một bài tập theo ID
  async getById(id) {
    return axios.get(`${EXERCISE_POST_URL}/${id}`);
  }

  // Tạo bài tập mới
  async create(exerciseData) {
    const formData = new FormData();
    
    // Thêm thông tin cơ bản
    formData.append('name', exerciseData.name);
    formData.append('description', exerciseData.description);
    formData.append('user_id', exerciseData.user_id);
    
    if (exerciseData.video_rul) {
      formData.append('video_rul', exerciseData.video_rul);
    }
    
    // Thêm ảnh nếu có
    if (exerciseData.imgFile) {
      formData.append('imgUrl', exerciseData.imgFile);
    }
    
    // Thêm tags nếu có
    if (exerciseData.tagIds && exerciseData.tagIds.length > 0) {
      exerciseData.tagIds.forEach(tagId => {
        formData.append('tagIds', tagId);
      });
    }
    
    // Thêm steps nếu có
    if (exerciseData.steps && exerciseData.steps.length > 0) {
      exerciseData.steps.forEach((step, index) => {
        formData.append(`steps[${index}][stepNumber]`, step.stepNumber);
        formData.append(`steps[${index}][instruction]`, step.instruction);
        if (step.imgUrl) {
          formData.append(`steps[${index}][imgUrl]`, step.imgUrl);
        }
      });
    }
    
    return axios.post(EXERCISE_POST_URL, formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    });
  }

  // Cập nhật bài tập
  async update(id, updateData) {
    const formData = new FormData();
    
    // Thêm các trường cần cập nhật
    if (updateData.name) formData.append('name', updateData.name);
    if (updateData.description) formData.append('description', updateData.description);
    if (updateData.video_rul) formData.append('video_rul', updateData.video_rul);
    
    // Thêm ảnh mới nếu có
    if (updateData.imgFile) {
      formData.append('imgUrl', updateData.imgFile);
    }
    
    // Thêm tags mới nếu có
    if (updateData.tagIds && updateData.tagIds.length > 0) {
      updateData.tagIds.forEach(tagId => {
        formData.append('tagIds', tagId);
      });
    }
    
    // Thêm steps mới nếu có
    if (updateData.steps && updateData.steps.length > 0) {
      updateData.steps.forEach((step, index) => {
        formData.append(`steps[${index}][stepNumber]`, step.stepNumber);
        formData.append(`steps[${index}][instruction]`, step.instruction);
        if (step.imgUrl) {
          formData.append(`steps[${index}][imgUrl]`, step.imgUrl);
        }
      });
    }
    
    return axios.patch(`${EXERCISE_POST_URL}/${id}`, formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    });
  }

  // Xóa bài tập
  async delete(id) {
    return axios.delete(`${EXERCISE_POST_URL}/${id}`);
  }

  // Thao tác với Tags
  
  // Lấy tất cả tags
  async getAllTags() {
    return axios.get(TAG_URL);
  }
  
  // Tạo tag mới
  async createTag(tagName) {
    return axios.post(TAG_URL, { tag_name: tagName });
  }
}

export default new ExerciseService();