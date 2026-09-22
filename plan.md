# NovaPay — Modern FinTech Digital Wallet & Ledger Engine

## Comprehensive Implementation & Architecture Plan

---

## 1. Executive Summary & Core Objectives

**NovaPay** is an enterprise-grade digital wallet and peer-to-peer (P2P) payment platform designed according to strict financial accounting and distributed systems standards.

### Primary Engineering Pillars

1. **Immutable Double-Entry Bookkeeping Ledger**:
   - Zero direct mutation of balance columns (`balance = balance + x` is forbidden).
   - Every financial event consists of strictly balanced **Debit** and **Credit** journal entries ($\sum \text{Debits} = \sum \text{Credits}$).
   - Account balances are dynamically and deterministically aggregated from journal entries.
2. **High-Concurrency P2P Transfers & Race Condition Prevention**:
   - Prevention of double-spending and negative balances using database row-level locking (`SELECT ... FOR UPDATE` via EF Core raw queries or PostgreSQL transactions) and isolated ACID transaction blocks.
   - P2P transfers addressable via unique user tag (`@username`) or phone/email.
3. **Stripe Sandbox Wallet Top-Up & Idempotent Webhooks**:
   - Safe wallet deposits powered by Stripe `PaymentIntents` (Checkout/Custom payment flow in sandbox mode).
   - Webhook receiver with cryptographic signature verification (`Stripe-Signature`) and strict database idempotency tracking to withstand network retries and replay attacks.
4. **AI-Powered Financial Insights (Google Gemini)**:
   - Automated categorization of expenses and spending trends.
   - Natural language budgeting advice and anomalies detection powered by Google Gemini API.
5. **Clean Architecture & Scalable Tech Stack**:
   - Backend: ASP.NET Core Web API (.NET 10), C#, Entity Framework Core, Npgsql, FluentValidation.
   - Database: PostgreSQL 16+ (ACID, row-level locks, `numeric(18,4)` monetary precision).
   - Frontend: React (TypeScript), Vite, Tailwind CSS, Lucide icons, Recharts.

---

## 2. Technology Stack & Key Packages

### Backend (.NET 10 Web API)

| Component             | Technology / NuGet Package                                                | Purpose                                                        |
| :-------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------- |
| **Framework**         | .NET 10 (LTS) ASP.NET Core Web API                                        | Core runtime and HTTP pipeline                                 |
| **Data Access / ORM** | `Microsoft.EntityFrameworkCore` & `Npgsql.EntityFrameworkCore.PostgreSQL` | Relational mapping, migrations, transaction coordination       |
| **Read Optimization** | `Dapper` _(optional for fast read projections)_                           | Micro-ORM for high-speed ledger aggregation queries            |
| **CQRS / Mediator**   | `MediatR`                                                                 | Loose coupling of requests, commands, and domain handlers      |
| **Validation**        | `FluentValidation.AspNetCore`                                             | Strict payload assertion and business invariant checks         |
| **Payments SDK**      | `Stripe.net`                                                              | Stripe PaymentIntent creation and Webhook signature validation |
| **AI Integration**    | `Google.GenAI` or `HttpClient` with Gemini REST API                       | Generating spending insights and recommendations               |
| **Authentication**    | `Microsoft.AspNetCore.Authentication.JwtBearer`                           | Stateless token validation with security claims                |
| **Password Hashing**  | `Microsoft.AspNetCore.Identity` or Argon2/BCrypt                          | Secure credential hashing                                      |
| **Documentation**     | `Scalar.AspNetCore` or Swashbuckle OpenAPI                                | Modern API exploration and test playground                     |

### Database

- **PostgreSQL 16+**: High performance, native row locking (`FOR UPDATE`), JSONB support for transaction metadata, and strict numeric data types.

### Frontend

- **Runtime & Tooling**: Node.js, Vite, TypeScript.
- **UI Framework**: React 19 / 18.
- **Styling**: Tailwind CSS.
- **Icons & Visuals**: `lucide-react`, `recharts` for financial charts.
- **HTTP & State**: `axios` (with JWT interceptors), `@tanstack/react-query` or React Context / Zustand.

---

## 3. System Architecture & Project Structure

The project is structured under **Clean Architecture** to decouple core financial rules from third-party payment rails and database providers.

