// Financial Guardrails Service
const FinancialGuardrails = {
    LARGE_TRANSACTION_THRESHOLD: 10000,

    // Suspicious activity patterns
    suspiciousPatterns: [
        /split\s+(this|the)?\s*\$?\d+.*into\s+multiple/gi,
        /avoid\s+(reporting|detection|limit)/gi,
        /structure\s+.*transaction/gi,
        /multiple\s+.*\$?[89],?\d{3}\s*(deposit|transfer)/gi,
        /under\s+\$?10,?000/gi,
        /layer(ing)?\s+(the\s+)?money/gi,
        /smurfi?ng/gi,
        /wash(ing)?\s+.*money/gi
    ],

    // Investment advice patterns
    investmentAdvicePatterns: [
        /you\s+should\s+(definitely\s+)?invest/gi,
        /invest\s+(all\s+)?(your|my)\s+(savings?|money|retirement)/gi,
        /guaranteed\s+(returns?|profit|income)/gi,
        /will\s+make\s+you\s+rich/gi,
        /can't\s+lose/gi,
        /sure\s+thing/gi,
        /this\s+(stock|crypto|coin)\s+(will|is\s+going\s+to)\s+(moon|skyrocket)/gi
    ],

    // Compliance violation patterns
    compliancePatterns: [
        /money\s+launder/gi,
        /tax\s+evas/gi,
        /hide\s+(the\s+)?money/gi,
        /offshore\s+(account|shell\s+company)/gi,
        /avoid\s+(the\s+)?tax/gi,
        /unreport/gi
    ],

    // Fraud indicator patterns
    fraudPatterns: [
        /urgent!?\s+(action|response|verification)\s+(required|needed)/gi,
        /your\s+(account|bank)\s+(has\s+been\s+)?compromis/gi,
        /click\s+(here|this\s+link)\s+(immediately|now)/gi,
        /verify\s+(your\s+)?(account|identity|details)\s+(immediately|now|urgently)/gi,
        /suspended?\s+(account|access)/gi,
        /wire\s+(money|funds)\s+(immediately|urgently|now)/gi,
        /act\s+now\s+or\s+lose/gi,
        /limited\s+time\s+(only|offer)/gi
    ],

    // Financial data patterns
    financialDataPatterns: {
        accountNumber: /\b\d{9,18}\b/g,
        routingNumber: /\b\d{9}\b/g,
        iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g,
        swift: /\b[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\b/g
    },

    // Trading restriction patterns
    tradingRestrictionPatterns: [
        /insider\s+(trading|information|tip)/gi,
        /market\s+manipulat/gi,
        /pump\s+and\s+dump/gi,
        /front\s+running/gi,
        /confidential\s+.*\b(merger|acquisition|earnings)\b/gi
    ],

    checkTransactionAmount(input) {
        const amountPattern = /\$\s*([\d,]+(?:\.\d{2})?)/g;
        const matches = [...input.matchAll(amountPattern)];
        const detected = [];

        for (const match of matches) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            if (amount > this.LARGE_TRANSACTION_THRESHOLD) {
                detected.push(`Amount: $${amount.toLocaleString()}`);
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: `Transaction amount exceeds $${this.LARGE_TRANSACTION_THRESHOLD.toLocaleString()} reporting threshold.`,
                detectedItems: detected,
                sanitizedOutput: null,
                confidence: 0.88
            };
        }

        return {
            status: 'allowed',
            reason: 'Transaction amount within normal limits.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.85
        };
    },

    checkSuspiciousActivity(input) {
        const detected = [];

        for (const pattern of this.suspiciousPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Suspicious: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Potential structuring or money laundering pattern detected.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.94
            };
        }

        return {
            status: 'allowed',
            reason: 'No suspicious activity patterns detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.87
        };
    },

    checkInvestmentAdvice(input) {
        const detected = [];

        for (const pattern of this.investmentAdvicePatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Unlicensed advice: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: 'Content may constitute unlicensed investment advice.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.82
            };
        }

        return {
            status: 'allowed',
            reason: 'No unlicensed investment advice detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.85
        };
    },

    checkComplianceViolation(input) {
        const detected = [];

        for (const pattern of this.compliancePatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Compliance issue: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Request involves potential financial compliance violations.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.93
            };
        }

        return {
            status: 'allowed',
            reason: 'No compliance violations detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    redactFinancialData(input) {
        const detected = [];
        let sanitized = input;

        // Account numbers
        const accountMatches = input.match(this.financialDataPatterns.accountNumber);
        if (accountMatches) {
            // Filter to only likely account numbers (not phone numbers or other data)
            const filteredMatches = accountMatches.filter(m => m.length >= 10);
            if (filteredMatches.length > 0) {
                detected.push(...filteredMatches.map(m => `Account: "${m}"`));
                sanitized = sanitized.replace(this.financialDataPatterns.accountNumber, '[ACCOUNT REDACTED]');
            }
        }

        // IBAN
        const ibanMatches = input.match(this.financialDataPatterns.iban);
        if (ibanMatches) {
            detected.push(...ibanMatches.map(m => `IBAN: "${m}"`));
            sanitized = sanitized.replace(this.financialDataPatterns.iban, '[IBAN REDACTED]');
        }

        // SWIFT codes
        const swiftMatches = input.match(this.financialDataPatterns.swift);
        if (swiftMatches) {
            detected.push(...swiftMatches.map(m => `SWIFT: "${m}"`));
            sanitized = sanitized.replace(this.financialDataPatterns.swift, '[SWIFT REDACTED]');
        }

        if (detected.length > 0) {
            return {
                status: 'sanitized',
                reason: 'Sensitive financial data detected and redacted.',
                detectedItems: detected,
                sanitizedOutput: sanitized,
                confidence: 0.9
            };
        }

        return {
            status: 'allowed',
            reason: 'No sensitive financial data detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.85
        };
    },

    checkFraudIndicators(input) {
        const detected = [];

        for (const pattern of this.fraudPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Fraud indicator: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Content matches common financial fraud or phishing patterns.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.91
            };
        }

        return {
            status: 'allowed',
            reason: 'No fraud indicators detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.86
        };
    },

    checkTradingRestrictions(input) {
        const detected = [];

        for (const pattern of this.tradingRestrictionPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Trading violation: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Content involves potential market manipulation or insider trading.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.93
            };
        }

        return {
            status: 'allowed',
            reason: 'No trading restrictions violated.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    // Main check function
    check(input) {
        // Check for compliance violations first (most severe)
        const complianceResult = this.checkComplianceViolation(input);
        if (complianceResult.status === 'blocked') return complianceResult;

        // Check for suspicious activity
        const suspiciousResult = this.checkSuspiciousActivity(input);
        if (suspiciousResult.status === 'blocked') return suspiciousResult;

        // Check for trading restrictions
        const tradingResult = this.checkTradingRestrictions(input);
        if (tradingResult.status === 'blocked') return tradingResult;

        // Check for fraud indicators
        const fraudResult = this.checkFraudIndicators(input);
        if (fraudResult.status === 'blocked') return fraudResult;

        // Check and redact financial data
        const dataResult = this.redactFinancialData(input);
        if (dataResult.status === 'sanitized') return dataResult;

        // Check transaction amounts
        const amountResult = this.checkTransactionAmount(input);
        if (amountResult.status === 'flagged') return amountResult;

        // Check for investment advice
        const adviceResult = this.checkInvestmentAdvice(input);
        if (adviceResult.status === 'flagged') return adviceResult;

        return {
            status: 'allowed',
            reason: 'Financial compliance checks passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.89
        };
    }
};
