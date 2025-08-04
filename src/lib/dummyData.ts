// utils/dummyData.ts
interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  createdAt?: string;
  lastLogin?: string;
}

// Dummy users data for testing
export const dummyUsers: User[] = [
  {
    id: "dummy_1",
    name: "أحمد محمد",
    phone: "0512345678",
    password: "12345678",
    createdAt: "2024-01-15T10:30:00.000Z",
    lastLogin: "2024-01-20T14:22:00.000Z",
  },
  {
    id: "dummy_2",
    name: "رويدا على",
    phone: "0523456789",
    password: "123456",
    createdAt: "2024-01-16T09:15:00.000Z",
    lastLogin: "2024-01-21T16:45:00.000Z",
  },
  {
    id: "dummy_3",
    name: "محمد عبدالله",
    phone: "0534567890",
    password: "123456",
    createdAt: "2024-01-17T11:20:00.000Z",
    lastLogin: "2024-01-22T08:30:00.000Z",
  },
  {
    id: "dummy_4",
    name: "عائشة حسن",
    phone: "0545678901",
    password: "123456",
    createdAt: "2024-01-18T13:45:00.000Z",
    lastLogin: "2024-01-23T12:15:00.000Z",
  },
  {
    id: "dummy_5",
    name: "خالد أحمد",
    phone: "0556789012",
    password: "123456",
    createdAt: "2024-01-19T15:30:00.000Z",
    lastLogin: "2024-01-24T10:00:00.000Z",
  },
];

// Generate dummy token
export const generateDummyToken = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 15);
  return `dummy_token_${timestamp}_${randomString}`;
};

// Dummy OTP for testing
export const DUMMY_OTP = "1234";

// Helper to check if phone exists in dummy data
export const phoneExistsInDummyData = (phone: string): boolean => {
  return dummyUsers.some((user) => user.phone === phone);
};

// Helper to get user by phone
export const getUserByPhone = (phone: string): User | undefined => {
  return dummyUsers.find((user) => user.phone === phone);
};

// Helper to validate user credentials
export const validateUserCredentials = (
  phone: string,
  password: string
): User | null => {
  const user = dummyUsers.find(
    (user) => user.phone === phone && user.password === password
  );
  return user || null;
};

// Helper to add new user to dummy data
export const addUserToDummyData = (user: User): void => {
  dummyUsers.push(user);
};

// Helper to get all dummy users (for debugging)
export const getAllDummyUsers = (): User[] => {
  return [...dummyUsers];
};

export type { User };
