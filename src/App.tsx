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
  const [activeView, setActiveView] = useState<'dashboard' | 'interactive' | 'configure'>('dashboard');

  const [activeMandates, setActiveMandates] = useState({
    standard: true,
    singapore: true,
    contentSafety: true
  });

  const [mandateParams, setMandateParams] = useState({
    spendingLimit: 1000,
    blockLimit: 5000,
    velocityLimit: 10,
    blockedCategories: ['Ungoverned Gambling', 'High-Risk Investment']
  });

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
              <button
                onClick={() => setActiveView('configure')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'configure'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                Governance Mandates
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
            {activeView === 'interactive' && (
              <InteractiveView
                activeMandates={activeMandates}
                mandateParams={mandateParams}
                envelope={envelope}
                setEnvelope={setEnvelope}
                result={result}
                setResult={setResult}
              />
            )}
            {activeView === 'configure' && (
              <ConfigureView
                activeMandates={activeMandates}
                setActiveMandates={setActiveMandates}
                mandateParams={mandateParams}
                setMandateParams={setMandateParams}
              />
            )}
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

function ConfigureView({
  activeMandates,
  setActiveMandates,
  mandateParams,
  setMandateParams
}: {
  activeMandates: any,
  setActiveMandates: any,
  mandateParams: any,
  setMandateParams: any
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Lock className="w-6 h-6 text-emerald-600" />
          Governance Mandates Configuration
        </h2>
        <p className="text-slate-600 mb-8">
          Define the active guardrails and parameters that the FAGF-FS validator enforces across the ecosystem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Column 1: Active Switches */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Enabled Mandate Sets</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeMandates.standard}
                  onChange={(e) => setActiveMandates({ ...activeMandates, standard: e.target.checked })}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <div>
                  <span className="block font-bold text-slate-900">Standard Mandates</span>
                  <p className="text-sm text-slate-500 mt-1">Foundational financial controls: spending limits, horizontal velocity, and merchant authorization.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeMandates.singapore}
                  onChange={(e) => setActiveMandates({ ...activeMandates, singapore: e.target.checked })}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <div>
                  <span className="block font-bold text-slate-900">Singapore MAS Compliance</span>
                  <p className="text-sm text-slate-500 mt-1">Region-specific mandates including MAS licensing checks and NRIC/FIN PII detection.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeMandates.contentSafety}
                  onChange={(e) => setActiveMandates({ ...activeMandates, contentSafety: e.target.checked })}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <div>
                  <span className="block font-bold text-slate-900">Content Safety & Intent</span>
                  <p className="text-sm text-slate-500 mt-1">Filters for profanity, scam keywords, and consistency checks on transaction reasoning.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Column 2: Parameters */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Dynamic Parameters</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Autonomous Approval Threshold ($)
                </label>
                <input
                  type="number"
                  value={mandateParams.spendingLimit}
                  onChange={(e) => setMandateParams({ ...mandateParams, spendingLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">Transactions above this amount require human intervention.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Hard Block Threshold ($)
                </label>
                <input
                  type="number"
                  value={mandateParams.blockLimit}
                  onChange={(e) => setMandateParams({ ...mandateParams, blockLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">Maximum absolute limit; transactions above this are rejected.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Velocity Limit (TX/Hr)
                </label>
                <input
                  type="number"
                  value={mandateParams.velocityLimit}
                  onChange={(e) => setMandateParams({ ...mandateParams, velocityLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">Cumulative transaction count allowed per hour per agent.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Blocked Merchant Categories</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Gambling', 'High-Risk Investment', 'Cryptocurrency', 'Adult Content'].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mandateParams.blockedCategories.includes(cat)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...mandateParams.blockedCategories, cat]
                            : mandateParams.blockedCategories.filter((c: string) => c !== cat);
                          setMandateParams({ ...mandateParams, blockedCategories: newCategories });
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-medium text-slate-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setMandateParams({
                  spendingLimit: 1000,
                  blockLimit: 5000,
                  velocityLimit: 10,
                  blockedCategories: ['Gambling', 'High-Risk Investment']
                });
              }}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
            >
              Reset Configuration to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveView({
  activeMandates,
  mandateParams,
  envelope,
  setEnvelope,
  result,
  setResult
}: {
  activeMandates: any,
  mandateParams: any,
  envelope: GovernanceEnvelope,
  setEnvelope: (e: GovernanceEnvelope) => void,
  result: ValidationResult | null,
  setResult: (r: ValidationResult | null) => void
}) {
  const handleRunValidation = () => {
    let mandates: any = {};

    if (activeMandates.standard) {
      mandates = {
        ...STANDARD_MANDATES,
        confirmationThreshold: {
          ...STANDARD_MANDATES.confirmationThreshold,
          parameter: mandateParams.spendingLimit,
          description: `Transactions over $${mandateParams.spendingLimit} require confirmation.`
        },
        dailyAggregateLimit: {
          ...STANDARD_MANDATES.dailyAggregateLimit,
          parameter: mandateParams.blockLimit,
          description: `Daily spending limit (used as hard block) of $${mandateParams.blockLimit}.`
        },
        rateLimitPerHour: {
          ...STANDARD_MANDATES.rateLimitPerHour,
          parameter: mandateParams.velocityLimit,
          description: `Maximum ${mandateParams.velocityLimit} transactions per hour.`
        },
        blockedCategories: {
          ...STANDARD_MANDATES.blockedCategories,
          parameter: mandateParams.blockedCategories,
          description: `Restricted categories: ${mandateParams.blockedCategories.join(', ')}`
        }
      };
    }

    if (activeMandates.singapore) {
      mandates = { ...mandates, ...SINGAPORE_MANDATES };
    }
    if (activeMandates.contentSafety) {
      mandates = { ...mandates, ...CONTENT_SAFETY_MANDATES };
    }

    const validationResult = GovernanceValidator.validate(envelope, mandates, []);
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
            {/* Layer 1: Envelope */}
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

            {/* Layer 2: Mandate Stack */}
            <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3 text-blue-600">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Layer 2: Mandate Stack</h3>
              </div>
              <div className="space-y-2">
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-spend-02')
                  ? 'bg-red-100 border-red-300 text-red-800 ring-2 ring-red-400'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  1. Hard Block Threshold (Enforced)
                  {result?.triggeredMandates.includes('fagf-spend-02') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-red-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-cat-01')
                  ? 'bg-red-100 border-red-300 text-red-800 ring-2 ring-red-400'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  2. Categorical Blocklist (Enforced)
                  {result?.triggeredMandates.includes('fagf-cat-01') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-red-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-spend-01')
                  ? 'bg-amber-100 border-amber-300 text-amber-800 ring-2 ring-amber-400'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  3. Spending Limit Mandate (HITL)
                  {result?.triggeredMandates.includes('fagf-spend-01') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-amber-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('fagf-velocity-01')
                  ? 'bg-amber-100 border-amber-300 text-amber-800 ring-2 ring-amber-400'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}>
                  4. Velocity Rate Limiting (Log)
                  {result?.triggeredMandates.includes('fagf-velocity-01') && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-amber-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
                <div className={`p-2 border rounded text-[10px] font-medium transition-all ${result?.triggeredMandates.includes('ext-sg-mas-01') || result?.triggeredMandates.includes('ext-sg-nric-01') || result?.triggeredMandates.includes('reasoning-safety-01')
                  ? 'bg-red-100 border-red-300 text-red-800 ring-2 ring-red-400'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  }`}>
                  5. Custom Mandates (MAS/PII/Safety)
                  {(result?.triggeredMandates.includes('ext-sg-mas-01') || result?.triggeredMandates.includes('ext-sg-nric-01') || result?.triggeredMandates.includes('reasoning-safety-01')) && (
                    <span className="ml-2 text-[8px] px-1 py-0.5 bg-red-200 rounded">⚠ TRIGGERED</span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                A set of deterministic rules (Mandates) mapping regulatory/safety requirements.
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="text-slate-400 text-2xl">↓</div>
            </div>

            {/* Layer 3: Validator */}
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
                  </>
                ) : (
                  <>
                    <div className="text-center font-bold text-4xl mb-2 text-white">
                      {result.allowed ? '✓ APPROVED' : '✗ BLOCKED'}
                    </div>
                    <div className="text-center text-xs text-white/90 leading-relaxed line-clamp-2">
                      {result.reason}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
