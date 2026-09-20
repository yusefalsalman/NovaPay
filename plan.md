# NovaPay — Engineering Roadmap & System Plan

## 📑 Table of Contents (Index)

1. [System Architecture & Core Principles](#1-system-architecture--core-principles)
2. [Database Schema & Indexes Specification](#2-database-schema--indexes-specification)
3. [Implementation Roadmap by Phase](#3-implementation-roadmap-by-phase)
   - [Phase 0: Database Hardening & Initial Migration](#phase-0-database-hardening--initial-migration)
   - [Phase 1: User & Wallet Management (JWT & Auto-Provisioning)](#phase-1-user--wallet-management-jwt--auto-provisioning)
   - [Phase 2: Instant P2P Transfers & Double-Entry Ledger](#phase-2-instant-p2p-transfers--double-entry-ledger)
   - [Phase 3: Top-Up & Payment Gateway (Stripe & Webhooks)](#phase-3-top-up--payment-gateway-stripe--webhooks)
   - [Phase 4: Transactions History & PDF Statements](#phase-4-transactions-history--pdf-statements)
   - [Phase 5: AI Financial Advisor (Google Gemini)](#phase-5-ai-financial-advisor-google-gemini)
4. [Current Project Status Tracker](#4-current-project-status-tracker)

---

## 1. System Architecture & Core Principles

- **Framework:** ASP.NET Core (.NET 10) Web API
- **Database:** PostgreSQL on Neon Serverless DB via `Npgsql.EntityFrameworkCore.PostgreSQL`
- **Documentation:** OpenAPI / Swagger UI via `Swashbuckle.AspNetCore`
- **Financial Integrity Principles:**
  - **Double-Entry Bookkeeping:** Every financial transaction creates balanced, immutable ledger entries (Debit and Credit).
  - **Zero Money Loss:** Cascade deletes on wallets, transactions, and ledger entries are strictly prohibited.
  - **Concurrency Control:** Optimistic locking via PostgreSQL row versioning prevents double-spending and race conditions during simultaneous requests.

---

## 2. Database Schema & Indexes Specification

### Entity Index & Constraints Reference:

| Entity | Field | Index Type | Constraint / Purpose |
| :--- | :--- | :--- | :--- |
| **User** | `Email` | **Unique Index** | Prevents duplicate accounts; fast login queries |
| **Wallet** | `AccountNumber` | **Unique Index** | Unique account identifier for P2P transfers |
| **Wallet** | `UserId` | **Unique Foreign Key** | Enforces 1-to-1 relationship with User |
| **Wallet** | `Balance` | Column Precision | `decimal(18, 4)` precision |
| **Wallet** | `Version` / `xmin` | Concurrency Token | Concurrency protection against race conditions |
| **Transaction** | `ReferenceId` | **Unique Index** | Idempotency key for tracking & reconciliation |
| **Transaction** | `Amount` | Column Precision | `decimal(18, 4)` precision |
| **LedgerEntry** | `(WalletId, CreatedAt)` | **Composite Index** | High-performance queries for user statements |
| **LedgerEntry** | `TransactionId` | **Index** | Fast lookup of entries for a transaction |
| **LedgerEntry** | `Amount` | Column Precision | `decimal(18, 4)` precision |

### Referential Integrity:
- `Wallet` ➔ `LedgerEntries`: `OnDelete(DeleteBehavior.Restrict)`
- `Transaction` ➔ `LedgerEntries`: `OnDelete(DeleteBehavior.Restrict)`

---

## 3. Implementation Roadmap by Phase

### Phase 0: Database Hardening & Initial Migration
- [ ] Configure `OnModelCreating` in `NovaPayDbContext` with all unique indexes, column precisions, and delete restrictions.
- [ ] Configure PostgreSQL concurrency token on `Wallet`.
- [ ] Register `RequestLoggingMiddleware` in `Program.cs`.
- [ ] Generate EF Core initial migration (`InitialCreate`).
- [ ] Push migration to Neon PostgreSQL database and verify tables.

### Phase 1: User & Wallet Management (JWT & Auto-Provisioning)
- [ ] Install `Microsoft.AspNetCore.Authentication.JwtBearer` & `BCrypt.Net-Next`.
- [ ] Setup JWT authentication and token issuance.
- [ ] Create DTOs (`RegisterDto`, `LoginDto`, `AuthResponseDto`).
- [ ] Implement `AuthService`:
  - Secure registration with password hashing.
  - Automatic creation of a `Wallet` with unique account number (e.g., `NP-XXXXXXXX`) and `0.00` balance.
- [ ] Implement `AuthController` and test via Swagger.

### Phase 2: Instant P2P Transfers & Double-Entry Ledger
- [ ] Create DTOs (`TransferRequestDto`, `TransferResponseDto`).
- [ ] Implement `TransferService` inside atomic `IDbContextTransaction`:
  - Verify sender balance & recipient account existence.
  - Deduct from sender (Debit) and add to recipient (Credit).
  - Record `Transaction` (Type: `Transfer`, Status: `Completed`).
  - Record two balanced `LedgerEntry` rows.
  - Handle `DbUpdateConcurrencyException` to stop double-spending.
- [ ] Implement `TransferController`.

### Phase 3: Top-Up & Payment Gateway (Stripe & Webhooks)
- [ ] Install `Stripe.net`.
- [ ] Implement `PaymentService` to generate Stripe `PaymentIntent`.
- [ ] Implement `StripeWebhookController`:
  - Verify webhook signature.
  - Handle `payment_intent.succeeded`: credit wallet balance and record official Top-Up `LedgerEntry`.

### Phase 4: Transactions History & PDF Statements
- [ ] Create `GET /api/transactions` with pagination & filtering.
- [ ] Integrate PDF library (`QuestPDF`).
- [ ] Implement receipt generation and monthly account statements export.

### Phase 5: AI Financial Advisor (Google Gemini)
- [ ] Integrate Google Gemini API.
- [ ] Implement financial advisor service to analyze user cash-flow and provide personalized budgeting recommendations.

---

## 4. Current Project Status Tracker

| Phase | Milestone | Status |
| :--- | :--- | :---: |
| **Phase 0** | Models & DbContext Setup | ✅ Completed |
| **Phase 0** | Fluent API Indexes & Constraints | ⏳ Next |
| **Phase 0** | Neon DB Initial Migration | ⏳ Pending |
| **Phase 1** | JWT Authentication & Password Hashing | ⏳ Pending |
| **Phase 1** | Automatic Wallet Generation | ⏳ Pending |
| **Phase 2** | P2P Transfers & Concurrency Control | ⏳ Pending |
| **Phase 2** | Double-Entry Ledger Engine | ⏳ Pending |
| **Phase 3** | Stripe Top-Up & Webhook Receiver | ⏳ Pending |
| **Phase 4** | Transaction Queries & Pagination | ⏳ Pending |
| **Phase 4** | PDF Receipts & Statements Generator | ⏳ Pending |
| **Phase 5** | Google Gemini Financial Advisor | ⏳ Pending |
