# Student Finance Wallet (SFW) — Project Notes
> Source: Phase 2 Design Phase PDF by Jelo Gabriel O. Caperiña
> Last updated: 2026-04-28

---

## Rules (Claude must follow at all times)

- **NEVER touch any `.env` file** — the user manages all environment variables manually
- **Use Supabase** as the database — not a locally running PostgreSQL instance
- **Ask for clarifications first** before starting any implementation phase
- **Tech stack is fixed:** Express 5 (backend API), React 19 + Vite (frontend), Supabase (hosted DB + Auth + JS client), Zod (input validation)
- **No Prisma** — use `@supabase/supabase-js` directly for all database operations
- **Authentication:** Supabase Auth (email/password) — role stored in user metadata (`finance_staff` or `student`)
- **Integrations (SRM, CMS, CSS, U-ANAS):** real external services — base URLs stored in `.env`, one adapter file per subsystem in `server/src/integrations/` for easy changes
- **Do not create features or abstractions beyond what the design doc or user specifies**
- **Do not add comments** unless the reason is non-obvious

---

## What This System Is

The **Student Finance Wallet (SFW)** is the financial control layer of the **Intelligent Academic Ecosystem (IAE)**. It handles:
- Fee computation based on enrollment
- Payment recording by finance staff
- Financial clearance determination
- Broadcasting financial status to other subsystems

---

## Connected Subsystems

| Subsystem | Abbreviation | Direction | What It Sends / Receives |
|---|---|---|---|
| Student Registration Management | SRM | IN to SFW | Student profile, enrollment status |
| Course Management Subsystem | CMS | IN to SFW | Tuition per unit, lab fees, other charges |
| Course Shifting Subsystem | CSS | BOTH | Financial adjustments in; clearance status out |
| Unified Academic Notification & Alert System | U-ANAS | OUT from SFW | Financial alerts and notifications |

---

## Inputs

| Input | Source | Description |
|---|---|---|
| Student Profile Data | SRM | Student ID, program, enrollment status |
| Course Pricing Data | CMS | Tuition per unit, lab fees, other charges |
| Financial Adjustments | CSS | Changes from added/dropped subjects |
| Payment Data | Finance Staff (manual) | Amount, date, reference number |

---

## Outputs

| Output | Description | Destination |
|---|---|---|
| Student Balance Summary | Total due, total paid, remaining balance | Student UI |
| Payment Receipts | Proof of payment after transaction | Student UI + U-ANAS |
| Invoice Records | Updated billing statement | Student UI |
| Financial Status | CLEARED or ON_HOLD | CSS |
| Adjustment Notices | Updated fee breakdown after changes | Student UI + U-ANAS |

---

## Processing Logic (9 Steps)

1. **Retrieve Data** — fetch student profile from SRM, course pricing from CMS
2. **Validate Data** — ensure student ID, subjects, and fees are all present; reject if incomplete
3. **Compute Fees** — calculate tuition (units × rate) + lab fees + other charges
4. **Process Payment** — finance staff manually enters payment; validate (positive amount, no duplicate reference)
5. **Update Financial Records** — update total paid and remaining balance in DB
6. **Generate Documents** — auto-create receipt; update invoice with new balance
7. **Evaluate Financial Status** — `balance = 0` → CLEARED, `balance > 0` → ON_HOLD
8. **Broadcast Status** — send status to SRM and CSS; trigger U-ANAS notification
9. **Log All Activities** — record every transaction, adjustment, and user action

---

## Security & Roles

| Role | Access |
|---|---|
| Finance Staff (`finance_staff`) | Can edit student financial information |
| Student | View only — can see their own balance, receipts, invoices |

---

## Error Handling Requirements

| Error Type | Handling |
|---|---|
| Input Validation | Zod schema validation; return `{ error, message }` JSON |
| Data Retrieval (SRM/CMS/CSS) | Retry 3 times, log failure, fallback if possible |
| Computation | Validate before computing; abort + log if data is missing |
| Payment Processing | Positive numeric amount; block duplicate reference numbers; require confirmation |
| Database | try-catch with transactions; rollback on failure; generic error to client, detailed error to logs |

---

## Database Tables (Supabase)

| Table | Purpose |
|---|---|
| `student_accounts` | Core financial account per student — total due, total paid, status |
| `payment_transactions` | Individual payment records with reference number |
| `fee_records` | Fee breakdown per enrollment (tuition, lab, other, adjustments) |
| `activity_logs` | Audit log of all actions |

