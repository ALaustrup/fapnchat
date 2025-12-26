# MASTER PROMPT 23
## DISCOVERY PIPELINE & EXPLANATION ENGINE

**SYSTEM MODE**: RANKING & EXPLAINABILITY ARCHITECT

Design the discovery pipeline for WYA!? that ranks results transparently and explains decisions in plain language.

---

## Input

- Profile Discovery & Recommendation (MASTER_PROMPT_20)
- Proximity Engine & Location Privacy Model (MASTER_PROMPT_21)
- Social Score & Trust System (MASTER_PROMPT_22)
- Product Governance Framework (Anti-Algorithm philosophy)

---

## Architectural Truths

### Why Transparency is Essential

**A. Transparency Prevents Creepiness**:
- Users see why they're seeing someone
- Factors are visible, not hidden
- **Consequence**: Proximity-first systems feel grounded, not creepy

**B. Transparency Enables Agency**:
- Users can see which factors applied
- Users can improve their discovery
- Users can opt out of ranking behavior
- **Consequence**: User agency, not manipulation

**C. Transparency Builds Trust**:
- No black-box algorithms
- No hidden suppression
- No invisible penalties
- **Consequence**: Trust through transparency

---

## The Non-Negotiable Invariants

### Invariant #1: Distance is Always Evaluated First
- ✅ **REQUIRED**: Distance computed and disclosed even when overridden
- ✅ **REQUIRED**: Distance weight can be softened, but never skipped
- **Rationale**: Proximity-first means distance is primary, always

### Invariant #2: Discovery Must Remain Finite
- ✅ **REQUIRED**: Bounded discovery (limited options, not infinite)
- ❌ **FORBIDDEN**: Endless scrolling, algorithmic trance
- **Rationale**: Violates core philosophy if discovery becomes infinite

### Invariant #3: No Hidden Suppression
- ✅ **REQUIRED**: All restrictions visible, explainable, appealable
- ❌ **FORBIDDEN**: Shadow banning, silent throttling, invisible penalties
- **Rationale**: Moderation convenience is not worth trust loss

### Invariant #4: System Must Never Feel Manipulative
- ✅ **REQUIRED**: Transparent ranking, explainable decisions
- ✅ **REQUIRED**: User can opt out, influence, or appeal
- ❌ **FORBIDDEN**: Hidden manipulation, dark patterns, forced engagement
- **Rationale**: Trust requires transparency, not manipulation

---

## Define

### 1. Step-by-Step Ranking Flow (As Code-Ready Stages)

#### **Ranking Pipeline Stages**

**Stage 1: Candidate Collection** (Gather Potential Matches):
```typescript
interface CandidateCollection {
  stage: 'collection'
  input: {
    userId: string
    location: GeohashCell
    preferences: UserPreferences
    context: DiscoveryContext
  }
  output: {
    candidates: Candidate[] // All potential matches
    filters: AppliedFilters // Privacy, age, blocks applied
  }
}

function collectCandidates(input: CandidateCollection['input']): CandidateCollection['output'] {
  // 1. Get all users in proximity tiers (Tier 0-4, not Tier 5)
  const proximityCandidates = getUsersInProximityTiers(input.location, [0, 1, 2, 3, 4])
  
  // 2. Apply privacy filters (exclude private, friends-only if not friend)
  const privacyFiltered = applyPrivacyFilters(proximityCandidates, input.userId)
  
  // 3. Apply age filters (exclude age-restricted if user is underage)
  const ageFiltered = applyAgeFilters(privacyFiltered, input.userId)
  
  // 4. Apply block filters (exclude blocked users)
  const blockFiltered = applyBlockFilters(ageFiltered, input.userId)
  
  // 5. Apply user preferences (exclude if user opted out)
  const preferenceFiltered = applyUserPreferences(blockFiltered, input.preferences)
  
  return {
    candidates: preferenceFiltered,
    filters: {
      privacy: true,
      age: true,
      blocks: true,
      preferences: true
    }
  }
}
```

