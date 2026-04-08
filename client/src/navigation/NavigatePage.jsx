import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import api from '../auth/api';
import StoreMap from './components/StoreMap';
import SensorPermission from './components/SensorPermission';
import { engine } from './engine/pipelineManager';
import { Button } from '../shared/components';

export default function NavigatePage() {
  const [hasPermission, setHasPermission] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 500 });
  const [heading, setHeading] = useState(0);
  const [isStep, setIsStep] = useState(false);
  const [mode, setMode] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const storeId = useStore(state => state.storeId);
  const stepLength = useStore(state => state.user?.step_length || 0.75);

  useEffect(() => {
    // Fetch map data
    const initEngine = async () => {
      try {
        const res = await api.get('/navigation/map');
        const paths = JSON.parse(res.data.walkable_paths_json || '[]');
        
        // Mock a mode discovery
        const discoveredMode = 3; 
        setMode(discoveredMode);

        engine.init(discoveredMode, { x: 200, y: 480 }, stepLength, paths, []);
        setPos(engine.pos);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    initEngine();
  }, [storeId, stepLength]);

  useEffect(() => {
    if (!hasPermission) return;

    let throttle = false;

    const handleMotion = (e) => {
      if (throttle) return;
      throttle = true;
      setTimeout(() => throttle = false, 150); // process every 150ms

      const accel = e.accelerationIncludingGravity;
      if (accel) {
        // Simple magnitude
        const mag = Math.sqrt(accel.x*accel.x + accel.y*accel.y + accel.z*accel.z);
        // We pass null for alpha if we don't have orientation linked yet
        const state = engine.processSensorData(mag, null);
        
        setPos({ x: state.x, y: state.y });
        setHeading(state.heading);
        setIsStep(state.isStep);
      }
    };

    const handleOrientation = (e) => {
      // e.alpha is 0-360 compass
      if (e.alpha !== null) {
         engine.processSensorData(0, e.alpha);
         setHeading(engine.heading);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [hasPermission]);

  if (loading) return <div className="text-white p-6">Loading Map Data...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Navigation</h1>
          <p className="text-gray-400 text-sm">Mode: Level {mode} Pipeline</p>
        </div>
      </div>

      {!hasPermission && (
         <SensorPermission onGranted={() => setHasPermission(true)} />
      )}

      {/* The main SVG renderer */}
      <StoreMap pos={pos} heading={heading} isStep={isStep} walkablePaths={engine.walkablePaths} />

      <div className="mt-8 bg-gray-900 border border-gray-800 p-4 rounded-xl">
         <h4 className="text-white font-bold mb-2">Debug Tools</h4>
         <div className="flex gap-2">
            <Button variant="outline" className="w-1/2" onClick={() => engine.triggerAnchor('product-1')}>
               Simulate Scan (Anchor)
            </Button>
            <Button variant="outline" className="w-1/2" onClick={() => {
              // spoof step
              const state = engine.processSensorData(2.0 /* high mag */, 0); // pointing North
              setPos({ x: state.x, y: state.y });
              setTimeout(() => engine.processSensorData(1.0, 0), 200); // reset
            }}>
               Simulate Step
            </Button>
         </div>
      </div>
    </div>
  );
}
