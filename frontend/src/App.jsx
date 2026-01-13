import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import MyReservations from "./pages/MyReservations";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <Rooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/rooms" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
