// Lấy health analysis của user
async getHealthAnalysis(userId) {
  try {
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      throw new Error('User ID phải là một số');
    }

    const response = await axios.get(`${API_URL}/${numericUserId}/health-analysis`);
    
    if (response.data.status === 'success') {
      return {
        status: 'success',
        data: {
          userId: numericUserId,
          healthInfo: response.data.data.healthInfo || '',
          illness: response.data.data.illness || '',
          recommended_tags: response.data.data.recommended_tags || [],
          exclude_tags: response.data.data.exclude_tags || [],
          message: response.data.data.message || ''
        }
      };
    }

    return {
      status: 'error',
      message: response.data.message || 'Không thể lấy được thông tin phân tích sức khỏe'
    };

  } catch (error) {
    console.error('Error in getHealthAnalysis:', error);
    throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi phân tích thông tin sức khỏe');
  }
} 