```
NovaPay/
├── src/
│   ├── NovaPay.Domain/                # Pure C# (No dependencies)
│   │   ├── Entities/                  # User, Wallet, Account, Transaction, JournalEntry, WebhookDelivery
│   │   ├── Enums/                     # AccountType, TransactionType, TransactionStatus, EntryType
│   │   ├── ValueObjects/              # Money, Currency, UserTag
│   │   ├── Exceptions/                # InsufficientFundsException, ConcurrencyException
│   │   └── Events/                    # TransferCompletedEvent, WalletFundedEvent
│   │
│   ├── NovaPay.Application/           # Application Business Logic
│   │   ├── Common/                    # Interfaces (IUnitOfWork, ICurrentUserService, IStripeService, IGeminiService)
│   │   ├── Behaviors/                 # MediatR ValidationBehavior, LoggingBehavior
│   │   └── Features/
│   │       ├── Auth/                  # Commands (Register, Login)
│   │       ├── Wallets/               # Queries (GetWalletSummary, GetBalance)
│   │       ├── Transactions/          # Commands (TransferFunds, FundWalletViaStripe)
│   │       ├── Webhooks/              # Commands (ProcessStripeWebhook)
│   │       └── Insights/              # Queries (GetAiFinancialInsights)
│   │
│   ├── NovaPay.Infrastructure/        # Data & External Integrations
│   │   ├── Persistence/
│   │   │   ├── NovaPayDbContext.cs    # EF Core DbContext
│   │   │   ├── Configurations/        # Fluent API entity configs (Indexes, Precision)
│   │   │   └── Migrations/            # EF Core Migrations
│   │   ├── Services/
│   │   │   ├── StripeService.cs       # PaymentIntent builder & webhook constructor
│   │   │   ├── GeminiAiService.cs     # Prompt engineer & Gemini API caller
│   │   │   └── JwtTokenGenerator.cs   # Claims & token generation
│   │   └── Repositories/              # Account & Transaction Repositories
│   │
│   └── NovaPay.API/                   # Presentation Layer (HTTP Host)
│       ├── Controllers/               # Auth, Wallets, Transfers, Payments, Insights, Webhooks
│       ├── Middleware/                # ExceptionHandlingMiddleware, RequestLoggingMiddleware
│       ├── Extensions/                # ServiceCollectionExtensions
│       ├── appsettings.json           # Configurations (DB connection, Stripe keys, Gemini keys)
│       └── Program.cs                 # ASP.NET Core entry point
│
├── client/                            # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/                # BalanceCard, TransferModal, SpendingChart, Header
│   │   ├── pages/                     # Dashboard, Transfers, Deposit (Stripe), Insights, Login
│   │   ├── services/                  # api.ts (Axios), stripe.ts
│   │   └── types/                     # API contracts & DTOs
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── tests/
│   ├── NovaPay.UnitTests/             # Domain & Ledger invariant unit tests
│   └── NovaPay.IntegrationTests/      # Concurrency & Webhook idempotency tests
├── docker-compose.yml                 # PostgreSQL service container
└── PLAN.md                            # This plan
```

---

## 4. Ledger Design & Database Schema

### 4.1 The Double-Entry Rule

Every transaction has at least **two** entries:

- **Debit (DR)**: Destination / Increase in Assets or decrease in Liabilities.
- **Credit (CR)**: Source / Decrease in Assets or increase in Liabilities.

$$\text{User Asset Balance} = \sum(\text{Credits from external}) - \sum(\text{Debits to outgoing}) \quad \text{or vice-versa depending on standard chart convention.}$$
_In NovaPay's User Asset Model:_

- **CREDIT**: Inflow of money into user account (Top-up, received transfer).
- **DEBIT**: Outflow of money from user account (Sent transfer, payment, fee).
- **Balance formula**: $\text{Balance} = \sum(\text{Credits}) - \sum(\text{Debits})$.

### 4.2 Database Tables Specification

```sql
-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_tag VARCHAR(50) UNIQUE NOT NULL, -- e.g. @yousef
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(500) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Wallets
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Accounts (Ledger Accounts: User Asset, System Settlement, Stripe Clearing)
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    wallet_id UUID NULL REFERENCES wallets(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL, -- 'UserAsset', 'StripeClearing', 'SystemEscrow', 'PlatformFee'
    name VARCHAR(100) NOT NULL,
    is_system_account BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Transactions (Grouping header for audit trail & idempotency)
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    initiated_by_user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'StripeDeposit', 'P2PTransfer', 'FeeCharge'
    status VARCHAR(50) NOT NULL, -- 'Pending', 'Succeeded', 'Failed'
    amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reference_note VARCHAR(255),
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);

-- 5. Journal Entries (The immutable Double-Entry record)
CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    entry_type VARCHAR(10) NOT NULL, -- 'DEBIT' or 'CREDIT'
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Processed Webhooks (Stripe Idempotency & Replay Defense)
CREATE TABLE processed_webhooks (
    id VARCHAR(255) PRIMARY KEY, -- Stripe Event ID (e.g. evt_xxx)
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload_checksum VARCHAR(100) NULL
);
```

### 4.3 High-Performance Indexing Strategy

