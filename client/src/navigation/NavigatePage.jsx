import React, { useState, useEffect, useRef } from "react";
import useStore from "../store/useStore";
import api from "../auth/api";
import StoreMap from "./components/StoreMap";
import SensorPermission from "./components/SensorPermission";
import { engine } from "./engine/pipelineManager";
import { Button } from "../shared/components";
import { discoverSensors } from "./engine/sensorDiscovery";
import { startSensorDashboard } from "./engine/sensorDashboard";

function statusTone(status) {
  if (status === "granted") return "text-emerald-300";
  if (status === "denied") return "text-red-300";
  if (status === "unavailable") return "text-gray-400";
  return "text-yellow-200";
}

function fmt(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "N/A";
  return Number(value).toFixed(digits);
}

export default function NavigatePage() {
  const [hasPermission, setHasPermission] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 500 });
  const [heading, setHeading] = useState(0);
  const [isStep, setIsStep] = useState(false);
  const [mode, setMode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState({
    motion: "pending",
    orientation: "pending",
    geolocation: "pending",
  });
  const [sensorData, setSensorData] = useState({
    magnitude: null,
    x: null,
    y: null,
    z: null,
    gyroAlpha: null,
    gyroBeta: null,
    gyroGamma: null,
    alpha: null,
    beta: null,
    gamma: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    lastUpdateTs: null,
  });
  const latestAlphaRef = useRef(null);

  const storeId = useStore((state) => state.storeId);
  const stepLength = useStore((state) => state.user?.step_length || 0.75);

  useEffect(() => {
    // Fetch map data
    const initEngine = async () => {
      try {
        const res = await api.get("/navigation/map");
        const paths = JSON.parse(res.data.walkable_paths_json || "[]");

        const discovery = discoverSensors();
        const discoveredMode = discovery.mode;
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

    const stop = startSensorDashboard({
      intervalMs: 100,
      onMotion: (motion) => {
        const state = engine.processSensorData(
          motion.magnitude,
          latestAlphaRef.current,
        );

        setPos({ x: state.x, y: state.y });
        setHeading(state.heading);
        setIsStep(state.isStep);
        setSensorData((prev) => ({
          ...prev,
          ...motion,
          lastUpdateTs: motion.ts,
        }));
      },
      onOrientation: (orientation) => {
        latestAlphaRef.current = orientation.alpha;
        if (orientation.alpha !== null) {
          engine.processSensorData(0, orientation.alpha);
          setHeading(engine.heading);
        }

        setSensorData((prev) => ({
          ...prev,
          alpha: orientation.alpha,
          beta: orientation.beta,
          gamma: orientation.gamma,
          lastUpdateTs: orientation.ts,
        }));
      },
      onGeo: (geo) => {
        setSensorData((prev) => ({
          ...prev,
          latitude: geo.latitude,
          longitude: geo.longitude,
          accuracy: geo.accuracy,
          lastUpdateTs: geo.ts,
        }));
      },
    });

    return stop;
  }, [hasPermission]);

  const handlePermissionResolved = (nextStatus) => {
    setPermissionStatus(nextStatus);
    const canRun =
      nextStatus.motion === "granted" || nextStatus.orientation === "granted";
    setHasPermission(canRun);
  };

  if (loading) return <div className="text-white p-6">Loading Map Data...</div>;

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Navigation
          </h1>
          <p className="text-gray-400 text-sm">Mode: Level {mode} Pipeline</p>
        </div>

        {!hasPermission && (
          <SensorPermission onResolved={handlePermissionResolved} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
          <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl p-3 md:p-4 shadow-[0_24px_60px_-30px_rgba(59,130,246,0.45)]">
            <StoreMap
              pos={pos}
              heading={heading}
              isStep={isStep}
              walkablePaths={engine.walkablePaths}
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
            <h4 className="text-white font-bold mb-2">Debug Tools</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-sm mb-4">
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <p className="text-gray-400 mb-2">Permission Status</p>
                <p className={statusTone(permissionStatus.motion)}>
                  Motion: {permissionStatus.motion}
                </p>
                <p className={statusTone(permissionStatus.orientation)}>
                  Orientation: {permissionStatus.orientation}
                </p>
                <p className={statusTone(permissionStatus.geolocation)}>
                  Geolocation: {permissionStatus.geolocation}
                </p>
              </div>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <p className="text-gray-400 mb-2">Sensor Readings</p>
                <p className="text-gray-200">
                  Accel |a|: {fmt(sensorData.magnitude)}
                </p>
                <p className="text-gray-200">
                  Gyro z: {fmt(sensorData.gyroGamma)}
                </p>
                <p className="text-gray-200">
                  Compass alpha: {fmt(sensorData.alpha)}
                </p>
                <p className="text-gray-200">
                  Geo acc: {fmt(sensorData.accuracy)} m
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => engine.triggerAnchor("product-1")}
              >
                Simulate Scan (Anchor)
              </Button>
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => {
                  const state = engine.processSensorData(2.0, 0);
                  setPos({ x: state.x, y: state.y });
                  setTimeout(() => engine.processSensorData(1.0, 0), 200);
                }}
              >
                Simulate Step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
