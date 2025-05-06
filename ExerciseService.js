import axios from 'axios';

const API_URL = 'http://localhost:3000/exercise-post';

class ExerciseService {
  constructor() {
    axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  // Lấy tất cả bài tập
  async getAll() {
    return axios.get(API_URL);
  }

  // Alias for getAll() to maintain compatibility
  async getAllExercisePosts() {
    return this.getAll();
  }

  async createExercisePost(data, file) {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    
    // Xử lý tagIds
    if (data.tagIds && Array.isArray(data.tagIds)) {
      data.tagIds.forEach((tagId, index) => {
        // Chuyển tagId thành số nếu là chuỗi
        const numericTagId = typeof tagId === 'string' ? parseInt(tagId) : tagId;
        formData.append(`tagIds[${index}]`, numericTagId);
      });
    }
    
    // Xử lý steps
    if (data.steps && Array.isArray(data.steps)) {
      data.steps.forEach((step, index) => {
        Object.keys(step).forEach(key => {
          formData.append(`steps[${index}][${key}]`, step[key] === null ? '' : step[key]);
        });
      });
    }
    
    // Quan trọng: Đảm bảo tên file đúng với tên trong FileInterceptor (image)
    if (file) {
      formData.append('image', file);
    }
    
    if (data.video_rul) {
      formData.append('video_rul', data.video_rul);
    }
    
    // QUAN TRỌNG: Phải truyền user_id từ dữ liệu, KHÔNG được mặc định là 1
    if (data.user_id) {
      formData.append('user_id', data.user_id);
    }
    
    // Debug
    console.log("FormData entries for create:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]));
    }
    
    return axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeader()
      }
    });
  }

  // Alias for getExercisePostById to maintain compatibility
  async getById(id) {
    return this.getExercisePostById(id);
  }

  async getExercisePostById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  async updateExercisePost(id, data, file) {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    
    // Xử lý tagIds
    if (data.tagIds && Array.isArray(data.tagIds)) {
      data.tagIds.forEach((tagId, index) => {
        // Chuyển tagId thành số nếu là chuỗi
        const numericTagId = typeof tagId === 'string' ? parseInt(tagId) : tagId;
        formData.append(`tagIds[${index}]`, numericTagId);
      });
    }
    
    // Xử lý steps
    if (data.steps && Array.isArray(data.steps)) {
      data.steps.forEach((step, index) => {
        Object.keys(step).forEach(key => {
          formData.append(`steps[${index}][${key}]`, step[key] === null ? '' : step[key]);
        });
      });
    }
    
    // Quan trọng: Đảm bảo tên file đúng với tên trong FileInterceptor (image)
    if (file) {
      formData.append('image', file);
    }
    
    if (data.video_rul) {
      formData.append('video_rul', data.video_rul);
    }
    
    // Truyền user_id nếu có
    if (data.user_id) {
      formData.append('user_id', data.user_id);
    }
    
    // Luôn gán status_id mặc định là 1 khi update exercise
    formData.append('status_id', data.status_id || '1');
    
    // Để debug
    console.log("FormData entries for update:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]));
    }
    
    return axios.patch(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeader()
      }
    });
  }
  
  async updateExercisePostStatus(id, status_id) {
    return axios.patch(`${API_URL}/${id}/status`, { status_id }, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });
  }

  async deleteExercisePost(id) {
    return axios.delete(`${API_URL}/${id}`);
  }

  async getAllTags() {
    try {
      const response = await axios.get(`${API_URL}/tag/tag`);
      console.log("getAllTags response:", response.data);
      return response;
    } catch (error) {
      console.error("Error in getAllTags:", error);
      // Nếu API gốc lỗi, thử API thay thế
      try {
        console.log("Trying alternative tag API endpoint");
        const altResponse = await axios.get(`${API_URL}/tag`);
        console.log("Alternative tag API response:", altResponse.data);
        return altResponse;
      } catch (altError) {
        console.error("Error in alternative tag API:", altError);
        // Trả về một đối tượng với mảng rỗng để tránh lỗi
        return { data: [] };
      }
    }
  }
}

export default new ExerciseService();