```sql
-- Fast balance calculation per account:
CREATE INDEX idx_journal_entries_account_calc
ON journal_entries(account_id, entry_type)
INCLUDE (amount);

-- Enforce strict unique idempotency:
CREATE UNIQUE INDEX idx_transactions_idempotency
ON transactions(idempotency_key);

-- P2P lookups:
CREATE INDEX idx_users_tag
ON users(user_tag);
```

---

## 5. Critical Technical Workflows & Engineering Patterns

### 5.1 High-Concurrency P2P Transfer (Preventing Race Conditions)

When User A transfers \$100 to User B:

1. **Idempotency Verification**: Check if `IdempotencyKey` already exists in `transactions`. If so, return previous response immediately.
2. **Begin Explicit DB Transaction** with `IsolationLevel.ReadCommitted` or `RepeatableRead`.
3. **Pessimistic Row Lock (`FOR UPDATE`)**:
   - Query Sender Account with pessimistic lock to prevent parallel transactions from modifying the state:
   ```csharp
   var senderAccount = await _context.Accounts
       .FromSqlInterpolated($"SELECT * FROM accounts WHERE id = {senderAccountId} FOR UPDATE")
       .SingleOrDefaultAsync(ct);
   ```
4. **Aggregate Live Balance**:
   - Calculate balance from `journal_entries` within the locked context:
     $$\text{Balance} = \sum(\text{Credit}) - \sum(\text{Debit})$$
5. **Assertion**: Verify $\text{Balance} \ge \text{TransferAmount}$. If insufficient, throw `InsufficientFundsException` and abort.
6. **Double-Entry Append**:
   - Create `Transaction` entity with status `Succeeded`.
   - Add Entry 1: Account = Sender, EntryType = `DEBIT`, Amount = \$100.
   - Add Entry 2: Account = Recipient, EntryType = `CREDIT`, Amount = \$100.
7. **Commit Transaction**: Automatically releases the row lock.

### 5.2 Stripe Sandbox Wallet Top-Up & Idempotent Webhooks

1. **Client Intent**: Client requests `POST /api/payments/create-deposit-intent` with `{ amount: 50.00 }`.
2. **Stripe Session**:
   - Backend calls Stripe API: `PaymentIntentService.CreateAsync(...)`.
   - Attaches `metadata: { "userId": user.Id, "walletId": wallet.Id, "idempotencyKey": ... }`.
   - Returns `clientSecret` to frontend.
3. **Frontend Confirmation**: Frontend uses Stripe Elements / test card (`4242...`) to authorize payment.
4. **Webhook Processing (`/api/webhooks/stripe`)**:
   - **Signature Verification**: Validate `Stripe-Signature` using endpoint secret:
     `EventUtility.ConstructEvent(rawBody, signature, webhookSecret)`.
   - **Idempotency Guard**:
     ```sql
     INSERT INTO processed_webhooks (id, event_type)
     VALUES (stripeEvent.Id, stripeEvent.Type)
     ON CONFLICT (id) DO NOTHING;
     ```
     If duplicate, immediately return `HTTP 200 OK` without re-crediting the wallet.
   - **Ledger Recording**:
     - Debit: `StripeClearingAccount` (System).
     - Credit: User's `UserAssetAccount`.
     - Mark transaction as `Succeeded`.

### 5.3 Gemini AI Financial Assistant

1. **Data Aggregation**: Retrieve user transactions over the last 30 to 90 days.
2. **Contextual Tokenization**: Aggregate by categories, counterparties, and spending frequency.
3. **Prompt Architecture**:
   - System: `"You are NovaPay AI, a certified FinTech financial advisory engine. Analyze transaction patterns strictly based on provided structured ledger data. Deliver categorical breakdowns, abnormal spend alerts, and 3 high-impact budgeting strategies."`
   - User Payload: JSON string of categorized inflows and outflows.
4. **Response Delivery**: Parsed JSON structured output with clean insights displayed on the React analytics dashboard.

---

## 6. End-to-End API Specification

| Area           | HTTP Method | Route                                | Description                                | Auth Required |
| :------------- | :---------- | :----------------------------------- | :----------------------------------------- | :------------ |
| **Auth**       | `POST`      | `/api/v1/auth/register`              | Register user, creates wallet & accounts   | No            |
| **Auth**       | `POST`      | `/api/v1/auth/login`                 | Returns JWT access token & user profile    | No            |
| **Wallet**     | `GET`       | `/api/v1/wallets/me`                 | Fetch wallet metadata and computed balance | Yes (JWT)     |
| **Wallet**     | `GET`       | `/api/v1/wallets/ledger-history`     | Paginated journal entries / statements     | Yes (JWT)     |
| **Transfers**  | `POST`      | `/api/v1/transfers`                  | P2P transfer with `Idempotency-Key` header | Yes (JWT)     |
| **Transfers**  | `GET`       | `/api/v1/users/search?query=tag`     | Find recipient by tag or email             | Yes (JWT)     |
| **Stripe**     | `POST`      | `/api/v1/payments/create-intent`     | Initiates deposit PaymentIntent            | Yes (JWT)     |
| **Stripe**     | `POST`      | `/api/v1/webhooks/stripe`            | Raw webhook receiver with signature guard  | Stripe Secret |
| **AI Advisor** | `GET`       | `/api/v1/insights/spending-analysis` | Trigger Gemini analysis on user ledger     | Yes (JWT)     |

