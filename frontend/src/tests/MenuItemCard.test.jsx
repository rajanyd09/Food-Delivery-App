import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import MenuItemCard from "../components/MenuItemCard";

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaPlus: () => <span data-testid="plus-icon">+</span>,
  FaMinus: () => <span data-testid="minus-icon">-</span>,
}));

describe("MenuItemCard", () => {
  const mockItem = {
    _id: "1",
    name: "Test Pizza",
    description: "Delicious test pizza",
    price: 12.99,
    image: "test.jpg",
  };

  const mockOnAdd = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders menu item details correctly", () => {
    render(
      <MenuItemCard
        item={mockItem}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText("Test Pizza")).toBeDefined();
    expect(screen.getByText("₹12.99")).toBeDefined();
    expect(screen.getByText("Delicious test pizza")).toBeDefined();
  });

  it('calls onAdd when "Add to Cart" button is clicked', () => {
    render(
      <MenuItemCard
        item={mockItem}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    const addButton = screen.getByText("Add to Cart");
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith("1");
  });

  it("shows quantity controls when quantity > 0", () => {
    render(
      <MenuItemCard
        item={mockItem}
        quantity={2}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByTestId("minus-icon")).toBeDefined();
    expect(screen.getByTestId("plus-icon")).toBeDefined();
  });

  it("calls onRemove when minus button is clicked", () => {
    render(
      <MenuItemCard
        item={mockItem}
        quantity={2}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    const minusButton = screen.getByTestId("minus-icon");
    fireEvent.click(minusButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith("1");
  });

  it("calls onAdd when plus button is clicked", () => {
    render(
      <MenuItemCard
        item={mockItem}
        quantity={2}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    const plusButton = screen.getByTestId("plus-icon");
    fireEvent.click(plusButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith("1");
  });

  it('shows "Add to Cart" button when quantity is 0', () => {
    render(
      <MenuItemCard
        item={mockItem}
        quantity={0}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText("Add to Cart")).toBeDefined();
  });

  it("has hover styles class", () => {
    const { container } = render(
      <MenuItemCard
        item={mockItem}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />,
    );

    const card = container.querySelector(".transition-transform");
    expect(card).toBeTruthy();
  });
});
