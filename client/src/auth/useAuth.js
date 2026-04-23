import { useState } from "react";
import useStore from "../store/useStore";
import { authApi } from "./api";

function parseAuthError(err, fallback) {
  if (err?.response?.data?.error) return err.response.data.error;

  // axios network-level failures (offline, blocked, server unreachable)
  if (err?.code === "ERR_NETWORK") {
    return "Network error: check internet connection and ensure backend is running.";
  }

  if (err?.response?.status === 502) {
    return "Gateway error (502): API proxy cannot reach backend server.";
  }

  return fallback;
}

export function useAuth() {
  const setAuth = useStore((state) => state.setAuth);
  const logoutAction = useStore((state) => state.logout);
  const setCalibration = useStore((state) => state.setCalibration);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      setAuth(data.token, data.customer);
      return true;
    } catch (err) {
      setError(parseAuthError(err, "Login failed"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (store_id, name, phone, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register(
        store_id,
        name,
        phone,
        email,
        password,
      );
      setAuth(data.token, data.customer);
      return true;
    } catch (err) {
      setError(parseAuthError(err, "Registration failed"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const calibrate = async (step_length) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.calibrate(step_length);
      setCalibration(data.step_length_meters);
      return true;
    } catch (err) {
      setError(parseAuthError(err, "Calibration failed"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutAction();
  };

  return { login, register, calibrate, logout, isLoading, error };
}
