import type {
    FinancialMandates,
    GovernanceEnvelope,
    ValidationResult
} from './types';

export class GovernanceValidator {
    /**
     * The core FAGF-FS deterministic validation logic.
     * Evaluates a proposed transaction against a set of financial mandates.
     */
    static validate(
        envelope: GovernanceEnvelope,
        mandates: FinancialMandates & { [key: string]: any }, // Allow custom mandates
        history: GovernanceEnvelope[]
    ): ValidationResult {
        const { transaction, context } = envelope;
        const triggeredMandates: string[] = [];

        // 1. Categorical Blocklist (Block-Before-Commit)
        // Risk: Regulatory Non-Compliance / High-Exposure categories.
        if (mandates.blockedCategories.parameter.includes(transaction.category)) {
            return {
                allowed: false,
                requiresApproval: false,
                reason: `FAGF-FS Block: Category '${transaction.category}' is strictly restricted.`,
                mitigationRisk: mandates.blockedCategories.riskDisclosure,
                severity: mandates.blockedCategories.severity,
                triggeredMandates: [mandates.blockedCategories.id]
            };
        }

        // 2. Authorization Mandates: New Merchant Check
        // Risk: Phishing / Merchant Impersonation.
        if (context.isNewMerchant && mandates.newMerchantAuth.parameter) {
            triggeredMandates.push(mandates.newMerchantAuth.id);
            return {
                allowed: false,
                requiresApproval: true,
                reason: `FAGF-FS HITL: New merchant '${transaction.merchantName}' requires manual authorization.`,
                mitigationRisk: mandates.newMerchantAuth.riskDisclosure,
                severity: mandates.newMerchantAuth.severity,
                triggeredMandates
            };
        }

        // 3. Spending Mandates: Confirmation Threshold
        // Risk: Large Unauthorized Financial Loss.
        if (transaction.amount > mandates.confirmationThreshold.parameter) {
            triggeredMandates.push(mandates.confirmationThreshold.id);
            return {
                allowed: false,
                requiresApproval: true,
                reason: `FAGF-FS HITL: Transaction amount $${transaction.amount} exceeds autonomous limit ($${mandates.confirmationThreshold.parameter}).`,
                mitigationRisk: mandates.confirmationThreshold.riskDisclosure,
                severity: mandates.confirmationThreshold.severity,
                triggeredMandates
            };
        }

        // 4. Velocity Mandates: Rate Limiting
        // Risk: API Runaway / Autonomous Loops.
        const oneHourAgo = Date.now() - 3600000;
        const recentTxCount = history.filter(h => h.transaction.timestamp > oneHourAgo).length;
        if (recentTxCount >= mandates.rateLimitPerHour.parameter) {
            triggeredMandates.push(mandates.rateLimitPerHour.id);
            return {
                allowed: false,
                requiresApproval: true,
                reason: `FAGF-FS HITL: Velocity limit exceeded (${mandates.rateLimitPerHour.parameter} tx/hr).`,
                mitigationRisk: mandates.rateLimitPerHour.riskDisclosure,
                severity: mandates.rateLimitPerHour.severity,
                triggeredMandates
            };
        }

        // 5. Velocity Mandates: Cooldown
        // Risk: Botanical Exhaustion / Rapid Drainage.
        if (history.length > 0) {
            // Sort history by timestamp descending to get the latest
            const sortedHistory = [...history].sort((a, b) => b.transaction.timestamp - a.transaction.timestamp);
            const lastTx = sortedHistory[0];
            const secondsSinceLast = (Date.now() - lastTx.transaction.timestamp) / 1000;
            if (secondsSinceLast < mandates.cooldownSeconds.parameter) {
                triggeredMandates.push(mandates.cooldownSeconds.id);
                return {
                    allowed: false,
                    requiresApproval: true,
                    reason: `FAGF-FS HITL: Cooling period active. Wait ${Math.ceil(mandates.cooldownSeconds.parameter - secondsSinceLast)}s.`,
                    mitigationRisk: mandates.cooldownSeconds.riskDisclosure,
                    severity: mandates.cooldownSeconds.severity,
                    triggeredMandates
                };
            }
        }

        // 6. Authorization Mandates: Payment Channel Filtering
        // Risk: High-Risk / Untrusted Payment Channels.
        if (!mandates.allowedMethods.parameter.includes(transaction.paymentMethod)) {
            triggeredMandates.push(mandates.allowedMethods.id);
            return {
                allowed: false,
                requiresApproval: true,
                reason: `FAGF-FS HITL: Payment method '${transaction.paymentMethod}' is untrusted for autonomous use.`,
                mitigationRisk: mandates.allowedMethods.riskDisclosure,
                severity: mandates.allowedMethods.severity,
                triggeredMandates
            };
        }


        // 7. Custom Mandate: Singapore MAS License Check
        // Logic: If transaction category indicates a financial service, check if it's in the allowed list
        if (mandates.masLicensedActivity &&
            ['banking', 'insurance', 'wealth_management'].includes(transaction.category.toLowerCase()) &&
            !mandates.masLicensedActivity.parameter.includes(transaction.category.toLowerCase())) {
            triggeredMandates.push(mandates.masLicensedActivity.id);
            return {
                allowed: false,
                requiresApproval: false, // Strict block
                reason: `FAGF-FS Block: Activity '${transaction.category}' is not a licensed service under MAS guidelines.`,
                mitigationRisk: mandates.masLicensedActivity.riskDisclosure,
                severity: 'high',
                triggeredMandates
            };
        }

        // 8. Custom Mandate: NRIC/PII Check (Regex on reasoning/context)
        if (mandates.nricRedaction) {
            const nricRegex = new RegExp(mandates.nricRedaction.parameter, 'i');
            // Check reasoning and merchant name for PII
            if (nricRegex.test(envelope.reasoning) || nricRegex.test(transaction.merchantName)) {
                triggeredMandates.push(mandates.nricRedaction.id);
                return {
                    allowed: false,
                    requiresApproval: true,
                    reason: `FAGF-FS Block: Standard NRIC/FIN pattern detected. PII must be redacted.`,
                    mitigationRisk: mandates.nricRedaction.riskDisclosure,
                    severity: 'high',
                    triggeredMandates
                };
            }
        }

        // 9. Custom Mandate: Content Safety (Profanity)
        if (mandates.profanityFilter) {
            const forbiddenWords = mandates.profanityFilter.parameter;
            const textToCheck = (envelope.reasoning + ' ' + transaction.merchantName).toLowerCase();
            const foundWord = forbiddenWords.find((word: string) => textToCheck.includes(word.toLowerCase()));

            if (foundWord) {
                triggeredMandates.push(mandates.profanityFilter.id);
                return {
                    allowed: false,
                    requiresApproval: false,
                    reason: `FAGF-FS Block: Content safety violation detected (${foundWord}).`,
                    mitigationRisk: mandates.profanityFilter.riskDisclosure,
                    severity: 'medium',
                    triggeredMandates
                };
            }
        }

        // All mandates passed for autonomous execution
        return {
            allowed: true,
            requiresApproval: false,
            triggeredMandates: []
        };
    }
}
