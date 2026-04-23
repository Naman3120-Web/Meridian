# AI-STORE Navigation Engine - Implementation Plan

**Status**: Ready to start coding
**Deadline**: Tomorrow
**Target**: Working MVP with live sensor navigation

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  UI Layer:                                                    │
│  ├─ NavigationPage (main component)                           │
│  ├─ StoreMap (canvas-based rendering)                         │
│  ├─ DebugPanel (collapsible sensor dashboard)                 │
│  ├─ CalibrationUI (10-step walkthrough)                       │
│  └─ SensorPermissionDialog (iOS/Android permissions)          │
│                                                               │
│  Sensor & Positioning Layer:                                 │
│  ├─ sensorDiscovery.js (request permissions, get raw data)   │
│  ├─ stepDetector.js (accelerometer → step detection)          │
│  ├─ kalmanFilter.js (sensor fusion, position estimation)      │
│  ├─ deadReckoning.js (stride × heading → position update)     │
│  ├─ behavioralConstraints.js (aisle snapping, turn snapping)  │
│  ├─ mapMatching.js (enforce boundaries)                        │
│  └─ virtualAnchors.js (product tap → hard reset)              │
│                                                               │
│  State Management (Zustand):                                 │
│  ├─ Navigation store (position, heading, confidence, etc.)    │
│  ├─ Calibration store (stride length, baseline)               │
│  └─ UI store (debug visible, current aisle, trail history)    │
│                                                               │
│  API Layer (axios):                                          │
│  └─ navigationApi.js (call backend endpoints)                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                            ↕ REST API

┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  New Routes:                                                 │
│  ├─ GET  /api/navigation/map (store layout JSON)              │
│  ├─ GET  /api/navigation/products (product locations)         │
│  ├─ POST /api/navigation/session/start (create session)       │
│  ├─ POST /api/navigation/session/end (save session data)      │
│  ├─ POST /api/navigation/position (batch log positions)       │
│  └─ POST /api/navigation/anchor (log anchor tap)              │
│                                                               │
│  Services:                                                   │
│  └─ navigationService.js (business logic)                     │
│                                                               │
│  Database:                                                   │
│  └─ New Prisma models (see schema section below)              │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                            ↕ SQLite

┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  New Tables:                                                 │
│  ├─ NavigationSession (session metadata)                      │
│  ├─ PositionLog (sampled position history, 1/sec)             │
│  └─ AnchorLog (product tap records)                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION PHASES

### PHASE 1: PWA Foundation (2 hours)

**Goal**: App installs, works offline, ready for sensors

**Files to create/modify:**

```
client/vite.config.js           [MODIFY] - ensure vite-plugin-pwa configured
client/public/manifest.json     [CREATE] - PWA app metadata
client/public/icon-192.png      [CREATE] - app icon
client/public/icon-512.png      [CREATE] - app icon
client/src/registerSW.js        [MODIFY] - service worker registration
```

**What to implement:**

1. Configure `vite-plugin-pwa` with cache strategies
2. Create app manifest (name: "Meridian")
3. Generate or use existing app icons
4. Service worker caches: app shell + store map data
5. Test "Add to Home Screen" on Android

**Expected outcome**: App appears on home screen, can open offline

---

### PHASE 2: Sensor Integration (3 hours)

**Goal**: Read sensors, show raw data, handle permissions

**Files to create:**

```
client/src/navigation/engine/
├─ sensorDiscovery.js          [CREATE] - permission requests
├─ sensorPermissionDialog.jsx   [CREATE] - UI for asking permissions
└─ sensorDashboard.js           [CREATE] - collect raw sensor data
```

**What to implement:**

1. Request `DeviceMotionEvent` permission (iOS)
2. Request `DeviceOrientationEvent` permission (iOS)
3. Request `Geolocation` permission (Android/iOS)
4. Display real-time sensor values
5. Show permission status indicators
6. Handle denied permissions gracefully

**Expected outcome**:

- Green indicators when sensors are accessible
- Real-time readings shown in debug panel
- Graceful degradation if sensors denied

---

### PHASE 3: Step Detection & Calibration (3 hours)

**Goal**: Detect footsteps, calibrate stride length

**Files to create:**

```
client/src/navigation/engine/
├─ stepDetector.js              [CREATE] - accelerometer → steps
├─ calibration.js               [CREATE] - 10-step walkthrough
└─ calibrationStore.js          [CREATE] - stride length state
```

**What to implement:**

1. Baseline measurement (10 seconds on app start)
2. Accelerometer magnitude calculation: ||a|| = √(ax² + ay² + az²)
3. Threshold detection: if ||a|| > baseline + 2σ → step detected
4. Step counter that increments in real-time
5. 10-step calibration UI with instructions
6. Store calibrated stride length in Zustand + localStorage

