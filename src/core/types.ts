/**
 * FAGF-FS (Foundational Agentic Governance Framework for Financial Services)
 * Core Type Definitions
 */

export type Severity = 'low' | 'medium' | 'high';

export type EnforcementAction = 'block' | 'approval_required' | 'shadow_log';

export type GovernanceCategory =
    | 'authorization'
    | 'spending_limit'
    | 'category_restriction'
    | 'velocity';

/**
 * The standard FAGF-FS mandate definition.
 */
export interface GovernanceMandate<T = any> {
    id: string; // Standard FAGF-FS ID (e.g., 'fagf-limit-01')
    category: GovernanceCategory;
    parameter: T;
    enforcement: EnforcementAction;
    severity: Severity;
    riskDisclosure: string;
    description: string;
}

/**
 * The standard FAGF-FS governance envelope for transaction proposals.
 */
export interface GovernanceEnvelope {
    transaction: {
        amount: number;
        destination: string;
        merchantName: string;
        category: string;
        timestamp: number;
        paymentMethod: string;
    };
    reasoning: string; // The AI agent's explanation
    context: {
        isNewMerchant: boolean;
        historyDepth: number;
        riskScore: number;
    };
}

/**
 * The result structure returned by a FAGF-FS validator.
 */
export interface ValidationResult {
    allowed: boolean;
    requiresApproval: boolean;
    reason?: string;
    mitigationRisk?: string;
    severity?: Severity;
    triggeredMandates: string[];
}

/**
 * Standard Financial Mandates (MAS/AP2 Aligned)
 */
export interface FinancialMandates {
    newMerchantAuth: GovernanceMandate<boolean>;
    confirmationThreshold: GovernanceMandate<number>;
    dailyAggregateLimit: GovernanceMandate<number>;
    rateLimitPerHour: GovernanceMandate<number>;
    cooldownSeconds: GovernanceMandate<number>;
    blockedCategories: GovernanceMandate<string[]>;
    allowedMethods: GovernanceMandate<string[]>;
}
