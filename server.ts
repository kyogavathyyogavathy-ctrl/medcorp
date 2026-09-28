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

  // If Gemini client is active, use gemini-3.8-flash with JSON schema
  if (ai && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = 
        "You are an expert pharmaceutical procurement assistant for MedLink, a B2B platform connecting doctors with pharmaceutical suppliers. " +
        "Extract structured procurement details from the doctor's free-text request. " +
        "Identify composition (active pharmaceutical ingredient), strength, dosage form (Tablet, Capsule, Syrup, Injection, Suspension, Inhaler), " +
        "and quantity. If not mentioned, set fields to null. Never make clinical diagnosis or medical recommendations.";

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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
      console.error('Gemini API Error:', apiError);
      // Fall through to fallback
    }
  }

  // Fallback server entity parser if Gemini key is not configured
  const q = prompt.toLowerCase();
  let quantity: number | undefined;
  const qtyMatch = q.match(/(\d+[\d,]*)\s*(units?|packs?|boxes?|vials?|strips?|bottles?|tablets?|doses?)/i) ||
                   q.match(/(need|require|order|buy|procure|want)\s*(\d+[\d,]*)/i) ||
                   q.match(/\b(\d{2,6})\b/);
  if (qtyMatch) {
    const num = parseInt((qtyMatch[1] || qtyMatch[2]).replace(/,/g, ''), 10);
    if (!isNaN(num)) quantity = num;
  }

  let strength: string | undefined;
  const strMatch = q.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)\b/i);
  if (strMatch) {
    strength = `${strMatch[1]} ${strMatch[2].toLowerCase()}`;
  }

  let dosage_form: string | undefined;
  if (/tablets?|tab\b/i.test(q)) dosage_form = 'Tablet';
  else if (/capsules?|cap\b/i.test(q)) dosage_form = 'Capsule';
  else if (/injections?|inj\b|vials?/i.test(q)) dosage_form = 'Injection';
  else if (/syrups?|suspension/i.test(q)) dosage_form = 'Suspension';
  else if (/inhalers?|aerosol/i.test(q)) dosage_form = 'Inhaler';

  let composition: string | undefined;
  if (q.includes('paracetamol')) composition = 'Paracetamol';
  else if (q.includes('amoxicillin') || q.includes('clavulanic')) composition = 'Amoxicillin + Clavulanic Acid';
  else if (q.includes('azithromycin')) composition = 'Azithromycin';
  else if (q.includes('atorvastatin')) composition = 'Atorvastatin';
  else if (q.includes('metformin')) composition = 'Metformin HCl';
  else if (q.includes('pantoprazole')) composition = 'Pantoprazole';
  else if (q.includes('salbutamol')) composition = 'Salbutamol';
  else if (q.includes('paclitaxel')) composition = 'Paclitaxel';

  const tags: string[] = [];
  if (composition) tags.push(`Composition: ${composition}`);
  if (strength) tags.push(`Strength: ${strength}`);
  if (dosage_form) tags.push(`Form: ${dosage_form}`);
  if (quantity) tags.push(`Qty: ${quantity}`);

  res.json({
    success: true,
    message: 'Processed via server parser',
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