**Stage 2: Proximity Scoring** (Calculate Distance Scores):
```typescript
interface ProximityScoring {
  stage: 'proximity'
  input: {
    candidates: Candidate[]
    userLocation: GeohashCell
  }
  output: {
    scoredCandidates: ScoredCandidate[] // Candidates with proximity scores
  }
}

function scoreProximity(input: ProximityScoring['input']): ProximityScoring['output'] {
  const scoredCandidates = input.candidates.map(candidate => {
    // Calculate distance tier (0-5)
    const tier = calculateDistanceTier(input.userLocation, candidate.location)
    
    // Calculate proximity score (tier 0 = 1.0, tier 5 = 0.1)
    const proximityScore = 1.0 - (tier * 0.15) // Linear decay
    
    // Calculate proximity confidence (from location update)
    const confidence = candidate.locationConfidence
    
    // Combined proximity score (score * confidence)
    const combinedScore = proximityScore * confidence
    
    return {
      ...candidate,
      proximityScore: combinedScore,
      tier,
      confidence,
      explanation: `Distance: ${getTierName(tier)} (${(confidence * 100).toFixed(0)}% confidence)`
    }
  })
  
  return { scoredCandidates }
}
```

**Stage 3: Social Score Weighting** (Apply Trust Scores):
```typescript
interface SocialScoreWeighting {
  stage: 'social-score'
  input: {
    scoredCandidates: ScoredCandidate[]
    socialScores: Map<string, SocialScore>
  }
  output: {
    weightedCandidates: WeightedCandidate[] // Candidates with social score weights
  }
}

function applySocialScoreWeighting(
  input: SocialScoreWeighting['input']
): SocialScoreWeighting['output'] {
  const weightedCandidates = input.scoredCandidates.map(candidate => {
    const socialScore = input.socialScores.get(candidate.userId) || getDefaultSocialScore()
    
    // Social score weight: 20% (proximity is 80%)
    const socialScoreWeight = 0.2
    const proximityWeight = 0.8
    
    // Weighted score: (proximity * 0.8) + (socialScore * 0.2)
    const weightedScore = 
      candidate.proximityScore * proximityWeight +
      socialScore.total * socialScoreWeight
    
    return {
      ...candidate,
      weightedScore,
      socialScore: socialScore.total,
      explanation: candidate.explanation + `, Trust: ${(socialScore.total * 100).toFixed(0)}%`
    }
  })
  
  return { weightedCandidates }
}
```

**Stage 4: Context Adjustment** (Apply Context Factors):
```typescript
interface ContextAdjustment {
  stage: 'context'
  input: {
    weightedCandidates: WeightedCandidate[]
    context: DiscoveryContext
  }
  output: {
    adjustedCandidates: AdjustedCandidate[] // Candidates with context adjustments
  }
}

function applyContextAdjustment(
  input: ContextAdjustment['input']
): ContextAdjustment['output'] {
  const adjustedCandidates = input.weightedCandidates.map(candidate => {
    let adjustedScore = candidate.weightedScore
    const adjustments: string[] = []
    
    // Relationship context: Friends/connections get boost
    if (input.context.relationship === 'friend') {
      adjustedScore *= 1.1
      adjustments.push('Friend (+10%)')
    } else if (input.context.relationship === 'connection') {
      adjustedScore *= 1.05
      adjustments.push('Connection (+5%)')
    }
    
    // Location context: Same room = boost
    if (input.context.location === 'same-room') {
      adjustedScore *= 1.05
      adjustments.push('Same room (+5%)')
    }
    
    // Activity context: Chat = boost
    if (input.context.activity === 'chat') {
      adjustedScore *= 1.05
      adjustments.push('Active chat (+5%)')
    }
    
    return {
      ...candidate,
      finalScore: Math.min(1.0, adjustedScore), // Clamp to 1.0
      adjustments,
      explanation: candidate.explanation + (adjustments.length > 0 ? `, ${adjustments.join(', ')}` : '')
    }
  })
  
  return { adjustedCandidates }
}
```

