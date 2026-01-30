import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Cart from "../components/Cart";

describe("Cart", () => {
  const mockMenuItems = [
    {
      _id: "1",
      name: "Test Pizza",
      description: "Delicious pizza",
      price: 12.99,
      image: "pizza.jpg",
    },
    {
      _id: "2",
      name: "Test Burger",
      description: "Juicy burger",
      price: 8.99,
      image: "burger.jpg",
    },
  ];

  const mockCartItems = [
    { menuItemId: "1", quantity: 2 },
    { menuItemId: "2", quantity: 1 },
  ];

  const mockOnUpdateQuantity = vi.fn();
  const mockOnRemoveItem = vi.fn();
  const mockOnCheckout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty cart message when no items", () => {
    render(
      <Cart
        cartItems={[]}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    expect(screen.getByText("Your cart is empty")).toBeDefined();
    expect(screen.queryByText("Your Cart")).toBeNull();
  });

  it("renders cart items when items exist", () => {
    render(
      <Cart
        cartItems={mockCartItems}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    expect(screen.getByText(/Shopping Cart/)).toBeDefined();
    expect(screen.getAllByText("Test Pizza").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Test Burger").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("calculates and displays correct total", () => {
    render(
      <Cart
        cartItems={mockCartItems}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    // Total calculation: (12.99 * 2) + (8.99 * 1) = 34.97
    // + 2.99 delivery fee
    // + 2.80 tax (8% of 34.97)
    // = 40.76
    expect(screen.getAllByText("₹40.76").length).toBeGreaterThan(0);
  });

  it("calls onUpdateQuantity when minus button is clicked", () => {
    render(
      <Cart
        cartItems={mockCartItems}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    const minusButtons = screen.getAllByRole("button", { name: /decrease quantity/i });
    fireEvent.click(minusButtons[0]);

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith("1", 1);
  });

  it("calls onUpdateQuantity when plus button is clicked", () => {
    render(
      <Cart
        cartItems={mockCartItems}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    const plusButtons = screen.getAllByRole("button", { name: /increase quantity/i });
    fireEvent.click(plusButtons[0]);

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith("1", 3);
  });

  it("calls onRemoveItem when trash icon is clicked", () => {
    render(
      <Cart
        cartItems={mockCartItems}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    const trashButtons = screen.getAllByTitle("Remove from cart");
    fireEvent.click(trashButtons[0]);

    expect(mockOnRemoveItem).toHaveBeenCalledWith("1");
  });

  it("calls onCheckout when checkout button is clicked", () => {
    render(
      <Cart
        cartItems={mockCartItems}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    const checkoutButton = screen.getByText("Proceed to Checkout");
    fireEvent.click(checkoutButton);

    expect(mockOnCheckout).toHaveBeenCalledTimes(1);
  });

  it("minus button is disabled when quantity is 1", () => {
    render(
      <Cart
        cartItems={[{ menuItemId: "1", quantity: 1 }]}
        menuItems={mockMenuItems}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onCheckout={mockOnCheckout}
      />,
    );

    const minusButton = screen.getAllByText("-")[0];
    expect(minusButton).toBeDisabled();
  });
});
