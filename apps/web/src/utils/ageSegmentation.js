/**
 * WYA!? — Age Segmentation Utilities (Alpha)
 * 
 * Purpose: Hard age isolation, soft UX
 * 
 * Age Layers:
 * - minor: 13-17
 * - transitional: 18-21
 * - adult: 22+
 * 
 * Rules:
 * - Age layer is IMMUTABLE after signup
 * - Users CANNOT see or interact across layers
 * - Age layer affects discovery, chat, profile visibility, content filtering
 * 
 * Alpha: Self-declared age (soft verification)
 * Beta+: External verification required
 */

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Determine age layer from age
 * @param {number} age - Age in years
 * @returns {string} Age layer: 'minor' | 'transitional' | 'adult'
 */
export function getAgeLayer(age) {
  if (age === null || age === undefined || isNaN(age)) {
    throw new Error('Invalid age');
  }
  
  if (age < 13) {
    throw new Error('Users must be at least 13 years old');
  }
  
  if (age >= 13 && age <= 17) {
    return 'minor';
  }
  
  if (age >= 18 && age <= 21) {
    return 'transitional';
  }
  
  if (age >= 22) {
    return 'adult';
  }
  
  throw new Error('Invalid age range');
}

/**
 * Determine age layer from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {string} Age layer: 'minor' | 'transitional' | 'adult'
 */
export function getAgeLayerFromBirthDate(birthDate) {
  const age = calculateAge(birthDate);
  return getAgeLayer(age);
}

/**
 * Check if two age layers can interact
 * @param {string} layer1 - First age layer
 * @param {string} layer2 - Second age layer
 * @returns {boolean} True if layers can interact
 */
export function canAgeLayersInteract(layer1, layer2) {
  // Hard isolation: layers CANNOT interact
  return layer1 === layer2;
}

/**
 * Check if user can see another user based on age layers
 * @param {string} viewerLayer - Viewer's age layer
 * @param {string} targetLayer - Target user's age layer
 * @returns {boolean} True if viewer can see target
 */
export function canSeeUser(viewerLayer, targetLayer) {
  return canAgeLayersInteract(viewerLayer, targetLayer);
}

/**
 * Check if user can chat with another user based on age layers
 * @param {string} user1Layer - First user's age layer
 * @param {string} user2Layer - Second user's age layer
 * @returns {boolean} True if users can chat
 */
export function canChat(user1Layer, user2Layer) {
  return canAgeLayersInteract(user1Layer, user2Layer);
}

/**
 * Validate birth date for Alpha signup
 * @param {Date|string} birthDate - Birth date
 * @returns {object} { valid: boolean, error?: string, age?: number, layer?: string }
 */
export function validateBirthDateForSignup(birthDate) {
  if (!birthDate) {
    return { valid: false, error: 'Birth date is required' };
  }
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birth.getTime())) {
    return { valid: false, error: 'Invalid birth date' };
  }
  
  // Check if date is in the future
  if (birth > today) {
    return { valid: false, error: 'Birth date cannot be in the future' };
  }
  
  // Check if user is at least 13
  const age = calculateAge(birth);
  if (age < 13) {
    return { valid: false, error: 'Users must be at least 13 years old' };
  }
  
  // Check if user is too old (reasonable limit)
  if (age > 120) {
    return { valid: false, error: 'Invalid birth date' };
  }
  
  try {
    const layer = getAgeLayer(age);
    return { valid: true, age, layer };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Get age layer display name
 * @param {string} layer - Age layer
 * @returns {string} Display name
 */
export function getAgeLayerDisplayName(layer) {
  const names = {
    minor: '13-17',
    transitional: '18-21',
    adult: '22+',
  };
  
  return names[layer] || 'Unknown';
}

/**
 * Filter users by age layer compatibility
 * @param {Array} users - Array of user objects with age_layer
 * @param {string} viewerLayer - Viewer's age layer
 * @returns {Array} Filtered users (same layer only)
 */
export function filterUsersByAgeLayer(users, viewerLayer) {
  if (!viewerLayer) {
    return [];
  }
  
  return users.filter(user => {
    const userLayer = user.age_layer || user.ageLayer;
    return canAgeLayersInteract(viewerLayer, userLayer);
  });
}