**Stage 5: Diversity Enforcement** (Ensure Diversity):
```typescript
interface DiversityEnforcement {
  stage: 'diversity'
  input: {
    adjustedCandidates: AdjustedCandidate[]
    diversityFactors: DiversityFactors
  }
  output: {
    diversifiedCandidates: DiversifiedCandidate[] // Candidates with diversity applied
  }
}

function enforceDiversity(
  input: DiversityEnforcement['input']
): DiversityEnforcement['output'] {
  // Sort by final score (highest first)
  const sorted = [...input.adjustedCandidates].sort((a, b) => b.finalScore - a.finalScore)
  
  // Apply diversity: Ensure mix of factors (not all same type)
  const diversified: DiversifiedCandidate[] = []
  const seenFactors = new Set<string>()
  
  for (const candidate of sorted) {
    const factorKey = `${candidate.tier}-${candidate.socialScore > 0.7 ? 'high' : 'low'}`
    
    // If we've seen this factor combination, reduce score slightly
    if (seenFactors.has(factorKey) && diversified.length > 0) {
      candidate.finalScore *= 0.95 // 5% reduction for diversity
      candidate.explanation += ', Diversity adjustment (-5%)'
    }
    
    diversified.push(candidate)
    seenFactors.add(factorKey)
  }
  
  return { diversifiedCandidates: diversified }
}
```

**Stage 6: Result Limiting** (Apply Bounds):
```typescript
interface ResultLimiting {
  stage: 'limiting'
  input: {
    diversifiedCandidates: DiversifiedCandidate[]
    maxResults: number // Default: 20
  }
  output: {
    finalResults: FinalResult[] // Bounded results with explanations
  }
}

function limitResults(input: ResultLimiting['input']): ResultLimiting['output'] {
  // Sort by final score (highest first)
  const sorted = [...input.diversifiedCandidates].sort((a, b) => b.finalScore - a.finalScore)
  
  // Take top N results (bounded, not infinite)
  const limited = sorted.slice(0, input.maxResults)
  
  // Generate explanations for each result
  const finalResults = limited.map((candidate, index) => ({
    ...candidate,
    rank: index + 1,
    explanation: generateExplanation(candidate) // Plain language explanation
  }))
  
  return { finalResults }
}
```

#### **Complete Pipeline**

**Pipeline Execution**:
```typescript
function executeDiscoveryPipeline(
  userId: string,
  location: GeohashCell,
  preferences: UserPreferences,
  context: DiscoveryContext
): FinalResult[] {
  // Stage 1: Collect candidates
  const { candidates, filters } = collectCandidates({ userId, location, preferences, context })
  
  // Stage 2: Score proximity
  const { scoredCandidates } = scoreProximity({ candidates, userLocation: location })
  
  // Stage 3: Apply social score weighting
  const socialScores = getSocialScores(candidates.map(c => c.userId))
  const { weightedCandidates } = applySocialScoreWeighting({ scoredCandidates, socialScores })
  
  // Stage 4: Apply context adjustments
  const { adjustedCandidates } = applyContextAdjustment({ weightedCandidates, context })
  
  // Stage 5: Enforce diversity
  const { diversifiedCandidates } = enforceDiversity({ 
    adjustedCandidates, 
    diversityFactors: getDiversityFactors() 
  })
  
  // Stage 6: Limit results
  const { finalResults } = limitResults({ 
    diversifiedCandidates, 
    maxResults: 20 // Bounded, not infinite
  })
  
  return finalResults
}
```

---

### 2. How Weights Are Applied and Adjusted

#### **Weight Configuration**

