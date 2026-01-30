const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await MenuItem.deleteMany({});
});

describe("Order API", () => {
  describe("POST /api/orders", () => {
    it("should create a new order", async () => {
      const menuItem = await MenuItem.create({
        name: "Test Pizza",
        description: "Delicious pizza",
        price: 12.99,
        image: "test.jpg",
        category: "pizza",
      });

      const orderData = {
        customer: {
          name: "John Doe",
          address: "123 Main St",
          phone: "555-1234",
        },
        items: [
          {
            menuItemId: menuItem._id,
            quantity: 2,
          },
        ],
      };

      const response = await request(app)
        .post("/api/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.customer.name).toBe("John Doe");
      expect(response.body.totalAmount).toBe(25.98);
      expect(response.body.status).toBe("Order Received");
    });

    it("should return 400 for invalid order data", async () => {
      const response = await request(app)
        .post("/api/orders")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should get order by ID", async () => {
      const order = await Order.create({
        customer: {
          name: "Test User",
          address: "Test Address",
          phone: "555-1234",
        },
        items: [],
        totalAmount: 0,
      });

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .expect(200);

      expect(response.body.customer.name).toBe("Test User");
    });

    it("should return 404 for non-existent order", async () => {
      const response = await request(app)
        .get("/api/orders/507f1f77bcf86cd799439011")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should update order status", async () => {
      const order = await Order.create({
        customer: {
          name: "Test User",
          address: "Test Address",
          phone: "555-1234",
        },
        items: [],
        totalAmount: 0,
      });

      const response = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: "Preparing" })
        .expect(200);

      expect(response.body.status).toBe("Preparing");
    });

    it("should return 400 for invalid status", async () => {
      const order = await Order.create({
        customer: {
          name: "Test User",
          address: "Test Address",
          phone: "555-1234",
        },
        items: [],
        totalAmount: 0,
      });

      const response = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: "Invalid Status" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
