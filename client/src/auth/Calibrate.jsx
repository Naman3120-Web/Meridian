import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/components';
import { useAuth } from './useAuth';
import useStore from '../store/useStore';

export default function Calibrate() {
  const [steps, setSteps] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const { calibrate, isLoading } = useAuth();
  const userName = useStore(state => state.user?.name || '');
  const navigate = useNavigate();

  // Simulated pedometer. In a real app we'd use DeviceMotionEvent
  const handleSimulateStep = () => {
    if (isCalibrating && steps < 10) {
      setSteps(s => s + 1);
    }
  };

  const startCalibration = () => {
    setSteps(0);
    setIsCalibrating(true);
  };

  const saveCalibration = async () => {
    // 10 steps = ~7.5 meters by default. Let's assume standard 0.75m per step for this demo.
    const step_length = 0.75;
    const success = await calibrate(step_length);
    if (success) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center px-6 text-center">
      <div className="mb-8 block">
        <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome, {userName.split(' ')[0]}!</h1>
        <p className="text-gray-400">Let's personalize your navigation. Walk 10 steps forward.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl py-12 mb-8">
        <h2 className="text-6xl font-black text-white mb-2">{steps}<span className="text-3xl text-gray-500 font-bold">/10</span></h2>
        <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Steps Detected</p>
      </div>

      <div className="space-y-4">
        {!isCalibrating ? (
          <Button onClick={startCalibration}>Start Walking</Button>
        ) : steps < 10 ? (
          <Button variant="outline" onClick={handleSimulateStep} className="animate-pulse border-blue-500 text-blue-500">
            Simulate Step (Tap Me)
          </Button>
        ) : (
          <Button onClick={saveCalibration} isLoading={isLoading}>
            Finish Calibration
          </Button>
        )}
        
        <Button variant="secondary" onClick={() => navigate('/home')} disabled={isLoading} className="opacity-70">
          Skip for now (Use Default)
        </Button>
      </div>
    </div>
  );
}
