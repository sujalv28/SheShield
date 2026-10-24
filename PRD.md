# SafePath: Hackathon PRD

Track: Social Impact, Women Safety, Smart Cities. Build window: 24 to 48 hours. Status: working prototype exists, production data layer pending.

## 1\. One-Line Pitch

Google Maps finds the fastest route. SafePath finds the route with the least risk exposure, shows exactly why, and lets the user decide how much extra distance safety is worth.

## 2\. Problem

* Women adjust routes daily using informal knowledge: lighting, crowds, reputation of a street.
* Mainstream navigation optimizes one variable, travel time. It has no safety signal.
* Crime data exists but sits in tables and reports. It never reaches the moment of route choice.
* Result: safety decisions rely on memory and guesswork, especially at night and in unfamiliar areas.

## 3\. Solution

A web navigation layer that converts spatial crime data and OpenStreetMap context into a per-street risk score, then routes over a risk-weighted graph.

* Two routes shown side by side: fastest and safest.
* Safety score (0 to 100) with plain-language factors for each route.
* Time-of-day aware: the same street scores differently at 2 PM and 11 PM.
* User-controlled detour limit, so the tradeoff is visible and chosen.
* Crowdsourced unsafe-spot reports that rescore the map instantly.

## 4\. Why This Wins (Judging Criteria Mapping)

|Criterion|SafePath answer|
|-|-|
|Problem relevance|Universal, daily, high emotional stakes, clear underserved gap.|
|Innovation|Risk-weighted routing with explainability and a user-set detour cap, not a heatmap and not a panic button.|
|Technical depth|Graph construction from OSM, spatial joins, kernel density scoring, footfall normalization, constrained shortest path search.|
|Working demo|Live prototype with route comparison, time buckets, heatmap, reporting, CSV upload.|
|Impact and scalability|Any city with geocoded incident data and OSM coverage. Data layer is swappable.|
|Responsibility|Relative scoring language, bias handling, privacy by design, published methodology.|

## 5\. Target Users

* Primary: women commuters, students, late-shift workers, and newcomers to a city.
* Secondary: families checking a route before a trip.
* Tertiary: city planners and NGOs reading aggregate low-safety corridors.

## 6\. Scope

### Must Ship (Demo-Critical)

* Start and destination selection on a map.
* Fastest versus safest route with scores, distance, time, and delta.
* Day, evening, night selector.
* Detour slider.
* Street risk overlay.
* Factor explanation per route.

### Should Ship

* Safe-place layer (police, transit, open shops).
* Unsafe-spot reporting with live rescoring.
* Incident CSV upload for any dataset.

### Cut for Hackathon

* Turn-by-turn voice guidance, native apps, accounts, live location sharing, SOS, multi-city support.

## 7\. Core User Flow (Demo Script Backbone)

1. User opens SafePath and picks a night-time trip.
2. Fastest route appears with a mid safety score and a high-risk stretch flagged.
3. Safest route appears with a visible small detour and a higher score.
4. User drags the detour slider to see the route change.
5. User switches to day. Scores and routes shift.
6. User reports an unsafe spot. The map rescoring updates immediately.

## 8\. Safety Scoring Model

`risk(edge, time) = 0.6 \\\* crime + 0.2 \\\* isolation + 0.25 \\\* poor\\\_lighting - 0.2 \\\* protective\\\_proximity`

* **crime:** Gaussian kernel density of nearby incidents, severity weighted, time-bucket weighted, divided by a footfall factor to reduce the busy-area reporting bias.
* **isolation:** Fewer open places nearby raises risk, stronger at night.
* **poor\_lighting:** OSM lit tag on the street, active in evening and night.
* **protective\_proximity:** Distance decay to police stations, transit stops, and open shops.

Routing cost: `length \\\* (1 + lambda \\\* risk)`. Lambda increases until the route reaches the user's detour cap. The best scoring candidate within the cap is returned.

Route score: length-weighted mean risk blended with the worst three-segment window, so one dangerous stretch cannot be averaged away.

## 9\. Tech Stack

|Layer|Choice|
|-|-|
|Frontend|React, MapLibre GL or Leaflet on OSM tiles|
|Backend|Python, FastAPI|
|Graph and routing|OSMnx, NetworkX or igraph|
|Spatial data|GeoPandas, PostGIS|
|Geocoding|Nominatim with caching|
|Deploy|Single container, free-tier host|