> Status values: `CLEARED` or `ON_HOLD`
> Balance is derived: `total_due - total_paid`

---

## Actual Project Structure

```
SYSInteg/
├── client/           React 19 + Vite frontend
│   ├── src/
│   │   ├── App.jsx   (currently default Vite template — not yet built)
│   │   └── main.jsx
│   └── package.json  (react, react-dom, react-router-dom, @supabase/supabase-js, axios)
├── server/           Express 5 backend
│   └── package.json  (express, @supabase/supabase-js, cors, dotenv, nodemon)
├── PROJECT_NOTES.md  (this file)
└── Jelo Gabriel O. Caperiña - Phase 2_ Design Phase [Draft].pdf
```

### Client dependencies installed
- `react`, `react-dom` — UI framework
- `react-router-dom` — client-side routing
- `@supabase/supabase-js` — Supabase Auth + direct DB queries
- `axios` — HTTP calls to the Express backend

### Server dependencies installed
- `express` — API server
- `@supabase/supabase-js` — Supabase client for DB operations
- `cors` — cross-origin requests from the React client
- `dotenv` — environment variable loading
- `nodemon` — dev auto-restart
- `zod` — input validation (to be installed)

---

## Planned Folder Structure

### Server
```
server/
├── src/
│   ├── routes/             one file per resource (fees, payments, invoices, status)
│   ├── controllers/        business logic called by routes
│   ├── integrations/       one file per external subsystem (srm, cms, css, uanas)
│   ├── middleware/         auth.js (Supabase Auth check), validate.js (Zod)
│   ├── config/             supabase.js (Supabase client init)
│   └── utils/              logger.js
└── index.js                Express app entry point
```

### Client
```
client/
└── src/
    ├── pages/
    │   ├── Login.jsx
    │   ├── student/        Dashboard, Receipts, Invoice
    │   └── finance/        Dashboard, ComputeFees, RecordPayment
    ├── components/         shared UI components
    ├── lib/
    │   └── supabase.js     Supabase client init
    ├── App.jsx             routing setup
    └── main.jsx
```

---

## Key Design Decisions

- **`student_id` is not owned by SFW.** It comes from the Student Registration Management (SRM) subsystem. SFW never generates or assigns student IDs — it only receives and stores them as a reference. When fee computation is triggered, SRM provides the student ID and SFW uses it to create or look up the student's financial account.

---

## Database Tables (to be created fresh in Supabase SQL Editor)

```sql
-- Student financial account
CREATE TABLE student_accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  VARCHAR NOT NULL UNIQUE,
  total_due   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_paid  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status      VARCHAR CHECK (status IN ('CLEARED', 'ON_HOLD')) DEFAULT 'ON_HOLD',
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    VARCHAR NOT NULL REFERENCES student_accounts(student_id),
  amount        NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  reference_no  VARCHAR NOT NULL UNIQUE,
  payment_date  DATE NOT NULL,
  recorded_by   VARCHAR NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Fee breakdown per enrollment
CREATE TABLE fee_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    VARCHAR NOT NULL REFERENCES student_accounts(student_id),
  tuition       NUMERIC(10,2),
  lab_fees      NUMERIC(10,2),
  other_charges NUMERIC(10,2),
  adjustments   NUMERIC(10,2) DEFAULT 0,
  computed_at   TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    VARCHAR,
  action        VARCHAR NOT NULL,
  performed_by  VARCHAR NOT NULL,
  details       JSONB,
  logged_at     TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Phases (Pending)

| Phase | Focus | Status |
|---|---|---|
| 0 | Database setup (Supabase + Prisma schema) | Done |
| 1 | Express backend scaffold (src/ structure, routes, middleware) | Pending |
| 2 | Fee computation (fetch SRM + CMS + CSS → compute) | Pending |
| 3 | Payment recording (validation, duplicate check, DB transaction) | Pending |
| 4 | Status evaluation + document generation (receipt, invoice) | Pending |
| 5 | Broadcast & notifications (SRM, CSS, U-ANAS) | Pending |
| 6 | Auth & RBAC (finance_staff vs student) | Pending |
| 7 | Next.js frontend (student view + finance staff view) | Pending |
| 8 | Error handling & activity logging | Pending |
