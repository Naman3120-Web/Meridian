import React, { useMemo, useState } from "react";
import { Button } from "../../shared/components";
import {
  requestAllSensorPermissions,
  discoverSensors,
} from "../engine/sensorDiscovery";

function statusClass(status) {
  if (status === "granted")
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (status === "denied")
    return "bg-red-500/20 text-red-300 border-red-500/40";
  if (status === "unavailable")
    return "bg-gray-500/20 text-gray-300 border-gray-500/40";
  return "bg-yellow-500/20 text-yellow-200 border-yellow-500/40";
}

export default function SensorPermission({ onResolved }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionState, setPermissionState] = useState({
    motion: "pending",
    orientation: "pending",
    geolocation: "pending",
  });

  const discovered = useMemo(() => discoverSensors(), []);

  const labels = {
    motion: "Motion (accelerometer + gyroscope)",
    orientation: "Orientation (compass heading)",
    geolocation: "Geolocation (entrance reference)",
  };

  const requestAccess = async () => {
    setIsRequesting(true);
    try {
      const nextState = await requestAllSensorPermissions();
      setPermissionState(nextState);
      onResolved?.(nextState);
    } catch (error) {
      console.error(error);
      const fallback = {
        motion: "denied",
        orientation: "denied",
        geolocation: "denied",
      };
      setPermissionState(fallback);
      onResolved?.(fallback);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-6">
      <h3 className="text-xl font-bold text-white mb-2">
        Enable Live Tracking
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        We request motion, orientation, and location access to run the indoor
        navigation pipeline.
      </p>

      <div className="space-y-2 mb-4">
        {Object.entries(labels).map(([key, label]) => {
          const supported =
            key === "motion"
              ? discovered.accelerometer
              : key === "orientation"
                ? discovered.magnetometer
                : discovered.geolocation;
          const currentState = supported ? permissionState[key] : "unavailable";

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="text-gray-300">{label}</span>
              <span
                className={`px-2 py-1 border rounded-md ${statusClass(currentState)}`}
              >
                {currentState}
              </span>
            </div>
          );
        })}
      </div>

      <Button onClick={requestAccess} isLoading={isRequesting}>
        Request Sensor Permissions
      </Button>

      <p className="text-xs text-gray-500 mt-3">
        If access is denied, navigation still runs in degraded mode.
      </p>
    </div>
  );
}
