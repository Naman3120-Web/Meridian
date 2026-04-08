import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../shared/components';
import { useAuth } from './useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-gray-400">Sign in to sync your smart shopping list.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl text-center">{error}</div>}
        
        <div className="space-y-4">
          <Input 
            type="email" 
            label="Email Address" 
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password" 
            label="Password" 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="mt-4">
          Sign In
        </Button>
      </form>

      <p className="text-center text-gray-500 mt-8">
        Don't have an account? <Link to="/register" className="text-blue-500 font-semibold hover:underline">Register here</Link>
      </p>
    </div>
  );
}
