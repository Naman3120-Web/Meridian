# AI-STORE: Comprehensive Decision Queries

This document contains ALL questions that need answering before implementing any feature. Use this as a checklist for future decisions.

---

## SECTION 1: PROJECT SCOPE & TIMELINE

### 1.1 Timeline

- [ ] When is the presentation/demo deadline?
- [ ] How many weeks do you have?
- [ ] Are there hard deadlines for intermediate milestones?
- [ ] Is this for a thesis viva, semester project, or hackathon?

### 1.2 Target Audience

- [ ] Who are the professors/evaluators? (Computer Science, Civil, Other?)
- [ ] What level of technical depth do they expect?
- [ ] Do they care more about algorithm accuracy or user experience?
- [ ] Will they test on their own phones or watch a demo?

### 1.3 Success Criteria

- [ ] What does "success" mean? (Must have vs. Nice to have features)
- [ ] What's the minimum viable product (MVP) for your presentation?
- [ ] What would impress professors the most?
- [ ] Is there a specific accuracy target? (e.g., ±80cm positioning)

---

## SECTION 2: REAL-TIME ENVIRONMENT (SENSOR INTEGRATION)

### 2.1 Update Frequency

- [ ] **100ms** (10 updates/sec) - Smooth but higher CPU/battery
- [ ] **500ms** (2 updates/sec) - Balanced
- [ ] **1 second** (1 update/sec) - Battery efficient but choppier

### 2.2 Data Collection & Storage

- [ ] Should we record position history? **YES / NO**
- [ ] If YES: How long should we keep history? (Session only / Permanent)
- [ ] Should we store raw sensor data? **YES / NO**
- [ ] Do professors want to see trajectory replay? **YES / NO**

### 2.3 Data Flow Architecture

- [ ] **Option A**: Client-side only (sensors → Kalman in browser → position → UI, NO server)
- [ ] **Option B**: Client + Server (sensors → Kalman in browser → send to server → store → database)
- [ ] Which one? **A / B**

### 2.4 Step Detection Sensitivity

- [ ] **Strict** (2σ threshold) - Few false positives, might miss some steps
- [ ] **Moderate** (1.5σ threshold) - Balanced
- [ ] **Loose** (1σ threshold) - Catches more steps, more false positives
- [ ] Which one? **Strict / Moderate / Loose**

### 2.5 Accelerometer Baseline

- [ ] How long should baseline measurement run when app starts? (5s / 10s / 20s)
- [ ] Should baseline be recalibrated if phone orientation changes? **YES / NO**
- [ ] Should we display baseline values to user for debugging? **YES / NO**

### 2.6 Sensor Fusion (Kalman Filter)

- [ ] Use **default safe noise values** (I provide) or **custom tuned values** (you optimize)?
- [ ] Should Kalman adapt noise matrices in real-time? **YES / NO**
- [ ] Trust model more or sensors more? (Process noise Q high/low?)
- [ ] Should magnetometer be used for heading? **YES / NO** (can be noisy indoors)

### 2.7 Gyroscope Drift Correction

- [ ] How often should magnetometer correct gyro drift? (Every 1s / 2s / 5s)
- [ ] Should drift correction be visible to user? **YES / NO**
- [ ] Threshold for when to apply correction? (e.g., >5° drift)

### 2.8 GPS Usage

- [ ] Use GPS only at store entrance? **YES**
- [ ] Or also periodically indoors as backup? **YES / NO**
- [ ] GPS timeout - if signal lost indoors, how long before ignoring? (5s / 10s)

---

## SECTION 3: POSITIONING ALGORITHMS

### 3.1 Dead Reckoning

- [ ] Should we calculate stride length or let user input? (Auto / Manual / Both)
- [ ] Use height formula (0.414) or 10-step calibration? (Height / 10-step / Both)
- [ ] What's the minimum steps to require before calibration? (3 / 5 / 10)

### 3.2 Virtual Anchors (Product Tapping)

