# Student Finance Wallet (SFW)

A payment recording and financial status management system built as part of the **Intelligent Academic Ecosystem (IAE)** — a multi-team integration project. SFW is responsible for recording student payments, maintaining running balances, and broadcasting financial clearance status to dependent subsystems.

---

## What the System Does

The Student Finance Wallet acts as the central payment recording system for finance staff. When a student comes in to pay, the finance staff looks up their student ID — the system verifies the student exists through SRM and pulls their profile. The staff then sets how much the student owes and records the payment with the amount, date, reference number, and payment method. Once saved, the system updates the student's running balance, determines whether the student is cleared or on hold, and automatically generates a PDF receipt. Other subsystems like CSS and U-ANAS can query the student's financial status and payment notifications from us at any time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v3 |
| Backend | Express 5, Node.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Validation | Zod |
| PDF Generation | jsPDF |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

---

## System Architecture

```
Finance Staff (Browser)
        │
        ▼
   Vercel (React)
        │
        ▼
  Railway (Express)
        │
   ┌────┴────────────┐
   │                 │
   ▼                 ▼
Supabase        ESB (RabbitMQ)
(PostgreSQL)         │
                     ▼
                    SRM
                (Student Registry)

CSS ──────GET──────▶ SFW /api/students/:id/status
U-ANAS ───GET──────▶ SFW /api/payments/notif
```

---

## Database Tables

### `student_accounts`
Tracks each student's financial record.
| Column | Type | Notes |
|---|---|---|
| student_id | text | Primary key, sourced from SRM |
| student_name | text | Populated from SRM on first lookup |
| program | text | Populated from SRM on first lookup |
| email | text | Populated from SRM on first lookup |
| total_due | numeric | Set manually by finance staff |
| total_paid | numeric | Auto-updated on each payment |
| status | text | `CLEARED` or `ON_HOLD` |
| updated_at | timestamptz | Updated on every change |

### `payment_transactions`
Immutable log of every recorded payment.
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| student_id | text | References student_accounts |
| amount | numeric | Payment amount |
| payment_date | date | Date of payment |
| reference_no | text | Unique transaction reference |
| payment_method | text | GCASH, MAYA, ONLINE_BANK, MANUAL |
| recorded_by | text | Email of finance staff who recorded it |
| status | text | Always `CLEARED` |
| created_at | timestamptz | Auto-set by DB |

### `activity_logs`
Audit trail of all system actions.
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| student_id | text | Student involved |
| action | text | PAYMENT_RECORDED, TOTAL_DUE_UPDATED |
| performed_by | text | Email of finance staff |
| details | jsonb | Action-specific metadata |
| logged_at | timestamptz | Manila time (PHT) |

### `payment_notifications`
Notification feed consumed by U-ANAS via the ESB.
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| event | text | PAYMENT_RECORDED, STATUS_CHANGED |
| student_id | text | Student involved |
| payload | jsonb | Full event data |
| created_at | timestamptz | Auto-set by DB |

---

## Status Logic

A student's status is automatically computed on every payment recorded or total due update:

```
CLEARED  → total_due > 0 AND total_paid >= total_due
ON_HOLD  → everything else
```

---

## Processing Flow

1. Finance staff logs in with email and password
2. Finance staff enters a student ID — system verifies student exists via SRM and retrieves their profile
3. Finance staff sets the student's total due amount
4. Finance staff enters payment details (amount, date, reference number, payment method) and submits
5. System records the transaction, updates the running balance, and recalculates the student's status
6. A PDF receipt is automatically generated and downloaded
7. Payment notification is written to `payment_notifications` for U-ANAS to consume
8. CSS and U-ANAS can query the student's current status at any time

---

## API Reference

### Authentication
All protected routes require a Supabase JWT passed as `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | null | Sign in with email and password |

### Students
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/students/:studentId` | finance_staff | Lookup student via SRM, auto-creates account if new |
| PATCH | `/api/students/:studentId/total-due` | finance_staff | Set student's total due amount |
| GET | `/api/students/:studentId/status` | null | Returns student's CLEARED or ON_HOLD status |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments` | finance_staff | Record a payment |
| GET | `/api/payments/recent` | finance_staff | Fetch recent payment ledger |
| GET | `/api/payments/today-total` | finance_staff | Today's total collected and count |
| GET | `/api/payments/export` | finance_staff | Export payments as CSV |
| GET | `/api/payments/notif` | null | All payment notifications |
| GET | `/api/payments/notif/:studentId` | null | Notifications for a specific student |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | finance_staff | Dashboard stats and weekly trends |
| GET | `/api/admin/activity-logs` | finance_staff | Paginated activity audit log |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | null | Server health check |

---

## External Integrations

| System | Direction | Endpoint | Auth | Purpose |
|---|---|---|---|---|
| SRM | We call SRM | `GET /api/esb/srm/students/:studentId` | null | Verify student exists and retrieve profile |
| CSS | CSS calls us | `GET /api/students/:studentId/status` | null | CSS checks if student is cleared before allowing course shift |
| U-ANAS | U-ANAS calls us | `GET /api/payments/notif` | null | U-ANAS polls payment notifications |

All ESB calls route through `https://esb-cjnx.onrender.com`.

---

## Environment Variables

### Backend (Railway)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `CLIENT_URL` | Vercel frontend URL (no trailing slash) |
| `PORT` | Auto-set by Railway |

### Frontend (Vercel)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Railway backend URL |

---

## Deployment

- **Frontend:** Vercel — root directory set to `/client`, build command `npm run build`, output `dist`
- **Backend:** Railway — root directory set to `/server`
- **Database:** Supabase (hosted PostgreSQL)
