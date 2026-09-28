import { Medicine } from '../types';

export interface SearchMatch {
  medicine: Medicine;
  score: number;
  matchReason: string;
  matchedField: string;
  matchedKeyword: string;
  isExact: boolean;
}

export interface SearchResult {
  exactMatches: Medicine[];
  recommendedMatches: Medicine[];
  allMatches: Medicine[];
  didYouMean?: string;
  queryTokens: string[];
  totalResults: number;
}

// Normalized Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

// Common medical stopwords to ignore when tokenizing
const STOP_WORDS = new Set([
  'for', 'and', 'or', 'the', 'in', 'at', 'to', 'of', 'with', 'from', 'by', 
  'need', 'want', 'require', 'urgently', 'urgent', 'hospital', 'supply', 
  'supplier', 'order', 'procure', 'purchase', 'please', 'give', 'quote', 'quotation'
]);

// Medical common typo and phonetic mapping dictionary
const PHONETIC_SYNONYMS: Record<string, string[]> = {
  paracetamol: ['paracetemol', 'paracitamol', 'paracip', 'pcm', 'crocin', 'dolo', 'calpol', 'panadol', 'tylenol', 'pacimol'],
  dolo: ['paracetamol', 'dolo 650', 'dolo650', 'dollo', 'p-650', 'crocin 650', 'calpol 650'],
  crocin: ['paracetamol', 'crocin advance', 'calpol', 'dolo'],
  augmentin: ['amoxicillin', 'clavulanate', 'amoxyclav', 'augumentin', 'augmenten', 'amoxiclav', 'moxikind-cv'],
  azithromycin: ['azithral', 'azithromicin', 'azithro', 'zithromax', 'azimax', 'aziwok'],
  pantoprazole: ['pantop', 'pantocid', 'pantaprazole', 'pan 40', 'pan-d', 'pan d', 'panta', 'protonix'],
  ceftriaxone: ['ceftriaxon', 'monocef', 'rocephin', 'ceftri', 'ceftraxone'],
  meropenem: ['meronem', 'merocrit', 'meropenam', 'merop', 'meropenum'],
  metformin: ['glucophage', 'glycomet', 'metformn', 'metfor', 'metformin hydrochloride'],
  telmisartan: ['telma', 'micardis', 'telmikind', 'telmi', 'telmep'],
  atorvastatin: ['lipitor', 'atorva', 'atorvastin', 'atorlip', 'ator'],
  ondansetron: ['zofran', 'emeset', 'ondem', 'vomikind', 'ondensetron'],
  insulin: ['lantus', 'humalog', 'actrapid', 'novorapid', 'basalog', 'mixtard', 'glargine'],
  enoxaparin: ['clexane', 'lovenox', 'lonopin', 'low molecular weight heparin', 'lmwh'],
  amoxicillin: ['amox', 'amoxyl', 'mox', 'novamox'],
  salbutamol: ['albuterol', 'asthalin', 'ventolin', 'duolin'],
  ciprofloxacin: ['cipro', 'ciplox', 'ciprobid', 'cifran'],
  diclofenac: ['voveran', 'dynapar', 'voltaren', 'diclophenac'],
  fever: ['paracetamol', 'dolo', 'crocin', 'calpol', 'pyrexia', 'antipyretic', 'dengue fever'],
  pain: ['analgesic', 'tramadol', 'diclofenac', 'ibuprofen', 'paracetamol', 'body ache'],
  antibiotic: ['amoxicillin', 'azithromycin', 'ceftriaxone', 'meropenem', 'ciprofloxacin', 'piperacillin', 'moxifloxacin', 'doxycycline'],
  hypertension: ['telmisartan', 'amlodipine', 'losartan', 'bp', 'blood pressure', 'atenolol'],
  diabetes: ['metformin', 'insulin', 'glimepiride', 'dapagliflozin', 'teneligliptin', 'sugar'],
  acidity: ['pantoprazole', 'omeprazole', 'esomeprazole', 'rabeprazole', 'ranitidine', 'gerd'],
  asthma: ['salbutamol', 'budesonide', 'duolin', 'asthalin', 'inhaler', 'respules'],
  vomiting: ['ondansetron', 'domperidone', 'emeset', 'ondem', 'nausea'],
  cardiac: ['atorvastatin', 'clopidogrel', 'aspirin', 'nitroglycerin', 'amiodarone', 'heparin'],
  icu: ['noradrenaline', 'adrenaline', 'meropenem', 'piperacillin', 'albumin', 'mannitol', 'furosemide'],
};

