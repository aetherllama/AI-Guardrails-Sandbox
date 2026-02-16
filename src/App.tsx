import { useState } from 'react';
import { Shield, Activity, Lock, FlaskConical } from 'lucide-react';
import { GovernanceValidator } from './core/validator';
import { STANDARD_MANDATES } from './core/mandates';
import { SINGAPORE_MANDATES, CONTENT_SAFETY_MANDATES } from './core/customMandates';
import { DEMO_SCENARIOS } from './core/scenarios';
import type { DemoScenario } from './core/scenarios';
import type { GovernanceEnvelope, ValidationResult } from './core/types';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_MANDATES = { ...STANDARD_MANDATES, ...SINGAPORE_MANDATES, ...CONTENT_SAFETY_MANDATES };

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'interactive'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div>
                <span className="text-xl font-bold tracking-tight">AI Guardrails Sandbox</span>
                <span className="ml-2 text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                  FAGF-FS Compliant
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'dashboard'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('interactive')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'interactive'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                Interactive Playground
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'interactive' && <InteractiveView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Active Mandates</h3>
          </div>
          <div className="space-y-3">
            {Object.values(ALL_MANDATES).map((mandate) => (
              <div key={mandate.id} className="flex items-start justify-between text-sm">
                <span className="text-slate-600">{mandate.description}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mandate.severity === 'high' ? 'bg-red-50 text-red-700' :
                  mandate.severity === 'medium' ? 'bg-amber-50 text-amber-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                  {mandate.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">System Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Validator Engine</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Framework Version</span>
              <span className="text-slate-900 font-mono text-sm">1.0.0-Stabilized</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active Mode</span>
              <span className="text-slate-900 text-sm">Strict Enforcement</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold">Security Overview</h3>
          </div>
          <p className="text-slate-300 text-sm mb-4">
            The FAGF-FS Validator is enforcing 7 active mandates across authorization, spending, and velocity vectors.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-slate-400">Coverage</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">0ms</div>
              <div className="text-xs text-slate-400">Latency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveView() {
  const [envelope, setEnvelope] = useState<GovernanceEnvelope>({
    transaction: {
      amount: 500,
      destination: '0x123...abc',
      merchantName: 'Trusted Vendor Inc',
      category: 'Software Subscription',
      timestamp: Date.now(),
      paymentMethod: 'Credit Card'
    },
    reasoning: 'Monthly subscription renewal',
    context: {
      isNewMerchant: false,
      historyDepth: 12,
      riskScore: 0.1
    }
  });

  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleRunValidation = () => {
    const validationResult = GovernanceValidator.validate(envelope, ALL_MANDATES as any, []);
    setResult(validationResult);
  };

  const loadScenario = (scenario: DemoScenario) => {
    setEnvelope(scenario.envelope);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT SIDE: Playground */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
            Validator Playground
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Test the FAGF-FS validator with custom scenarios or predefined demos.
          </p>

          {/* Demo Scenarios */}
          <div className="mb-6">
            <h3 className="font-medium text-slate-900 mb-3 text-sm">Demo Scenarios</h3>
            <div className="space-y-2">
              {DEMO_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadScenario(s)}
                  className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700">{s.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${s.expectedOutcome === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                      s.expectedOutcome === 'hitl' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {s.expectedOutcome}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Input Configuration */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="font-medium text-slate-900 mb-3 text-sm">Transaction Proposal</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Merchant Name</label>
              <input
                type="text"
                value={envelope.transaction.merchantName}
                onChange={e => setEnvelope({ ...envelope, transaction: { ...envelope.transaction, merchantName: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={envelope.transaction.amount}
                  onChange={e => setEnvelope({ ...envelope, transaction: { ...envelope.transaction, amount: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={envelope.transaction.category}
                  onChange={e => setEnvelope({ ...envelope, transaction: { ...envelope.transaction, category: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Software Subscription">Software Subscription</option>
                  <option value="Gambling">Gambling (Blocked)</option>
                  <option value="High-Risk Investment">High-Risk Investment</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="insurance">Insurance (Req. License)</option>
                  <option value="crypto-trading">Crypto Trading (Unlicensed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reasoning / Notes</label>
              <textarea
                value={envelope.reasoning}
                onChange={e => setEnvelope({ ...envelope, reasoning: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
              />
              <p className="text-xs text-slate-500 mt-1">Try entering "S1234567A" (NRIC) or "scam" to test custom mandates.</p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={envelope.context.isNewMerchant}
                  onChange={e => setEnvelope({ ...envelope, context: { ...envelope.context, isNewMerchant: e.target.checked } })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <span className="text-sm text-slate-700">Flag as New Merchant</span>
              </label>
            </div>

            <button
              onClick={handleRunValidation}
              className="w-full mt-4 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors focus:ring-4 focus:ring-emerald-100 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Validate Transaction
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="font-medium text-slate-900 mb-3 text-sm">Validation Result</h3>
              <div className={`p-4 rounded-lg flex items-start gap-4 ${result.allowed
                ? 'bg-emerald-50 border border-emerald-100'
                : 'bg-red-50 border border-red-100'
                }`}>
                <div className={`p-2 rounded-full ${result.allowed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {result.allowed ? <Shield className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className={`font-bold ${result.allowed ? 'text-emerald-900' : 'text-red-900'}`}>
                    {result.allowed ? 'Validation Passed' : 'Validation Failed'}
                  </h4>
                  <p className={`mt-1 text-sm ${result.allowed ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.reason || 'Transaction is authorized for execution.'}
                  </p>
                </div>
              </div>

              {!result.allowed && result.mitigationRisk && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-3">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Disclosure</h5>
                  <p className="text-sm text-slate-700">{result.mitigationRisk}</p>
                </div>
              )}

              {result.triggeredMandates.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Triggered Mandates</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.triggeredMandates.map((id: string) => (
                      <span key={id} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-mono border border-slate-200">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Architecture */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            FAGF-FS Architecture
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            The Foundational Agentic Governance Framework uses a multi-layered deterministic validation approach.
          </p>

          <div className="space-y-4">
            {/* Layer 1: Envelope - NOW DYNAMIC */}
            <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-3 text-emerald-600">
                <FlaskConical className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Layer 1: Governance Envelope</h3>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-slate-300 leading-relaxed overflow-hidden">
                <div className="text-emerald-400">{"{"}</div>
                <div className="pl-4">
                  <span className="text-blue-400">"transaction"</span>: {"{"}
                  <div className="pl-4">
                    <span className="text-slate-400">"amount"</span>: {envelope.transaction.amount},
                    <br />
                    <span className="text-slate-400">"merchant"</span>: "{envelope.transaction.merchantName}",
                    <br />
                    <span className="text-slate-400">"category"</span>: "{envelope.transaction.category}"
                  </div>
                  {"}"},
                  <br />
                  <span className="text-blue-400">"reasoning"</span>: "{envelope.reasoning.substring(0, 30)}{envelope.reasoning.length > 30 ? '...' : ''}",
                  <br />
                  <span className="text-blue-400">"context"</span>: {"{"}
                  <div className="pl-4">
                    <span className="text-slate-400">"isNewMerchant"</span>: {envelope.context.isNewMerchant.toString()}
                  </div>
                  {"}"}
                </div>
                <div className="text-emerald-400">{"}"}</div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Wraps the raw action with agent intent (reasoning) and operational context.
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="text-slate-400 text-2xl">↓</div>
            </div>

            {/* Layer 2: Mandate Stack - NOW SHOWS TRIGGERED MANDATES */}
            <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3 text-blue-600">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Layer 2: Mandate Stack</h3>
              </div>
              <div className="space-y-2">
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-cat-01')
                    ? 'bg-red-100 border-red-300 text-red-800 ring-2 ring-red-400'
                    : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  1. Categorical Blocklist (Enforced)
                  {result?.triggeredMandates.includes('fagf-cat-01') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-red-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-spend-01')
                    ? 'bg-amber-100 border-amber-300 text-amber-800 ring-2 ring-amber-400'
                    : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  2. Spending Limit Mandate (HITL)
                  {result?.triggeredMandates.includes('fagf-spend-01') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-amber-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-velocity-01')
                    ? 'bg-amber-100 border-amber-300 text-amber-800 ring-2 ring-amber-400'
                    : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  3. Velocity Rate Limiting (Log)
                  {result?.triggeredMandates.includes('fagf-velocity-01') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-amber-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('ext-sg-mas-01') || result?.triggeredMandates.includes('ext-sg-nric-01') || result?.triggeredMandates.includes('reasoning-safety-01')
                    ? 'bg-red-100 border-red-300 text-red-800 ring-2 ring-red-400'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  }`}>
                  4. Custom Mandates (MAS/PII/Safety)
                  {(result?.triggeredMandates.includes('ext-sg-mas-01') || result?.triggeredMandates.includes('ext-sg-nric-01') || result?.triggeredMandates.includes('reasoning-safety-01')) && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-red-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                A set of deterministic rules (Mandates) mapping regulatory/safety requirements.
                {result && (
                  <span className="block mt-1 font-medium text-slate-700">
                    ✓ Checked {result.triggeredMandates.length > 0 ? result.triggeredMandates.length : 'all'} mandate{result.triggeredMandates.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="text-slate-400 text-2xl">↓</div>
            </div>

            {/* Layer 3: Validator - NOW SHOWS DECISION */}
            <div className={`p-4 rounded-xl shadow-lg text-white transition-all ${result ? (result.allowed ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-red-600 to-red-700') : 'bg-slate-900'
              }`}>
              <div className="flex items-center gap-2 mb-3 text-emerald-400">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Layer 3: Deterministic Validator</h3>
              </div>
              <div className="flex flex-col items-center justify-center h-32 border border-white/10 rounded-xl bg-white/5 p-4">
                {!result ? (
                  <>
                    <div className="text-center font-bold text-3xl mb-2 text-emerald-400">evaluate()</div>
                    <div className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-loose">
                      Deterministic Execution Loop
                    </div>
                    <div className="w-full h-px bg-white/10 my-3" />
                    <div className="text-center text-sm font-mono text-emerald-300">
                      RESULT: APPROVED | BLOCKED | HITL
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-center font-bold text-4xl mb-2 ${result.allowed ? 'text-white' : 'text-white'
                      }`}>
                      {result.allowed ? '✓ APPROVED' : '✗ BLOCKED'}
                    </div>
                    <div className="text-[10px] text-white/80 text-center uppercase tracking-widest leading-loose">
                      {result.requiresApproval ? 'Human-in-the-Loop Required' : result.allowed ? 'Autonomous Execution' : 'Hard Block'}
                    </div>
                    <div className="w-full h-px bg-white/10 my-3" />
                    <div className="text-center text-xs text-white/90 leading-relaxed">
                      {result.reason}
                    </div>
                  </>
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                The core engine that performs the final Tiered Validation Logic (TVL).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
