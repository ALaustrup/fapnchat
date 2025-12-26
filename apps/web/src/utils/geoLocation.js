/**
 * WYA!? — Geo Location Utilities (Alpha)
 * 
 * Purpose: Privacy-safe location hashing and distance tier calculation
 * 
 * Rules:
 * - Location is opt-in
 * - Use hashed/bucketed locations
 * - Never expose raw coordinates
 * - Distance tiers only (no exact distances)
 * 
 * Distance Tiers:
 * - immediate: Same location (~100m)
 * - nearby: Very close (~1km)
 * - local: Close (~5-25km)
 * - city: Same city (~50km+)
 */

/**
 * Hash a location string (city or neighborhood)
 * Uses SHA-256 for privacy-safe hashing
 * 
 * Note: For browser compatibility, uses Web Crypto API
 * Server-side can use Node.js crypto module
 * 
 * @param {string} location - City or neighborhood name
 * @returns {Promise<string>} SHA-256 hash (hex)
 */
export async function hashLocation(location) {
  if (!location || typeof location !== 'string') {
    return null;
  }
  
  // Normalize: lowercase, trim, remove extra spaces
  const normalized = location.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Use Web Crypto API (browser) or Node.js crypto (server)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser: Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Server: Node.js crypto (dynamic import)
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
}

/**
 * Synchronous hash function (server-side only)
 * @param {string} location - City or neighborhood name
 * @returns {string} SHA-256 hash (hex)
 */
export function hashLocationSync(location) {
  if (!location || typeof location !== 'string') {
    return null;
  }
  
  // Normalize: lowercase, trim, remove extra spaces
  const normalized = location.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Server-side only (Node.js)
  if (typeof window === 'undefined') {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
  
  // Browser fallback: simple hash (not cryptographically secure, but acceptable for Alpha)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Round coordinates to ~1km precision
 * This protects exact location while allowing proximity matching
 * 
 * @param {number} coord - Latitude or longitude
 * @returns {number} Rounded coordinate (~1km precision)
 */
export function roundCoordinate(coord) {
  if (coord === null || coord === undefined || isNaN(coord)) {
    return null;
  }
  
  // Round to 0.01 degrees ≈ 1km precision
  return Math.round(coord * 100) / 100;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns approximate distance in kilometers
 * 
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 0.1km
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Determine distance tier from distance in kilometers
 * 
 * @param {number} distanceKm - Distance in kilometers (or null)
 * @param {string} cityHash1 - City hash of user 1
 * @param {string} cityHash2 - City hash of user 2
 * @returns {string} Distance tier: 'immediate' | 'nearby' | 'local' | 'city' | null
 */
export function getDistanceTier(distanceKm, cityHash1, cityHash2) {
  // If no distance, check city hash match
  if (distanceKm === null || distanceKm === undefined) {
    if (cityHash1 && cityHash2 && cityHash1 === cityHash2) {
      return 'city'; // Same city, unknown distance
    }
    return null; // No location data
  }
  
  // Same city hash = same city
  if (cityHash1 && cityHash2 && cityHash1 === cityHash2) {
    // Within same city, determine tier by distance
    if (distanceKm <= 0.1) {
      return 'immediate'; // ~100m
    } else if (distanceKm <= 1) {
      return 'nearby'; // ~1km
    } else if (distanceKm <= 25) {
      return 'local'; // ~5-25km
    } else {
      return 'city'; // Same city but far apart
    }
  }
  
  // Different cities
  return null; // Not in discovery range
}

/**
 * Get distance tier display name
 * 
 * @param {string} tier - Distance tier
 * @returns {string} Display name
 */
export function getDistanceTierDisplayName(tier) {
  const names = {
    immediate: 'Same location',
    nearby: 'Very close',
    local: 'Close by',
    city: 'Same city',
  };
  
  return names[tier] || 'Unknown';
}

/**
 * Validate coordinates
 * 
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateCoordinates(latitude, longitude) {
  if (latitude === null || latitude === undefined || isNaN(latitude)) {
    return { valid: false, error: 'Latitude is required' };
  }
  
  if (longitude === null || longitude === undefined || isNaN(longitude)) {
    return { valid: false, error: 'Longitude is required' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Invalid latitude' };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Invalid longitude' };
  }
  
  return { valid: true };
}

/**
 * Extract city from location string
 * Handles formats like "City, State" or "City, Country"
 * 
 * @param {string} location - Location string
 * @returns {string} City name
 */
export function extractCity(location) {
  if (!location || typeof location !== 'string') {
    return null;
  }
  
  // Split by comma and take first part (city)
  const parts = location.split(',').map(p => p.trim());
  return parts[0] || null;
}

/**
 * Extract neighborhood from location string (optional)
 * 
 * @param {string} location - Location string
 * @returns {string|null} Neighborhood name or null
 */
export function extractNeighborhood(location) {
  if (!location || typeof location !== 'string') {
    return null;
  }
  
  // For Alpha, we don't extract neighborhood
  // This is a placeholder for Beta+ if needed
  return null;
}

