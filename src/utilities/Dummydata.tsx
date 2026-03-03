// types.ts
export interface DashboardData {
  activeDeliveries: number;
  completedToday: number;
  pendingPickups: number;
  cashInHand: number;
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthOrders: number;
  totalDeliveries: number;
  globalRank: number;
  rankPercentile: number;
  newAssignmentsCount: number;
}

// Mock API Call
export const fetchDashboardStats = (): Promise<DashboardData> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        activeDeliveries: 4,
        completedToday: 0,
        pendingPickups: 1,
        cashInHand: 330.26,
        todayRevenue: 0.0,
        todayOrders: 0,
        monthRevenue: 770.66,
        monthOrders: 2,
        totalDeliveries: 2,
        globalRank: 4,
        rankPercentile: 5,
        newAssignmentsCount: 1,
      });
    }, 1000);
  });
};

export interface Order {
  id: string;
  date: string;
  customerName: string;
  address: string;
  weight: string;
  orderValue: string;
  paymentMethod: string;
  specialInstructions?: string;
  productName: string;
  productQty: number;
  status?: OrderStatus;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD1006',
    date: '24 Feb',
    customerName: 'Frank White',
    address: '303 Cedar Pl, Newville, USA 44556',
    weight: '0.5 kg',
    orderValue: 'AED 80.74',
    paymentMethod: 'Cash on Delivery',
    specialInstructions: 'Apartment #3B. Use buzzer.',
    productName: 'Coffee Beans (1kg)',
    productQty: 1,
  },
];


// types.ts
export type OrderStatus =
  | 'Delivered'
  | 'Failed'
  | 'Returned'
  | 'Damaged'
  | 'Not Delivered'
  | 'Out for Delivery'
  | 'Picked Up'
  | 'Accepted';

// Simulated API
export const fetchHistory = async (filter: string): Promise<Order[]> => {
  const allData: Order[] = [
    {
      id: 'ORD1004',
      date: '24 Feb',
      customerName: 'David Lee',
      address: '101 Maple Dr, Everytown, USA 10112',
      weight: '1.2 kg',
      status: 'Delivered',
      orderValue: 'AED 80.74',
      paymentMethod: 'Cash on Delivery',
      productName: 'Coffee Beans (1kg)',
      productQty: 1,
    },
    {
      id: 'ORD1005',
      date: '22 Feb',
      customerName: 'Eva Green',
      address: '202 Birch Rd, Lastplace, USA 22334',
      weight: '3.0 kg',
      status: 'Failed',
      specialInstructions: 'Apartment #3B. Use buzzer.',
      orderValue: 'AED 80.74',
      paymentMethod: 'Cash on Delivery',
      productName: 'Coffee Beans (1kg)',
      productQty: 3,
    },
    {
      id: 'ORD1008',
      date: '21 Feb',
      customerName: 'Henry Chen',
      address: '505 Spruce Way, Suburbia, USA 99001',
      weight: '10.2 kg',
      status: 'Delivered',
      specialInstructions: 'Apartment #3B. Use buzzer.',
      orderValue: 'AED 80.74',
      paymentMethod: 'Cash on Delivery',
      productName: 'Coffee Beans (1kg)',
      productQty: 2,
    },
  ];

  // In a real app, you'd send the 'filter' param to your backend
  if (filter === 'All Time') return allData;
  return allData.filter(
    item => item.status.toLowerCase() === filter.toLowerCase(),
  );
};


// types.ts
export interface ProfileData {
  name: string;
  agentId: string;
  role: string;
  vehicle: string;
  isAvailable: boolean;
  onTimeRate: string;
  returnRate: string;
  avgDropTime: string;
  cashAccuracy: string;
  totalOrders: number;
  teamAvgOrders: number;
  rating: number;
  teamAvgRating: number;
}

export const fetchProfile = (): Promise<ProfileData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Devin Patel',
        agentId: 'DP-052',
        role: 'Warehouse Delivery Agent',
        vehicle: 'Blue E-Bike (Reg: EB-45-XYZ)',
        isAvailable: true,
        onTimeRate: '66.7%',
        returnRate: '33.3%',
        avgDropTime: '12m',
        cashAccuracy: '100%',
        totalOrders: 2,
        teamAvgOrders: 120,
        rating: 4.9,
        teamAvgRating: 4.6,
      });
    }, 500);
  });
};