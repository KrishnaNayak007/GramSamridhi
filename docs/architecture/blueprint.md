# SWC (Smart Waste Complaint) — Architecture Blueprint

This document defines the architecture blueprint for the SWC platform.

## 1. Architecture Overview

SWC is a **modular monolith**, not a microservices system. One Django project, one PostgreSQL/PostGIS database, one React SPA. Internally, the code is organized into strict domain boundaries (Django "apps" and React "features") so that:

- Each domain owns its models, services, and API surface.
- Cross-domain communication happens through service-layer function calls and Django signals/events — never by one app reaching into another app's models directly for writes.
- SURPLUS can be added later as new domains sitting beside SWC's domains, sharing only the genuinely shared infrastructure (accounts, media, geography, AI, notifications).

Three architectural layers run through the whole backend:

```
API layer        → thin. Auth, validation (serializers), calls services. No business logic.
Service layer     → business logic, orchestration, transactions. This is where workflows live.
Model layer        → persistence + invariants only (constraints, simple derived fields).
Selector layer      → read/query logic, separate from services that mutate state.
```

This is the standard "services + selectors" pattern used in mature Django codebases (HackSoft-style), chosen because it scales to a student team without needing DDD ceremony (aggregates, repositories, CQRS buses) that would be overkill here.

Guiding stance: **build the seams now, fill them in later.** Aggregation, prioritization, and AI provider selection all get interface boundaries today even though their internal logic starts trivial.

---

## 2. Repository Structure

```
swc-platform/
├── backend/
│   ├── config/                     # Django project (settings, urls, wsgi/asgi)
│   │   ├── settings.py              # ← single settings file, here
│   │   ├── urls.py                  # root URLconf, includes api/v1/urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── accounts/
│   │   ├── geography/
│   │   ├── authorities/
│   │   ├── evidence/
│   │   ├── incidents/              # CitizenReport + CivicIncident
│   │   ├── aggregation/
│   │   ├── prioritization/
│   │   ├── ai_analysis/
│   │   ├── workflow/                # status transitions, assignment
│   │   ├── notifications/
│   │   ├── analytics/
│   │   ├── audit/
│   │   ├── surplus/                # item listings, categories, transactions
│   │   ├── activity/               # cross-domain feed read-aggregator
│   │   ├── impact/                 # cross-domain user impact calculator
│   │   └── messaging/              # conversation/message services
│   ├── core/                        # shared kernel: base models, permissions, exceptions, pagination
│   │   ├── models.py                 # BaseModel (UUID pk, timestamps, soft-delete)
│   │   ├── permissions.py
│   │   ├── exceptions.py
│   │   └── pagination.py
│   ├── api/
│   │   └── v1/                       # thin routing layer that composes each app's viewsets
│   ├── manage.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── dev.txt
│   │   └── prod.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── app/                      # App shell, router definitions, and provider wrappers
│   │   ├── routes/                   # Route guard components and path constants
│   │   ├── pages/                    # Page component directories (DashboardPage, SettingsPage, MyActivityPage, SurplusPage, SwcPage, auth, etc.)
│   │   ├── shared/                   # Shared presentational components, hooks, formatting libs, and types
│   │   ├── services/                 # Endpoint API clients (authApi, surplusApi, etc.)
│   │   └── main.jsx                  # Main entry point
│   ├── index.html                # HTML mount point
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── infrastructure/
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── docker-compose.yml
│   └── env/
│       ├── .env.example
├── docs/
│   ├── architecture/                 # this document + ADRs
│   ├── api/                          # OpenAPI/schema exports
│   └── domain/                       # domain model diagrams, glossary
└── tests/
    └── integration/                  # cross-service integration tests that don't belong to one app
```

---

## 3. Django Domain/App Architecture

### Per-app breakdown

**`accounts`**
- Owns: `User` (custom user model), `CitizenProfile`, `AuthorityUser` (role, department FK, jurisdiction).
- Dependencies: none inward from other domain apps except `authorities` (FK from `AuthorityUser` to `Department`).

**`geography`**
- Owns: `Location` (point geometry + captured-vs-manual flag), `AdministrativeArea` (self-referential: State → District → ULB → Ward), the resolver service `resolve_administrative_area(point) -> AdministrativeArea`.
- Uses PostGIS `PointField`/`PolygonField`.

**`authorities`**
- Owns: `Department`, `Authority` (a department scoped to an `AdministrativeArea`), the lookup service `resolve_authority(administrative_area, category) -> Authority`.
- Depends on `geography` (read) and `accounts` (for officer assignment).

