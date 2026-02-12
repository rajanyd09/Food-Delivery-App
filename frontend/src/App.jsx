import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { authService } from "./services/api";
import Navigation from "./components/Navigation";
import MenuPage from "./pages/MenuPage";
import FullMenuPage from "./pages/FullMenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import AdminDashboard from "./components/Admin/AdminDashboard";
import OrderManagement from "./components/Admin/OrderManagement";

// Layout component with navigation
// Layout component with navigation
const Layout = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Configure widget
    window.chatbotConfig = {
      chatbotId: "698310530eed542a1b3a2e85", // Ensure this ID is correct!
      apiUrl: "http://localhost:3000/api",
      botName: "AI Assistant",
      primaryColor: "#10b981",
    };

    // 2. Load the SINGLE script from your Backend
    const script = document.createElement("script");
    script.src = "http://localhost:3000/widget/embed.js"; // <--- Point to Provider Backend
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
      // Remove the widget UI if it exists to prevent duplicates on navigation
      const widget = document.querySelector(".chatbot-widget");
      if (widget) widget.remove();
      const styles = document.getElementById("chatbot-widget-styles");
      if (styles) styles.remove();
    };
  }, []);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // Check if user is admin
    if (
      currentUser &&
      (currentUser.role === "admin" ||
        currentUser.email === "admin@example.com" ||
        currentUser.email.includes("admin"))
    ) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [location]); // Re-run when location changes

  // Don't show navigation on auth pages AND admin pages
  const hideNav =
    ["/login", "/register"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNav && <Navigation user={user} isAdmin={isAdmin} />}
      <main className={hideNav ? "" : "pt-4"}>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/menu" element={<FullMenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/order-status/:orderId" element={<OrderStatusPage />} />

          {/* Protected routes (Require authentication) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes (Require admin role) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Navigate to="/admin/dashboard" replace />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <div className="container mx-auto px-4 py-8">
                  <OrderManagement />
                </div>
              </AdminRoute>
            }
          />

          {/* Additional admin routes can be added here */}
          <Route
            path="/admin/menu"
            element={
              <AdminRoute>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
                  <p>Menu management interface coming soon...</p>
                </div>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-6">User Management</h1>
                  <p>User management interface coming soon...</p>
                </div>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold mb-6">
                    Analytics Dashboard
                  </h1>
                  <p>Analytics dashboard coming soon...</p>
                </div>
              </AdminRoute>
            }
          />

          {/* Public order status route with ID */}
          <Route
            path="/order-status/:orderId"
            element={<OrderStatusPage publicView={true} />}
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
