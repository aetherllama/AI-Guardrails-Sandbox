// Output Sanitizer Service
const OutputSanitizer = {
    // PII patterns
    piiPatterns: {
        ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
        creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
        dob: /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])[-/](?:19|20)?\d{2}\b/g
    },

    // Hallucination indicators
    hallucinationPatterns: [
        /\b(definitely|certainly|guaranteed)\s+(will|would|can)\b/gi,
        /\b(always|never)\s+(works?|fails?|happens?)\b/gi,
        /\b(100%|guaranteed|certain)\s+(returns?|success|profit)\b/gi,
        /\bI\s+(heard|read)\s+that\s+.*\b(definitely|will|certainly)\b/gi,
        /\bthe\s+CEO\s+(said|confirmed|announced)\s+.*\bwill\b/gi,
        /\bsources?\s+(confirm|say|indicate)\s+that\b/gi
    ],

    // Missing attribution patterns
    unattributedPatterns: [
        /\bstudies\s+show\b/gi,
        /\bresearch\s+(indicates?|shows?|proves?)\b/gi,
        /\bexperts?\s+(say|agree|believe)\b/gi,
        /\bscientists?\s+(found|discovered|confirmed)\b/gi,
        /\baccording\s+to\s+(research|studies|experts?)\b/gi
    ],

    // Toxicity patterns
    toxicityPatterns: [
        /\byou\s+are\s+(so\s+)?(stupid|dumb|idiot|moron)/gi,
        /\b(stupid|dumb|idiotic)\s+question/gi,
        /\bonly\s+(an?\s+)?(idiot|moron|fool)\s+would/gi,
        /\byou\s+(should|must)\s+(be\s+)?(ashamed|embarrassed)/gi,
        /\bI\s+can't\s+believe\s+(how\s+)?(stupid|dumb)/gi,
        /\bwhat\s+(a|an)\s+(stupid|dumb|idiotic)/gi
    ],

    redactPII(input) {
        const detected = [];
        let sanitized = input;

        // SSN
        const ssnMatches = input.match(this.piiPatterns.ssn);
        if (ssnMatches) {
            detected.push(...ssnMatches.map(m => `SSN: "${m}"`));
            sanitized = sanitized.replace(this.piiPatterns.ssn, '[SSN REDACTED]');
        }

        // Credit Card
        const ccMatches = input.match(this.piiPatterns.creditCard);
        if (ccMatches) {
            detected.push(...ccMatches.map(m => `Credit Card: "${m}"`));
            sanitized = sanitized.replace(this.piiPatterns.creditCard, '[CARD REDACTED]');
        }

        // Phone
        const phoneMatches = input.match(this.piiPatterns.phone);
        if (phoneMatches) {
            detected.push(...phoneMatches.map(m => `Phone: "${m}"`));
            sanitized = sanitized.replace(this.piiPatterns.phone, '[PHONE REDACTED]');
        }

        // Email
        const emailMatches = input.match(this.piiPatterns.email);
        if (emailMatches) {
            detected.push(...emailMatches.map(m => `Email: "${m}"`));
            sanitized = sanitized.replace(this.piiPatterns.email, '[EMAIL REDACTED]');
        }

        if (detected.length > 0) {
            return {
                status: 'sanitized',
                reason: 'Personally identifiable information (PII) detected and redacted.',
                detectedItems: detected,
                sanitizedOutput: sanitized,
                confidence: 0.95
            };
        }

        return {
            status: 'allowed',
            reason: 'No PII detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    checkHallucination(input) {
        const detected = [];

        for (const pattern of this.hallucinationPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Unverifiable claim: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: 'Content contains potentially unverifiable or speculative claims.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.72
            };
        }

        return {
            status: 'allowed',
            reason: 'No hallucination indicators detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.8
        };
    },

    checkSourceAttribution(input) {
        const detected = [];

        for (const pattern of this.unattributedPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Missing citation: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: 'Claims lack proper source attribution or citations.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.75
            };
        }

        return {
            status: 'allowed',
            reason: 'Source attribution check passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.82
        };
    },

    checkToxicity(input) {
        const detected = [];

        for (const pattern of this.toxicityPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Toxic language: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Content contains toxic or insulting language.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.91
            };
        }

        return {
            status: 'allowed',
            reason: 'No toxicity detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.89
        };
    },

    // Main check function
    check(input) {
        // Check toxicity first (most severe)
        const toxicityResult = this.checkToxicity(input);
        if (toxicityResult.status === 'blocked') return toxicityResult;

        // Check and redact PII
        const piiResult = this.redactPII(input);
        if (piiResult.status === 'sanitized') return piiResult;

        // Check for hallucinations
        const hallucinationResult = this.checkHallucination(input);
        if (hallucinationResult.status === 'flagged') return hallucinationResult;

        // Check source attribution
        const attributionResult = this.checkSourceAttribution(input);
        if (attributionResult.status === 'flagged') return attributionResult;

        return {
            status: 'allowed',
            reason: 'Output passed all safety checks.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.9
        };
    }
};