**Expected outcome**:

- Step counter incrementing smoothly while walking
- Debug panel shows baseline, σ, current magnitude, threshold
- Stride length saved for session

---

### PHASE 4: Heading Tracking (2 hours)

**Goal**: Track which direction user is facing

**Files to create:**

```
client/src/navigation/engine/
├─ headingTracker.js            [CREATE] - gyro + magnetometer fusion
└─ magnetometerCorrection.js    [CREATE] - drift correction
```

**What to implement:**

1. Read gyroscope rotation rate (z-axis for heading)
2. Read magnetometer (compass heading)
3. Fuse: use gyro for smooth real-time, magnetometer for correction every 2s
4. Store current heading angle in degrees (0-360)
5. Display heading arrow on the position dot

**Expected outcome**:

- Heading arrow rotates as user turns
- Smooth rotation with periodic magnetometer "corrections"
- Debug shows: gyro rate, magnetometer value, fused heading

---

### PHASE 5: Kalman Filter & Dead Reckoning (4 hours)

**Goal**: Optimal position estimation from sensors

**Files to create:**

```
client/src/navigation/engine/
├─ kalmanFilter.js              [CREATE] - Kalman filter implementation
├─ deadReckoning.js             [CREATE] - position update logic
└─ navigationEngine.js           [CREATE] - main orchestrator
```

**What to implement:**

1. Kalman filter state: [x, y, θ] (position x/y, heading angle)
2. State transition matrix F (physics of movement)
3. Process noise matrix Q (trust in motion model)
4. Measurement noise matrix R (trust in sensors)
5. Adaptive Q/R based on context (adaptive Kalman)
6. Prediction step: x̂ₖ = F × x̂ₖ₋₁
7. Update step: incorporate sensor measurements
8. Dead reckoning: pₓ = pₓ + S × cos(θ), pᵧ = pᵧ + S × sin(θ)
9. Call every 100ms

**Expected outcome**:

- Position dot updates smoothly every 100ms
- Debug shows: position [x,y], uncertainty (Kalman P matrix), confidence
- Position path makes sense (dot moves forward in direction facing)

---

### PHASE 6: Store Map & NavMesh (2 hours)

**Goal**: Define walkable areas, enforce boundaries

**Files to create:**

```
client/src/navigation/
├─ DemoStore.json                [CREATE] - hardcoded store layout
├─ StoreMap.jsx                  [MODIFY] - render map
└─ engine/mapMatching.js         [CREATE] - boundary enforcement
```

**What to implement:**

1. Define demo store: 15m × 20m with 4 aisles
2. Define NavMesh: walkable polygons (each aisle is a rect)
3. Draw store layout on canvas (clean, no grid)
4. Enforce boundary: if position outside walkable area, snap back
5. Animate snap (smooth slide back)
6. Show aisle labels (A, B, C, D)
7. Highlight current aisle with subtle tint

**Expected outcome**:

- Store map visible with aisles labeled
- Position dot animates back if user "walks through wall"
- Current aisle highlighted

---

### PHASE 7: Behavioral Constraints (2 hours)

**Goal**: Make positioning more realistic through human movement patterns

**Files to create:**

```
client/src/navigation/engine/
├─ behavioralConstraints.js     [CREATE] - aisle snapping, turn snapping
└─ zupt.js                       [CREATE] - ZUPT (stillness detection)
```

**What to implement:**

1. Aisle alignment: if walking straight, gently nudge toward aisle center
2. Turn snapping: if turning, snap to 0°/90°/180°/270°
3. ZUPT: detect stillness via low variance, reset Kalman drift
4. Weights: subtle (0.1) in normal mode, aggressive (0.7) in degraded mode

**Expected outcome**:

- Dot smoothly snaps into aisle center when walking straight
- Turns are clean 90° angles, not wobbly
- Debug shows: aisle alignment weight, turn snapping active, ZUPT triggered

---

### PHASE 8: Virtual Anchors (1.5 hours)

**Goal**: Product taps reset position

**Files to create:**

```
client/src/navigation/
├─ ProductsList.jsx              [MODIFY] - add checkmark buttons
└─ engine/virtualAnchors.js      [CREATE] - anchor tap handler
```

**What to implement:**

1. Products list shows all 20 products
2. Tap checkmark next to product
3. Product's shelf coordinate → force position to that location
4. Reset Kalman uncertainty to P₀ (high confidence)
5. Animate marker pulse on map
6. Update confidence score to 100%

**Expected outcome**:

