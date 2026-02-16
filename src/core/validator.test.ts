import { describe, it, expect } from 'vitest';
import { GovernanceValidator } from './validator';
import { STANDARD_MANDATES } from './mandates';
import { SINGAPORE_MANDATES, CONTENT_SAFETY_MANDATES } from './customMandates';
import type { GovernanceEnvelope } from './types';

const ALL_MANDATES = { ...STANDARD_MANDATES, ...SINGAPORE_MANDATES, ...CONTENT_SAFETY_MANDATES };

describe('GovernanceValidator', () => {
    const baseEnvelope: GovernanceEnvelope = {
        transaction: {
            amount: 100,
            destination: '0x123',
            merchantName: 'Test Merchant',
            category: 'Software',
            timestamp: Date.now(),
            paymentMethod: 'Credit Card'
        },
        reasoning: 'Valid business expense',
        context: {
            isNewMerchant: false,
            historyDepth: 10,
            riskScore: 0.1
        }
    };

    it('should allow a standard valid transaction', () => {
        const result = GovernanceValidator.validate(baseEnvelope, ALL_MANDATES as any, []);
        expect(result.allowed).toBe(true);
        expect(result.requiresApproval).toBe(false);
    });

    it('should block restricted categories (Gambling)', () => {
        const envelope = {
            ...baseEnvelope,
            transaction: { ...baseEnvelope.transaction, category: 'Gambling' }
        };
        const result = GovernanceValidator.validate(envelope, ALL_MANDATES as any, []);
        expect(result.allowed).toBe(false);
        expect(result.triggeredMandates).toContain('fagf-cat-01');
    });

    it('should require approval for large amounts', () => {
        const envelope = {
            ...baseEnvelope,
            transaction: { ...baseEnvelope.transaction, amount: 50000 }
        };
        const result = GovernanceValidator.validate(envelope, ALL_MANDATES as any, []);
        expect(result.allowed).toBe(false);
        expect(result.requiresApproval).toBe(true);
        expect(result.triggeredMandates).toContain('fagf-spend-01');
    });

    it('should block NRIC in reasoning (Singapore Mandate)', () => {
        const envelope = {
            ...baseEnvelope,
            reasoning: 'Transferring to user S1234567A'
        };
        const result = GovernanceValidator.validate(envelope, ALL_MANDATES as any, []);
        expect(result.allowed).toBe(false);
        expect(result.triggeredMandates).toContain('ext-sg-nric-01');
    });

    it('should block profanity (Content Safety)', () => {
        const envelope = {
            ...baseEnvelope,
            reasoning: 'This is a scam attempt'
        };
        const result = GovernanceValidator.validate(envelope, ALL_MANDATES as any, []);
        expect(result.allowed).toBe(false);
        expect(result.triggeredMandates).toContain('reasoning-safety-01');
    });
});
