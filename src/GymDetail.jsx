const handlePayment = async () => {
  try {
    const paymentData = {
      amount_paid: selectedMembership.price,
      user_id: userId,
      membership_id: selectedMembership.id
    };
    
    // Gọi API tạo payment
    const response = await axios.post('http://localhost:3000/payment', paymentData);
    
    // Nhận payment_url từ response và chuyển hướng người dùng
    if (response.data.payment_url) {
      window.location.href = response.data.payment_url;  // Chuyển hướng đến trang thanh toán ZaloPay
    }
  } catch (error) {
    console.error('Lỗi khi tạo payment:', error);
  }
};

// Trong phần render
return (
  <div>
    {/* ... other components ... */}
    <button onClick={handlePayment}>
      Thanh toán qua ZaloPay
    </button>
  </div>
); 