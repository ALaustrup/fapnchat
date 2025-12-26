# WYA!? — Alpha Geo-First Discovery Implementation

**Status:** ✅ Complete  
**Purpose:** Proximity-first discovery with privacy-safe location handling

---

## Overview

Alpha-grade geo-first discovery system that prioritizes proximity above all else. Location is opt-in, privacy-safe (hashed/bucketed), and discovery explains why users are shown.

**Core Principles:**
- **Proximity > everything** — Distance is primary sort
- **Privacy-safe** — Hashed locations, rounded coordinates
- **Transparent** — Explains why users are shown
- **Manual refresh** — No infinite feeds
- **No algorithms** — Simple distance-based ranking

---

## Implementation Files

### 1. Geo Location Utilities
**File:** `apps/web/src/utils/geoLocation.js`

**Functions:**
- `hashLocation(location)` / `hashLocationSync(location)` — Hash city/neighborhood (SHA-256)
- `roundCoordinate(coord)` — Round to ~1km precision
- `calculateDistance(lat1, lon1, lat2, lon2)` — Haversine distance calculation
- `getDistanceTier(distanceKm, cityHash1, cityHash2)` — Determine tier
- `getDistanceTierDisplayName(tier)` — Human-readable tier name
- `validateCoordinates(lat, lon)` — Validate coordinate inputs
- `extractCity(location)` — Extract city from location string

**Distance Tiers:**
- `immediate` — Same location (~100m)
- `nearby` — Very close (~1km)
- `local` — Close (~5-25km)
- `city` — Same city (~50km+)

---

### 2. Location Update API
**File:** `apps/web/src/app/api/geo/location/route.js`

**Endpoints:**

**POST /api/geo/location**
- Update user location (opt-in)
- Body: `{ latitude, longitude, city }`
- Rounds coordinates to ~1km precision
- Hashes city name
- Never exposes raw data

**GET /api/geo/location**
- Get location status
- Returns only `has_location` and `city_hash`
- Never exposes coordinates or city name

**DELETE /api/geo/location**
- Remove location (opt-out)
- Deletes location data

**Privacy Protection:**
- Coordinates rounded to ~1km precision
- City name hashed (SHA-256)
- Never exposes raw data in responses

---

### 3. Discovery API
**File:** `apps/web/src/app/api/discovery/route.js`

**Endpoint:**

**GET /api/discovery**
- Returns users sorted by proximity
- Query params: `limit` (default: 50, max: 100), `offset` (default: 0)
- Filters by age layer (same layer only)
- Requires location to be enabled

**Response Format:**
```json
{
  "users": [
    {
      "user_id": "uuid",
      "display_name": "Name",
      "bio": "Bio text",
      "avatar_url": "url",
      "distance_tier": "nearby",
      "distance_tier_display": "Very close",
      "explanation": "Very close to you • Your age group"
    }
  ],
  "total": 42,
  "has_more": false,
  "limit": 50,
  "offset": 0
}
```

**Ranking Logic:**
1. Same city first (city_hash match)
2. Then by distance tier (immediate > nearby > local > city)
3. Then by most recent location update
4. Age layer filtering applied (same layer only)

**Explanations:**
- Each user includes explanation of why they're shown
- Format: `"{distance_tier} • Your age group"`
- Examples:
  - "Very close to you • Your age group"
  - "Same city • Your age group"

---

### 4. Discovery View Component
**File:** `apps/web/src/components/DiscoveryView.jsx`

**Features:**
- Simple list UI (no infinite feed)
- Manual refresh button
- Shows distance tier and explanation
- Glass UI components
- Empty state for no location
- Loading and error states

**UI Elements:**
- Header with user count and refresh button
- User cards with avatar, name, bio
- Distance tier badge (color-coded)
- Explanation text
- Footer with pagination info

**No Infinite Feed:**
- Manual refresh only
- Shows total count
- Pagination info (has_more)
- User must click refresh to see more

---

## Distance Tier System

### Tier Definitions

