import type { FinancialMandates } from './types';

/**
 * Standard FAGF-FS Mandates Configuration
 * Aligned with MAS TRM Guidelines and generic financial safety standards.
 */
export const STANDARD_MANDATES: FinancialMandates = {
    newMerchantAuth: {
        id: 'fagf-authz-01',
        category: 'authorization',
        parameter: true,
        enforcement: 'approval_required',
        severity: 'high',
        riskDisclosure: 'Prevents unauthorized transfers to unknown entities (Phishing/Fraud risk).',
        description: 'New merchants require manual authorization.'
    },
    confirmationThreshold: {
        id: 'fagf-spend-01',
        category: 'spending_limit',
        parameter: 1000, // $1000 limit
        enforcement: 'approval_required',
        severity: 'medium',
        riskDisclosure: 'Mitigates large-scale financial loss from autonomous errors.',
        description: 'Transactions over $1000 require confirmation.'
    },
    dailyAggregateLimit: {
        id: 'fagf-spend-02',
        category: 'spending_limit',
        parameter: 5000, // $5000 daily limit
        enforcement: 'block',
        severity: 'high',
        riskDisclosure: 'Prevents total wallet drainage via multiple small transactions.',
        description: 'Daily spending limit of $5000.'
    },
    rateLimitPerHour: {
        id: 'fagf-velocity-01',
        category: 'velocity',
        parameter: 10, // 10 tx per hour
        enforcement: 'approval_required',
        severity: 'medium',
        riskDisclosure: 'Detects and halts run-away loops or bot-net behavior.',
        description: 'Maximum 10 transactions per hour.'
    },
    cooldownSeconds: {
        id: 'fagf-velocity-02',
        category: 'velocity',
        parameter: 60, // 60 seconds cooldown
        enforcement: 'approval_required',
        severity: 'low',
        riskDisclosure: 'Prevents rapid-fire execution errors.',
        description: '60-second cooldown between transactions.'
    },
    blockedCategories: {
        id: 'fagf-cat-01',
        category: 'category_restriction',
        parameter: ['Ungoverned Gambling', 'High-Risk Investment', 'Adult Entertainment'],
        enforcement: 'block',
        severity: 'high',
        riskDisclosure: 'Ensures compliance with corporate/regulatory usage policies.',
        description: 'Restricted categories are blocked.'
    },
    allowedMethods: {
        id: 'fagf-authz-02',
        category: 'authorization',
        parameter: ['Credit Card', 'Bank Transfer', 'Corporate Account'],
        enforcement: 'approval_required',
        severity: 'medium',
        riskDisclosure: 'Restricts usage to traceable and reversible payment channels.',
        description: 'Only specific payment methods are allowed.'
    }
};
