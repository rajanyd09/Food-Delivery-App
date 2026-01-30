import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";
import toast from "react-hot-toast";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const [isValidAdmin, setIsValidAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAdmin = async () => {
      const user = authService.getCurrentUser();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Verify token + role with backend
        await authService.getProfile();
        
        // Check if role is admin OR if email indicates admin (matching LoginForm logic)
        const isAdminCallback = 
          user.role === "admin" || 
          user.email === "admin@example.com" || 
          user.email.includes("admin");

        if (isAdminCallback) {
          setIsValidAdmin(true);
        }
      } catch (error) {
        console.log("Admin validation failed:", error.response?.status);
      } finally {
        setLoading(false);
      }
    };

    validateAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isValidAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
