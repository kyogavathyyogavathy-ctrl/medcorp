import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize server-side Gemini client per skill instructions
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// AI Endpoint: Parse natural language medicine queries
app.post('/api/ai/parse-search', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // If Gemini client is active, use gemini-3.1-flash-lite with schema, and fallback to flash-latest if needed
  if (ai && process.env.GEMINI_API_KEY) {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
    for (const modelName of candidateModels) {
      try {
        const systemInstruction = 
          "You are an expert pharmaceutical procurement assistant for MedLink, a B2B platform connecting doctors with pharmaceutical suppliers. " +
          "Extract structured procurement details from the doctor's free-text request. " +
          "Identify composition (active pharmaceutical ingredient), strength, dosage form (Tablet, Capsule, Syrup, Injection, Suspension, Inhaler), " +
          "and quantity. If not mentioned, set fields to null. Never make clinical diagnosis or medical recommendations.";

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Doctor natural search query: "${prompt}". Extract composition, strength, dosage_form, quantity, and category.`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                composition: { type: Type.STRING, description: 'Active pharmaceutical ingredient or chemical generic name' },
                strength: { type: Type.STRING, description: 'Concentration or strength with units, e.g. 500 mg, 625 mg' },
                dosage_form: { type: Type.STRING, description: 'Formulation form: Tablet, Capsule, Syrup, Injection, Suspension, Inhaler' },
                quantity: { type: Type.INTEGER, description: 'Required quantity or unit count' },
                category: { type: Type.STRING, description: 'Therapeutic pharmaceutical category' },
                summary: { type: Type.STRING, description: 'Short scannable entity summary' },
              },
            },
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const tags: string[] = [];
          if (parsed.composition) tags.push(`Composition: ${parsed.composition}`);
          if (parsed.strength) tags.push(`Strength: ${parsed.strength}`);
          if (parsed.dosage_form) tags.push(`Form: ${parsed.dosage_form}`);
          if (parsed.quantity) tags.push(`Qty: ${parsed.quantity}`);

          return res.json({
            success: true,
            model_used: modelName,
            extracted: {
              composition: parsed.composition || undefined,
              strength: parsed.strength || undefined,
              dosage_form: parsed.dosage_form || undefined,
              quantity: parsed.quantity || undefined,
              category: parsed.category || undefined,
              raw_query: prompt,
              confidence: 0.95,
              extracted_tags: tags,
            },
          });
        }
      } catch (apiError) {
        console.warn(`Model ${modelName} failed or quota reached:`, (apiError as any)?.message || apiError);
        // Continue to next model or fallback
      }
    }
  }

  // Resilient fallback clinical NLP parser if Gemini quota is reached or key not present
  const q = prompt.toLowerCase();
  let quantity: number | undefined;
  const qtyMatch = q.match(/(\d+[\d,]*)\s*(units?|packs?|boxes?|vials?|strips?|bottles?|tablets?|doses?)/i) ||
                   q.match(/(need|require|order|buy|procure|want)\s*(\d+[\d,]*)/i) ||
                   q.match(/\b(\d{2,6})\b/);
  if (qtyMatch) {
    const num = parseInt((qtyMatch[1] || qtyMatch[2]).replace(/,/g, ''), 10);
    if (!isNaN(num) && num > 0) quantity = num;
  }

  let strength: string | undefined;
  const strMatch = q.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)\b/i);
  if (strMatch) {
    strength = `${strMatch[1]} ${strMatch[2].toLowerCase()}`;
  }

  let dosage_form: string | undefined;
  if (/tablets?|tab\b/i.test(q)) dosage_form = 'Tablet';
  else if (/capsules?|cap\b/i.test(q)) dosage_form = 'Capsule';
  else if (/injections?|inj\b|vials?|infusion|ampoule/i.test(q)) dosage_form = 'Injection';
  else if (/syrups?|suspension/i.test(q)) dosage_form = 'Suspension';
  else if (/inhalers?|aerosol|respules?/i.test(q)) dosage_form = 'Inhaler';
  else if (/drops?/i.test(q)) dosage_form = 'Drops';
  else if (/ointments?|cream/i.test(q)) dosage_form = 'Ointment';

  let composition: string | undefined;
  const brandAndCompMap = [
    { keys: ['paracetamol', 'dolo', 'crocin', 'calpol', 'panadol', 'pacimol'], label: 'Paracetamol' },
    { keys: ['amoxicillin', 'augmentin', 'clavam', 'moxikind-cv', 'amoxyclav'], label: 'Amoxicillin + Clavulanic Acid' },
    { keys: ['azithromycin', 'azee', 'azithral', 'zithromax', 'azicip'], label: 'Azithromycin' },
    { keys: ['atorvastatin', 'lipitor', 'atorva'], label: 'Atorvastatin' },
    { keys: ['rosuvastatin', 'crestor', 'rosuvas'], label: 'Rosuvastatin' },
    { keys: ['telmisartan', 'telma', 'micardis'], label: 'Telmisartan' },
    { keys: ['metformin', 'glucophage', 'glycomet'], label: 'Metformin HCl' },
    { keys: ['pantoprazole', 'pan 40', 'pantocid', 'pantop'], label: 'Pantoprazole' },
    { keys: ['salbutamol', 'asthalin', 'ventolin'], label: 'Salbutamol' },
    { keys: ['budesonide', 'budecort', 'pulmicort'], label: 'Budesonide' },
    { keys: ['ceftriaxone', 'monocef', 'rocephin'], label: 'Ceftriaxone Sodium' },
    { keys: ['meropenem', 'meronem', 'merocrit'], label: 'Meropenem' },
    { keys: ['enoxaparin', 'clexane', 'lonopin'], label: 'Enoxaparin Sodium' },
    { keys: ['insulin glargine', 'lantus', 'basalog', 'insulin'], label: 'Insulin Glargine' },
    { keys: ['noradrenaline', 'norepinephrine', 'norad'], label: 'Norepinephrine (Noradrenaline)' },
    { keys: ['adrenaline', 'epinephrine'], label: 'Adrenaline (Epinephrine)' },
    { keys: ['furosemide', 'lasix'], label: 'Furosemide' },
    { keys: ['ondansetron', 'emset', 'zofran'], label: 'Ondansetron' },
    { keys: ['mupirocin', 't-bact', 'bactroban'], label: 'Mupirocin' },
  ];

  for (const item of brandAndCompMap) {
    if (item.keys.some(k => q.includes(k))) {
      composition = item.label;
      break;
    }
  }

  if (!strength) {
    if (q.includes('650')) strength = '650 mg';
    else if (q.includes('625')) strength = '625 mg';
    else if (q.includes('500')) strength = '500 mg';
    else if (q.includes('1000') || q.includes('1g')) strength = '1000 mg';
    else if (q.includes('40')) strength = '40 mg';
    else if (q.includes('20')) strength = '20 mg';
  }

  const tags: string[] = [];
  if (composition) tags.push(`Composition: ${composition}`);
  if (strength) tags.push(`Strength: ${strength}`);
  if (dosage_form) tags.push(`Form: ${dosage_form}`);
  if (quantity) tags.push(`Qty: ${quantity}`);

  res.json({
    success: true,
    message: 'Processed via resilient clinical entity parser',
    extracted: {
      composition,
      strength,
      dosage_form,
      quantity,
      raw_query: prompt,
      confidence: 0.9,
      extracted_tags: tags,
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`MedLink server running on http://localhost:${PORT}`);
  });
}

startServer();