**Default Weights**:
```typescript
interface WeightConfiguration {
  proximity: 0.8 // 80% weight (primary)
  socialScore: 0.2 // 20% weight (secondary)
  context: {
    relationship: 0.1 // 10% boost for friends
    location: 0.05 // 5% boost for same room
    activity: 0.05 // 5% boost for active chat
  }
  diversity: 0.05 // 5% reduction for diversity
}
```

**Weight Adjustment** (User-Controlled):
```typescript
interface UserWeightPreferences {
  proximityWeight: number // 0.5-1.0 (user can reduce, not eliminate)
  socialScoreWeight: number // 0.0-0.5 (user can reduce or eliminate)
  contextWeight: number // 0.0-0.2 (user can reduce or eliminate)
  diversityWeight: number // 0.0-0.1 (user can reduce or eliminate)
}

function applyUserWeights(
  baseWeights: WeightConfiguration,
  userPreferences: UserWeightPreferences
): WeightConfiguration {
  // User can adjust weights, but proximity must remain primary
  const adjustedProximity = Math.max(0.5, userPreferences.proximityWeight) // Minimum 50%
  const adjustedSocialScore = Math.min(0.5, userPreferences.socialScoreWeight) // Maximum 50%
  
  // Normalize weights (must sum to 1.0)
  const total = adjustedProximity + adjustedSocialScore
  const normalizedProximity = adjustedProximity / total
  const normalizedSocialScore = adjustedSocialScore / total
  
  return {
    proximity: normalizedProximity,
    socialScore: normalizedSocialScore,
    context: {
      relationship: userPreferences.contextWeight * 0.5, // Half of context weight
      location: userPreferences.contextWeight * 0.25, // Quarter of context weight
      activity: userPreferences.contextWeight * 0.25 // Quarter of context weight
    },
    diversity: userPreferences.diversityWeight
  }
}
```

**Weight Rules**:
- ✅ **REQUIRED**: Proximity weight is primary (minimum 50%, default 80%)
- ✅ **REQUIRED**: Social score weight is secondary (maximum 50%, default 20%)
- ✅ **REQUIRED**: Weights normalized (must sum to 1.0)
- ✅ **REQUIRED**: User can adjust weights (preferences)
- ❌ **FORBIDDEN**: Proximity weight below 50% (violates proximity-first)
- ❌ **FORBIDDEN**: Weights don't sum to 1.0 (invalid ranking)

---

### 3. How Diversity is Enforced

#### **Diversity Factors**

**Factor Types**:
```typescript
interface DiversityFactors {
  proximityTier: boolean // Ensure mix of proximity tiers
  socialScore: boolean // Ensure mix of social scores
  interests: boolean // Ensure mix of interests
  activity: boolean // Ensure mix of activity levels
}
```

**Diversity Enforcement**:
```typescript
function enforceDiversity(
  candidates: AdjustedCandidate[],
  factors: DiversityFactors
): DiversifiedCandidate[] {
  const diversified: DiversifiedCandidate[] = []
  const seenCombinations = new Map<string, number>()
  
  for (const candidate of candidates) {
    // Create factor combination key
    const combinationKey = createCombinationKey(candidate, factors)
    const seenCount = seenCombinations.get(combinationKey) || 0
    
    // If we've seen this combination, reduce score for diversity
    if (seenCount > 0 && factors.proximityTier) {
      candidate.finalScore *= 0.95 // 5% reduction
      candidate.explanation += ', Diversity: Mix of distances'
    }
    
    if (seenCount > 0 && factors.socialScore) {
      candidate.finalScore *= 0.95 // 5% reduction
      candidate.explanation += ', Diversity: Mix of trust levels'
    }
    
    diversified.push(candidate)
    seenCombinations.set(combinationKey, seenCount + 1)
  }
  
  return diversified
}
```

