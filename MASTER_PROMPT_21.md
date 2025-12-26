# MASTER PROMPT 21
## PROXIMITY ENGINE & LOCATION PRIVACY MODEL

**SYSTEM MODE**: GEO & PRIVACY SYSTEM ARCHITECT

Design the proximity engine for WYA!?—a privacy-first location system that enables proximity-based discovery without exposing exact coordinates.

---

## Input

- Full "Geo-first social graph" specification
- Profile Discovery & Recommendation (MASTER_PROMPT_20)
- Product Governance Framework
- The 4 Sacred Invariants

---

## Architectural Truths

### Why Proximity-First Works

**A. Proximity-First is the Correct Primitive**:
- Aligns incentives toward real-world connection
- Naturally throttles virality and abuse
- Makes discovery finite and comprehensible
- Prevents global popularity distortion
- **Consequence**: Proximity is primary ordering function, not a filter

**B. Proximity is Tiered, Not Boolean**:
- Makes it tunable, explainable, and humane
- Avoids "why am I seeing someone 3,000 miles away?"
- Prevents "why is the same influencer everywhere?"
- **Consequence**: Proximity tiers create natural boundaries

---

## The Non-Negotiable Invariants

### Invariant #1: Distance is Always Evaluated First
- ✅ **REQUIRED**: Distance computed and disclosed even when overridden
- ✅ **REQUIRED**: Distance weight can be softened, but never skipped
- **Rationale**: Proximity-first means distance is primary, always

### Invariant #2: Age Layers Never Leak
- ✅ **REQUIRED**: Hard partitions, no edge cases
- ✅ **REQUIRED**: No temporary exceptions, no "but they consented"
- **Rationale**: If this breaks once, trust is gone forever

### Invariant #3: No Hidden Suppression
- ✅ **REQUIRED**: All restrictions visible, explainable, appealable
- ❌ **FORBIDDEN**: Shadow banning, silent throttling, invisible penalties
- **Rationale**: Moderation convenience is not worth trust loss

### Invariant #4: Discovery Must Remain Finite
- ✅ **REQUIRED**: Bounded discovery, intentional exploration
- ❌ **FORBIDDEN**: Endless scrolling, algorithmic trance
- **Rationale**: Violates core philosophy if discovery becomes infinite

---

## Define

### 1. How Distance Tiers Are Calculated Without Exact Coordinates

#### **Distance Tier System**

**Tier 0: Same Location** (0-100m):
```typescript
// Precision: ~100m radius
// Method: Geohash precision level 7 (approximately 153m x 153m)
// Privacy: No exact coordinates, only geohash cell
// Use: Immediate proximity (same building, same block)
```

**Tier 1: Very Close** (100m-1km):
```typescript
// Precision: ~1km radius
// Method: Geohash precision level 6 (approximately 1.2km x 0.6km)
// Privacy: No exact coordinates, only geohash cell
// Use: Same neighborhood, same area
```

**Tier 2: Close** (1km-5km):
```typescript
// Precision: ~5km radius
// Method: Geohash precision level 5 (approximately 4.9km x 4.9km)
// Privacy: No exact coordinates, only geohash cell
// Use: Same district, same part of city
```

**Tier 3: Nearby** (5km-25km):
```typescript
// Precision: ~25km radius
// Method: Geohash precision level 4 (approximately 39km x 19.5km)
// Privacy: No exact coordinates, only geohash cell
// Use: Same city, same metropolitan area
```

**Tier 4: Regional** (25km-200km):
```typescript
// Precision: ~200km radius
// Method: Geohash precision level 3 (approximately 156km x 156km)
// Privacy: No exact coordinates, only geohash cell
// Use: Same region, same state/province
```

**Tier 5: Distant** (200km+):
```typescript
// Precision: Very large area
// Method: Geohash precision level 2 or lower
// Privacy: No exact coordinates, only geohash cell
// Use: Fallback only, not primary discovery
```

#### **Distance Calculation Rules**

**Geohash-Based Calculation**:
- ✅ **REQUIRED**: Use geohash cells, not exact coordinates
- ✅ **REQUIRED**: Precision level determines tier (not exact distance)
- ✅ **REQUIRED**: Never expose exact coordinates (privacy)
- ❌ **FORBIDDEN**: Storing or transmitting exact coordinates
- ❌ **FORBIDDEN**: Calculating exact distance (use tier instead)

**Tier Assignment**:
```typescript
function calculateDistanceTier(userGeohash: string, targetGeohash: string): number {
  // Compare geohash precision levels
  // Same geohash cell at level 7 → Tier 0 (same location)
  // Same geohash cell at level 6 → Tier 1 (very close)
  // Same geohash cell at level 5 → Tier 2 (close)
  // Same geohash cell at level 4 → Tier 3 (nearby)
  // Same geohash cell at level 3 → Tier 2 (regional)
  // Different geohash cells → Calculate shared prefix length
  // Return tier based on shared prefix length
}
```