**Immediate** (~100m)
- Same location
- Color: Green (#00FF88)
- Priority: 0 (highest)

**Nearby** (~1km)
- Very close
- Color: Purple (#7A5AF8)
- Priority: 1

**Local** (~5-25km)
- Close by
- Color: Light Purple (#9F7AEA)
- Priority: 2

**City** (~50km+)
- Same city
- Color: Gray (#8B8B90)
- Priority: 3 (lowest)

---

## Privacy Protection

### What's Protected

1. **Raw Coordinates**
   - Never exposed in API responses
   - Rounded to ~1km precision before storage
   - Only used for distance calculation

2. **City Names**
   - Hashed with SHA-256
   - Only hash stored in database
   - Never exposed in responses

3. **Exact Distances**
   - Only distance tiers exposed
   - Never exact distance in kilometers
   - Tiers provide privacy buffer

### What's Exposed

1. **Distance Tier**
   - `immediate`, `nearby`, `local`, `city`
   - Human-readable display name
   - Color-coded in UI

2. **Explanation**
   - Why user is shown
   - Includes distance tier and age group
   - Transparent and clear

---

## Usage Flow

### 1. User Enables Location

```javascript
// POST /api/geo/location
{
  latitude: 40.7128,
  longitude: -74.0060,
  city: "New York"
}

// Server:
// - Rounds coordinates to ~1km: (40.71, -74.01)
// - Hashes city: SHA-256("new york")
// - Stores in geo_locations table
```

### 2. User Requests Discovery

```javascript
// GET /api/discovery?limit=50

// Server:
// - Gets viewer's location
// - Queries users with same age layer
// - Calculates distances
// - Determines tiers
// - Sorts by proximity
// - Returns with explanations
```

### 3. User Views Results

- List shows users sorted by proximity
- Each user shows distance tier and explanation
- User can refresh to see updated results
- No infinite scrolling

---

## Integration Points

### Age Layer Filtering

Discovery automatically filters by age layer:
- Only shows users in same age layer
- Uses `requireAgeLayer()` middleware
- Applies SQL WHERE clause: `age_layer = ${viewerAgeLayer}`

### Profile Visibility

Discovery respects profile privacy:
- Only shows non-private profiles
- Filters: `is_private = false`

### Location Opt-In

Discovery requires location:
- Returns empty if user hasn't enabled location
- Shows message: "Enable location sharing to discover users nearby"

---

## Alpha Constraints

### ✅ Included

- Proximity-first sorting
- Distance tiers (no exact distances)
- Manual refresh only
- Privacy-safe hashing
- Transparent explanations
- Age layer filtering
- Simple ranking (no ML)

### ❌ Excluded

- Boosts (not in Alpha)
- Interest ML (not in Alpha)
- Engagement scoring (not in Alpha)
- Infinite feeds (forbidden)
- Algorithmic black boxes (forbidden)
- Exact coordinates (privacy violation)
- Reverse geocoding (Beta+)

---

## TODO: Beta+ Enhancements

**Marked in code with `// TODO: Beta+` comments:**

1. **Reverse Geocoding**
   - Get city from coordinates automatically
   - Integrate with geocoding API
   - Fallback to manual city input

2. **Neighborhood Support**
   - Extract neighborhood from location
   - Hash neighborhood separately
   - More granular proximity matching

3. **Location Sources**
   - GPS (high confidence)
   - WiFi (medium confidence)
   - IP (low confidence)
   - Manual (user-set)

4. **Location Expiration**
   - TTL for location data
   - Auto-expire stale locations
   - Privacy protection

---

## Testing Checklist

- [ ] Location update stores hashed city
- [ ] Location update rounds coordinates
- [ ] Discovery requires location to be enabled
- [ ] Discovery filters by age layer
- [ ] Discovery sorts by proximity
- [ ] Distance tiers calculated correctly
- [ ] Explanations generated correctly
- [ ] No raw coordinates exposed
- [ ] No city names exposed
- [ ] Manual refresh works
- [ ] Empty state shows when no location
- [ ] Error handling works

---

## Security Notes

1. **Privacy Protection**
   - Coordinates rounded before storage
   - City names hashed
   - Never expose raw data

2. **Opt-In Only**
   - Location must be explicitly enabled
   - Can be disabled at any time
   - No location = no discovery

3. **Server-Side Enforcement**
   - All calculations server-side
   - Client cannot override ranking
   - Age layer filtering enforced

---

## Migration Instructions

1. **Database Schema**
   - `geo_locations` table already defined in `ALPHA_DATABASE_SCHEMA.sql`
   - No additional migration needed

2. **Deploy Code**
   - Geo location utilities
   - Location update API
   - Discovery API
   - Discovery view component

3. **Test**
   - Location update flow
   - Discovery ranking
   - Privacy protection
   - Age layer filtering

---

## Summary

✅ **Complete:** Alpha geo-first discovery implemented  
✅ **Proximity-First:** Distance is primary sort  
✅ **Privacy-Safe:** Hashed locations, rounded coordinates  
✅ **Transparent:** Explains why users are shown  
✅ **Manual Refresh:** No infinite feeds  
✅ **No Algorithms:** Simple distance-based ranking  
✅ **Age Layer Filtered:** Same layer only  
✅ **Opt-In:** Location must be enabled

**Next Steps:**
- Test location update flow
- Test discovery ranking
- Verify privacy protection
- Integrate DiscoveryView into main app
- Plan Beta+ enhancements (reverse geocoding, etc.)