- Tap product → dot jumps to that product's location on map
- Confidence circle shrinks to minimum (high confidence)
- Marker pulses green briefly

---

### PHASE 9: Debug Panel & Visualization (2 hours)

**Goal**: Show all internal state for demo & debugging

**Files to create:**

```
client/src/navigation/
└─ components/DebugPanel.jsx     [CREATE] - collapsible sensor dashboard
```

**What to implement:**

1. Real-time sensor readings (accel, gyro, magnetometer, GPS)
2. Baseline and threshold values
3. Step count
4. Current position [x, y]
5. Current heading θ
6. Kalman confidence (0-100%)
7. Uncertainty radius (P matrix)
8. Mode badge (Mode 1/2/3 depending on sensor availability)
9. Position trail (show last 10 positions as fading dots)
10. Toggle button to expand/collapse

**Expected outcome**:

- Collapsible panel shows all real-time debug info
- Professors can see sensors working
- Trail shows path taken

---

### PHASE 10: Backend Endpoints (2 hours)

**Goal**: New API routes for navigation session tracking

**Files to create:**

```
server/navigation/
├─ navigation.routes.js          [CREATE] - all 6 endpoints
└─ navigationService.js          [CREATE] - business logic
```

**Endpoints to create:**

```
GET  /api/navigation/map
  → Return store layout (hardcoded for now)

GET  /api/navigation/products
  → Return all 20 products with [x, y, shelf_id]

POST /api/navigation/session/start
  → Create NavigationSession record
  → Return session_id

POST /api/navigation/session/end
  → Close session, save summary
  → Body: { session_id, total_steps, total_distance, avg_confidence }

POST /api/navigation/position
  → Batch log positions
  → Body: { session_id, positions: [{x, y, θ, timestamp, confidence}] }

POST /api/navigation/anchor
  → Log product tap
  → Body: { session_id, product_id, x, y }
```

**Expected outcome**:

- Backend ready to receive navigation data
- Sessions tracked in database

---

### PHASE 11: Database Schema (1 hour)

**Goal**: Store navigation sessions and positions

**Files to modify:**

```
server/prisma/schema.prisma      [MODIFY] - add 3 new models
```

**New Prisma models:**

```prisma
model NavigationSession {
  id              String   @id @default(uuid())
  customer_id     String
  store_id        String
  started_at      DateTime @default(now())
  ended_at        DateTime?
  total_steps     Int      @default(0)
  total_distance  Float    @default(0)
  avg_confidence  Float    @default(0)
  device_type     String?  // "flagshipPhone" or "budgetPhone"

  position_logs   PositionLog[]
  anchor_logs     AnchorLog[]
  customer        Customer @relation(fields: [customer_id], references: [id])
  store           Store    @relation(fields: [store_id], references: [id])
}

model PositionLog {
  id           String   @id @default(uuid())
  session_id   String
  x            Float
  y            Float
  heading      Float
  confidence   Float    // Kalman uncertainty (0-100%)
  timestamp    DateTime @default(now())

  session      NavigationSession @relation(fields: [session_id], references: [id])
}

model AnchorLog {
  id           String   @id @default(uuid())
  session_id   String
  product_id   String
  x            Float
  y            Float
  timestamp    DateTime @default(now())

  session      NavigationSession @relation(fields: [session_id], references: [id])
  product      Product @relation(fields: [product_id], references: [id])
}
```

**Expected outcome**:

- Prisma migrations ready
- Can run `npm run db:push`

---

### PHASE 12: Frontend API Integration (1.5 hours)

**Goal**: Connect React to new backend endpoints

**Files to create/modify:**

```
client/src/navigation/
├─ api.js                        [CREATE] - axios calls
└─ NavigationPage.jsx             [MODIFY] - call endpoints
```

**What to implement:**

1. On navigation start: `POST /api/navigation/session/start` → get session_id
2. Store session_id in Zustand
3. Every 30 seconds: batch position logs → `POST /api/navigation/position`
4. On navigation end: `POST /api/navigation/session/end`
5. `GET /api/navigation/map` on load
6. `GET /api/navigation/products` on load

**Expected outcome**:

- Navigation session tracked server-side
- Positions logged in batches every 30s
- Session data persisted for analytics

---

### PHASE 13: Integration & Testing (2 hours)

**Goal**: Make everything work together

**What to test:**

1. ✅ App installs on Android home screen
2. ✅ Permissions request works
3. ✅ Sensors read data (debug panel shows values)
4. ✅ Step detection works (counter increments)
5. ✅ Heading tracks correctly
6. ✅ Position dot moves smoothly
7. ✅ Virtual anchor resets position
8. ✅ Aisle snapping works
9. ✅ Boundary enforcement works
10. ✅ Backend receives session data
11. ✅ Accuracy within ±80cm

