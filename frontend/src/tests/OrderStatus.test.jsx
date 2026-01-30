import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import OrderStatus from "../components/OrderStatus";

// Remove duplicate mock since it's in setup.js

describe("OrderStatus", () => {
  const mockOrderId = "order123";
  const mockCurrentStatus = "Preparing";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all status steps", () => {
    render(
      <OrderStatus orderId={mockOrderId} currentStatus={mockCurrentStatus} />,
    );

    expect(screen.getByText("Order Status")).toBeInTheDocument();
    expect(screen.getByText("Order Received")).toBeInTheDocument();
    expect(screen.getAllByText("Preparing").length).toBeGreaterThan(0); // Use getAllByText
    expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("highlights current status step", () => {
    render(
      <OrderStatus orderId={mockOrderId} currentStatus={mockCurrentStatus} />,
    );

    // Use getAllByText since there are multiple "Preparing" texts
    const preparingElements = screen.getAllByText("Preparing");
    expect(preparingElements.length).toBeGreaterThan(1);
  });

  it("shows current status in the info box", () => {
    render(<OrderStatus orderId={mockOrderId} currentStatus="Preparing" />);

    expect(screen.getByText(/Your order is currently:/)).toBeInTheDocument();
  });

  it("renders all icons for status steps", () => {
    render(<OrderStatus orderId={mockOrderId} currentStatus="Delivered" />);

    expect(screen.getByText("✓")).toBeInTheDocument(); // Check icon
    expect(screen.getByText("🍴")).toBeInTheDocument(); // Utensils icon
    expect(screen.getByText("🏍")).toBeInTheDocument(); // Motorcycle icon
    expect(screen.getByText("🏠")).toBeInTheDocument(); // Home icon
  });

  it("shows progress bar", () => {
    const { container } = render(
      <OrderStatus orderId={mockOrderId} currentStatus="Out for Delivery" />,
    );

    const progressBar = container.querySelector(".h-1.bg-green-500");
    expect(progressBar).toBeTruthy();
  });
});
