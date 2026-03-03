import api from "../axiosConfig";

// Example structure based on your provided fetchOrderDetails
export const fetchAgentDashboard = async () => {
  try {
    const response = await api.get('employees/agent/dashboard/');
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [Dashboard API] Error:', error);
    throw error;
  }
};

export const fetchAgentRankings = async () => {
  try {
    const response = await api.get('employees/agent/rankings/');
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [Rankings API] Error:', error);
    throw error;
  }
};

export const fetchAgentProfile = async () => {
  try {
    const response = await api.get('employees/agent/profile/');
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [Profile API] Error:', error);
    throw error;
  }
};


export const fetchOrderHistory = async (filter: string) => {
  try {
    let time = 'all_time';
    let status = '';

    // Mapping UI Filters to API Parameters
    switch (filter) {
      case 'Today':
        time = 'today';
        break;
      case 'This Month':
        time = 'this_month';
        break;
      case 'Delivered':
        status = 'delivered';
        break;
      case 'Returned':
        status = 'returned';
        break;
      case 'Damaged':
        status = 'damaged';
        break;
      case 'Not Delivered':
        status = 'undelivered';
        break;
    }

    const query = `orders/agent/history/?time=${time}${
      status ? `&status=${status}` : ''
    }`;
    const response = await api.get(query);
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [History API] Error:', error);
    throw error;
  }
};

// Fetch Profile
export const getProfile = async () => {
  const response = await api.get('employees/agent/profile/');
  
  return response.data.results.data;
};

// Update Status
export const updateStatus = async (newStatus) => {
  console.log('new status is', newStatus);
  
  const response = await api.patch('employees/agent/profile/', {
    availability_status: newStatus,
  });
  return response.data.results.data;
};

/**
 * Fetch New Assignments
 * Endpoint: orders/agent/assignments/
 */
export const fetchAssignments = async () => {
  try {
    const response = await api.get('orders/agent/assignments/');
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [Assignments API] Error:', error);
    throw error;
  }
};

/**
 * Fetch Active Deliveries
 * Endpoint: orders/agent/active/
 */
export const fetchActiveOrders = async () => {
  try {
    const response = await api.get('orders/agent/active/');
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [Active Orders API] Error:', error);
    throw error;
  }
};

export const fetchCashReport = async (time: string = 'today') => {
  try {
    const response = await api.get(`orders/agent/cash-report/?time=${time}`);
    return response.data.results.data;
  } catch (error) {
    console.error('❌ [Cash Report API] Error:', error);
    throw error;
  }
};


/**
 * Fetch specific order details
 */
export const fetchOrderDetail = async (orderId: string) => {
  const response = await api.get(`orders/agent/order/detail/?id=${orderId}`);
  // Returning the first item from the data array as per your JSON structure
  return response.data.results.data[0];
};

/**
 * Update Order Status
 * Actions: 'accept', 'pickup', 'out_for_delivery', 'failed', 'returned', 'damaged', 'verify_otp'
 */
export const updateOrderStatus = async (orderId: string, action: string, extraData: any = {}) => {
  const payload = { action, ...extraData };
  const response = await api.post(`orders/agent/update-status/${orderId}/`, payload);
  return response.data;
};


export const reportOrderIssue = async (
  orderId: string,
  reason: string,
  remarks: string,
  imageUri?: string,
) => {
  const formData = new FormData();
  formData.append('order', orderId);
  formData.append('reason', reason);
  formData.append('remarks', remarks);

  if (imageUri) {
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);
  }

  const response = await api.post(
    'orders/agent/order/report-issue/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};