**Diversity Rules**:
- ✅ **REQUIRED**: Ensure mix of factors (not all same type)
- ✅ **REQUIRED**: Diversity adjustments are small (5%, not dramatic)
- ✅ **REQUIRED**: Diversity is transparent (explained to users)
- ❌ **FORBIDDEN**: Diversity overrides proximity (proximity is primary)
- ❌ **FORBIDDEN**: Hidden diversity adjustments (must be transparent)

---

### 4. How Results Are Explained to Users in Plain Language

#### **Explanation Generation**

**Explanation Templates**:
```typescript
function generateExplanation(candidate: DiversifiedCandidate): string {
  const parts: string[] = []
  
  // Proximity explanation
  if (candidate.tier === 0) {
    parts.push('Very close to you')
  } else if (candidate.tier === 1) {
    parts.push('Nearby')
  } else if (candidate.tier === 2) {
    parts.push('In your area')
  } else if (candidate.tier === 3) {
    parts.push('In your city')
  } else if (candidate.tier === 4) {
    parts.push('In your region')
  }
  
  // Confidence explanation
  if (candidate.confidence < 0.5) {
    parts.push('(approximate location)')
  } else if (candidate.confidence > 0.8) {
    parts.push('(verified location)')
  }
  
  // Social score explanation
  if (candidate.socialScore > 0.7) {
    parts.push('High trust score')
  } else if (candidate.socialScore < 0.4) {
    parts.push('Building trust')
  }
  
  // Context explanations
  if (candidate.adjustments.includes('Friend')) {
    parts.push('Your friend')
  }
  if (candidate.adjustments.includes('Same room')) {
    parts.push('In the same room')
  }
  
  // Diversity explanation
  if (candidate.explanation.includes('Diversity')) {
    parts.push('(showing variety)')
  }
  
  return parts.join(' • ')
}
```

**Explanation Examples**:
- "Very close to you (verified location) • High trust score • Your friend"
- "Nearby (approximate location) • Building trust • In the same room"
- "In your area • High trust score • (showing variety)"