- [ ] When user taps product, **Hard reset** (exact position) or **Soft reset** (hint)?
- [ ] Should virtual anchor reset Kalman uncertainty? **YES / NO**
- [ ] Can user undo/ignore a reset? **YES / NO**
- [ ] Should app require confirmation before resetting? **YES / NO**

### 3.3 Behavioral Constraints

- [ ] Enable aisle alignment? **YES / NO**
- [ ] Enable turn snapping (90° grid)? **YES / NO**
- [ ] Enable shelf stop detection? **YES / NO**
- [ ] Weight for constraints: Aggressive / Balanced / Subtle?

### 3.4 Map Matching (Boundary Enforcement)

- [ ] Snap to boundary if **>30cm outside / >50cm / >100cm outside**?
- [ ] Should snapping be visible (animated) or instant? **Visible / Instant**
- [ ] Should we warn user if outside walkable area? **YES / NO**

### 3.5 ZUPT (Zero Velocity Update)

- [ ] Enable ZUPT? **YES / NO**
- [ ] Variance threshold for detecting stillness? (σ² value)
- [ ] Minimum still duration before applying ZUPT? (0.5s / 1s / 2s)

---

## SECTION 4: STORE LAYOUT & MAP

### 4.1 Store Layout Format

- [ ] Do you have a floor plan image? **YES / NO**
- [ ] If YES: Please provide the image or description
- [ ] If NO: Use demo store? (10m x 15m, 3 aisles)

### 4.2 NavMesh Definition

- [ ] How many aisles in your store? (\_\_\_\_ aisles)
- [ ] Store dimensions? (\_**\_ m x \_\_** m)
- [ ] Aisle width? (\_\_\_\_ m)
- [ ] Product shelf locations as JSON or let me generate demo?

### 4.3 Store Visualization

- [ ] Should map be editable by user? **YES / NO**
- [ ] Show grid background? **YES / NO**
- [ ] Show aisle labels? **YES / NO**
- [ ] Animate position updates or show instant jumps? **Animated / Instant**

### 4.4 Product Locations

- [ ] How many products should be placed in store? (\_\_\_\_ products)
- [ ] Should products be randomly placed or specific locations? **Random / Specific**
- [ ] Should product location be shown on map? **YES / NO**

---

## SECTION 5: VIRTUAL ANCHORS & INTERACTIONS

### 5.1 Product Interaction

- [ ] How should user interact with product? (Tap / Long-press / Scan barcode / Button)
- [ ] Should product location highlight on map? **YES / NO**
- [ ] Should app show countdown to auto-reset if not tapped? **YES / NO**
- [ ] Can user mark products as "in cart"? **YES / NO**

### 5.2 Anchor History

- [ ] Should we track which products user visited? **YES / NO**
- [ ] Show "recently visited" list? **YES / NO**
- [ ] Should visiting anchor affect position confidence score? **YES / NO**

---

## SECTION 6: FRONTEND - USER INTERFACE

### 6.1 Navigation Page Layout

- [ ] What should be visible on navigation screen?
  - [ ] Store map (center)
  - [ ] Position dot (current location)
  - [ ] Heading indicator (direction arrow)
  - [ ] Sensor status (green/red indicators)
  - [ ] Position confidence score
  - [ ] Speed/distance traveled
  - [ ] Controls panel (calibrate, reset, etc.)

### 6.2 Sensor Permission UI

- [ ] How to handle permission requests?
  - [ ] Auto-request on app load?
  - [ ] Show button "Enable Sensors"?
  - [ ] Show info dialog explaining why sensors needed?

### 6.3 Sensor Status Dashboard

- [ ] Show real-time sensor readings to user? **YES / NO**
- [ ] Show Kalman filter debug info? **YES / NO**
- [ ] Show step detection events? **YES / NO**
- [ ] Mode: Always visible / Collapsible / Debug only?

### 6.4 Calibration UI

- [ ] Let user input height for stride calculation? **YES / NO**
- [ ] Show 10-step calibration walkthrough? **YES / NO**
- [ ] Allow recalibration mid-navigation? **YES / NO**
- [ ] Show calibration confidence score? **YES / NO**

