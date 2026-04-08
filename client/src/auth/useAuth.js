import { useState } from 'react';
import useStore from '../store/useStore';
import { authApi } from './api';

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
      setError(err.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (store_id, name, phone, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register(store_id, name, phone, email, password);
      setAuth(data.token, data.customer);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
      setError(err.response?.data?.error || 'Calibration failed');
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
