export function detectSteps(accelData, threshold = 1.2) {
  // Simple peak-valley detection
  // To keep the demo simple, we assume accelData is the magnitude of the 3-axis accel
  return accelData > threshold;
}

export function updatePosition(currentPos, heading, stepLength) {
  // heading is in radians
  const dx = Math.sin(heading) * stepLength;
  const dy = -Math.cos(heading) * stepLength; // y typically points down in screen coords, so up is negative, but assume standard map coord for now. We reverse later in SVG if needed.

  return {
    x: currentPos.x + dx,
    y: currentPos.y + dy
  };
}