### 6.5 Visual Feedback

- [ ] Animate position updates? **YES / NO**
- [ ] Show position trail/history line? **YES / NO**
- [ ] Show heading indicator (arrow/compass)? **YES / NO**
- [ ] Show uncertainty radius around position dot? **YES / NO**
- [ ] Highlight aisle when user in it? **YES / NO**

---

## SECTION 7: BACKEND - API ENDPOINTS

### 7.1 Navigation Endpoints

Do we need new backend routes?

- [ ] GET `/api/navigation/map` - Store map data? **HAVE / NEED / SKIP**
- [ ] GET `/api/navigation/products` - Product locations? **HAVE / NEED / SKIP**
- [ ] POST `/api/navigation/session/start` - Start tracking session? **HAVE / NEED / SKIP**
- [ ] POST `/api/navigation/session/end` - End session? **HAVE / NEED / SKIP**
- [ ] POST `/api/navigation/position` - Log position? **HAVE / NEED / SKIP**
- [ ] POST `/api/navigation/anchor` - Product tap/reset? **HAVE / NEED / SKIP**

### 7.2 Position History

- [ ] Should positions be sent to server in real-time? **YES / NO**
- [ ] Or only at end of navigation session? **End of session**
- [ ] How many positions per second? (1 / 5 / 10 / unlimited)
- [ ] Should server validate positions? **YES / NO**

### 7.3 Virtual Anchors

- [ ] Should anchor taps be logged on backend? **YES / NO**
- [ ] Should backend verify product location is real? **YES / NO**
- [ ] Should anchor data feed into crowdsourced map inference? **YES / NO**

---

## SECTION 8: DATABASE SCHEMA

### 8.1 New Tables Needed?

- [ ] `NavigationSession` - Track user navigation sessions? **YES / NO**
- [ ] `PositionLog` - Store position history? **YES / NO**
- [ ] `AnchorLog` - Store virtual anchor taps? **YES / NO**
- [ ] `SensorReading` - Store raw sensor data? **YES / NO**

### 8.2 Data Retention

- [ ] How long to keep position history? (1 day / 7 days / Forever)
- [ ] How long to keep sensor readings? (Same session / 1 day / Forever)
- [ ] Should old data be archived or deleted? **Archive / Delete**
- [ ] GDPR concern: Can user request data deletion? **YES / NO**

### 8.3 Session Tracking

- [ ] What to store per session?
  - [ ] Start time, end time
  - [ ] Total distance traveled
  - [ ] Total steps counted
  - [ ] Average position confidence
  - [ ] Products visited
  - [ ] Final route taken

---

## SECTION 9: TESTING & VALIDATION

### 9.1 Test Environment

- [ ] Will you test on real Android phone? **YES / NO**
- [ ] Multiple phones? **YES / NO**
- [ ] Real store or simulated environment? **Real / Simulated**
- [ ] Will professors test themselves? **YES / NO**

### 9.2 Test Scenarios

- [ ] Should we test: Walking straight? **YES / NO**
- [ ] Should we test: Making turns? **YES / NO**
- [ ] Should we test: Standing still? **YES / NO**
- [ ] Should we test: Different phone orientations? **YES / NO**
- [ ] Should we test: With products (virtual anchors)? **YES / NO**

### 9.3 Validation Metrics

- [ ] How to measure accuracy? (Manual measurement / Known positions)
- [ ] Target accuracy: **±50cm / ±80cm / ±1m**
- [ ] Acceptable error: **<5% / <10% / <15%**
- [ ] How many test runs needed to pass? (3 / 5 / 10)

### 9.4 Demo Recording

- [ ] Should we record demo video? **YES / NO**
- [ ] Should demo show real sensors or simulation? **Real / Simulation**
- [ ] How long should demo video be? (\_\_\_\_ minutes)

---

## SECTION 10: DEPLOYMENT

### 10.1 Frontend Deployment