**`evidence`**
- Owns: `Evidence` (file reference, captured_at, upload metadata, checksum, status: `pending_upload` / `uploaded` / `failed` / `processed`), upload-confirmation service, validation service (MIME/size).

**`incidents`**
- Owns: `CitizenReport`, `CivicIncident`.
- Owns the **submission orchestration service** (`ReportSubmissionService.submit_report(...)`).

**`aggregation`**
- Owns: `SimilarityService` interface with a single method like `find_matching_incident(report) -> CivicIncident | None`.

**`prioritization`**
- Owns: `PriorityAssessment` model (versioned score + factor breakdown, one row per incident per (re)calculation) and `PriorityService.calculate(incident) -> PriorityAssessment`.

**`ai_analysis`**
- Owns: `AIAnalysisResult` model (structured fields: title, category, severity, detected_objects, confidence, raw_provider_response as JSON for audit), the `AIProvider` interface, and the `GeminiProvider` implementation.

**`workflow`**
- Owns: `Assignment`, `StatusHistory`, `SLA` and the state machine service that enforces valid transitions.

**`notifications`**
- Owns: `Notification` model + `NotificationService` interface with pluggable channels.

**`analytics`**
- Owns: read-only selector functions and DRF views that back the dashboard's overview/analytics/map endpoints.

**`audit`**
- Owns: `AuditLog` model + a simple `record(actor, action, target, metadata)` helper other services call.

---

## 4. React Feature Architecture

Feature-based, not type-based, because SWC's complexity is in *workflows* (submit-with-offline-support, officer-review-and-act) that each span multiple components, hooks, and API calls.

---

## 5. Core Domain Entities and Relationships

- `User (accounts)`
- `CitizenProfile (accounts)`
- `AuthorityUser (accounts)`
- `Location (geography)`
- `AdministrativeArea (geography)`
- `Authority (authorities)`
- `Evidence (evidence)`
- `CitizenReport (incidents)`
- `CivicIncident (incidents)`
- `AIAnalysisResult (ai_analysis)`
- `PriorityAssessment (prioritization)`
- `Assignment (workflow)`
- `StatusHistory (workflow)`
- `Notification (notifications)`
- `AuditLog (audit)`

---

## 6. High-Level Database Design (PostgreSQL + PostGIS)

- **Primary keys**: UUID (via `core.BaseModel`) — avoids leaking sequential incident counts, and plays well with future multi-region/offline-created client-side IDs.
- **Soft deletion**: `is_deleted` + `deleted_at` on `core.BaseModel`, applied to `CitizenReport`, `CivicIncident`, `Evidence`.
- **Timestamps**: `created_at`, `updated_at` on every table via the base model.
- **Geospatial indexing**: All point/polygon columns use `GEOGRAPHY` with `GIST` indexing.

---

## 7. Evidence Architecture

- Checksum validation for upload deduplication.
- Presigned uploads direct-to-object-storage (MVP starts with a simplified direct-to-backend multipart upload with size limit of 50MB, production upgrades to presigned URLs).
- Sniff actual bytes to validate MIME types.
- Device EXIF data priority for `captured_at` timestamp.

---

## 8. Offline Architecture

- **Browser storage recommendation**: **IndexedDB**, via a small wrapper library (`idb` — thin promise wrapper) rather than localStorage.
- Stores report payloads including file Blobs asynchronously.
- FIFO upload sync manager handles backoffs and connectivity state.

---

## 9. AI Architecture

- AI analysis is an enhancement, never a blocker. If the provider fails, the report proceeds.
- Strictly validates Gemini's response schema (no unapproved fields allowed) to prevent hallucinated assertions.
- Saves raw payload for audit trails, but maps clean attributes to database records.

---

## 10. Incident Aggregation Architecture

- Spatial-temporal proximity matching via `ST_DWithin`.
- Similarity matcher hidden behind interface boundaries to allow future vector search or perceptual hashing.

---

## 11. API Architecture

- Versioned REST under `/api/v1/`.
- Explicit sub-resources for workflow steps (e.g. `/assign/` and `/status/`).

---

## 12. Security Architecture

- JWT authentication with rotation.
- Object-level and jurisdiction-level permission scopes.
- Location privacy for citizens on public maps.

---

## 13. Testing Architecture

- App-level unit tests for selectors/services.
- Multi-app service integration tests.
- React components and Offline queue sync flow testing.

---

## 14. SURPLUS Integration (Future-proofing)

- Add new Django apps for surplus without touching SWC.
- Share `accounts`, `geography`, `evidence`, `ai_analysis`, `notifications`, `audit` components.
- Separate namespace `/api/v1/surplus/...` and distinct frontend features.