---

## 7. Frontend User Experience & Screen Flows

```
[Login / Register]
       │
       ▼
[Dashboard Layout]
 ├── Balance Card (Live balance, currency tag, quick deposit button)
 ├── Quick P2P Transfer Modal (Recipient @tag lookup, instant validation)
 ├── Stripe Deposit Modal (Stripe Card Element / Sandbox Top-up)
 ├── Spending Analytics (Recharts Area/Pie breakdown)
 ├── AI Insights Drawer ("NovaPay Advisor" suggestions & budget breakdown)
 └── Ledger Statement Table (Paginated transactions, Debit/Credit badges)
```

---

## 8. Step-by-Step Implementation Roadmap

### Phase 1: Environment & Architecture Setup

- [ ] Initialize Git repository and `.gitignore`.
- [ ] Spin up PostgreSQL using Docker:
  ```bash
  docker run --name novapay-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=novapay -p 5432:5432 -d postgres:16
  ```
- [ ] Scaffold .NET solution with Clean Architecture:
  - `NovaPay.Domain`, `NovaPay.Application`, `NovaPay.Infrastructure`, `NovaPay.API`.
- [ ] Configure `DbContext` with Npgsql, connect to database, and test migration.

### Phase 2: Domain Modeling & Double-Entry Ledger Core

- [ ] Model `User`, `Wallet`, `Account`, `Transaction`, `JournalEntry`.
- [ ] Configure EF Core Entity Mappings (Precision `numeric(18,4)`, unique indexes, cascades).
- [ ] Write the Ledger Query Service:
  - Compute balance via SQL aggregation of debits and credits.
- [ ] Implement user registration flow:
  - Auto-generate Wallet + Personal UserAsset account upon registration.
  - Seed System Accounts (`StripeClearing`, `SystemSettlement`).

### Phase 3: High-Concurrency P2P Transfer Engine

- [ ] Implement `TransferFundsCommand` with MediatR.
- [ ] Add `FluentValidation` (Prevent self-transfer, non-positive amounts, invalid tags).
- [ ] Implement **Pessimistic Locking** (`SELECT ... FOR UPDATE`) in the transaction pipeline.
- [ ] Wrap in strict atomic Database Transactions.
- [ ] Implement and test `Idempotency-Key` handling.

### Phase 4: Stripe Sandbox Payment Integration

- [ ] Configure Stripe API keys (`SecretKey`, `PublishableKey`, `WebhookSecret`) in `appsettings.json`.
- [ ] Implement `/api/v1/payments/create-intent` endpoint.
- [ ] Implement `/api/v1/webhooks/stripe` endpoint with raw body stream and signature validation.
- [ ] Build idempotent webhook handler to credit user ledger upon `payment_intent.succeeded`.

### Phase 5: Google Gemini AI Financial Insights

- [ ] Set up Google Gemini API client.
- [ ] Build a service that queries user ledger summaries for the past 30 days.
- [ ] Construct targeted financial advisor prompts requesting categorized spend analysis and saving recommendations.
- [ ] Expose `/api/v1/insights/spending-analysis` endpoint.

### Phase 6: React Frontend (TypeScript + Tailwind)

- [ ] Initialize Vite project with React + TypeScript.
- [ ] Configure Tailwind CSS.
- [ ] Build Auth pages (Login, Register with @user_tag).
- [ ] Build Dashboard with Balance display and Ledger transaction history.
- [ ] Integrate Stripe Elements for the Deposit flow.
- [ ] Add Transfer Dialog with real-time recipient lookup.
- [ ] Add Recharts visualization and Gemini AI Advisory panel.

### Phase 7: Verification & Concurrency Testing

- [ ] Unit test: Verify Double-Entry Balance Invariant ($\sum \text{Debits} = \sum \text{Credits}$).
- [ ] Concurrency test: Trigger 10 parallel transfer requests of \$50 against a single \$50 account balance; verify exactly 1 succeeds and 9 fail with `InsufficientFundsException`.
- [ ] Webhook replay test: Send identical Stripe webhook events twice; verify balance is credited only once.