/**
 * Searches medicine collection with high-confidence scoring,
 * fuzzy typo-tolerance, brand aliases, composition, and therapeutic indication matching.
 * This search NEVER LOSES — it always yields winning, relevant results.
 */
export function searchMedicines(
  medicines: Medicine[],
  rawQuery: string,
  options?: {
    companyId?: string;
    category?: string;
    dosageForm?: string;
    availability?: string;
    maxPrice?: number;
    verifiedOnly?: boolean;
    location?: string;
  }
): SearchResult {
  const query = rawQuery.trim().toLowerCase();

  // Filter basic status first
  let pool = medicines.filter(m => m.status === 'published');

  // Apply optional strict filters if provided
  if (options) {
    if (options.companyId && options.companyId !== 'All') {
      pool = pool.filter(m => m.company_id === options.companyId);
    }
    if (options.category && options.category !== 'All') {
      pool = pool.filter(m => m.category === options.category);
    }
    if (options.dosageForm && options.dosageForm !== 'All') {
      pool = pool.filter(m => m.dosage_form === options.dosageForm);
    }
    if (options.availability && options.availability !== 'All') {
      pool = pool.filter(m => m.availability === options.availability);
    }
    if (options.verifiedOnly) {
      pool = pool.filter(m => m.is_verified_supplier);
    }
    if (options.maxPrice && options.maxPrice > 0) {
      pool = pool.filter(m => m.listed_price <= options.maxPrice!);
    }
    if (options.location && options.location !== 'All') {
      pool = pool.filter(m => m.supplier_location.toLowerCase().includes(options.location!.toLowerCase()));
    }
  }

  // If no search query, return sorted pool by verification and availability
  if (!query) {
    const sorted = [...pool].sort((a, b) => {
      if (a.is_verified_supplier !== b.is_verified_supplier) {
        return a.is_verified_supplier ? -1 : 1;
      }
      if (a.availability === 'in_stock' && b.availability !== 'in_stock') return -1;
      if (b.availability === 'in_stock' && a.availability !== 'in_stock') return 1;
      return a.medicine_name.localeCompare(b.medicine_name);
    });

    return {
      exactMatches: sorted,
      recommendedMatches: [],
      allMatches: sorted,
      queryTokens: [],
      totalResults: sorted.length,
    };
  }

  // Break query into non-stopword tokens
  const rawTokens = query.split(/[\s,+/_-]+/).filter(t => t.length > 0);
  const cleanTokens = rawTokens.filter(t => !STOP_WORDS.has(t));
  const tokens = cleanTokens.length > 0 ? cleanTokens : rawTokens;

  // Check if query matches any synonym dictionary key
  const expandedQueryKeywords = new Set<string>(tokens);
  for (const token of tokens) {
    for (const [key, synonyms] of Object.entries(PHONETIC_SYNONYMS)) {
      if (token === key || synonyms.includes(token) || (token.length >= 4 && key.includes(token))) {
        expandedQueryKeywords.add(key);
        synonyms.forEach(s => expandedQueryKeywords.add(s.toLowerCase()));
      }
    }
  }

  const matches: SearchMatch[] = [];

  for (const med of pool) {
    let score = 0;
    let matchReason = '';
    let matchedField = '';
    let matchedKeyword = '';
    let isExact = false;

    const medName = med.medicine_name.toLowerCase();
    const genericName = med.generic_name.toLowerCase();
    const comp = med.composition.toLowerCase();
    const strength = med.strength.toLowerCase();
    const category = med.category.toLowerCase();
    const form = med.dosage_form.toLowerCase();
    const company = med.company_name.toLowerCase();
    const desc = (med.description || '').toLowerCase();
    const aliases = (med.brand_aliases || []).map(a => a.toLowerCase());
    const tags = (med.therapeutic_tags || []).map(t => t.toLowerCase());

    // 1. Full Query Exact / Substring Matching
    if (medName === query || genericName === query || comp === query) {
      score += 150;
      isExact = true;
      matchedField = 'Full Title';
      matchedKeyword = query;
      matchReason = 'Exact match on medicine title or formulation';
    } else if (aliases.includes(query)) {
      score += 140;
      isExact = true;
      matchedField = 'Brand Alias';
      matchedKeyword = query;
      matchReason = `Direct match for brand alias "${query}"`;
    } else if (medName.includes(query) || genericName.includes(query) || comp.includes(query)) {
      score += 110;
      matchedField = 'Medicine / Composition';
      matchedKeyword = query;
      matchReason = `Contains full search phrase "${query}"`;
    } else if (aliases.some(a => a.includes(query) || query.includes(a))) {
      score += 105;
      matchedField = 'Brand Alias';
      const alias = aliases.find(a => a.includes(query) || query.includes(a));
      matchedKeyword = alias || query;
      matchReason = `Matched brand name "${alias}"`;
    }

    // 2. Tokenized & Partial Prefix Matching
    let tokenHitCount = 0;
    for (const token of tokens) {
      let hit = false;

      // Medicine title or Generic Name
      if (medName.includes(token)) {
        score += 35;
        hit = true;
        matchedKeyword = token;
      } else if (genericName.includes(token)) {
        score += 35;
        hit = true;
        matchedKeyword = token;
      }

      // Active Composition
      if (comp.includes(token)) {
        score += 40;
        hit = true;
        matchedKeyword = token;
      }

      // Strength (e.g. 500, 650, 40, 100, 1g)
      if (strength.replace(/\s+/g, '').includes(token.replace(/\s+/g, ''))) {
        score += 30;
        hit = true;
      }

      // Brand Aliases
      if (aliases.some(a => a.includes(token) || token.includes(a))) {
        score += 35;
        hit = true;
        matchedKeyword = token;
      }

      // Therapeutic Tags / Indications
      if (tags.some(t => t.includes(token) || token.includes(t))) {
        score += 25;
        hit = true;
      }

      // Dosage Form
      if (form.includes(token)) {
        score += 20;
        hit = true;
      }

      // Category
      if (category.includes(token)) {
        score += 20;
        hit = true;
      }

      // Company Name
      if (company.includes(token)) {
        score += 15;
        hit = true;
      }

      // Description
      if (desc.includes(token)) {
        score += 10;
        hit = true;
      }

      if (hit) tokenHitCount++;
    }

    // Bonus for matching all or most query tokens
    if (tokens.length > 1 && tokenHitCount === tokens.length) {
      score += 50;
      if (!matchReason) matchReason = `Matched all ${tokens.length} search tokens`;
    } else if (tokenHitCount > 0 && !matchReason) {
      matchReason = `Matched ${tokenHitCount} search keywords`;
    }

    // 3. Synonym / Therapeutic Mapping bonus
    for (const kw of expandedQueryKeywords) {
      if (
        comp.includes(kw) || 
        genericName.includes(kw) || 
        aliases.some(a => a.includes(kw)) ||
        tags.some(t => t.includes(kw))
      ) {
        score += 30;
        if (!matchReason) {
          matchReason = `Related therapeutic match for "${kw}"`;
        }
      }
    }

    // 4. Fuzzy & Typo Tolerance (Levenshtein)
    if (score === 0) {
      for (const token of tokens) {
        if (token.length >= 4) {
          // Check against composition words
          const compWords = comp.split(/\s+/);
          for (const cw of compWords) {
            if (cw.length >= 4 && Math.abs(cw.length - token.length) <= 2) {
              const dist = levenshteinDistance(token, cw);
              if (dist <= 2) {
                score += 50 - (dist * 15);
                matchReason = `Fuzzy match on composition "${cw}"`;
                matchedField = 'Composition (Fuzzy)';
                matchedKeyword = cw;
                break;
              }
            }
          }

          // Check against brand aliases
          for (const alias of aliases) {
            const aliasWords = alias.split(/\s+/);
            for (const aw of aliasWords) {
              if (aw.length >= 4 && Math.abs(aw.length - token.length) <= 2) {
                const dist = levenshteinDistance(token, aw);
                if (dist <= 2) {
                  score += 45 - (dist * 15);
                  matchReason = `Fuzzy match on brand "${alias}"`;
                  matchedField = 'Brand (Fuzzy)';
                  matchedKeyword = alias;
                  break;
                }
              }
            }
          }
        }
      }
    }

    // 5. Commercial & Verification quality boosts
    if (score > 0) {
      if (med.is_verified_supplier) score += 10;
      if (med.availability === 'in_stock') score += 10;
      else if (med.availability === 'limited_stock') score += 5;

      matches.push({
        medicine: med,
        score,
        matchReason: matchReason || 'Matched search parameters',
        matchedField: matchedField || 'General Search',
        matchedKeyword: matchedKeyword || query,
        isExact,
      });
    }
  }

  // Sort matches descending by score
  matches.sort((a, b) => b.score - a.score);

  // If matches were found, partition into exact and recommended
  if (matches.length > 0) {
    const exactMatches = matches.filter(m => m.score >= 80).map(m => m.medicine);
    const recommendedMatches = matches.filter(m => m.score < 80).map(m => m.medicine);

    return {
      exactMatches,
      recommendedMatches,
      allMatches: matches.map(m => m.medicine),
      queryTokens: tokens,
      totalResults: matches.length,
    };
  }

  // GUARANTEED WIN FALLBACK:
  // If zero matches, return top verified, high-stock hospital medicines
  // so the user is NEVER left staring at an empty or dead-end screen!
  const fallbackMeds = [...pool]
    .filter(m => m.is_verified_supplier)
    .sort((a, b) => {
      if (a.availability === 'in_stock' && b.availability !== 'in_stock') return -1;
      return 0;
    })
    .slice(0, 8);

  return {
    exactMatches: [],
    recommendedMatches: fallbackMeds,
    allMatches: fallbackMeds,
    didYouMean: getBestDidYouMeanSuggestion(query),
    queryTokens: tokens,
    totalResults: 0,
  };
}

/**
 * Returns a smart "Did you mean?" suggestion if a query had typos
 */
export function getBestDidYouMeanSuggestion(query: string): string | undefined {
  const q = query.toLowerCase().trim();
  const knownTerms = [
    'Paracetamol 650mg (Dolo)',
    'Augmentin 625mg (Amoxicillin + Clavulanate)',
    'Azithromycin 500mg',
    'Pantoprazole 40mg',
    'Ceftriaxone 1g Injection',
    'Meropenem 1g IV',
    'Metformin 500mg',
    'Telmisartan 40mg',
    'Atorvastatin 20mg',
    'Enoxaparin 40mg (Clexane)',
    'Ondansetron 4mg',
    'Insulin Glargine',
    'Piperacillin + Tazobactam',
    'Noradrenaline 4mg Injection',
    'Diclofenac Sodium 50mg'
  ];

  let bestSuggestion: string | undefined;
  let lowestDist = 999;

  for (const term of knownTerms) {
    const mainWord = term.split(/[\s(]/)[0].toLowerCase();
    const dist = levenshteinDistance(q, mainWord);
    if (dist <= 3 && dist < lowestDist) {
      lowestDist = dist;
      bestSuggestion = term;
    }
  }

  return bestSuggestion;
}
