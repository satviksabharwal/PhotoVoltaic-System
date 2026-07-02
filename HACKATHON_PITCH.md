# ☀️ SolarSense — Hackathon Pitch

> **The AI layer for solar.** Don't just monitor your panels — understand them, act on them,
> and know where to go next.

*One-liner: SolarSense turns a solar monitoring dashboard into an AI advisor that explains
your data in plain English, forecasts your output, and uses your location to recommend where
to buy panels and how good your site really is — all grounded in your own measurements and
live, cited web data.*

---

## 1. The Problem

People install or research solar, then drown in numbers.

- Dashboards show **charts, not answers.** "142 kWh" means nothing to most people.
- Owners don't know if their system is **healthy or underperforming.**
- Newcomers don't know if their **location is even good** for solar — or **who to buy from.**
- Every existing tool stops at *display*. None of them tell you **what to do next.**

> **The gap:** monitoring tools measure. They don't advise. They don't act.

---

## 2. The Solution

SolarSense adds an **AI advisory layer** on top of a working solar monitoring platform (MERN +
real weather data + hourly production tracking). Three capabilities, two of them headline:

### ⭐ Pillar 1 — Local Solar Marketplace & Site Suitability *(headline)*
Using the **coordinates we already track**, AI answers the two questions every solar user has:
- **"Where do I buy / who installs?"** → real, nearby operators, suppliers, and installers,
  with links and **citations** (powered by live web search — not made up).
- **"Is my location actually good?"** → a suitability score that fuses **your own measured
  sunlight data** with local incentives and regulations, plus the best install type.

### 💬 Pillar 2 — Ask Your Solar Data *(conversational analytics)*
A chat that speaks your data. Ask *"Which panel underperformed last week?"* or *"Did south beat
west last month?"* and get a **real number plus a plain-English explanation** — because the AI
queries your actual production data, then narrates it.

### 📈 Pillar 3 — Production Forecasting *(supporting)*
*"Tomorrow ~14 kWh, clear morning — run heavy appliances before 2pm."* Forecasts the next
24h/7 days from weather + panel physics, with AI-written guidance.

---

## 3. Why It's Different (and why it wins)

| Most solar tools | SolarSense |
|---|---|
| Show charts | **Explain** charts in plain language |
| Generic advice | Grounded in **your own measured data** |
| Hallucinated AI add-ons | **Live web search with citations** — verifiable |
| Stop at "here's your data" | **Tell you what to do and where to act** |
| Math by black-box AI | **Numbers computed by code, prose by AI** — accurate *and* readable |

**Three different AI patterns in one product:** web-grounded recommendations, agentic tool-use
over a live database, and generation over deterministic numbers. That breadth is the demo.

---

## 4. Live Demo Script (≈ 3 minutes)

1. **Open the map.** Click a tracked panel → **"Recommendations."**
   - Pins drop for 5 local installers with links; a card reads
     *"Excellent site (score 86) — south-facing 30° tilt is near-optimal for this latitude;
     KfW grants apply. [sources]"* → **(Pillar 1)**
2. **Open the chat.** Type *"compare my south vs west panel last month."*
   - *"South produced 142 kWh vs West's 98 kWh — 31% more, consistent with higher exposure for
     south-facing arrays at your latitude."* → **(Pillar 2)**
3. **Forecast card.** *"Tomorrow ~14 kWh, clear morning — best time for heavy appliances is
     before 2pm."* → **(Pillar 3)**
4. **Close:** "Monitor → Understand → Act. That's SolarSense."

---

## 5. How It Works (architecture in one glance)

```
            React (map + chat + forecast)
                       │  REST
                       ▼
        Express API ───── Claude (server-side)
             │             ├─ Web search + fetch  → recommendations (cited)
             │             ├─ Tool-use loop       → chat over your DB
             │             └─ Narrative gen        → forecast advice
             ▼
        MongoDB (panels, hourly production) + Weatherbit (irradiance)
```

**Stack:** MongoDB · Express · React · Node (existing) **+** Anthropic Claude API
(`claude-opus-4-8` for reasoning & web search, `claude-haiku-4-5` for fast text).

**Design principles:**
- All AI runs **server-side** — the API key never touches the browser.
- Every query is **scoped to the logged-in user.**
- **Numbers from code, words from AI** — figures stay correct.
- Recommendations are **cached** (fast demos, low cost) and **cited** (trustworthy).

---

## 6. Who It's For & Impact

- **Homeowners / prosumers** — finally understand their system and find local installers.
- **Solar shoppers** — check if their site is viable *before* spending money.
- **Operators / O&M teams** — spot underperformance fast.

**Impact angle for judges:** lowering the knowledge barrier accelerates solar adoption — the
recommendation engine literally connects users to local renewable-energy providers.

---

## 7. Feasibility (we're not starting from zero)

The hard parts already exist: a working MERN app, real weather integration, hourly production
data, lat/lon per panel, charts, and a map. The hackathon work is the **AI layer** on top —
which is exactly what's scoped and time-estimated in `HACKATHON_AI_FEATURES_PLAN.md`.

- **MVP in a hackathon window:** Pillar 1 + Pillar 3 = a complete, impressive story.
- **Cost:** a few dollars of API usage for the whole event (cached recommendations ≈ free).

---

## 8. Roadmap (post-hackathon)

- **Anomaly detection** — expected-vs-actual per panel → AI explains the likely fault + fix.
- **AI narrative reports** — auto-written executive summaries in the existing PDF/email pipeline.
- **Natural-language onboarding** — describe your panels in a sentence, we extract + geocode.
- **Marketplace partnerships** — turn recommendations into a referral/lead channel.

---

## 9. The Ask / Closing

> Solar data is everywhere. **Solar understanding isn't.**
> SolarSense is the AI advisor that turns measurements into decisions — and decisions into action.
>
> **Monitor → Understand → Act.**

---

### Appendix — Tagline options
- *"Your solar system, finally explained."*
- *"From kilowatt-hours to clear answers."*
- *"The AI advisor for solar."*
- *"Measure less. Understand more."*
