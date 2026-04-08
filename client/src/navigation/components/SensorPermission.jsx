import React, { useState } from 'react';
import { Button } from '../../shared/components';

export default function SensorPermission({ onGranted }) {
  const [granted, setGranted] = useState(false);

  // iOS 13+ requires explicit permission for DeviceMotionEvent
  const requestAccess = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') {
          setGranted(true);
          onGranted();
        } else {
          alert('Sensor permission denied. Degraded mode active.');
          onGranted(); // still call to proceed in basic mode
        }
      } catch(e) {
        console.error(e);
        onGranted(); // Proceed without if fails
      }
    } else {
      // Non-iOS 13+ devices don't require this popup
      setGranted(true);
      onGranted();
    }
  };

  if (granted) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-6 text-center">
      <h3 className="text-xl font-bold text-white mb-2">Enable Live Tracking</h3>
      <p className="text-gray-400 text-sm mb-4">We need motion sensor access to track your steps indoors where GPS fails.</p>
      <Button onClick={requestAccess}>Grant Sensor Access</Button>
    </div>
  );
}
