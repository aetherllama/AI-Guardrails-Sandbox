# AI Guardrails Sandbox

> **An interactive playground for the Foundational Agentic Governance Framework for Financial Services (FAGF-FS)**

[![FAGF-FS Compliant](https://img.shields.io/badge/FAGF--FS-Compliant-emerald)](https://github.com/aetherllama/ai-fin-stack-specification)
[![MAS Aligned](https://img.shields.io/badge/MAS-Aligned-blue)](https://www.mas.gov.sg/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What Is This?

The **AI Guardrails Sandbox** is a browser-based demonstration and testing environment for the **FAGF-FS** governance framework — a deterministic validation layer designed to sit between an autonomous AI agent and any financial execution system.

The core problem it solves: **AI agents are probabilistic. Financial systems are not.** An LLM might "decide" to make a payment that violates compliance rules, exceeds spending limits, or leaks PII in its reasoning trace. FAGF-FS provides a hard, non-negotiable enforcement layer that intercepts every proposed transaction before it executes.

This sandbox lets you:
- **Explore** how the governance engine works through an interactive dashboard
- **Test** real transaction scenarios against a live mandate stack
- **Configure** mandate parameters and see enforcement decisions change in real time

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent / LLM                          │
│         (proposes a transaction with reasoning)             │
└─────────────────────────┬───────────────────────────────────┘
                          │  GovernanceEnvelope
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  FAGF-FS Validator                          │
│                                                             │
│  1. Categorical Blocklist  →  HARD BLOCK                    │
│  2. New Merchant Auth      →  HITL Required                 │
│  3. Daily Hard Cap         →  HARD BLOCK                    │
│  4. Confirmation Threshold →  HITL Required                 │
│  5. Rate Limiting          →  HITL Required                 │
│  6. Cooldown Period        →  HITL Required                 │
│  7. Payment Channel Filter →  HITL Required                 │
│  8. MAS Licensed Activity  →  HARD BLOCK                    │
│  9. NRIC/PII Detection     →  HARD BLOCK                    │
│  10. Content Safety        →  HARD BLOCK                    │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
     ✅ APPROVED            ⏸ HITL / 🚫 BLOCKED
     (autonomous)          (human review / rejected)
```

### The Three Enforcement Tiers

| Tier | Outcome | When |
|------|---------|------|
| **✅ Autonomous** | Transaction proceeds without human review | All mandates pass |
| **⏸ HITL Required** | Transaction paused, human must approve | Spending limits, new merchants, velocity |
| **🚫 Hard Block** | Transaction rejected immediately | Forbidden categories, PII, unlicensed activity |

---

## Core Concepts

### Governance Envelope
Every transaction proposed by an AI agent must be wrapped in a `GovernanceEnvelope` — a structured data object containing:
- **Transaction details**: amount, destination, merchant, category, payment method
- **Agent reasoning**: the AI's explanation for why it wants to make this payment
- **Context**: whether the merchant is new, transaction history depth, risk score

### Mandates
Mandates are deterministic rules — the "laws" of the governance system. Unlike probabilistic AI guardrails, mandates always produce the same outcome for the same input. They are organized into four vectors:

| Vector | Mandates | Purpose |
|--------|----------|---------|
| **Authorization** | New Merchant Auth, Allowed Payment Methods | *Who* is involved |
| **Spending** | Confirmation Threshold, Daily Hard Cap | *How much* is at risk |
| **Velocity** | Rate Limit (tx/hr), Cooldown (seconds) | *How fast* the agent is moving |
| **Content & Category** | Blocked Categories, NRIC Redaction, Content Safety | *What* is being requested |

### Mandates vs. Guardrails
A key distinction in the FAGF-FS specification:

| | Mandate | Guardrail |
|---|---------|-----------|
| **Nature** | Deterministic | Probabilistic |
| **Enforced by** | FAGF-FS Validator | LLM Gateway / Filter |
| **Function** | Ensures the AI *does* the legal thing | Ensures the AI *says* the right thing |
| **Example** | Block all "Ungoverned Gambling" transactions | Don't generate harmful content |

---

## Project Structure

```
src/
├── App.tsx                    # Main app shell, navigation, state management
│
└── core/                      # The FAGF-FS governance engine
    ├── types.ts               # Core type definitions (GovernanceEnvelope, ValidationResult, etc.)
    ├── mandates.ts            # Standard FAGF-FS mandate configuration (MAS-aligned)
    ├── customMandates.ts      # Extended mandates: Singapore MAS rules + Content Safety
    ├── scenarios.ts           # Pre-built demo transaction scenarios
    ├── validator.ts           # The deterministic validation engine
    └── validator.test.ts      # Vitest unit tests for the validator
```

### Key Files

#### `core/validator.ts`
The heart of the system. `GovernanceValidator.validate()` takes a `GovernanceEnvelope`, a mandate stack, and transaction history, then runs through each check in priority order. The first failing mandate short-circuits the evaluation and returns a `ValidationResult`.

#### `core/mandates.ts`
The default mandate configuration, aligned with MAS (Monetary Authority of Singapore) TRM guidelines. All parameters are tunable:
- `confirmationThreshold`: $1,000 — transactions above this require human approval
- `dailyAggregateLimit`: $5,000 — hard cap on total daily spend
- `rateLimitPerHour`: 10 transactions/hour
- `cooldownSeconds`: 60 seconds between transactions
- `blockedCategories`: `['Ungoverned Gambling', 'High-Risk Investment', 'Adult Entertainment']`

#### `core/customMandates.ts`
Singapore-specific extensions:
- **`masLicensedActivity`**: Blocks financial activities not licensed under MAS (e.g., unlicensed crypto trading)
- **`nricRedaction`**: Regex-based PII detection — blocks any payload containing a Singapore NRIC/FIN number in plaintext
- **`profanityFilter`**: Content safety keyword blocklist (scam, phishing, etc.)

#### `core/scenarios.ts`
Eight pre-built test scenarios covering the full enforcement spectrum:

| Scenario | Expected Outcome | Mandate Triggered |
|----------|-----------------|-------------------|
| Standard Subscription | ✅ Approved | — |
| High-Value Purchase ($2,500) | ⏸ HITL | Confirmation Threshold |
| NRIC Leaked in Reasoning | 🚫 Blocked | NRIC Redaction |
| Unlicensed Activity (Gambling) | 🚫 Blocked | Blocked Categories |
| Content Safety Violation | 🚫 Blocked | Profanity Filter |
| Office Supplies | ✅ Approved | — |
| Utility Bill Payment | ✅ Approved | — |
| Team Lunch Expense | ✅ Approved | — |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests

```bash
# Run the validator unit tests
npx vitest run src/core/validator.test.ts

# Run all tests in watch mode
npx vitest
```

### Build for Production

```bash
npm run build
```

---

## The Three Views

### 📊 Dashboard
An overview of the FAGF-FS architecture — the three-layer defense model, mandate categories, and how the enforcement tiers work. Good starting point for understanding the system.

### 🧪 Interactive Playground
The main testing interface. Select a pre-built scenario or craft a custom transaction, then run it through the live validator. Results show:
- The enforcement decision (Approved / HITL / Blocked)
- Which specific mandate was triggered
- The risk disclosure for that mandate
- The agent's reasoning trace

### ⚙️ Governance Mandates
Configure the active mandate stack. Toggle mandate groups on/off (Standard, Singapore, Content Safety) and adjust parameters. Changes take effect immediately on the next validation run.

---

## Regulatory Alignment

| Framework | Coverage |
|-----------|----------|
| **MAS TRM (Singapore)** | Sections 11 & 13 — Strong Authentication, Transaction Integrity |
| **MAS PDPA** | NRIC/FIN PII detection and redaction in agent reasoning |
| **MAS Project Guardian** | Purpose-bound spending via category and merchant mandates |
| **EU AI Act** | Human-in-the-Loop (HITL) for high-risk financial decisions |
| **NIST AI RMF 1.0** | "Govern" and "Measure" functions via mandate audit trails |

---

## Related Projects

| Project | Description |
|---------|-------------|
| [fagf-fs-core](https://github.com/aetherllama/fagf-fs-core) | Production-grade FAGF-FS implementation with full mandate editor UI |
| [ai-fin-stack-specification](https://github.com/aetherllama/ai-fin-stack-specification) | The master technical specification for the AI-Fin Stack |

---

## Tech Stack

- **React 19** + **TypeScript** — UI and type safety
- **Vite** — Build tooling
- **Tailwind CSS v4** — Styling
- **Framer Motion** — Animations
- **Vitest** — Unit testing
- **Lucide React** — Icons
