# NovaPay — Project Index & Roadmap Tracker

## 📑 Complete System Index

### ✅ Phase 0: Database Hardening & Infrastructure _(COMPLETED)_

- [x] **0.1** Domain Models Created (`User`, `Wallet`, `Transaction`, `LedgerEntry`)
- [x] **0.2** Fluent API Configuration in `NovaPayDbContext`:
  - Unique Indexes on `User.Email`, `Wallet.AccountNumber`, `Transaction.ReferenceId`
  - High-performance Composite Indexes on `LedgerEntry`
  - Financial Decimal Precision `(18, 4)`
  - Concurrency Token mapped to PostgreSQL `xmin`
  - `DeleteBehavior.Restrict` on ledger & financial records
- [x] **0.3** Custom Middlewares (`GlobalExceptionMiddleware`, `RequestLoggingMiddleware`)
- [x] **0.4** EF Core Initial Migration applied to Neon PostgreSQL
- [x] **0.5** Git Repository initialized, clean `.gitignore`, and pushed to GitHub

---

### ✅ Phase 1: User & Wallet Management _(COMPLETED)_

- [x] **1.1** Security Packages installed (`BCrypt.Net-Next`, `Microsoft.AspNetCore.Authentication.JwtBearer`)
- [x] **1.2** JWT Configuration & Swagger Bearer Authentication setup
- [x] **1.3** DTOs created (`RegisterRequest`, `LoginRequest`, `AuthResponse`)
- [x] **1.4** `IAuthService` & `AuthService` implemented:
  - BCrypt password hashing
  - Automated `Wallet` creation (`NP-2026-XXXXXX` with `0.00` balance)
  - JWT generation with claims (`NameIdentifier`, `Email`, `Name`)
  - Eager-loading `Wallet` on login via `.Include(u => u.Wallet)`
- [x] **1.5** `AuthController` with `/register`, `/login`, and protected `[Authorize] /me`
- [x] **1.6** Dependency Injection registered in `Program.cs` and verified

### ✅ Phase 2: Instant P2P Transfers & Double-Entry Ledger _(COMPLETED)_

- [x] **2.1** Create Transfer DTOs (`TransferRequest`, `TransferResponse`)
- [x] **2.2** Implement `ITransferService` & `TransferService`:
  - Executed within atomic `IDbContextTransaction`
  - Validates sender balance and verifies recipient existence (by Account Number or Email)
  - Performs Double-Entry accounting:
    - Master `Transaction` (Type: `Transfer`, Status: `Completed`)
    - `Debit` LedgerEntry (Deduct from sender with `BalanceAfter`)
    - `Credit` LedgerEntry (Add to recipient with `BalanceAfter`)
  - Concurrency protection against race conditions (`DbUpdateConcurrencyException`)
- [x] **2.3** Implement `TransferController` (Protected with `[Authorize]`)
- [x] **2.4** Registered DI in `Program.cs` and verified compilation

---

### 🛑 📍 WE ARE STOPPED HERE 📍 🛑

---

### ⏳ Phase 3: External Top-Up & Gateway (Stripe) _(NEXT STEP)_

- [ ] **3.1** Install `Stripe.net` and configure API keys
- [ ] **3.2** Implement `PaymentService` to create Stripe `PaymentIntent`
- [ ] **3.3** Implement `StripeWebhookController` (`payment_intent.succeeded` handler)

---

### ⏳ Phase 4: Transaction History & PDF Statements _(PENDING)_

- [ ] **4.1** `GET /api/transactions` with pagination and date/type filters
- [ ] **4.2** PDF generation engine (`QuestPDF`) for receipts and monthly statements

---

### ⏳ Phase 5: AI Financial Advisor (Google Gemini) _(PENDING)_

- [ ] **5.1** Integrate Google Gemini API
- [ ] **5.2** Analyze cash flow patterns and generate personalized budget advice
