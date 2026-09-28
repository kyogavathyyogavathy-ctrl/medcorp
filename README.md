# MedLink — B2B Digital Platform Connecting Doctors & Pharmaceutical Suppliers

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **MedLink** is an enterprise-grade B2B digital procurement platform designed specifically for licensed healthcare practitioners, hospital pharmacy directors, and verified pharmaceutical manufacturers. It streamlines medicine discovery, side-by-side supplier comparison, quotation requests (RFPs), and procurement compliance.

---

## 🏥 Platform Purpose & Architecture

In standard clinical settings, hospital procurement teams and doctors face fragmented supplier lists, manual telephonic inquiries, and opaque pricing markups. MedLink digitizes and legitimizes this institutional workflow:

* **Strictly B2B:** MedLink is **not** a direct-to-consumer pharmacy. It serves verified medical institutions, primary clinics, and licensed pharmaceutical distributors.
* **Verified Network:** Both healthcare professionals (Medical Registration Numbers) and pharma manufacturers (Drug Manufacturing License Form 25/28, WHO-GMP certifications) are audited before executing orders.
* **Transparent Indicative Quotations:** Clearly labels all listed prices as *Supplier Quotes / Listed Prices*, giving hospitals the transparency needed to issue audit-ready RFPs.

---

## 👥 Three Core User Portals

### 1. Doctor / Hospital Procurement Officer Portal
* **Dashboard Overview:** Real-time visibility into active requisitions, received supplier quotations, catalog inventory counts, and saved suppliers.
* **Live Discovery & Autocomplete Search:** Instant suggestions as you type brand names (*Dolo 650*, *Augmentin*, *Clexane*), chemical compositions (*Paracetamol*, *Piperacillin + Tazobactam*), or clinical indications (*ICU Emergency*, *Sepsis*, *Asthma*).
* **Multi-Supplier Comparison:** Side-by-side comparison matrix evaluating unit prices, pack sizes, delivery lead times, minimum order quantities (MOQ), and certifications.
* **Institutional Requisition Generation:** Issue formal RFPs (`ML-REQ-XXXXXX`) specifying required volume, expected delivery date, receiving department, and special storage conditions (cold chain, COA mandatory).
* **Real-Time Request Milestones:** Interactive milestone tracker:
  $$\text{Request Created} \longrightarrow \text{Sent to Suppliers} \longrightarrow \text{Supplier Responded} \longrightarrow \text{Quotations Received} \longrightarrow \text{Under Review} \longrightarrow \text{Order Awarded}$$

### 2. Pharmaceutical Manufacturer / Supplier Portal
* **Listing & Inventory Management:** Add, edit, and publish formulations with dosage forms, strength, packaging standards, listed pricing, MOQ, and warehouse stock counts.
* **Requisition Inbox:** Receive formal inquiries from verified hospital directors and doctors.
* **Quotation Submitter:** Submit binding commercial bids including quoted unit price, bulk discount tiers, batch release lead times, and payment terms.
* **Direct Procurement Communication:** Clarify logistics, cold-chain specifications, and batch COAs via secure procurement messaging.

### 3. Platform Compliance Administrator
* **Physician Credential Verification:** Audit Medical Council registration numbers, clinical affiliations, and uploaded practitioner credentials.
* **Pharma Manufacturer Licensing Audit:** Review state drug licenses (Form 25/28), WHO-GMP certificates, GSTIN, and manufacturing facilities.
* **Catalog Moderation:** Ensure regulatory compliance, verify pharmacopeial specifications (IP/BP/USP), and archive unapproved listings.
* **Procurement Analytics:** Track platform-wide quotation fulfillment volume, active orders, and average response times.

---

## 🔍 Always-Winning Search Engine (`searchEngine.ts`)

MedLink features an intelligent multi-tiered matching engine engineered so **every clinical search succeeds**:

1. **Multi-Field Matching:** Searches simultaneously across:
   * Medicine Name & Generic Formulation
   * Active Chemical Composition
   * Dosage Strength (*500 mg*, *650 mg*, *4.5 g*, *1 g*, *40 mg*)
   * Dosage Form (*Tablet*, *Injection*, *Infusion*, *Respules*, *Inhaler*, *Drops*, *Powder*)
   * Popular Brand Aliases (*Dolo 650*, *Augmentin 625*, *Pantocid 40*, *Monocef*, *Meronem*, *Clexane*, *Lantus*, *Asthalin*, *Emeset*)
   * Therapeutic Tags & Indications (*Fever*, *Sepsis*, *ICU*, *Cardiac*, *Anaphylaxis*, *Hypertension*, *Diabetic Ketoacidosis*)
2. **Levenshtein Typo Tolerance:** Automatically handles common clinical misspellings (e.g. *"paracetemol"*, *"augmntin"*, *"azithromicin"*, *"pan 40"*, *"ceftriaxon"*).
3. **Live Interactive Autocomplete:** Displays a floating suggestion box beneath the search bar on both the Doctor Dashboard and Medicine Search page.
4. **Smart Fallback Alternatives:** If a doctor applies strict filters that yield no exact match, MedLink surfaces verified therapeutic alternatives and highest-rated hospital formulations rather than a dead-end screen.
5. **AI Entity Extraction (Gemini API):** Extracts composition, strength, dosage form, and required units from natural language doctor prompts (e.g. *"Need 500 vials of Ceftriaxone 1g injection for ICU"*).

---

## 💊 Comprehensive Clinical Medicine Dataset (105+ Products)

MedLink includes a pre-seeded, realistic hospital formulary spanning 12 specialties:

