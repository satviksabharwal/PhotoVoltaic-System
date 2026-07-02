# PhotoVoltaic System — AI Feature Plan (Hackathon Edition)

> **Goal:** Turn the existing MERN photovoltaic monitoring app into an AI-powered solar
> platform. This document specifies three AI features in build-ready detail.
>
> **Order:** (1) Local Solar Marketplace & Site Suitability *(headline idea)*,
> (2) Ask Your Solar Data *(conversational analytics)*, (3) Production Forecasting.

---

## 0. Context & Why This Wins

### What the app already is
A full-stack MERN app to monitor photovoltaic (solar) systems. Users create **Projects**,
add **Products** (panel arrays), and the backend computes hourly electricity output from
weather data, visualizes it, and emails PDF reports.

### Data assets we can build AI on top of
These already exist — that's what makes the AI features credible instead of cosmetic:

| Asset | Where | Why it matters for AI |
|---|---|---|
| Per-panel config: orientation, inclination, area, **lat/lon**, powerPeak | [server/models/product.js](server/models/product.js) | Geospatial + physical inputs |
| Hourly production time-series: `pvValue`, `solarRad`, `powerPeak` | [server/models/pvDetails.js](server/models/pvDetails.js) | Real measured performance |
| Weather + an "expected output" physics formula | [server/cornCalculatePS.js](server/cornCalculatePS.js), [server/commonFunctions.js](server/commonFunctions.js#L48) | Ground truth for analysis & forecasting |
| PDF report + email pipeline | [server/genrateDocument.js](server/genrateDocument.js) | Reusable delivery channel |
| React dashboard (ApexCharts) + Leaflet map | [src/pages/DashboardAppPage.js](src/pages/DashboardAppPage.js), [src/pages/VisualMap.js](src/pages/VisualMap.js) | Ready-made surfaces for AI output |

### The hackathon pitch (one sentence)
> *"We don't just show you how your solar panels are doing — we tell you what it means,
> what to do next, and where to go to act on it."*

### Why judges will like it
- **Real data → real AI value** (not a wrapper around a chatbot).
- **Three distinct AI patterns**: web-grounded recommendations, agentic tool-use, and generation over deterministic numbers.
- **Live web grounding with citations** — recommendations are verifiable, not hallucinated.
- **Visible on a map and in chat** — demos beautifully.

---

## 1. Shared Foundation (build once, ~30 min)

All three features share one setup.

### 1.1 Install & configure
```bash
cd server
npm i @anthropic-ai/sdk
```

Add to `server/.env` (already gitignored):
```bash
ANTHROPIC_API_KEY="sk-ant-..."
# While here: move the hardcoded JWT 'secretKey' (server/index.js, commonFunctions.js) to env too
JWT_SECRET="some-long-random-string"
```

### 1.2 Shared client module — `server/ai/client.js`
```js
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

export const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// Model choices (see pricing in §5)
export const MODELS = {
  reasoning: 'claude-opus-4-8',   // chat + web-grounded recommendations
  fast:      'claude-haiku-4-5',  // cheap, high-volume (forecast narrative, cron scoring)
  balanced:  'claude-sonnet-4-6', // middle option to control cost
};
```

### 1.3 Hard rules (apply to every feature)
- **Server-side only.** The React app calls *your* Express routes. The Anthropic key never reaches the browser.
- **Scope every DB query by the authenticated `userId`** (reuse `getUserIdFromtoken` from [server/commonFunctions.js](server/commonFunctions.js#L32)). The AI must never read another user's data.
- **Numbers come from code, prose comes from Claude.** The LLM narrates; deterministic math (your existing formula) produces the figures.

---

## 2. FEATURE 1 — Local Solar Marketplace & Site Suitability ⭐ (Headline)

### 2.1 Concept
For any panel the user is tracking (or any new location), use its **coordinates** to surface:

- **Buy / Install** — real, nearby solar **operators, suppliers, and installers** where the
  user can purchase panels or hire installation, with links and citations.
- **Where to build** — a **suitability assessment** of the location for solar, combining the
  user's *own measured irradiance* with Claude's reasoning + web-sourced local incentives,
  plus suggested install types and nearby high-potential options.

This is the standout because it closes the loop: **monitor → understand → act**, and it's
grounded in live web data with citations.

### 2.2 Architecture
```
React (Map + side panel)
        │  GET /api/recommendations/:productId
        ▼
Express route (server/routes/recommendations.js)
        │
        ├─ 1. Reverse-geocode lat/lon → city/region   (Nominatim / OpenStreetMap, free)
        ├─ 2. Check cache (recommendations collection, 30-day TTL)
        ├─ 3. If miss → Claude w/ web_search + web_fetch (server-side, cited)
        │        + structured output (output_config.format)
        ├─ 4. Fuse with user's own data (avg solarRad/DNI, orientation, tilt)
        └─ 5. Cache + return JSON
        ▼
Render operators as Leaflet pins + suitability card
```

### 2.3 Step detail

**Step 1 — Reverse geocoding (lat/lon → place name)**
Web search needs a place name to be useful. Use **Nominatim** (OpenStreetMap) — free, and you
already use OSM tiles via Leaflet.
```
GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json
Headers: User-Agent: "PhotoVoltaicSystem/1.0 (your-email)"
```
Respect their usage policy: set the `User-Agent`, and **cache** (we do anyway in Step 5).

**Step 2 — Cache lookup**
New Mongo collection `recommendations`:
```js
// server/models/recommendation.js
{
  geoKey: String,        // e.g. "50.83,12.92" (lat/lon rounded to 2 dp ≈ 1 km)
  city: String,
  payload: Mixed,        // the structured result from Step 3/4
  createdAt: Date,       // TTL index → expire after 30 days
}
```
Local operators don't change weekly, and web-search calls cost money — caching keeps this
cheap and fast for demos.

**Step 3 — Claude with web search (the AI core)**
```js
const resp = await anthropic.messages.create({
  model: MODELS.reasoning,                    // claude-opus-4-8 (best web-search filtering)
  max_tokens: 4000,
  thinking: { type: 'adaptive' },
  tools: [
    { type: 'web_search_20260209', name: 'web_search' },
    { type: 'web_fetch_20260209',  name: 'web_fetch'  },
  ],
  output_config: { format: { type: 'json_schema', schema: RECOMMENDATION_SCHEMA } },
  messages: [{ role: 'user', content: buildPrompt({ city, lat, lon, avgIrradiance, orientation, inclination }) }],
});
```
Claude searches the live web for installers/suppliers near `city`, local incentives, and
ballpark pricing, then returns structured JSON. Results carry **citations** so the UI can
show the source.

**Step 4 — Structured output schema**
```jsonc
RECOMMENDATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    operators: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name:        { type: "string" },
          type:        { type: "string", enum: ["installer", "supplier", "operator"] },
          city:        { type: "string" },
          distanceHint:{ type: "string" },         // "≈ 8 km, central Chemnitz"
          offerings:   { type: "string" },         // panels / inverters / full install
          url:         { type: "string" },
          source:      { type: "string" }          // citation URL
        },
        required: ["name", "type", "city", "offerings", "url"]
      }
    },
    suitability: {
      type: "object",
      additionalProperties: false,
      properties: {
        score:               { type: "integer" },  // 0–100
        rating:              { type: "string", enum: ["poor","fair","good","excellent"] },
        rationale:           { type: "string" },
        recommendedInstall:  { type: "string" },    // rooftop / ground-mount / etc.
        localIncentives:     { type: "string" },
        caveats:             { type: "string" }
      },
      required: ["score", "rating", "rationale"]
    }
  },
  required: ["operators", "suitability"]
}
```

**Step 5 — Fuse with the user's own data**
Before/while prompting, compute the panel's **average measured irradiance** (`solarRad`/DNI
from `hourWiseData`) and pass it in. The suitability rationale is then grounded in the user's
*real measurements*, not generic regional averages — a strong differentiator.

### 2.4 Frontend
- Render `operators` as **pins on the existing Leaflet map** ([src/pages/VisualMap.js](src/pages/VisualMap.js)),
  plus a **side panel** of cards (name, type, offerings, "Visit →", "source").
- Render `suitability` as a **score badge + rationale card** (reuse MUI components).
- This makes the map page *actionable* instead of display-only.

### 2.5 Model & cost
- Model: `claude-opus-4-8` (web-search dynamic filtering is strongest here).
- Cached lookup ≈ near-zero; fresh lookup ≈ **$0.05–0.15** (web search + reasoning).

### 2.6 Demo moment
> Click a panel on the map → "Recommendations" → pins drop for 5 local installers with links,
> and a card says *"Excellent site (score 86) — south-facing 30° tilt is near-optimal for this
> latitude; Germany's KfW grants apply. [sources]"*

---

## 3. FEATURE 2 — Ask Your Solar Data (Conversational Analytics)

### 3.1 Concept
A chat panel on the dashboard. Users ask plain English; Claude answers with **real numbers +
a short narrative** by querying their own data through tools.

Example questions:
- *"Which panel underperformed last week, and by how much?"*
- *"How much did facing west cost me compared to south?"*
- *"What was my best production day and what was the weather?"*

### 3.2 Architecture (agentic tool-use loop)
```
React chat drawer
     │  POST /api/assistant/chat  { messages }
     ▼
Express (server/routes/assistant.js)  — verify JWT → userId
     │
     ▼  manual tool-use loop:
   while stop_reason === "tool_use":
       claude.messages.create({ model, tools, messages, thinking:{type:"adaptive"} })
       run matching Mongo query (scoped by userId)
       append tool_result
   → stream final answer to client
```

### 3.3 Tools exposed to Claude (each = a scoped Mongo query)
```js
const TOOLS = [
  { name: "list_products",
    description: "List the user's panels with config (orientation, tilt, area, location). Call when the user asks what panels they have or to pick a panel.",
    input_schema: { type:"object", properties:{ projectId:{type:"string"} }, required:[] } },

  { name: "get_production_series",
    description: "Hourly production (pvValue, solarRad) for one panel over a date range.",
    input_schema: { type:"object", properties:{
      productId:{type:"string"}, from:{type:"string"}, to:{type:"string"} },
      required:["productId","from","to"] } },

  { name: "compare_products",
    description: "Aggregate a metric across panels (e.g. total kWh) for comparisons.",
    input_schema: { type:"object", properties:{
      productIds:{type:"array",items:{type:"string"}}, metric:{type:"string"} },
      required:["productIds","metric"] } },

  { name: "get_weather_for",
    description: "Cached weather/irradiance for a panel on a given date.",
    input_schema: { type:"object", properties:{
      productId:{type:"string"}, date:{type:"string"} }, required:["productId","date"] } },
];
```

### 3.4 The loop (illustrative)
```js
let messages = req.body.messages;
while (true) {
  const r = await anthropic.messages.create({
    model: MODELS.reasoning, max_tokens: 4000,
    thinking: { type: 'adaptive' }, tools: TOOLS, messages,
  });
  if (r.stop_reason !== 'tool_use') { /* stream r to client */ break; }

  messages.push({ role: 'assistant', content: r.content });
  const results = [];
  for (const block of r.content) {
    if (block.type !== 'tool_use') continue;
    const data = await runTool(block.name, block.input, userId); // userId-scoped
    results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(data) });
  }
  messages.push({ role: 'user', content: results });
}
```
For the final answer, use `anthropic.messages.stream(...)` so the UI types it out.

### 3.5 Guardrails
- Tools return **pre-aggregated** values → figures stay correct (the model narrates, doesn't do math on raw arrays).
- Every `runTool` adds `{ user: userId }` to the query filter.
- System prompt: *"Answer only from tool results. If data is missing, say so. Be concise; lead with the number."*

### 3.6 Frontend
Chat drawer on [src/pages/DashboardAppPage.js](src/pages/DashboardAppPage.js) using your existing
axios + redux token pattern. Stream tokens into a message bubble.

### 3.7 Model & cost
- `claude-opus-4-8` (or `claude-sonnet-4-6` to cut cost ~40%).
- ≈ **$0.01–0.05 per answer**.

### 3.8 Demo moment
> Type *"compare my south vs west panel last month"* → Claude calls `compare_products`,
> replies *"South produced 142 kWh vs West's 98 kWh — 31% more, consistent with the
> higher solar exposure for south-facing arrays at your latitude."*

---

## 4. FEATURE 3 — Production Forecasting

### 4.1 Concept
Predict the next 24 hours / 7 days of generation and give actionable guidance:
*"Tomorrow ~14 kWh, clear morning — run heavy appliances before 2pm. Thursday overcast (~6 kWh)."*

### 4.2 Architecture
```
React forecast card/chart
     │  GET /api/forecast/:productId
     ▼
Express (server/routes/forecast.js)
     ├─ 1. Weatherbit FORECAST endpoint (you already use their history API)
     ├─ 2. Run existing physics formula on forecast irradiance  → kWh per hour/day  (DETERMINISTIC)
     ├─ 3. Claude writes the human guidance (fast model)
     └─ 4. Return { series, advice }
```

### 4.3 Step detail
- **Step 1:** Weatherbit forecast (`/v2.0/forecast/hourly`) with the panel's lat/lon — mirror
  the call shape already in [server/cornCalculatePS.js](server/cornCalculatePS.js).
- **Step 2:** Reuse `calculateElectricityProduced` from [server/commonFunctions.js](server/commonFunctions.js#L48)
  on forecast irradiance. **The numbers are computed, not generated.**
- **Step 3:** Pass the computed series to Claude (`claude-haiku-4-5`) for a 2–3 sentence advice blurb.
- **Step 4:** UI renders an ApexCharts forecast line + an advice card.

### 4.4 Synergy with Feature 2
Once built, add a `get_forecast` tool to the chat so users can ask
*"should I wait until tomorrow to run laundry?"* — the chat then reasons over the forecast.

### 4.5 Model & cost
- `claude-haiku-4-5` (short generation) → **< $0.01 per forecast**. Cheapest feature.

---

## 5. Models & Cost Summary

| Model | ID | Input / Output ($/M tok) | Used for |
|---|---|---|---|
| Opus 4.8 | `claude-opus-4-8` | $5 / $25 | Recommendations (web search), chat |
| Sonnet 4.6 | `claude-sonnet-4-6` | $3 / $15 | Cost-tuned alternative for chat |
| Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 | Forecast narrative, future cron scoring |

**Per-action cost:** recommendations $0.05–0.15 (cached → ~$0), chat $0.01–0.05, forecast < $0.01.
For a hackathon demo, total spend is negligible (a few dollars).

---

## 6. Build Roadmap (hackathon timeline)

| Phase | Scope | Est. |
|---|---|---|
| **0** | Shared foundation: install SDK, env, `ai/client.js` (§1) | 0.5h |
| **1** | Feature 1 backend: reverse geocode + web search + schema + cache | 3–4h |
| **2** | Feature 1 frontend: map pins + suitability card | 2–3h |
| **3** | Feature 2: tool-use loop + 4 Mongo tools + streaming chat UI | 4–5h |
| **4** | Feature 3: Weatherbit forecast + formula + advice card | 2–3h |
| **5** | Polish: loading states, error handling, demo data, README | 2h |

**Recommended order for impact:** Foundation → **Feature 1** (most novel, self-contained, demos on the map) → Feature 2 → Feature 3.
If time is tight, **Feature 1 + Feature 3 alone** make a complete, impressive story (web-grounded recommendations + forecasting), and Feature 3 is fast.

---

## 7. New Files & Touch Points

**New (backend)**
- `server/ai/client.js` — shared Anthropic client
- `server/routes/recommendations.js` — Feature 1
- `server/routes/assistant.js` — Feature 2
- `server/routes/forecast.js` — Feature 3
- `server/models/recommendation.js` — cache collection
- `server/ai/tools.js` — tool definitions + `runTool` dispatcher (Feature 2)

**New (frontend)**
- `src/sections/@dashboard/assistant/ChatDrawer.js` — Feature 2 UI
- `src/sections/@dashboard/recommendations/` — cards + map integration
- forecast card/chart component

**Modified**
- [server/index.js](server/index.js) — mount the three new routers
- [src/pages/VisualMap.js](src/pages/VisualMap.js) — recommendation pins
- [src/pages/DashboardAppPage.js](src/pages/DashboardAppPage.js) — chat drawer + forecast card

---

## 8. Security & Quality Notes
- Keep `ANTHROPIC_API_KEY` server-side only; never ship it to React.
- Move the hardcoded JWT `'secretKey'` to `JWT_SECRET` env ([server/index.js:33](server/index.js#L33), [server/commonFunctions.js:20](server/commonFunctions.js#L20)).
- Scope **every** AI-triggered DB query by `userId`.
- Cache web-search results (cost + speed + rate limits).
- Set a `User-Agent` on Nominatim calls and cache them.
- Treat web-sourced operator info as **suggestions** and always show citations.

---

## 9. Stretch Ideas (post-hackathon)
- **Anomaly detection**: expected-vs-actual per panel (you already compute expected) → Claude explains likely cause (soiling, shading, inverter fault) + recommended action. Cheap with Haiku in the cron.
- **AI narrative reports**: one Claude call inside [server/genrateDocument.js](server/genrateDocument.js) to add an executive summary (yield, CO₂, € saved, ranking) to the existing PDF.
- **NL panel setup**: *"20 m² south-facing panels in Chemnitz, 30° tilt"* → structured extraction + geocode → pre-fill the create form.
- **Weekly AI digest email** reusing the existing cron + nodemailer.

---

## 10. One-Line Elevator Pitch
> **SolarSense** — an AI layer on a solar monitoring app that explains your data in plain
> English (chat), forecasts your output, and uses your location to recommend where to buy
> panels and how good your site really is — all grounded in your own measurements and live,
> cited web data.
