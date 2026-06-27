import api from './api';

export const createPaymentOrder = async () => {
  const response = await api.post('/api/payment/order');
  return response.data;
};

export const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const response = await api.post('/api/payment/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await api.get('/api/payment/history');
  return response.data;
};