**Privacy Preservation**:
- ✅ **REQUIRED**: Only store geohash cells (not coordinates)
- ✅ **REQUIRED**: Only compare geohash cells (not coordinates)
- ✅ **REQUIRED**: Never expose geohash cells to users (internal only)
- ❌ **FORBIDDEN**: Storing exact coordinates (privacy violation)
- ❌ **FORBIDDEN**: Exposing geohash cells (privacy risk)

---

### 2. How Location Updates Are Ingested and Expired

#### **Location Update Flow**

**Update Ingestion**:
```typescript
interface LocationUpdate {
  userId: string
  geohash: string // Geohash cell, not exact coordinates
  timestamp: number
  source: 'gps' | 'wifi' | 'ip' | 'manual'
  confidence: number // 0-1, based on source and verification
  verified: boolean // Device verification status
}
```

**Update Sources** (Priority Order):
1. **GPS** (highest confidence, 0.9-1.0)
2. **WiFi** (medium confidence, 0.6-0.8)
3. **IP** (low confidence, 0.3-0.5)
4. **Manual** (user-set, 0.5-0.7)

**Update Expiration**:
```typescript
// Location updates expire based on source and age
// GPS: 15 minutes (high confidence, frequent updates)
// WiFi: 1 hour (medium confidence, less frequent)
// IP: 24 hours (low confidence, infrequent)
// Manual: Until user updates (user-controlled)

function isLocationExpired(update: LocationUpdate): boolean {
  const age = Date.now() - update.timestamp
  const maxAge = getMaxAgeForSource(update.source)
  return age > maxAge
}
```

**Update Rules**:
- ✅ **REQUIRED**: Expire stale locations (privacy, accuracy)
- ✅ **REQUIRED**: Use most recent update (if multiple available)
- ✅ **REQUIRED**: Degrade confidence over time (older = less confident)
- ❌ **FORBIDDEN**: Using expired locations (privacy, accuracy)
- ❌ **FORBIDDEN**: Storing locations indefinitely (privacy)

---

### 3. How Privacy Levels Affect Proximity Precision

#### **Privacy Level System**

**Level 0: Exact** (Not Available):
```typescript
// FORBIDDEN: Never expose exact coordinates
// This level does not exist (privacy violation)
```

**Level 1: Precise** (Same Location, Tier 0):
```typescript
// Precision: ~100m radius (geohash level 7)
// Requires: Explicit opt-in, verified device
// Use: Only for users who explicitly enable
// Privacy: Highest precision, still not exact coordinates
```

**Level 2: Close** (Very Close, Tier 1):
```typescript
// Precision: ~1km radius (geohash level 6)
// Requires: Location sharing enabled
// Use: Default for users who share location
// Privacy: Good precision, protects exact location
```

**Level 3: General** (Close/Nearby, Tier 2-3):
```typescript
// Precision: ~5-25km radius (geohash level 4-5)
// Requires: Location sharing enabled (default)
// Use: Default precision for most users
// Privacy: Protects exact location, shows general area
```

**Level 4: Regional** (Regional, Tier 4):
```typescript
// Precision: ~200km radius (geohash level 3)
// Requires: No location sharing (fallback)
// Use: Fallback when location not shared
// Privacy: Very low precision, protects privacy
```

**Level 5: Hidden** (No Proximity):
```typescript
// Precision: No proximity-based discovery
// Requires: Location sharing disabled
// Use: Users who don't want proximity discovery
// Privacy: Complete privacy, no location-based features
```

#### **Privacy Level Rules**

**Privacy → Precision Mapping**:
- ✅ **REQUIRED**: Privacy level determines geohash precision
- ✅ **REQUIRED**: Higher privacy = lower precision (larger geohash cells)
- ✅ **REQUIRED**: Users control privacy level (opt-in, opt-out)
- ❌ **FORBIDDEN**: Exposing exact coordinates (privacy violation)
- ❌ **FORBIDDEN**: Ignoring privacy level (privacy violation)

