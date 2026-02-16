import type { GovernanceMandate } from './types';

/**
 * Custom Mandates for Singapore Financial Regulations & Content Safety
 */

export const SINGAPORE_MANDATES = {
    masLicensedActivity: {
        id: 'ext-sg-mas-01',
        category: 'authorization', // Fits under authorization for "permitted activity"
        parameter: ['banking', 'insurance', 'wealth_management', 'payments'],
        enforcement: 'block',
        severity: 'high',
        riskDisclosure: 'Unlicensed financial activities are strictly prohibited by MAS.',
        description: 'Only MAS-licensed financial activities are permitted.'
    } as GovernanceMandate<string[]>,

    nricRedaction: {
        id: 'ext-sg-nric-01',
        category: 'category_restriction', // Using category restriction to flag PII patterns
        parameter: '[STFG]\\d{7}[A-Z]', // Simple NRIC regex
        enforcement: 'block', // In a real system this might be "redact", but for validator it blocks the payload containing it
        severity: 'high',
        riskDisclosure: 'PDPA violation: NRIC/FIN detected in unencrypted payload.',
        description: 'NRIC/FIN patterns must be redacted or encrypted.'
    } as GovernanceMandate<string>
};

export const CONTENT_SAFETY_MANDATES = {
    profanityFilter: {
        id: 'reasoning-safety-01',
        category: 'category_restriction',
        parameter: ['badword1', 'badword2', 'scam', 'phishing'], // Placeholder list
        enforcement: 'block',
        severity: 'medium',
        riskDisclosure: 'Content violates community safety guidelines.',
        description: 'Profanity and scam keywords are restricted.'
    } as GovernanceMandate<string[]>
};
