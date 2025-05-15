import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Lấy danh sách membership theo gym owner
const getMembershipsByGym = async (gymId) => {
  const response = await axios.get(`${API_URL}/membership/gym/${gymId}`);
  return response.data;
};

// Lấy chi tiết một membership
const getMembershipById = async (id) => {
  const response = await axios.get(`${API_URL}/membership/${id}`);
  return response.data;
};

// Tạo membership mới
const createMembership = async (membershipData) => {
  try {
    // Chuẩn bị dữ liệu đúng với cấu trúc DB
    const data = {
      user_id: membershipData.user_id,
      membership_name: membershipData.membership_name,
      description: membershipData.description,
      membership_type: membershipData.membership_type || 1,
      price: membershipData.price,
      duration: membershipData.duration
    };

    console.log('Creating membership with data:', data);

    const response = await axios.post(`${API_URL}/membership`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating membership:', error);
    if (error.response && error.response.data) {
      console.error('API Error Details:', error.response.data);
    }
    throw error;
  }
};

// Cập nhật membership
const updateMembership = async (id, membershipData) => {
  try {
    if (!id) {
      throw new Error('Membership ID is required');
    }

    // Validate input data
    if (typeof membershipData !== 'object' || membershipData === null) {
      throw new Error('Invalid membership data');
    }

    // Chuẩn bị dữ liệu đúng với cấu trúc DB
    const allowedFields = [
      'membership_name', 
      'description', 
      'price', 
      'duration', 
      'membership_type', 
      'user_id'
    ];
    
    const data = {};
    
    // Lọc chỉ các trường hợp lệ và loại bỏ các giá trị undefined/null
    for (const field of allowedFields) {
      if (membershipData[field] !== undefined && membershipData[field] !== null) {
        data[field] = membershipData[field];
      }
    }

    // Kiểm tra nếu có dữ liệu để cập nhật
    if (Object.keys(data).length === 0) {
      return {
        status: 'warning',
        message: 'Không có dữ liệu nào được cung cấp để cập nhật',
        data: null
      };
    }

    console.log('Updating membership with data:', data);

    const response = await axios.patch(`${API_URL}/membership/${id}`, data);
    
    return {
      status: 'success',
      message: 'Cập nhật gói membership thành công',
      data: response.data
    };
  } catch (error) {
    console.error('Error updating membership:', error);
    
    // Xử lý lỗi chi tiết hơn
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Details:', error.response.data);
      
      throw {
        status: 'error',
        message: error.response.data.message || 'Lỗi khi cập nhật gói membership',
        statusCode: error.response.status,
        error: error.response.data
      };
    }
    
    throw {
      status: 'error',
      message: error.message || 'Lỗi kết nối đến server',
      error: error
    };
  }
};

// Xóa membership
const deleteMembership = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/membership/${id}`);
    
    return {
      status: 'success',
      message: 'Xóa gói membership thành công',
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting membership:', error);
    if (error.response && error.response.data) {
      console.error('API Error Details:', error.response.data);
    }
    throw {
      status: 'error',
      message: error.response?.data?.message || 'Lỗi khi xóa gói membership',
      error: error
    };
  }
};

// Lấy danh sách payment theo gym owner
const getPaymentsByGym = async (gymId) => {
  try {
    if (!gymId) {
      throw new Error('Gym ID is required');
    }

    console.log('Fetching payments for gym owner with ID:', gymId);
    const response = await axios.get(`${API_URL}/payment/gym/${gymId}`);
    
    return {
      status: 'success',
      message: 'Lấy danh sách thanh toán thành công',
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching payments for gym:', error);
    
    // Xử lý lỗi chi tiết
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Details:', error.response.data);
      
      throw {
        status: 'error',
        message: error.response.data.message || 'Lỗi khi lấy danh sách thanh toán',
        statusCode: error.response.status,
        error: error.response.data
      };
    }
    
    throw {
      status: 'error',
      message: error.message || 'Lỗi kết nối đến server',
      error: error
    };
  }
};

export {
  getMembershipsByGym,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  getPaymentsByGym
}; 