- [ ] Platform: **Vercel / Netlify / Railway / Other**
- [ ] Which branch to deploy? **main / staging**
- [ ] Auto-deploy on push? **YES / NO**
- [ ] Need custom domain or localhost OK? **Custom / Localhost**

### 10.2 Backend Deployment

- [ ] Platform: **Render.com / Railway / Heroku / Other**
- [ ] Database: **SQLite (local) / PostgreSQL (managed) / Other**
- [ ] If PostgreSQL: Use **Neon.tech / Railway / Supabase**?
- [ ] Docker containerization needed? **YES / NO**

### 10.3 Environment Variables

- [ ] What secrets need to be set?
  - [ ] JWT_SECRET
  - [ ] DATABASE_URL
  - [ ] CORS_ORIGIN
  - [ ] API_URL
  - [ ] Other? (\_\_\_\_)

### 10.4 Database Migration

- [ ] Should we use Prisma migrations? **YES / NO**
- [ ] Run seed on deployment? **YES / NO**
- [ ] Backup strategy? (None / Manual / Automated)

---

## SECTION 11: PWA CONFIGURATION

### 11.1 PWA Features

- [ ] Should app be installable on home screen? **YES / NO**
- [ ] Should app work offline? **YES / NO**
- [ ] Should app have splash screen? **YES / NO**
- [ ] Should app have app icon? **YES / NO**

### 11.2 Service Worker

- [ ] What should be cached? (All assets / Critical only)
- [ ] Cache strategy: **Cache first / Network first / Stale-while-revalidate**
- [ ] Should sensor data update be cached? **YES / NO**

### 11.3 App Manifest