| Specialty Category | Key Formulations in Dataset |
| :--- | :--- |
| **Emergency & Critical Care (ICU)** | Noradrenaline 4mg/2mL (*Norad*), Adrenaline 1mg/1mL (*EpiPen*), Atropine 0.6mg/mL, Hydrocortisone 100mg (*Efcorlin*), Dexamethasone 4mg/mL (*Dexona*), Mannitol 20% Infusion, Human Normal Albumin 20% (*Alburel*), Furosemide 20mg/2mL (*Lasix*) |
| **Broad-Spectrum Antibiotics & Sepsis** | Piperacillin + Tazobactam 4.5g (*Piptaz*), Meropenem 1g IV (*Meronem*), Vancomycin 1g Infusion (*Vancocin*), Colistimethate Sodium 1 MIU (*Colistin*), Linezolid 600mg (*Linospan*), Ceftriaxone 1g (*Monocef*), Augmentin 625mg (*Amox-Clav*), Azithromycin 500mg (*Azithral*) |
| **Cardiovascular & Anticoagulation** | Enoxaparin 40mg Prefilled Syringes (*Clexane*), Heparin 25,000 IU, Clopidogrel + Aspirin 75/75mg (*Clopilet-A*), Atorvastatin 20mg (*Lipitor*), Telmisartan 40mg (*Telma*), Amlodipine 5mg (*Norvasc*), Nitroglycerin Infusion |
| **Diabetes & Endocrinology** | Insulin Glargine 100 IU/mL (*Lantus*), Regular Human Insulin (*Actrapid*), Metformin 500mg (*Glucophage*), Dapagliflozin 10mg (*Forxiga*), Teneligliptin 20mg |
| **Respiratory & Nebulization** | Budesonide 0.5mg Respules (*Budecort*), Levosalbutamol + Ipratropium Respules (*Duolin*), Salbutamol 100mcg MDI (*Asthalin*), Montelukast + Levocetirizine |
| **Gastroenterology** | Pantoprazole 40mg IV & Oral (*Pan 40 / Pantocid*), Ondansetron 4mg IV (*Emeset*), Sucralfate + Oxetacaine Suspension (*Sucrafil-O*), Lactulose Solution |
| **Anesthesia & Surgery** | Propofol 1% Emulsion (*Diprivan*), Lignocaine 2% with Adrenaline (*Xylocaine*), Midazolam 5mg/5mL, Fentanyl Citrate 50 mcg/mL |
| **Oncology & Immunotherapy** | Paclitaxel 100mg Infusion, Gemcitabine 1g, Cisplatin 50mg, Carboplatin 450mg, Doxorubicin 50mg, Trastuzumab 440mg |
| **Analgesics & Anti-Inflammatory** | Paracetamol 500mg (*Paracip*), Paracetamol 650mg (*Dolo 650*), Ibuprofen 400mg (*Brufen*), Diclofenac Sodium (*Voveran*), Tramadol 50mg/mL |
| **Pediatrics & Clinical Fluids** | WHO-Formula ORS Sachets (*Electral*), Zinc Sulphate 20mg Dispersible, Adult Multivitamin Infusion (*MVI*) |
| **Ophthalmology & Dermatology** | Moxifloxacin 0.5% Eye Drops (*Vigamox*), Carboxymethylcellulose 0.5% Tear Drops (*Refresh*), Mupirocin 2% Ointment (*T-Bact*) |

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
* **Backend:** Express, Node.js (`server.ts` with Vite development middleware)
* **AI & NLP:** Google GenAI SDK (`@google/genai`) with Gemini model for smart natural requisition parsing
* **Storage Layer:** Reactive storage repository pattern with local persistence (`src/services/storage.ts`) and pub-sub listener mechanism for multi-tab synchronization
* **Tooling:** Vite, TSX, ESLint, PostCSS

---

## 🚀 Getting Started

### 1. Installation

Clone or extract the project directory and install dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Gemini API Key for NLP requisition extraction
GEMINI_API_KEY="your-gemini-api-key"

# Port (configured to port 3000 by default)
PORT=3000
```

### 3. Development Server

Start the full-stack Express server with Vite middleware:

```bash
npm run dev
```

The application will be live at `http://localhost:3000`.

### 4. Build for Production

Compile and bundle the production applet:

```bash
npm run build
npm run start
```

---

## 🧪 Persona Quick-Switcher (Demo Feature)

MedLink includes a top **Persona Switcher Bar** for testing the entire B2B workflow:

1. **Doctor View:** Logged in as *Dr. Rajesh Sharma* (Chief of Critical Care, Apollo Hospital). Browse medicines, run searches, compare suppliers, and submit quotation requests.
2. **Pharma View:** Logged in as *Sunora BioPharma Ltd.* or *Apex Formulations*. Review incoming requests, quote bids, update stock, and respond.
3. **Admin View:** Logged in as *MedLink Compliance Desk*. Approve doctor licenses, audit pharma WHO-GMP documents, and moderate catalog listings.
4. **Guest Landing:** Explore the institutional landing page, search mockup, trust metrics, and onboarding registrations.

---

## ⚖️ Legal & Medical Sourcing Notice

* MedLink is a technology platform facilitating institutional communication between healthcare professionals and pharmaceutical manufacturers.
* All pricing figures are indicative *Supplier Quotes / Listed Prices*. Final purchase orders, volume discounts, tax forms, and distribution licenses are formalized directly between the registered commercial parties.
* MedLink does not provide diagnosis, prescription fulfillment, or consumer medicine sales.
