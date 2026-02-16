// Main Guardrail Service - Orchestrates all guardrail checks
const GuardrailService = {
    // Status priority for determining most severe result
    statusPriority: {
        'blocked': 4,
        'sanitized': 3,
        'flagged': 2,
        'allowed': 1
    },

    // Check a specific scenario by ID
    checkScenario(scenarioId, input) {
        const scenarioChecks = {
            // Content filtering scenarios
            'profanity-check': () => ContentFilter.checkProfanity(input),
            'harmful-content': () => ContentFilter.checkHarmfulContent(input),
            'sensitive-topics': () => ContentFilter.checkSensitiveTopics(input),
            'hate-speech': () => ContentFilter.checkHateSpeech(input),

            // Input validation scenarios
            'prompt-injection': () => InputValidator.checkPromptInjection(input),
            'xss-attack': () => InputValidator.checkFormat(input),
            'length-validation': () => InputValidator.checkLength(input),
            'template-injection': () => InputValidator.checkFormat(input),

            // Output safety scenarios
            'pii-redaction': () => OutputSanitizer.redactPII(input),
            'hallucination-check': () => OutputSanitizer.checkHallucination(input),
            'source-attribution': () => OutputSanitizer.checkSourceAttribution(input),
            'toxicity-filter': () => OutputSanitizer.checkToxicity(input),

            // Financial scenarios
            'large-transaction': () => FinancialGuardrails.checkTransactionAmount(input),
            'suspicious-activity': () => FinancialGuardrails.checkSuspiciousActivity(input),
            'investment-advice': () => FinancialGuardrails.checkInvestmentAdvice(input),
            'fraud-indicators': () => FinancialGuardrails.checkFraudIndicators(input),

            // Singapore financial scenarios
            'mas-licensed': () => SingaporeFinancialGuardrails.checkMASLicensedActivity(input),
            'cpf-restrictions': () => SingaporeFinancialGuardrails.checkCPFRestrictions(input),
            'singapore-aml': () => SingaporeFinancialGuardrails.checkSingaporeAML(input),
            'singapore-fraud': () => SingaporeFinancialGuardrails.checkSingaporeFraud(input),
            'nric-protection': () => SingaporeFinancialGuardrails.redactSingaporePII(input),
            'mas-disclosure': () => SingaporeFinancialGuardrails.checkMASProductDisclosure(input),
            'sg-mobile-redact': () => SingaporeFinancialGuardrails.redactSingaporePII(input),
            'job-scam': () => SingaporeFinancialGuardrails.checkSingaporeFraud(input)
        };

        const checkFn = scenarioChecks[scenarioId];
        if (checkFn) {
            return checkFn();
        }

        // Fallback to category check
        return this.checkAll(input);
    },

    // Check by category
    checkCategory(categoryId, input) {
        switch (categoryId) {
            case 'content':
                return ContentFilter.check(input);
            case 'input':
                return InputValidator.check(input);
            case 'output':
                return OutputSanitizer.check(input);
            case 'financial':
                return FinancialGuardrails.check(input);
            case 'singapore':
                return SingaporeFinancialGuardrails.check(input);
            default:
                return this.checkAll(input);
        }
    },

    // Check all guardrails and return the most severe result
    checkAll(input) {
        const results = [
            ContentFilter.check(input),
            InputValidator.check(input),
            OutputSanitizer.check(input),
            FinancialGuardrails.check(input),
            SingaporeFinancialGuardrails.check(input)
        ];

        // Sort by severity and return the most severe
        results.sort((a, b) =>
            this.statusPriority[b.status] - this.statusPriority[a.status]
        );

        // If the most severe result has detected items, return it
        if (results[0].status !== 'allowed') {
            return results[0];
        }

        // If all passed, combine confidence scores
        const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

        return {
            status: 'allowed',
            reason: 'Input passed all guardrail checks across all categories.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: avgConfidence
        };
    },

    // Check by mode (used in playground)
    checkByMode(mode, input) {
        switch (mode) {
            case 'all':
                return this.checkAll(input);
            case 'content':
                return ContentFilter.check(input);
            case 'input':
                return InputValidator.check(input);
            case 'output':
                return OutputSanitizer.check(input);
            case 'financial':
                return FinancialGuardrails.check(input);
            case 'singapore':
                return SingaporeFinancialGuardrails.check(input);
            default:
                return this.checkAll(input);
        }
    }
};
