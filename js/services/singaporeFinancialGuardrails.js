// Singapore Financial Guardrails Service
const SingaporeFinancialGuardrails = {
    // MAS licensed activity patterns
    masLicensedPatterns: [
        /\b(guarantee|guaranteed)\s+(returns?|profit|income|investment)/gi,
        /trust\s+me.*invest/gi,
        /invest\s+(your\s+)?cpf/gi,
        /\d+%\s+(returns?|profit|yield)\s+(guaranteed|certain)/gi,
        /financial\s+advi(ce|sor).*without.*licen[cs]e/gi,
        /recommend\s+(this\s+)?investment/gi
    ],

    // CPF restriction patterns
    cpfRestrictionPatterns: [
        /withdraw\s+(all\s+)?(my\s+)?cpf.*before\s+(\d+|age|55)/gi,
        /cpf\s+(withdrawal|money).*overseas\s+(property|investment)/gi,
        /bypass\s+cpf\s+(rules?|restrictions?|limits?)/gi,
        /unlock\s+(my\s+)?cpf/gi,
        /early\s+cpf\s+withdrawal/gi,
        /cpf\s+loophole/gi
    ],

    // Singapore AML patterns (MAS Notice 626)
    sgAmlPatterns: [
        /\$\s*100,?000.*without\s+(any\s+)?(documentation|verification|kyc)/gi,
        /no\s+(documentation|verification|kyc)\s+required/gi,
        /cash.*without.*paper\s*trail/gi,
        /multiple\s+accounts?.*avoid.*detection/gi,
        /circumvent\s+(aml|kyc|verification)/gi
    ],

    // Singapore fraud patterns
    sgFraudPatterns: [
        /(singapore\s+)?police\s+force/gi,
        /(ministry|mas|cpf\s*board|iras|mom).*your\s+(account|money)/gi,
        /safe\s+account/gi,
        /transfer.*for\s+(your\s+)?safety/gi,
        /government\s+official.*bank/gi,
        /warrant\s+for\s+(your\s+)?arrest.*money/gi,
        /parcel.*customs.*pay/gi,
        /inheritance.*pay.*fee/gi,
        /lottery.*singapore.*won/gi,
        /love\s+scam/gi,
        /carousell.*pay.*link/gi
    ],

    // Job scam patterns
    jobScamPatterns: [
        /work\s+from\s+home.*\$?\d{3,}.*day/gi,
        /selected\s+for.*high[\s-]paying/gi,
        /earn\s+\$?\d{4,}.*week.*simple/gi,
        /pay.*training\s+materials?.*start\s+earning/gi,
        /commission[\s-]based.*guaranteed/gi,
        /click.*link.*job.*telegram/gi
    ],

    // Singapore PII patterns (PDPA)
    sgPiiPatterns: {
        nric: /\b[STFG]\d{7}[A-Z]\b/gi,
        fin: /\b[FGMN]\d{7}[A-Z]\b/gi,
        sgMobile: /\b(?:\+?65[\s-]?)?[89]\d{3}[\s-]?\d{4}\b/g,
        sgLandline: /\b(?:\+?65[\s-]?)?6\d{3}[\s-]?\d{4}\b/g,
        cpfAccount: /\b(cpf\s*(?:account|a\/c)\s*(?:no\.?|number)?:?\s*)\d+/gi
    },

    // MAS product disclosure patterns
    masDisclosurePatterns: [
        /no\s+risk\s+(at\s+all|whatsoever)/gi,
        /completely\s+(guaranteed|safe|secure)/gi,
        /government\s+guaranteed/gi,
        /capital\s+protected\s+100%/gi,
        /risk[\s-]free\s+investment/gi,
        /cannot\s+lose\s+(money|capital)/gi
    ],

    checkMASLicensedActivity(input) {
        const detected = [];

        for (const pattern of this.masLicensedPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `MAS violation: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Content may violate MAS Financial Advisers Act. Financial advice requires proper licensing.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.92
            };
        }

        return {
            status: 'allowed',
            reason: 'MAS licensing compliance check passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.87
        };
    },

    checkCPFRestrictions(input) {
        const detected = [];

        for (const pattern of this.cpfRestrictionPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `CPF restriction: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Request may violate CPF Act or CPFIS regulations.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.93
            };
        }

        return {
            status: 'allowed',
            reason: 'CPF compliance check passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    checkSingaporeAML(input) {
        const detected = [];

        for (const pattern of this.sgAmlPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `AML concern: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Request may violate MAS Notice 626 anti-money laundering requirements.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.94
            };
        }

        return {
            status: 'allowed',
            reason: 'Singapore AML compliance check passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.89
        };
    },

    checkSingaporeFraud(input) {
        const detected = [];

        // Check general SG fraud patterns
        for (const pattern of this.sgFraudPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Scam indicator: "${m}"`));
            }
        }

        // Check job scam patterns
        for (const pattern of this.jobScamPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Job scam: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Content matches known Singapore scam patterns. This may be a fraudulent communication.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.95
            };
        }

        return {
            status: 'allowed',
            reason: 'Singapore fraud check passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    redactSingaporePII(input) {
        const detected = [];
        let sanitized = input;

        // NRIC
        const nricMatches = input.match(this.sgPiiPatterns.nric);
        if (nricMatches) {
            detected.push(...nricMatches.map(m => `NRIC: "${m}"`));
            sanitized = sanitized.replace(this.sgPiiPatterns.nric, '[NRIC REDACTED]');
        }

        // FIN
        const finMatches = input.match(this.sgPiiPatterns.fin);
        if (finMatches && finMatches.some(m => !nricMatches?.includes(m))) {
            const uniqueFins = finMatches.filter(m => !nricMatches?.includes(m));
            detected.push(...uniqueFins.map(m => `FIN: "${m}"`));
            sanitized = sanitized.replace(this.sgPiiPatterns.fin, '[FIN REDACTED]');
        }

        // SG Mobile
        const mobileMatches = input.match(this.sgPiiPatterns.sgMobile);
        if (mobileMatches) {
            detected.push(...mobileMatches.map(m => `SG Mobile: "${m}"`));
            sanitized = sanitized.replace(this.sgPiiPatterns.sgMobile, '[SG MOBILE REDACTED]');
        }

        // SG Landline
        const landlineMatches = input.match(this.sgPiiPatterns.sgLandline);
        if (landlineMatches) {
            detected.push(...landlineMatches.map(m => `SG Landline: "${m}"`));
            sanitized = sanitized.replace(this.sgPiiPatterns.sgLandline, '[SG PHONE REDACTED]');
        }

        // CPF Account
        const cpfMatches = input.match(this.sgPiiPatterns.cpfAccount);
        if (cpfMatches) {
            detected.push(...cpfMatches.map(m => `CPF Account: "${m}"`));
            sanitized = sanitized.replace(this.sgPiiPatterns.cpfAccount, 'CPF Account: [REDACTED]');
        }

        if (detected.length > 0) {
            return {
                status: 'sanitized',
                reason: 'Singapore personal data detected and redacted per PDPA requirements.',
                detectedItems: detected,
                sanitizedOutput: sanitized,
                confidence: 0.95
            };
        }

        return {
            status: 'allowed',
            reason: 'No Singapore PII detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.87
        };
    },

    checkMASProductDisclosure(input) {
        const detected = [];

        for (const pattern of this.masDisclosurePatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `Disclosure issue: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: 'Content may not comply with MAS fair dealing requirements for financial product disclosure.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.85
            };
        }

        return {
            status: 'allowed',
            reason: 'MAS product disclosure check passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.82
        };
    },

    // Main check function
    check(input) {
        // Check for fraud first (most critical for Singapore)
        const fraudResult = this.checkSingaporeFraud(input);
        if (fraudResult.status === 'blocked') return fraudResult;

        // Check Singapore AML
        const amlResult = this.checkSingaporeAML(input);
        if (amlResult.status === 'blocked') return amlResult;

        // Check CPF restrictions
        const cpfResult = this.checkCPFRestrictions(input);
        if (cpfResult.status === 'blocked') return cpfResult;

        // Check MAS licensed activity
        const masResult = this.checkMASLicensedActivity(input);
        if (masResult.status === 'blocked') return masResult;

        // Redact Singapore PII
        const piiResult = this.redactSingaporePII(input);
        if (piiResult.status === 'sanitized') return piiResult;

        // Check MAS product disclosure
        const disclosureResult = this.checkMASProductDisclosure(input);
        if (disclosureResult.status === 'flagged') return disclosureResult;

        return {
            status: 'allowed',
            reason: 'Singapore financial compliance checks passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.9
        };
    }
};
