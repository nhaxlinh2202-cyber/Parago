// ===================================================
// PARAGO - Mock Data for UI Development
// ===================================================

export interface User {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  faculty: string;
  rating: number;
  totalRides: number;
  verified: boolean;
  isPremium: boolean;
  role: "passenger" | "driver" | "moderator" | "admin";
  trustScore: number;
  ecoPoints: number;
}

export interface Ride {
  id: string;
  driver: User;
  pickup: string;
  pickupShort: string;
  destination: string;
  destinationShort: string;
  departureTime: string;
  date: string;
  seats: number;
  seatsAvailable: number;
  price: number;
  mode: "community" | "gas-tip";
  status: "published" | "matched" | "confirmed" | "in-progress" | "completed" | "cancelled";
  matchScore?: number;
  distance: string;
  duration: string;
  vehicleType: "motorcycle" | "car";
  vehicleName?: string;
  recurring?: "daily" | "weekly";
  genderPreference?: "same" | "male" | "female" | "any";
  notes?: string;
  passengers: User[];
  createdAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "ride-card" | "system";
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  rideId?: string;
}

export interface HostelListing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  roommates: number;
  area: number;
  contact: string;
  postedBy: User;
  postedAt: string;
}

export interface SocialPost {
  id: string;
  author: User;
  content: string;
  type: "need-ride" | "offer-ride" | "roommate" | "weekend-trip";
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  createdAt: string;
  images?: string[];
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activeRides: number;
  completedRides: number;
  revenue: number;
  premiumSubscribers: number;
  safetyIncidents: number;
  rideCompletionRate: number;
  userRetention: number;
}

// ---- MOCK USERS ----
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Nguyễn Minh Anh",
    university: "ĐH Bách Khoa Hà Nội",
    faculty: "Công nghệ Thực phẩm",
    rating: 4.9,
    totalRides: 127,
    verified: true,
    isPremium: true,
    role: "driver",
    trustScore: 95,
    ecoPoints: 2450,
  },
  {
    id: "u2",
    name: "Trần Đức Huy",
    university: "ĐH Bách Khoa Hà Nội",
    faculty: "CNTT",
    rating: 4.8,
    totalRides: 89,
    verified: true,
    isPremium: false,
    role: "driver",
    trustScore: 92,
    ecoPoints: 1800,
  },
  {
    id: "u3",
    name: "Lê Thị Hương",
    university: "ĐH Bách Khoa Hà Nội",
    faculty: "Kinh tế",
    rating: 4.7,
    totalRides: 45,
    verified: true,
    isPremium: false,
    role: "passenger",
    trustScore: 88,
    ecoPoints: 960,
  },
  {
    id: "u4",
    name: "Phạm Văn Đức",
    university: "ĐH Quốc Gia Hà Nội",
    faculty: "Luật",
    rating: 4.6,
    totalRides: 34,
    verified: true,
    isPremium: true,
    role: "driver",
    trustScore: 85,
    ecoPoints: 720,
  },
  {
    id: "u5",
    name: "Hoàng Thị Mai",
    university: "ĐH Bách Khoa Hà Nội",
    faculty: "Sinh học",
    rating: 5.0,
    totalRides: 67,
    verified: true,
    isPremium: false,
    role: "passenger",
    trustScore: 98,
    ecoPoints: 1540,
  },
];

export const currentUser: User = mockUsers[0];

// ---- MOCK RIDES ----
// Removed mockRides

// ---- MOCK CONVERSATIONS ----
// Removed mockConversations

// ---- MOCK MESSAGES ----
// Removed mockMessages

// ---- ADMIN STATS ----
export const mockAdminStats: AdminStats = {
  totalUsers: 12847,
  verifiedUsers: 9623,
  activeRides: 342,
  completedRides: 28456,
  revenue: 156780000,
  premiumSubscribers: 1247,
  safetyIncidents: 3,
  rideCompletionRate: 94.7,
  userRetention: 87.3,
};

export const mockChartData = {
  userGrowth: [
    { month: "T1", users: 2400 },
    { month: "T2", users: 3600 },
    { month: "T3", users: 5200 },
    { month: "T4", users: 6800 },
    { month: "T5", users: 8900 },
    { month: "T6", users: 12847 },
  ],
  ridesByDay: [
    { day: "T2", rides: 45 },
    { day: "T3", rides: 52 },
    { day: "T4", rides: 48 },
    { day: "T5", rides: 61 },
    { day: "T6", rides: 55 },
    { day: "T7", rides: 38 },
    { day: "CN", rides: 23 },
  ],
  revenueByMonth: [
    { month: "T1", revenue: 12000000 },
    { month: "T2", revenue: 18500000 },
    { month: "T3", revenue: 24300000 },
    { month: "T4", revenue: 28900000 },
    { month: "T5", revenue: 35600000 },
    { month: "T6", revenue: 37480000 },
  ],
};
