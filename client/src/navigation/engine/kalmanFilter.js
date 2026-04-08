import KalmanFilter from 'kalmanjs';

export function createKalmanFilter(R = 0.01, Q = 3) {
  // Simple 1D kalman wrapper. We will need two (one for X, one for Y)
  return new KalmanFilter({ R, Q });
}

export function applyKalman(kfX, kfY, pos) {
  return {
    x: kfX.filter(pos.x),
    y: kfY.filter(pos.y)
  };
}
