function isPermissionFunctionAvailable(sensorEvent) {
  return (
    typeof sensorEvent !== "undefined" &&
    typeof sensorEvent.requestPermission === "function"
  );
}

async function requestPermissionForEvent(sensorEvent) {
  if (typeof sensorEvent === "undefined") return "unavailable";
  if (!isPermissionFunctionAvailable(sensorEvent)) return "granted";

  try {
    const state = await sensorEvent.requestPermission();
    return state === "granted" ? "granted" : "denied";
  } catch (error) {
    console.error("Permission request failed:", error);
    return "denied";
  }
}

export async function requestMotionPermission() {
  return requestPermissionForEvent(DeviceMotionEvent);
}

export async function requestOrientationPermission() {
  return requestPermissionForEvent(DeviceOrientationEvent);
}

export async function requestGeolocationPermission() {
  if (!navigator.geolocation) return "unavailable";

  try {
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: "geolocation" });
      if (result.state === "granted" || result.state === "denied") {
        return result.state;
      }
    }
  } catch (error) {
    console.warn("Permissions API not available for geolocation:", error);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => resolve("granted"),
      () => resolve("denied"),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
  });
}

export function discoverSensors() {
  const status = {
    accelerometer:
      typeof window !== "undefined" &&
      typeof window.DeviceMotionEvent !== "undefined",
    gyroscope:
      typeof window !== "undefined" &&
      typeof window.DeviceMotionEvent !== "undefined",
    magnetometer:
      typeof window !== "undefined" &&
      typeof window.DeviceOrientationEvent !== "undefined",
    geolocation: typeof navigator !== "undefined" && !!navigator.geolocation,
    mode: 1,
  };

  if (status.accelerometer && status.gyroscope && status.magnetometer) {
    status.mode = 4;
  } else if (status.accelerometer && status.gyroscope) {
    status.mode = 3;
  } else if (status.accelerometer) {
    status.mode = 2;
  }

  return status;
}

export async function requestAllSensorPermissions() {
  const [motion, orientation, geolocation] = await Promise.all([
    requestMotionPermission(),
    requestOrientationPermission(),
    requestGeolocationPermission(),
  ]);

  return { motion, orientation, geolocation };
}
