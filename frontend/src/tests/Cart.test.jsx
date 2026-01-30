import { describe, it, expect, vi, beforeEach } from "vitest";
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

    expect(screen.getByText("Your Cart")).toBeDefined();
    expect(screen.getByText("Test Pizza")).toBeDefined();
    expect(screen.getByText("Test Burger")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
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
    expect(screen.getByText("$34.97")).toBeDefined();
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

    const minusButtons = screen.getAllByText("-");
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

    const plusButtons = screen.getAllByText("+");
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

    const trashButtons = screen.getAllByTitle("Remove item");
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
