import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button } from '../shared/components';
import { useAuth } from './useAuth';
import useStore from '../store/useStore';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { register, isLoading, error } = useAuth();
  const storeId = useStore(state => state.storeId);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(storeId, name, phone, email, password);
    if (success) {
      navigate('/calibrate');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
        <p className="text-gray-400">Join AI Store to start your seamless shopping journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl text-center">{error}</div>}
        
        <Input 
          type="text" 
          label="Full Name" 
          placeholder="Jane Doe" 
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Input 
          type="tel" 
          label="Phone Number" 
          placeholder="555-0123" 
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
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
          minLength={6}
        />

        <Button type="submit" isLoading={isLoading} className="mt-6">
          Create Account
        </Button>
      </form>

      <p className="text-center text-gray-500 mt-8">
        Already have an account? <Link to="/login" className="text-blue-500 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