- [ ] App name? (\_\_\_\_)
- [ ] App description? (\_\_\_\_)
- [ ] Theme color? (#**\_\_**)
- [ ] Background color? (#**\_\_**)
- [ ] Display mode: **Fullscreen / Standalone / Minimal-ui**

---

## SECTION 12: SECURITY

### 12.1 Authentication

- [ ] Should navigation require JWT token? **YES / NO**
- [ ] Can anonymous users navigate? **YES / NO**
- [ ] Should position data be encrypted? **YES / NO**

### 12.2 Data Privacy

- [ ] Should position history be visible to shopkeepers? **YES / NO**
- [ ] Should users be able to delete their history? **YES / NO**
- [ ] GDPR compliance needed? **YES / NO**

### 12.3 API Security

- [ ] Rate limit position updates? **YES / NO**
- [ ] Validate position coordinates on backend? **YES / NO**
- [ ] Check if position is within store bounds? **YES / NO**

---

## SECTION 13: PERFORMANCE & OPTIMIZATION

### 13.1 CPU & Battery

- [ ] Optimize for battery life? **YES / NO**
- [ ] Should app stop sensors when not in focus? **YES / NO**
- [ ] Should update frequency reduce at low battery? **YES / NO**

### 13.2 Memory

- [ ] Limit position history size? **YES / NO**
- [ ] Maximum number of logs to keep in memory? (\_\_\_\_ logs)
- [ ] Should old logs be cleared periodically? **YES / NO**

### 13.3 Network

- [ ] Batch position updates before sending to server? **YES / NO**
- [ ] Retry failed requests? **YES / NO**
- [ ] Max concurrent API requests? (\_\_\_\_ requests)

---

## SECTION 14: FEATURES (FOR FUTURE)

### 14.1 Shopping List Integration

- [ ] Should navigation show which products on your list? **YES / NO**
- [ ] Should list suggest optimal route through store? **YES / NO**
- [ ] Should app notify when near listed product? **YES / NO**

### 14.2 Suggestions & Recommendations

- [ ] Show product suggestions on map? **YES / NO**
- [ ] Use Apriori rules during navigation? **YES / NO**
- [ ] Show recommendations in real-time? **YES / NO**

### 14.3 Crowdsourced Map Inference

- [ ] Collect trajectory data for DBSCAN? **YES / NO**
- [ ] Detect and alert for obstacles? **YES / NO**
- [ ] Auto-update store map from trajectories? **YES / NO**

### 14.4 Multi-Store Support

- [ ] Should app work in multiple stores? **YES / NO**
- [ ] Should user switch stores seamlessly? **YES / NO**
- [ ] Should history track which store? **YES / NO**

---

## SECTION 15: DOCUMENTATION & PRESENTATION

### 15.1 Code Documentation

- [ ] Should code have inline comments? **YES / NO**
- [ ] Should we create API documentation? **YES / NO**
- [ ] Should we create algorithm explanations? **YES / NO**

### 15.2 Presentation Materials

- [ ] Should we create demo video? **YES / NO**
- [ ] Should we create slides/presentation? **YES / NO**
- [ ] Should we create technical report? **YES / NO**

### 15.3 Demo Walkthrough

- [ ] How long should demo be? (\_\_\_\_ minutes)
- [ ] What features to showcase first? (\_\_\_\_)
- [ ] Should professors use their phones? **YES / NO**

---

## USAGE INSTRUCTIONS

**For each new feature/decision:**

1. Find the relevant section above
2. Answer all questions in that section
3. Document answers here or in separate file
4. Reference this when implementing
5. Update this document when requirements change

**Template for answering:**

```
## FEATURE: [Feature Name]
Date: [Today's Date]

Answers:
- Q1: [Your answer]
- Q2: [Your answer]
- Implementation Plan: [What you'll build]
```

---

## DECISION HISTORY

Track all decisions made:

| Date       | Feature               | Key Decisions                                                    | Status    |
| ---------- | --------------------- | ---------------------------------------------------------------- | --------- |
| 2026-04-23 | Real-time environment | 100ms update, strict 2σ, option B (client+server)                | ✅ LOCKED |
| 2026-04-23 | Sensors               | Adaptive Kalman, magno correction 2s, GPS entrance only          | ✅ LOCKED |
| 2026-04-23 | Positioning           | Hard anchor reset, adaptive constraints, map matching animated   | ✅ LOCKED |
| 2026-04-23 | Store                 | 15m × 20m, 4 aisles, 20 products, demo store                     | ✅ LOCKED |
| 2026-04-23 | UI                    | Collapsible debug panel, trail visualization, uncertainty circle | ✅ LOCKED |
| 2026-04-23 | Backend               | 6 new nav endpoints, batch position at end                       | ✅ LOCKED |
| 2026-04-23 | Database              | NavigationSession, PositionLog, AnchorLog tables                 | ✅ LOCKED |
| 2026-04-23 | Testing               | Real Android, simulated store, ±80cm accuracy target             | ✅ LOCKED |
| 2026-04-23 | Deployment            | Vercel frontend, Render backend, SQLite local                    | ✅ LOCKED |
| 2026-04-23 | PWA                   | Full PWA (installable, offline), service worker                  | ✅ LOCKED |
| 2026-04-23 | Demo                  | 5 min live demo + backup video, show sensors working             | ✅ LOCKED |

---

## CONFIRMED SCOPE FOR IMMEDIATE IMPLEMENTATION

**MVP Features (Must implement):**

1. ✅ PWA setup (installable, offline)
2. ✅ Sensor integration (accel, gyro, magnetometer, GPS)
3. ✅ Kalman filter + dead reckoning engine
4. ✅ Navigation map with animated position dot
5. ✅ 10-step calibration walkthrough
6. ✅ Virtual anchors (hard reset on product tap)
7. ✅ Behavioral constraints (aisle snapping, turn snapping)
8. ✅ Map matching (boundary enforcement)
9. ✅ Debug panel (sensor readings, step count, confidence)
10. ✅ Position trail visualization

**Nice to have (Post-demo):**

- Crowdsourced map inference (DBSCAN)
- Apriori suggestions on map
- Optimal route calculation
- Trajectory replay

---

**Last Updated**: 2026-04-23 (ANSWERS FINALIZED)
**Project**: AI-STORE Navigation Engine
**Status**: Ready for implementation phase