**Testing procedure:**

1. Walk straight across store → dot follows
2. Make a 90° turn → dot and arrow update
3. Tap a product → dot jumps to product location
4. Stand still → ZUPT triggers, dot steady
5. Simulate sensor failure (disable gyro in DevTools) → graceful degradation
6. Check backend logs: session created, positions saved

**Expected outcome**:

- Live demo works smoothly
- Backup video ready
- All 10 accuracy tests pass within ±80cm

---

## FILE STRUCTURE TO CREATE

```
client/src/navigation/
├─ NavigationPage.jsx                    [MAIN PAGE]
├─ components/
│  ├─ StoreMap.jsx
│  ├─ DebugPanel.jsx
│  ├─ CalibrationUI.jsx
│  └─ SensorPermissionDialog.jsx
├─ engine/
│  ├─ sensorDiscovery.js
│  ├─ stepDetector.js
│  ├─ headingTracker.js
│  ├─ kalmanFilter.js
│  ├─ deadReckoning.js
│  ├─ behavioralConstraints.js
│  ├─ mapMatching.js
│  ├─ virtualAnchors.js
│  ├─ zupt.js
│  └─ navigationEngine.js              [ORCHESTRATOR]
├─ stores/
│  └─ navigationStore.js                [ZUSTAND]
├─ api.js                               [AXIOS]
└─ DemoStore.json                       [HARDCODED LAYOUT]

server/navigation/
├─ navigation.routes.js
└─ navigationService.js

server/prisma/
└─ schema.prisma                        [MODIFIED]
```

---

## DEPENDENCIES TO ADD

**Frontend:**

```json
{
  "kalmanjs": "^1.0.1",
  "axios": "^1.6.0" // already have
}
```

**Backend:**

```json
{
  "@prisma/client": "^5.22.0" // already have
}
```

**No new external dependencies needed!** Everything uses native Web APIs.

---

## TIMELINE

| Phase | Task                           | Hours        | Status     |
| ----- | ------------------------------ | ------------ | ---------- |
| 1     | PWA Foundation                 | 2            | 📋 Planned |
| 2     | Sensor Integration             | 3            | 📋 Planned |
| 3     | Step Detection & Calibration   | 3            | 📋 Planned |
| 4     | Heading Tracking               | 2            | 📋 Planned |
| 5     | Kalman Filter & Dead Reckoning | 4            | 📋 Planned |
| 6     | Store Map & NavMesh            | 2            | 📋 Planned |
| 7     | Behavioral Constraints         | 2            | 📋 Planned |
| 8     | Virtual Anchors                | 1.5          | 📋 Planned |
| 9     | Debug Panel                    | 2            | 📋 Planned |
| 10    | Backend Endpoints              | 2            | 📋 Planned |
| 11    | Database Schema                | 1            | 📋 Planned |
| 12    | Frontend API Integration       | 1.5          | 📋 Planned |
| 13    | Integration & Testing          | 2            | 📋 Planned |
|       | **TOTAL**                      | **29 hours** |            |

**Realistic timeline with breaks**: ~40-48 hours (2 days)

---

## KEY DECISIONS TO REMEMBER

1. **100ms update frequency** - 10 updates per second for smooth animation
2. **Strict step detection (2σ)** - Fewer false positives
3. **Adaptive Kalman** - Real-time noise matrix tuning (your research contribution)
4. **Hard reset anchors** - Instant position override, no confirmation
5. **Animated boundary snapping** - Smooth visual feedback
6. **Collapsible debug panel** - Hidden by default, expandable for demo
7. **Client-side Kalman** - All positioning stays on device, privacy-first
8. **Batch position logging** - Every 30 seconds to server, not real-time
9. **No GPS indoors** - Only at entrance, then dead reckoning
10. **Graceful degradation** - If sensors fail, behavioral constraints take over

---

## SUCCESS METRICS

**For professors:**

- ✅ Live dot follows user smoothly (wow factor)
- ✅ Virtual anchor resets position accurately (wow factor)
- ✅ Debug panel shows Kalman filter working (technical depth)
- ✅ App installs and works offline (PWA credibility)
- ✅ ±80cm accuracy on full sensor device (research quality)

**For implementation:**

- ✅ All 13 phases completed
- ✅ No crashes on Android
- ✅ <5s startup time
- ✅ Battery drain acceptable (<10%/hour)
- ✅ Demo video backup ready

---

**Ready to start? Answer any final questions before I begin Phase 1!**
