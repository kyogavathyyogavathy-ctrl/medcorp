import { Medicine, AIParsedMedicineQuery, PharmaCompany } from '../types';

export interface SupplierMatchResult {
  medicine: Medicine;
  pharma: PharmaCompany | undefined;
  overall_score: number; // 0-100
  criteria_scores: {
    availability_score: number; // Stock status & quantity
    pricing_score: number;      // Price competitiveness
    verification_score: number; // Admin verified badge & compliance
    lead_time_score: number;    // Location proximity & logistics
    reliability_score: number;  // Historical order completion & rating
  };
  highlights: string[];
  caveats: string[];
}

// Client-side rule-based NLP fallback if server or Gemini is unreachable
export function fallbackRuleBasedParse(query: string): AIParsedMedicineQuery {
  const q = query.toLowerCase();
  
  // Extract Quantity (e.g., 500 units, 1000 boxes, 200 vials, 50 strips)
  let quantity: number | undefined;
  const qtyMatch = q.match(/(\d+[\d,]*)\s*(units?|packs?|boxes?|vials?|strips?|bottles?|tablets?|doses?)/i) ||
                   q.match(/(need|require|order|buy|procure|want)\s*(\d+[\d,]*)/i) ||
                   q.match(/\b(\d{2,6})\b/);
  if (qtyMatch) {
    const numStr = (qtyMatch[1] || qtyMatch[2]).replace(/,/g, '');
    const parsed = parseInt(numStr, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
      quantity = parsed;
    }
  }

  // Extract Strength (e.g., 500 mg, 650mg, 625 mg, 1000 mg, 100mcg, 1g)
  let strength: string | undefined;
  const strengthMatch = q.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)\b/i);
  if (strengthMatch) {
    strength = `${strengthMatch[1]} ${strengthMatch[2].toLowerCase()}`;
  }

  // Extract Dosage Form (Tablet, Capsule, Syrup, Injection, Inhaler, Suspension, Drops, Ointment)
  let dosage_form: string | undefined;
  if (/tablets?|tab\b/i.test(q)) dosage_form = 'Tablet';
  else if (/capsules?|cap\b/i.test(q)) dosage_form = 'Capsule';
  else if (/injections?|inj\b|vials?|infusion|ampoule/i.test(q)) dosage_form = 'Injection';
  else if (/syrups?|suspension/i.test(q)) dosage_form = 'Suspension';
  else if (/inhalers?|aerosol|rotacap/i.test(q)) dosage_form = 'Inhaler';
  else if (/drops?|eye drop/i.test(q)) dosage_form = 'Drops';
  else if (/ointments?|cream|gel/i.test(q)) dosage_form = 'Ointment';

  // Common Compositions & Brand Aliases
  let composition: string | undefined;
  const brandAndCompMap = [
    { keys: ['paracetamol', 'dolo', 'crocin', 'calpol', 'panadol', 'tylenol', 'pacimol'], label: 'Paracetamol' },
    { keys: ['amoxicillin', 'augmentin', 'clavam', 'moxikind-cv', 'clavulanic', 'amoxyclav'], label: 'Amoxicillin + Clavulanic Acid' },
    { keys: ['azithromycin', 'azee', 'azithral', 'zithromax', 'azicip'], label: 'Azithromycin' },
    { keys: ['atorvastatin', 'lipitor', 'atorva', 'atorlip', 'storvas'], label: 'Atorvastatin' },
    { keys: ['rosuvastatin', 'crestor', 'rosuvas', 'rozavel'], label: 'Rosuvastatin' },
    { keys: ['telmisartan', 'telma', 'micardis', 'telsar'], label: 'Telmisartan' },
    { keys: ['amlodipine', 'norvasc', 'amlong', 'amlopres'], label: 'Amlodipine' },
    { keys: ['clopidogrel', 'plavix', 'clopilet', 'deplatt'], label: 'Clopidogrel' },
    { keys: ['aspirin', 'ecosprin', 'disprin'], label: 'Aspirin' },
    { keys: ['enoxaparin', 'clexane', 'lovenox', 'lonopin'], label: 'Enoxaparin Sodium' },
    { keys: ['metoprolol', 'betaloc', 'toprol', 'metolar'], label: 'Metoprolol Succinate' },
    { keys: ['metformin', 'glucophage', 'glycomet', 'obimet'], label: 'Metformin HCl' },
    { keys: ['glimepiride', 'amaryl', 'glimestar', 'zoryl'], label: 'Glimepiride' },
    { keys: ['dapagliflozin', 'forxiga', 'oxra'], label: 'Dapagliflozin' },
    { keys: ['insulin glargine', 'lantus', 'basalog', 'glaritus', 'insulin'], label: 'Insulin Glargine' },
    { keys: ['levothyroxine', 'thyronorm', 'eltroxin', 'synthroid', 'thyroid'], label: 'Levothyroxine Sodium' },
    { keys: ['pantoprazole', 'pan 40', 'pantocid', 'pantop', 'protonix', 'pan-d', 'pan d'], label: 'Pantoprazole' },
    { keys: ['omeprazole', 'omez', 'prilosec'], label: 'Omeprazole' },
    { keys: ['ondansetron', 'emset', 'zofran', 'ondem'], label: 'Ondansetron' },
    { keys: ['salbutamol', 'asthalin', 'ventolin', 'salbair'], label: 'Salbutamol' },
    { keys: ['budesonide', 'budecort', 'pulmicort'], label: 'Budesonide' },
    { keys: ['montelukast', 'montair-lc', 'montair lc', 'montek-lc'], label: 'Montelukast + Levocetirizine' },
    { keys: ['cetirizine', 'cetzine', 'zyrtec', 'okacet'], label: 'Cetirizine' },
    { keys: ['fexofenadine', 'allegra', 'fexova'], label: 'Fexofenadine' },
    { keys: ['paclitaxel', 'taxol', 'paclicad'], label: 'Paclitaxel' },
    { keys: ['trastuzumab', 'herceptin', 'vivitra'], label: 'Trastuzumab' },
    { keys: ['carboplatin', 'paraplatin'], label: 'Carboplatin' },
    { keys: ['pembrolizumab', 'keytruda'], label: 'Pembrolizumab' },
    { keys: ['rituximab', 'mabthera', 'rituxan'], label: 'Rituximab' },
    { keys: ['gabapentin', 'neurontin', 'gabapin'], label: 'Gabapentin' },
    { keys: ['pregabalin', 'lyrica', 'pregalin'], label: 'Pregabalin' },
    { keys: ['escitalopram', 'lexapro', 'nexito', 'cipralex'], label: 'Escitalopram' },
    { keys: ['sertraline', 'zoloft', 'daxid'], label: 'Sertraline' },
    { keys: ['levetiracetam', 'keppra', 'levera'], label: 'Levetiracetam' },
    { keys: ['dexamethasone', 'decadron', 'dexona'], label: 'Dexamethasone' },
    { keys: ['hydrocortisone', 'solu-cortef', 'primacort'], label: 'Hydrocortisone' },
    { keys: ['methylprednisolone', 'solu-medrol'], label: 'Methylprednisolone' },
    { keys: ['norepinephrine', 'noradrenaline', 'levophed'], label: 'Norepinephrine (Noradrenaline)' },
    { keys: ['furosemide', 'lasix'], label: 'Furosemide' },
    { keys: ['tranexamic', 'pause 500', 'cyklokapron'], label: 'Tranexamic Acid' },
    { keys: ['fluconazole', 'diflucan', 'forcan'], label: 'Fluconazole' },
    { keys: ['itraconazole', 'sporanox', 'canditral', 'candiforce'], label: 'Itraconazole' },
    { keys: ['amphotericin', 'ambisome', 'phosome'], label: 'Liposomal Amphotericin B' },
    { keys: ['tamsulosin', 'flomax', 'urimax'], label: 'Tamsulosin HCl' },
    { keys: ['erythropoietin', 'epo', 'epogen'], label: 'Erythropoietin (EPO)' },
    { keys: ['moxifloxacin', 'vigamox'], label: 'Moxifloxacin' },
    { keys: ['mupirocin', 'bactroban', 't-bact'], label: 'Mupirocin' },
    { keys: ['ibuprofen', 'brufen', 'advil'], label: 'Ibuprofen' },
    { keys: ['diclofenac', 'voveran', 'voltaren'], label: 'Diclofenac Sodium' },
    { keys: ['aceclofenac', 'zerodol', 'zerodol-p'], label: 'Aceclofenac + Paracetamol' },
    { keys: ['tramadol', 'tramal', 'ultram'], label: 'Tramadol HCl' },
    { keys: ['ceftriaxone', 'monocef', 'rocephin'], label: 'Ceftriaxone Sodium' },
    { keys: ['ciprofloxacin', 'ciplox', 'cifran'], label: 'Ciprofloxacin' },
    { keys: ['levofloxacin', 'levaquin', 'levomac'], label: 'Levofloxacin' },
    { keys: ['meropenem', 'meronem', 'merocrit'], label: 'Meropenem' },
    { keys: ['doxycycline', 'dox-sl', 'vibramycin'], label: 'Doxycycline' },
    { keys: ['metronidazole', 'flagyl', 'metrogyl'], label: 'Metronidazole' },
    { keys: ['piperacillin', 'tazobactam', 'pipzo', 'zosyn'], label: 'Piperacillin + Tazobactam' },
  ];

  for (const item of brandAndCompMap) {
    if (item.keys.some(k => q.includes(k))) {
      composition = item.label;
      break;
    }
  }

  // Auto-detect strength if Dolo 650 or Augmentin 625 was queried
  if (!strength) {
    if (q.includes('650')) strength = '650 mg';
    else if (q.includes('625')) strength = '625 mg';
    else if (q.includes('500')) strength = '500 mg';
    else if (q.includes('1000') || q.includes('1g')) strength = '1000 mg';
    else if (q.includes('40')) strength = '40 mg';
    else if (q.includes('20')) strength = '20 mg';
    else if (q.includes('10')) strength = '10 mg';
    else if (q.includes('5')) strength = '5 mg';
  }

  const extractedTags: string[] = [];
  if (composition) extractedTags.push(`Composition: ${composition}`);
  if (strength) extractedTags.push(`Strength: ${strength}`);
  if (dosage_form) extractedTags.push(`Form: ${dosage_form}`);
  if (quantity) extractedTags.push(`Qty: ${quantity.toLocaleString()}`);

  return {
    composition,
    strength,
    dosage_form,
    quantity,
    raw_query: query,
    confidence: (composition ? 0.4 : 0) + (strength ? 0.3 : 0) + (dosage_form ? 0.2 : 0) + (quantity ? 0.1 : 0),
    extracted_tags: extractedTags,
  };
}

