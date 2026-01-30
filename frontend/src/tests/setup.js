import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock react-icons globally
vi.mock("react-icons/fa", () => ({
  FaPlus: () => "+",
  FaMinus: () => "-",
  FaTrash: () => "🗑", // Just a text, not a button
  FaShoppingCart: () => "🛒",
  FaSpinner: () => "⏳",
  FaExclamationTriangle: () => "⚠",
  FaCheckCircle: () => "✓",
  FaUtensils: () => "🍴",
  FaMotorcycle: () => "🏍",
  FaHome: () => "🏠",
}));

// Mock socket service
vi.mock("../services/socket", () => ({
  default: {
    connect: vi.fn(),
    subscribeToOrder: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Mock API services
vi.mock("../services/api", () => ({
  menuService: {
    getAllMenuItems: vi.fn(),
    getMenuItem: vi.fn(),
  },
  orderService: {
    createOrder: vi.fn(),
    getOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    cancelOrder: vi.fn(),
  },
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));
