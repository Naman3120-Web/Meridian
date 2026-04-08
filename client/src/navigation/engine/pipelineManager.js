import { createKalmanFilter, applyKalman } from './kalmanFilter';
import { updatePosition, detectSteps } from './deadReckoning';
import { snapToMap } from './mapMatching';
import { applyVirtualAnchor } from './virtualAnchor';

class PipelineManager {
  constructor() {
    this.mode = 1;
    this.pos = { x: 50, y: 50 }; // Store entrance default
    this.heading = 0;
    this.kfX = createKalmanFilter();
    this.kfY = createKalmanFilter();
    this.stepLength = 0.75;
    this.walkablePaths = [];
    this.catalogue = [];
  }

  init(mode, startPos, stepLength, walkablePaths, catalogue) {
    this.mode = mode;
    if (startPos) this.pos = startPos;
    if (stepLength) this.stepLength = stepLength;
    if (walkablePaths) this.walkablePaths = walkablePaths;
    if (catalogue) this.catalogue = catalogue;
  }

  // Called on device motion/orientation frame
  processSensorData(accelMag, alpha) {
    // Basic heading mapping: alpha is 0-360, convert to radians
    // 0 is typically north.
    if (alpha !== null && alpha !== undefined) {
       this.heading = alpha * (Math.PI / 180);
    }

    const isStep = detectSteps(accelMag);
    
    if (isStep) {
      // Layer 1: Dead Reckoning
      let newPos = updatePosition(this.pos, this.heading, this.stepLength * 10); // scale up for map coords

      // Layer 2: Kalman
      if (this.mode >= 2) {
         newPos = applyKalman(this.kfX, this.kfY, newPos);
      }

      // Layer 3: Map Matching (only in full mode for demo)
      if (this.mode >= 3) {
         newPos = snapToMap(newPos, this.walkablePaths);
      }

      this.pos = newPos;
      return { ...this.pos, isStep: true, heading: this.heading };
    }

    return { ...this.pos, isStep: false, heading: this.heading };
  }

  triggerAnchor(productId) {
    const anchor = applyVirtualAnchor(productId, this.catalogue);
    if (anchor) {
      this.pos = anchor;
      // reset kalman to new baseline
      this.kfX = createKalmanFilter();
      this.kfY = createKalmanFilter();
      return this.pos;
    }
    return null;
  }
}

export const engine = new PipelineManager();
