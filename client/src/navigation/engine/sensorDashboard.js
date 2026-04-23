export function startSensorDashboard({
  onMotion,
  onOrientation,
  onGeo,
  intervalMs = 100,
}) {
  let lastMotionTs = 0;
  let lastOrientationTs = 0;
  let geoWatchId = null;

  const handleMotion = (event) => {
    const now = Date.now();
    if (now - lastMotionTs < intervalMs) return;
    lastMotionTs = now;

    const accel = event.accelerationIncludingGravity || {};
    const rot = event.rotationRate || {};

    const x = Number(accel.x || 0);
    const y = Number(accel.y || 0);
    const z = Number(accel.z || 0);
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    onMotion?.({
      ts: now,
      x,
      y,
      z,
      magnitude,
      gyroAlpha: Number(rot.alpha || 0),
      gyroBeta: Number(rot.beta || 0),
      gyroGamma: Number(rot.gamma || 0),
    });
  };

  const handleOrientation = (event) => {
    const now = Date.now();
    if (now - lastOrientationTs < intervalMs) return;
    lastOrientationTs = now;

    onOrientation?.({
      ts: now,
      alpha: event.alpha == null ? null : Number(event.alpha),
      beta: event.beta == null ? null : Number(event.beta),
      gamma: event.gamma == null ? null : Number(event.gamma),
      absolute: !!event.absolute,
    });
  };

  window.addEventListener("devicemotion", handleMotion);
  window.addEventListener("deviceorientation", handleOrientation);

  if (navigator.geolocation) {
    geoWatchId = navigator.geolocation.watchPosition(
      (position) => {
        onGeo?.({
          ts: Date.now(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
        });
      },
      () => {
        // No-op: permission or signal issues are handled in UI permission status.
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 3000,
      },
    );
  }

  return () => {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    if (geoWatchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchId);
    }
  };
}