**Discovery Impact**:
- ✅ **REQUIRED**: Privacy level affects discovery (higher privacy = less proximity-based)
- ✅ **REQUIRED**: Users can opt out of proximity discovery (Level 5)
- ✅ **REQUIRED**: Privacy level is transparent (users see what's shared)
- ❌ **FORBIDDEN**: Forcing location sharing (privacy violation)

---

### 4. How Spoofing and Anomalies Are Detected

#### **Spoofing Detection Mechanisms**

**Device Verification**:
```typescript
interface DeviceVerification {
  deviceId: string
  verified: boolean // Device verified (not spoofed)
  trustScore: number // 0-1, based on verification history
  lastVerified: number // Timestamp of last verification
}

// Verified devices: Higher trust, lower spoofing risk
// Unverified devices: Lower trust, higher spoofing risk
```

**Anomaly Detection**:
```typescript
interface LocationAnomaly {
  type: 'teleport' | 'impossible-speed' | 'inconsistent-source'
  severity: 'low' | 'medium' | 'high'
  confidence: number // 0-1, how confident we are it's an anomaly
}

// Teleport: User appears to move impossibly fast
// Impossible Speed: User moves faster than physically possible
// Inconsistent Source: Location source changes suspiciously
```

**Anomaly Detection Rules**:
```typescript
function detectAnomalies(updates: LocationUpdate[]): LocationAnomaly[] {
  const anomalies: LocationAnomaly[] = []
  
  // Check for teleporting (impossible movement)
  for (let i = 1; i < updates.length; i++) {
    const prev = updates[i - 1]
    const curr = updates[i]
    const distance = calculateGeohashDistance(prev.geohash, curr.geohash)
    const timeDiff = curr.timestamp - prev.timestamp
    const speed = distance / timeDiff // km/h
    
    if (speed > MAX_REALISTIC_SPEED) {
      anomalies.push({
        type: 'teleport',
        severity: speed > MAX_REALISTIC_SPEED * 2 ? 'high' : 'medium',
        confidence: 0.8
      })
    }
  }
  
  // Check for inconsistent sources
  const sources = updates.map(u => u.source)
  if (sources.filter(s => s === 'gps').length > 0 && 
      sources.filter(s => s === 'ip').length > sources.filter(s => s === 'gps').length) {
    anomalies.push({
      type: 'inconsistent-source',
      severity: 'medium',
      confidence: 0.6
    })
  }
  
  return anomalies
}
```

**Spoofing Mitigation**:
```typescript
// Instead of banning immediately, degrade proximity confidence
function adjustProximityConfidence(
  baseConfidence: number,
  anomalies: LocationAnomaly[],
  deviceVerification: DeviceVerification
): number {
  let adjusted = baseConfidence
  
  // Reduce confidence for anomalies
  for (const anomaly of anomalies) {
    if (anomaly.severity === 'high') {
      adjusted *= 0.5 // Reduce by 50%
    } else if (anomaly.severity === 'medium') {
      adjusted *= 0.7 // Reduce by 30%
    }
  }
  
  // Reduce confidence for unverified devices
  if (!deviceVerification.verified) {
    adjusted *= 0.8 // Reduce by 20%
  }
  
  return Math.max(0.1, adjusted) // Minimum 10% confidence
}
```

**Spoofing Detection Rules**:
- ✅ **REQUIRED**: Detect anomalies (teleporting, impossible speed, inconsistent sources)
- ✅ **REQUIRED**: Degrade confidence instead of banning (graceful degradation)
- ✅ **REQUIRED**: Surface "approximate confidence" internally (transparency)
- ✅ **REQUIRED**: Trust weighting for verified devices (higher trust)
- ❌ **FORBIDDEN**: Banning immediately (may be false positive)
- ❌ **FORBIDDEN**: Exposing exact coordinates (privacy violation)

---

### 5. How Proximity Confidence is Represented Internally

#### **Confidence Calculation**

**Base Confidence** (Source-Based):
```typescript
const BASE_CONFIDENCE = {
  'gps': 0.9, // High confidence (accurate)
  'wifi': 0.7, // Medium confidence (less accurate)
  'ip': 0.4, // Low confidence (imprecise)
  'manual': 0.6 // Medium confidence (user-set)
}
```

**Confidence Factors**:
```typescript
interface ProximityConfidence {
  base: number // 0-1, from source
  age: number // 0-1, degrades over time
  verification: number // 0-1, device verification
  anomalies: number // 0-1, anomaly detection
  total: number // 0-1, weighted combination
}

function calculateProximityConfidence(
  update: LocationUpdate,
  deviceVerification: DeviceVerification,
  anomalies: LocationAnomaly[]
): ProximityConfidence {
  const base = BASE_CONFIDENCE[update.source]
  
  // Age degradation (older = less confident)
  const age = Date.now() - update.timestamp
  const ageFactor = Math.max(0, 1 - (age / MAX_AGE))
  
  // Verification factor (verified = more confident)
  const verificationFactor = deviceVerification.verified ? 1.0 : 0.8
  
  // Anomaly factor (anomalies = less confident)
  const anomalyFactor = anomalies.length === 0 ? 1.0 : 
    Math.max(0.5, 1.0 - (anomalies.length * 0.1))
  
  // Weighted combination
  const total = base * 0.4 + ageFactor * 0.3 + verificationFactor * 0.2 + anomalyFactor * 0.1
  
  return {
    base,
    age: ageFactor,
    verification: verificationFactor,
    anomalies: anomalyFactor,
    total: Math.max(0.1, Math.min(1.0, total)) // Clamp to 0.1-1.0
  }
}
```

**Confidence Representation**:
```typescript
// Internal representation (never exposed to users)
interface InternalProximityConfidence {
  value: number // 0-1, total confidence
  factors: {
    source: number // Source confidence
    age: number // Age degradation
    verification: number // Device verification
    anomalies: number // Anomaly impact
  }
  tier: number // Distance tier (0-5)
  geohash: string // Geohash cell (not exact coordinates)
}

// User-facing representation (simplified, transparent)
interface UserFacingProximityConfidence {
  level: 'high' | 'medium' | 'low' // Simplified confidence level
  explanation: string // "Based on verified GPS location" or "Approximate location"
}
```

**Confidence Rules**:
- ✅ **REQUIRED**: Calculate confidence from multiple factors (source, age, verification, anomalies)
- ✅ **REQUIRED**: Represent confidence internally (detailed, for ranking)
- ✅ **REQUIRED**: Represent confidence to users (simplified, transparent)
- ✅ **REQUIRED**: Never expose exact coordinates (privacy)
- ❌ **FORBIDDEN**: Exposing detailed confidence factors (privacy risk)
- ❌ **FORBIDDEN**: Using confidence to hide users (transparency)

---

## Output Requirements

### Proximity Engine Architecture

**Core Systems**:
1. **Geohash Calculator** (coordinate → geohash, privacy-preserving)
2. **Distance Tier System** (geohash → tier, no exact coordinates)
3. **Location Update Manager** (ingestion, expiration, confidence)
4. **Privacy Level Manager** (privacy → precision mapping)
5. **Anomaly Detector** (spoofing detection, confidence adjustment)

### Distance Tier System Specification

**Tiers**:
- Tier 0: Same Location (0-100m, geohash level 7)
- Tier 1: Very Close (100m-1km, geohash level 6)
- Tier 2: Close (1km-5km, geohash level 5)
- Tier 3: Nearby (5km-25km, geohash level 4)
- Tier 4: Regional (25km-200km, geohash level 3)
- Tier 5: Distant (200km+, geohash level 2 or lower)

**Rules**:
- Use geohash cells, not exact coordinates
- Precision level determines tier
- Never expose exact coordinates

### Location Update System Specification

**Update Flow**:
- Ingestion (GPS, WiFi, IP, manual)
- Expiration (based on source and age)
- Confidence calculation (source, age, verification, anomalies)

**Update Rules**:
- Expire stale locations
- Use most recent update
- Degrade confidence over time

### Privacy Level System Specification

**Privacy Levels**:
- Level 1: Precise (Tier 0, opt-in)
- Level 2: Close (Tier 1, default for sharing)
- Level 3: General (Tier 2-3, default)
- Level 4: Regional (Tier 4, fallback)
- Level 5: Hidden (no proximity)

**Privacy Rules**:
- Privacy level determines precision
- Users control privacy level
- Privacy level affects discovery

### Spoofing Detection System Specification

**Detection Mechanisms**:
- Device verification (trusted devices)
- Anomaly detection (teleporting, impossible speed, inconsistent sources)
- Confidence adjustment (degrade instead of ban)

**Mitigation**:
- Degrade confidence instead of banning
- Surface approximate confidence internally
- Trust weighting for verified devices

### Proximity Confidence System Specification

**Confidence Calculation**:
- Base confidence (source-based)
- Age degradation (older = less confident)
- Verification factor (verified = more confident)
- Anomaly factor (anomalies = less confident)
- Weighted combination (total confidence)

**Confidence Representation**:
- Internal (detailed, for ranking)
- User-facing (simplified, transparent)

---

## Brand DNA Alignment

Every proximity decision must align with:

1. **Proximity-first** → Distance always evaluated first, even when overridden
2. **Privacy-first** → Never expose exact coordinates, geohash cells only
3. **Transparency** → Confidence explained, anomalies detected, users informed
4. **Anti-algorithm** → Proximity is tunable, explainable, humane

---

## Success Criteria

The proximity engine is successful when:

- ✅ Distance tiers calculated without exact coordinates (privacy)
- ✅ Location updates ingested and expired correctly (accuracy, privacy)
- ✅ Privacy levels affect precision correctly (user control)
- ✅ Spoofing and anomalies detected (abuse prevention)
- ✅ Proximity confidence represented transparently (trust)
- ✅ Distance always evaluated first (proximity-first)
- ✅ Age layers never leak (safety)
- ✅ No hidden suppression (transparency)

---

**CRITICAL**: This is a privacy-first location system. No UI, no maps. Pure backend architecture. Never expose exact coordinates. Proximity-first means distance is primary, always.

