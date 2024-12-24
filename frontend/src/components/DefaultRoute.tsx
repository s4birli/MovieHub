// src/components/DefaultRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

const DefaultRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? (
    <Navigate to="/movies" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default DefaultRoute;