**Explanation Rules**:
- ✅ **REQUIRED**: Plain language (no technical jargon)
- ✅ **REQUIRED**: All factors explained (proximity, trust, context, diversity)
- ✅ **REQUIRED**: Transparent (users see why they're seeing someone)
- ❌ **FORBIDDEN**: Hidden explanations (must be visible)
- ❌ **FORBIDDEN**: Technical jargon (must be plain language)

---

### 5. How Users Can Influence or Opt Out of Ranking Behavior

#### **User Controls**

**Opt-Out Options**:
```typescript
interface UserDiscoveryPreferences {
  // Opt-out of algorithmic ranking
  useAlgorithmicRanking: boolean // Default: false (chronological)
  
  // Opt-out of specific factors
  useProximityRanking: boolean // Default: true (can't fully opt out)
  useSocialScoreRanking: boolean // Default: false (opt-in)
  useContextRanking: boolean // Default: false (opt-in)
  useDiversityRanking: boolean // Default: true
  
  // Adjust weights
  proximityWeight: number // 0.5-1.0 (minimum 50%)
  socialScoreWeight: number // 0.0-0.5 (can eliminate)
  contextWeight: number // 0.0-0.2 (can eliminate)
  diversityWeight: number // 0.0-0.1 (can eliminate)
  
  // Filter preferences
  minProximityTier: number // 0-5 (minimum tier to show)
  maxProximityTier: number // 0-5 (maximum tier to show)
  minSocialScore: number // 0-1 (minimum score to show)
  maxSocialScore: number // 0-1 (maximum score to show)
}
```

**Influence Mechanisms**:
```typescript
function applyUserPreferences(
  pipeline: DiscoveryPipeline,
  preferences: UserDiscoveryPreferences
): DiscoveryPipeline {
  // If user opts out of algorithmic ranking, use chronological
  if (!preferences.useAlgorithmicRanking) {
    return useChronologicalRanking(pipeline.candidates)
  }
  
  // Apply user weight preferences
  const weights = applyUserWeights(defaultWeights, preferences)
  
  // Apply user filter preferences
  const filtered = applyFilters(pipeline.candidates, preferences)
  
  // Re-run pipeline with user preferences
  return executeDiscoveryPipeline(filtered, weights)
}
```

**Opt-Out Rules**:
- ✅ **REQUIRED**: Users can opt out of algorithmic ranking (chronological default)
- ✅ **REQUIRED**: Users can adjust weights (preferences)
- ✅ **REQUIRED**: Users can filter results (min/max tiers, scores)
- ✅ **REQUIRED**: Proximity ranking can't be fully opted out (minimum 50% weight)
- ❌ **FORBIDDEN**: Forcing algorithmic ranking (must be opt-in)
- ❌ **FORBIDDEN**: Hidden preferences (must be visible, adjustable)

---

## Output Requirements

### Discovery Pipeline Architecture

**Pipeline Stages**:
1. Candidate Collection (gather, filter)
2. Proximity Scoring (distance, confidence)
3. Social Score Weighting (trust scores)
4. Context Adjustment (relationship, location, activity)
5. Diversity Enforcement (mix of factors)
6. Result Limiting (bounded results)

**Pipeline Execution**:
- Sequential stages (each builds on previous)
- Transparent at each stage (explanations generated)
- Bounded results (max 20, not infinite)

### Weight System Specification

**Default Weights**:
- Proximity: 80% (primary)
- Social Score: 20% (secondary)
- Context: 10% boost (friends, same room, active chat)
- Diversity: 5% reduction (mix of factors)

**Weight Adjustment**:
- User can adjust weights (preferences)
- Proximity minimum 50% (proximity-first)
- Weights normalized (sum to 1.0)

### Diversity System Specification

**Diversity Factors**:
- Proximity tier (mix of distances)
- Social score (mix of trust levels)
- Interests (mix of interests)
- Activity (mix of activity levels)

**Diversity Enforcement**:
- Small adjustments (5%, not dramatic)
- Transparent (explained to users)
- Doesn't override proximity (proximity is primary)

### Explanation System Specification

**Explanation Generation**:
- Plain language (no technical jargon)
- All factors explained (proximity, trust, context, diversity)
- Transparent (users see why)

**Explanation Examples**:
- "Very close to you (verified location) • High trust score • Your friend"
- "Nearby (approximate location) • Building trust • In the same room"

### User Control System Specification

**Opt-Out Options**:
- Opt out of algorithmic ranking (chronological default)
- Opt out of specific factors (social score, context, diversity)
- Adjust weights (preferences)
- Filter results (min/max tiers, scores)

**Influence Mechanisms**:
- User preferences affect pipeline
- Weights adjusted based on preferences
- Filters applied based on preferences

---

## Brand DNA Alignment

Every discovery decision must align with:

1. **Anti-algorithm philosophy** → User intent always wins, algorithms assist
2. **Proximity-first** → Distance always evaluated first, primary weight
3. **Transparency** → Results explained, factors visible, users can opt out
4. **No infinite feeds** → Bounded discovery, intentional exploration

---

## Success Criteria

The discovery pipeline is successful when:

- ✅ Ranking flow is code-ready (sequential stages, clear logic)
- ✅ Weights are applied correctly (proximity primary, social score secondary)
- ✅ Diversity is enforced (mix of factors, transparent)
- ✅ Results are explained in plain language (no jargon, all factors)
- ✅ Users can influence or opt out (preferences, filters, chronological)
- ✅ Distance always evaluated first (proximity-first)
- ✅ Discovery remains finite (bounded, not infinite)
- ✅ System never feels manipulative (transparent, user-controlled)

---

**CRITICAL**: This discovery pipeline must never feel manipulative. Transparency is mandatory. User agency is primary. Violating these rules breaks trust and violates Brand DNA.