export const AIService = {
  // Parse natural language medicine search query
  parseMedicineQuery: async (prompt: string): Promise<AIParsedMedicineQuery> => {
    try {
      const response = await fetch('/api/ai/parse-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.extracted) {
          return data.extracted;
        }
      }
    } catch {
      // Graceful fallback to client-side pattern extraction
    }

    return fallbackRuleBasedParse(prompt);
  },

  // Duplicate / Similar Medicine Detection
  // Groups medicines sharing the same active composition and strength for direct B2B comparison
  groupSimilarMedicines: (medicines: Medicine[]): Record<string, Medicine[]> => {
    const groups: Record<string, Medicine[]> = {};
    
    medicines.forEach(med => {
      // Normalize key: e.g. "paracetamol-500 mg"
      const compKey = (med.composition || med.generic_name || med.medicine_name)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const strKey = (med.strength || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const groupKey = `${compKey}_${strKey}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(med);
    });

    return groups;
  },

  // Smart Supplier Matching & Transparent Criteria Ranking
  rankSuppliersForMedicine: (
    medicineList: Medicine[],
    pharmaCompanies: PharmaCompany[],
    preferredLocation?: string,
    requestedQuantity: number = 100
  ): SupplierMatchResult[] => {
    // Find min and max price for normalization
    const validPrices = medicineList.map(m => m.listed_price).filter(p => p > 0);
    const minPrice = validPrices.length ? Math.min(...validPrices) : 100;
    const maxPrice = validPrices.length ? Math.max(...validPrices) : 100;
    const priceRange = maxPrice > minPrice ? (maxPrice - minPrice) : 1;

    const results: SupplierMatchResult[] = medicineList.map(med => {
      const pharma = pharmaCompanies.find(p => p.id === med.company_id);

      // 1. Availability Score (25%)
      let availabilityScore = 50;
      if (med.availability === 'in_stock') {
        availabilityScore = med.stock_quantity >= requestedQuantity ? 100 : 80;
      } else if (med.availability === 'limited_stock') {
        availabilityScore = 55;
      } else {
        availabilityScore = 15;
      }

      // 2. Pricing Competitiveness Score (25%)
      // Lower listed price gives higher score
      const priceDiff = maxPrice - med.listed_price;
      const pricingScore = Math.round(60 + (priceDiff / priceRange) * 40);

      // 3. Verification & Compliance Score (20%)
      let verificationScore = 40;
      if (med.is_verified_supplier && pharma?.verification_status === 'verified') {
        verificationScore = 100;
      } else if (pharma?.verification_status === 'verified') {
        verificationScore = 85;
      } else {
        verificationScore = 40;
      }

      // 4. Lead Time & Location Proximity (15%)
      let leadTimeScore = 70;
      if (preferredLocation && med.supplier_location.toLowerCase().includes(preferredLocation.toLowerCase())) {
        leadTimeScore = 95;
      } else {
        leadTimeScore = 75;
      }

      // 5. Reliability & Fulfillment History (15%)
      const completedOrders = pharma?.total_orders_completed || 0;
      const rating = pharma?.rating || 4.0;
      const reliabilityScore = Math.min(100, Math.round((rating / 5) * 60 + Math.min(40, completedOrders / 4)));

      // Overall transparent weighted composite
      const overallScore = Math.round(
        availabilityScore * 0.25 +
        pricingScore * 0.25 +
        verificationScore * 0.20 +
        leadTimeScore * 0.15 +
        reliabilityScore * 0.15
      );

      const highlights: string[] = [];
      const caveats: string[] = [];

      if (med.is_verified_supplier) {
        highlights.push('Admin-verified pharmaceutical manufacturer');
      }
      if (med.availability === 'in_stock' && med.stock_quantity >= requestedQuantity) {
        highlights.push(`Immediate dispatch available (${med.stock_quantity.toLocaleString()} units in stock)`);
      }
      if (med.listed_price <= minPrice * 1.05) {
        highlights.push(`Highly competitive listed price (₹${med.listed_price})`);
      }
      if (pharma?.total_orders_completed && pharma.total_orders_completed > 100) {
        highlights.push(`High institutional track record (${pharma.total_orders_completed}+ completed orders)`);
      }

      if (!med.is_verified_supplier) {
        caveats.push('Supplier credentials pending final verification');
      }
      if (med.availability === 'limited_stock') {
        caveats.push('Limited stock: quotation confirmation advised');
      } else if (med.availability === 'out_of_stock') {
        caveats.push('Currently out of warehouse stock');
      }
      if (requestedQuantity < med.moq) {
        caveats.push(`Requested quantity below listed Minimum Order Quantity (${med.moq})`);
      }

      return {
        medicine: med,
        pharma,
        overall_score: overallScore,
        criteria_scores: {
          availability_score: availabilityScore,
          pricing_score: pricingScore,
          verification_score: verificationScore,
          lead_time_score: leadTimeScore,
          reliability_score: reliabilityScore,
        },
        highlights,
        caveats,
      };
    });

    // Sort descending by transparent overall score
    return results.sort((a, b) => b.overall_score - a.overall_score);
  },
};
