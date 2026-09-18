# Gestion Immobilière — Frontend

Rental-management web platform: landlords (*bailleurs*) manage properties, tenants, contracts, rents and maintenance — tenants follow their home, contract, payments and receipts — and a super admin supervises accounts, subscriptions and support.

**Stack:** Angular 18 (standalone components) · Spring Boot API skeleton at the repo root (`../../pom.xml`) · black / white / grey rectangular UI.

> **No backend required to run the app today.** The frontend runs in mock mode: all data lives in `localStorage` via `MockDataService` / `MockAuthService`, so every button, form, PDF insert and reminder works end-to-end without a server.

## Run it after a fresh pull

Prerequisites: **Node.js 18, 20 or 22** + npm (backend only: Java 17 + Maven, optional for now).

```bash
git pull
cd Frontend/gestion-immobiliere
npm install
npm start
# → open http://localhost:4200/
```

| Command | What it does |
|---|---|
| `npm start` | Dev server on http://localhost:4200 (auto-reload) |
| `npm run build` | Production build into `dist/` |
| `npm test` | Unit tests (Karma) |

Backend (optional, not used by the frontend yet — run from the repo root):

```bash
./mvnw spring-boot:run
# → API expected at http://localhost:8080/api (see src/environments/environment.ts)
```

## Demo accounts (password for all: `password123`)

| Email | Role | Login page | Lands on |
|---|---|---|---|
| `superadmin@immo.com` | Super Admin | `/auth/super-admin/login` | `/super-admin/dashboard` |
| `bailleur@immo.com` | Bailleur (landlord) | `/auth/bailleur/login` (+ register) | `/proprietaire/dashboard` |
| `locataire@immo.com` | Locataire (tenant, Marie Ngo, room CH-1) | `/auth/locataire/login` | `/locataire/dashboard` |

Sub-admins created in *Paramètres* log in through the Super Admin login page. Tenants invited by a bailleur log in with their email + the password the bailleur sets for them on the password-creation page.

## Pages and what they do

**Public** — `/` landing page (hero, features, bailleur/locataire/admin entry points) · 3 login pages (super admin, bailleur, locataire) · 1 bailleur register page · 3 forgot-password pages.

**Super Admin** (`/super-admin/...`) — `dashboard` (stats, revenue chart, recent activity with *Voir plus* modal + pagination) · `proprietaires` (search/filter/suspend; detail modal shows each owner's properties, rooms and occupants) · `locataires` (global list with room numbers) · `abonnements` (edit plans, suspend/resume) · `parametres` (platform settings, admin email/password, sous-admin management) · `logs` · `support` (reply box per ticket).

**Bailleur** (`/proprietaire/...`) — `dashboard` (revenue, occupancy, deadlines + notifications *Voir plus* modals) · `logements` (clickable cards → rooms/occupancy detail, assign tenant to a room, add/edit with room editor) · `locataires` (view/edit/delete, room info, invite form → password-creation page) · `contrats` (grouped by building, contract PDF insert/view/replace/delete per tenant) · `loyers` (status changes, bell reminders, arrears-per-tenant panel) · `quittances` (receipt states, insert PDF, months covered per building) · `interventions` (read problem, *En cours* / *Terminer*) · `settings` (profile, email, password).

**Locataire** (`/locataire/...`) — `dashboard` (home, rent, last/next payment, contract summary) · `logement` (details, own room badge, shared rooms, flatmates) · `contrat` (bailleur-inserted PDF download) · `paiements` (history, totals, reminder-received indicator) · `quittances` (download receipts the bailleur inserted) · `problemes` (report an issue) · `notifications` · `profil`.

## Key flows

- **Invite → access:** bailleur fills the invite form (name, email, phone, building, room) → lands on the password-creation page → the tenant logs in with email + that password.
- **Documents:** bailleur inserts a contract/quittance PDF on their side → the tenant sees and downloads the same file on theirs.
- **Reminders:** bailleur's bell on a payment → tenant sees *Rappel reçu* on that row.
- **Rooms:** several tenants can share one apartment in different rooms; occupancy, roommates and per-owner views stay consistent across dashboards.

## System map

```
Browser (http://localhost:4200)
  └─ Angular 18 SPA (standalone components, lazy routes)
       ├─ Pages ── role guards (SUPER_ADMIN / PROPRIETAIRE / LOCATAIRE)
       │    ├─ black sidebar + header (notifications popup, profile menu)
       │    └─ feature pages (dashboards, tables, cards, modals)
       ├─ MockDataService / MockAuthService ── localStorage (CURRENT mode)
       └─ ApiService ── http://localhost:8080/api (Spring Boot, future backend)

Landing (/) ── role login ── role layout ── feature pages
Bailleur invites tenant ── password page ── tenant login
```

## Project structure (this folder)

```
gestion-immobiliere/
├─ README.md              ← you are here
├─ src/app/app.routes.ts  ← all routes (flat, loadComponent)
├─ src/app/core/          ← models, services, guards, interceptors, layout
├─ src/app/features/      ← super-admin / proprietaire / locataire pages
├─ src/app/pages/         ← landing, auth, settings, unauthorized
└─ src/environments/      ← apiUrl (backend, currently unused by the UI)
```

## Notes

- Roles and route protection are enforced by functional guards (`authGuard`, `superAdminGuard`, `proprietaireGuard`, `locataireGuard`); deactivated accounts are rejected at login.
- Design system: black/white/grey only, rectangular corners, shadow depth, inline-SVG icons, modal dialogs for details, forms and confirmations.
- Currency labels currently mix FCFA (bailleur) and € (super admin / locataire) while amounts are shared — to be unified when the backend lands.