### API Surface

* `GET /route?from=\\\&to=\\\&time=\\\&max\\\_detour=` returns both routes, scores, factors.
* `GET /risk?time=` returns edge risk for the overlay.
* `POST /report` adds an unsafe-spot report.

## 10\. Data Plan

* **Pilot city:** choose the city with the best geocoded incident data available. Data availability decides the city.
* **Fallback:** if real incident data is thin, use a documented synthetic-plus-real hybrid and label it clearly in the demo.
* **Pipeline:** clean incidents, normalize categories, map to nearest edge, compute per-edge per-time features, store scores, version the output.
* **Attribution:** OSM (ODbL) credited on the map. Dataset source and licence stated on a methodology page.

## 11\. Build Plan (48 Hours)

|Block|Hours|Output|
|-|-|-|
|Data and graph|0 to 8|Cleaned incidents, OSM graph for pilot city|
|Scoring engine|8 to 16|Per-edge, per-time risk scores|
|Routing and API|16 to 24|Fastest and safest route endpoint with detour cap|
|Frontend|24 to 36|Map, dual routes, overlay, slider, explanations|
|Reporting and polish|36 to 42|Unsafe-spot reports, safe-place layer, CSV upload|
|Validation and pitch|42 to 48|Evaluation numbers, slides, demo rehearsal|

### Team Roles (Adjust to Team Size)

* Data and scoring lead.
* Backend and routing lead.
* Frontend and map lead.
* Pitch, validation, and documentation lead.

## 12\. Validation (Numbers for the Pitch)

* **Random-pair test:** 1,000 random origin-destination pairs. Report median safety-score gain and median detour overhead.
* **Temporal holdout:** score using earlier incidents, then check whether safest routes avoid segments where later incidents occurred, against a random-route baseline.
* **Target claims:** at least 25 percent lower risk exposure at a median detour of 20 percent or less. Publish actual measured values only.
* **Usability:** five test users, measure whether they can explain why the safest route was chosen.

## 13\. Risks and Responsible Design

|Risk|Mitigation|
|-|-|
|Reported crime is biased by reporting rates and police presence|Footfall normalization, OSM environment features, visible data recency and confidence|
|False sense of security|Relative wording only (safer than the fastest option), persistent disclaimer|
|Stigmatizing neighbourhoods|Street-level scores for routing, no area labels, published methodology|
|Sparse lighting tags in OSM|Road class and POI density proxies, confidence flag|
|Route privacy|No accounts, no identity-linked storage, per-request processing|
|Abuse of reports|Rate limiting, moderation queue, reputation weighting after hackathon|

## 14\. Success Metrics

* Demo: route comparison renders in under 3 seconds for trips up to 20 km.
* Model: measured safety gain and detour overhead published in the deck.
* Product (post-hackathon): share of searches where the safest route is chosen, report submission rate, repeat usage.

## 15\. Competitive Position

|Product type|Gap|
|-|-|
|Mainstream navigation|No safety signal, one objective|
|Panic and SOS apps|Reactive, act after danger starts|
|Static crime heatmaps|No routing, no time awareness, no explanation|
|SafePath|Proactive, route-level, time-aware, explainable, user-controlled tradeoff|

## 16\. Pitch Structure (3 Minutes)

1. Problem: the fastest route is not the safest route (30 seconds).
2. Solution and live demo: night trip, dual routes, slider, report (90 seconds).
3. How it works: scoring model and routing cost (30 seconds).
4. Validation numbers and responsible design (20 seconds).
5. Roadmap and ask (10 seconds).

## 17\. Roadmap After Hackathon

* Phase 1: real pilot city data, moderation for reports, mobile-first interface.
* Phase 2: live location share with trusted contacts, route deviation alerts, SOS.
* Phase 3: multi-city expansion, partnerships with NGOs and city safety programs, aggregate corridor insights for planners.

## 18\. Definition of Done

* Live URL with a working end-to-end route comparison.
* Methodology page with data sources, scoring formula, and limits.
* Measured validation numbers in the deck.
* Rehearsed demo with a fallback recording.