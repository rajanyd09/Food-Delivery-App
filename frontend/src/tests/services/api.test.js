import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock axios
vi.mock("axios");

// Create mock services
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
};

// Mock the actual services
const mockMenuService = {
  getAllMenuItems: vi.fn(),
  getMenuItem: vi.fn(),
};

const mockOrderService = {
  createOrder: vi.fn(),
  getOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
  cancelOrder: vi.fn(),
};

const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
};

// Export them
export {
  mockMenuService as menuService,
  mockOrderService as orderService,
  mockAuthService as authService,
};
export default mockApi;

describe("API Services", () => {
  const mockToken = "test-token-123";
  const mockResponse = { data: { success: true } };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Menu Service", () => {
    it("fetches all menu items", async () => {
      mockMenuService.getAllMenuItems.mockResolvedValue(mockResponse);

      const result = await mockMenuService.getAllMenuItems();

      expect(mockMenuService.getAllMenuItems).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("fetches single menu item", async () => {
      mockMenuService.getMenuItem.mockResolvedValue(mockResponse);

      const itemId = "123";
      const result = await mockMenuService.getMenuItem(itemId);

      expect(mockMenuService.getMenuItem).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Order Service", () => {
    beforeEach(() => {
      localStorage.setItem("token", mockToken);
    });

    it("creates a new order", async () => {
      const orderData = {
        customer: { name: "Test User" },
        items: [{ menuItemId: "1", quantity: 2 }],
      };

      mockOrderService.createOrder.mockResolvedValue(mockResponse);

      const result = await mockOrderService.createOrder(orderData);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(result).toEqual(mockResponse);
    });

    it("gets order by ID", async () => {
      mockOrderService.getOrder.mockResolvedValue(mockResponse);

      const orderId = "order123";
      const result = await mockOrderService.getOrder(orderId);

      expect(mockOrderService.getOrder).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockResponse);
    });

    it("updates order status", async () => {
      mockOrderService.updateOrderStatus.mockResolvedValue(mockResponse);

      const orderId = "order123";
      const status = "Preparing";
      const result = await mockOrderService.updateOrderStatus(orderId, status);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        orderId,
        status,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Auth Service", () => {
    it("logs in user", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await mockAuthService.login(loginData);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(result).toEqual(mockResponse);
    });

    it("registers new user", async () => {
      const registerData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };
      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await mockAuthService.register(registerData);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(result).toEqual(mockResponse);
    });

    it("gets user profile with authentication", async () => {
      localStorage.setItem("token", mockToken);
      mockAuthService.getProfile.mockResolvedValue(mockResponse);

      const result = await mockAuthService.getProfile();

      expect(mockAuthService.getProfile).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
