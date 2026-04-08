// Very rudimentary map matching: snaps to nearest valid corridor
export function snapToMap(pos, walkablePaths) {
  if (!walkablePaths || walkablePaths.length === 0) return pos;

  let nearestPoint = { ...pos };
  let minDistance = Infinity;

  // Simple point-to-point snap for demo. A real one uses point-to-line segment distance
  for (const path of walkablePaths) {
    const dist = Math.sqrt(Math.pow(pos.x - path.x, 2) + Math.pow(pos.y - path.y, 2));
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = path;
    }
  }

  // Only snap if within 15 units
  if (minDistance < 15) {
     return nearestPoint;
  }

  return pos;
}
