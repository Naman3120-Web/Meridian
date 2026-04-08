export function discoverSensors() {
  return new Promise((resolve) => {
    const status = {
      accelerometer: false,
      gyroscope: false,
      magnetometer: false, // Often true if device orientation absolute works
      mode: 1 // Default degrade mode
    };

    if (window.DeviceMotionEvent) status.accelerometer = true;
    if (window.DeviceOrientationEvent) {
       status.gyroscope = true;
       status.magnetometer = true; // Assuming magnetometer is available implicitly if orientation is
    }

    if (status.accelerometer && status.gyroscope && status.magnetometer) {
      status.mode = 4; // Full 5-layer pipeline capable
    } else if (status.accelerometer && status.gyroscope) {
      status.mode = 3;
    } else if (status.accelerometer) {
      status.mode = 2;
    }

    resolve(status);
  });
}
