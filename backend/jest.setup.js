// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock logger to prevent file writing during tests
jest.mock('./utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  },
  requestLogger: jest.fn((req, res, next) => next()),
  errorLogger: jest.fn((err, req, res, next) => next(err)),
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn()
}));

// Global test utilities
global.testUtils = {
  // Generate test user data
  generateTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123',
    phone: '+966501234567',
    role: 'customer',
    ...overrides
  }),

  // Generate test business data
  generateTestBusiness: (overrides = {}) => ({
    name: 'Test Business',
    category: 'clinic',
    phone: '+966501234568',
    email: `business${Date.now()}@example.com`,
    address: {
      city: 'Riyadh',
      street: 'Test Street'
    },
    workingHours: {
      monday: { isOpen: true, open: '09:00', close: '17:00' },
      tuesday: { isOpen: true, open: '09:00', close: '17:00' },
      wednesday: { isOpen: true, open: '09:00', close: '17:00' },
      thursday: { isOpen: true, open: '09:00', close: '17:00' },
      friday: { isOpen: false },
      saturday: { isOpen: true, open: '10:00', close: '16:00' },
      sunday: { isOpen: false }
    },
    ...overrides
  }),

  // Generate test service data
  generateTestService: (overrides = {}) => ({
    name: 'Test Service',
    duration: 60,
    price: 100,
    category: 'consultation',
    description: 'Test service description',
    ...overrides
  }),

  // Generate test booking data
  generateTestBooking: (overrides = {}) => ({
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    startTime: '14:00',
    notes: { customer: 'Test notes' },
    ...overrides
  })
};

