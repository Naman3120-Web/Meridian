import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import useStore from "./store/useStore";

// Auth Components
import Login from "./auth/Login";
import Register from "./auth/Register";
import Calibrate from "./auth/Calibrate";

import ListPage from "./list/ListPage";
import MealPage from "./meal/MealPage";
import NavigatePage from "./navigation/NavigatePage";
import { Button } from "./shared/components";

const Home = () => {
  const userName = useStore((state) => state.user?.name || "Shopper");

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">
          AI Store
        </p>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Welcome, {userName.split(" ")[0]}
        </h1>
        <p className="text-gray-400 mt-2">Choose what you want to do next.</p>
      </div>

      <div className="space-y-3">
        <Link to="/list" className="block">
          <Button>Build Shopping List</Button>
        </Link>
        <Link to="/navigate" className="block">
          <Button variant="outline">Open Indoor Navigation</Button>
        </Link>
        <Link to="/meal" className="block">
          <Button variant="secondary">Meal Prep Suggestions</Button>
        </Link>
        <Link to="/calibrate" className="block">
          <Button variant="secondary">Recalibrate Step Length</Button>
        </Link>
      </div>

      <button
        onClick={() => useStore.getState().logout()}
        className="mt-8 w-full py-3 px-4 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = useStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <div className="font-sans text-gray-100 selection:bg-blue-500 selection:text-white bg-gray-950 min-h-screen pb-16">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/calibrate"
          element={
            <ProtectedRoute>
              <Calibrate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list"
          element={
            <ProtectedRoute>
              <ListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/navigate"
          element={
            <ProtectedRoute>
              <NavigatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal"
          element={
            <ProtectedRoute>
              <MealPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}
