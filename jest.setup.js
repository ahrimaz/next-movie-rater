// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

// Mock fetch globally for all tests
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  notFound: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Prisma Client
// This will mock the prisma client for all tests.
// If you need to test actual database interactions, you'll need a different setup.
jest.mock('@/lib/db', () => {
  const { PrismaClient } = require('@prisma/client'); // Import original
  const actualPrisma = jest.requireActual('@prisma/client'); // Import original

  // Create a mock instance of PrismaClient
  const mockPrismaClient = {
    // Mock specific models and their methods as needed by your tests
    movieList: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    movieListItem: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    movie: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    // You can add other models or $transaction, etc., if your API routes use them
    // For example:
    // $transaction: jest.fn().mockImplementation(async (callback) => callback(mockPrismaClient)),
  };
  
  // Allow dynamic mock implementation per test if needed, by exposing the mock client
  // e.g. (prisma.movieList.create as jest.Mock).mockResolvedValueOnce(...)
  return {
    __esModule: true, // This is important for ES modules
    default: mockPrismaClient,
    Prisma: actualPrisma.Prisma, // Export Prisma types if needed
  };
});
