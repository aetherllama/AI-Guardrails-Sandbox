// Content Filter Service
const ContentFilter = {
    // Profanity patterns (with optional character substitutions)
    profanityPatterns: [
        /\bf+[u\*@]+c+k+/gi,
        /\bs+h+[i\*!1]+t+/gi,
        /\bd+a+m+n+/gi,
        /\ba+s+s+/gi,
        /\bb+[i\*!1]+t+c+h+/gi,
        /\bh+e+l+l+\b/gi,
        /\bcr+a+p+/gi
    ],

    // Harmful content keywords
    harmfulKeywords: [
        'hack', 'virus', 'malware', 'exploit', 'ddos', 'attack',
        'weapon', 'bomb', 'explosive', 'poison', 'drug synthesis',
        'bypass security', 'steal', 'break into'
    ],

    // Sensitive topic patterns
    sensitivePatterns: [
        /political\s*(party|leader|movement)/gi,
        /\b(democrat|republican|liberal|conservative)s?\s+(are|is)\s+(stupid|idiots|evil)/gi,
        /all\s+\w+\s+voters/gi,
        /religion\s+is\s+(stupid|fake|evil)/gi
    ],

    // Hate speech patterns
    hateSpeechPatterns: [
        /all\s+(people|immigrants|refugees)\s+from\s+\w+\s+(are|should)/gi,
        /\b(race|ethnic|religious)\s+group\b.*\b(inferior|superior|criminals)\b/gi,
        /(ban|deport|remove)\s+all\s+\w+/gi,
        /\b(they|those\s+people)\s+(are\s+all|should\s+all)\s+\w+/gi
    ],

    checkProfanity(input) {
        const text = input.toLowerCase();
        const detected = [];

        for (const pattern of this.profanityPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                detected.push(...matches);
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: 'Profane or vulgar language detected in the input.',
                detectedItems: [...new Set(detected.map(d => `Profanity: "${d}"`))],
                sanitizedOutput: this.sanitizeProfanity(input),
                confidence: Math.min(0.7 + (detected.length * 0.1), 0.95)
            };
        }

        return {
            status: 'allowed',
            reason: 'No profanity detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.9
        };
    },

    sanitizeProfanity(input) {
        let sanitized = input;
        for (const pattern of this.profanityPatterns) {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        }
        return sanitized;
    },

    checkHarmfulContent(input) {
        const text = input.toLowerCase();
        const detected = [];

        for (const keyword of this.harmfulKeywords) {
            if (text.includes(keyword)) {
                detected.push(keyword);
            }
        }

        // Check for combined dangerous patterns
        const dangerousPatterns = [
            /how\s+(to|do\s+i|can\s+i)\s+(make|create|build)\s+(a\s+)?(virus|malware|weapon|bomb)/gi,
            /teach\s+me\s+(to|how\s+to)\s+(hack|steal|attack)/gi
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(text)) {
                detected.push('dangerous request pattern');
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Request contains potentially harmful or dangerous content.',
                detectedItems: detected.map(d => `Harmful: "${d}"`),
                sanitizedOutput: null,
                confidence: 0.92
            };
        }

        return {
            status: 'allowed',
            reason: 'No harmful content detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    checkSensitiveTopics(input) {
        const text = input.toLowerCase();
        const detected = [];

        for (const pattern of this.sensitivePatterns) {
            if (pattern.test(input)) {
                detected.push('sensitive political/religious content');
            }
        }

        // Check for inflammatory language
        const inflammatoryPatterns = [
            /\b(idiots?|stupid|morons?|evil)\b.*\b(supporters?|voters?|believers?)\b/gi,
            /\b(all|every)\b.*\b(party|religion|group)\b.*\b(wrong|bad|terrible)\b/gi
        ];

        for (const pattern of inflammatoryPatterns) {
            if (pattern.test(text)) {
                detected.push('inflammatory language');
            }
        }

        if (detected.length > 0) {
            return {
                status: 'flagged',
                reason: 'Content involves sensitive or controversial topics that may require moderation.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.78
            };
        }

        return {
            status: 'allowed',
            reason: 'No sensitive topics detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.85
        };
    },

    checkHateSpeech(input) {
        const detected = [];

        for (const pattern of this.hateSpeechPatterns) {
            if (pattern.test(input)) {
                detected.push('discriminatory language pattern');
            }
        }

        // Check for slurs and derogatory terms
        const derogatory = [
            /\b(inferior|subhuman|vermin|parasites?)\b/gi
        ];

        for (const pattern of derogatory) {
            if (pattern.test(input)) {
                detected.push('derogatory terminology');
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Content contains hate speech or discriminatory language.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: null,
                confidence: 0.94
            };
        }

        return {
            status: 'allowed',
            reason: 'No hate speech detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.9
        };
    },

    // Main check function
    check(input) {
        // Run all content checks in order of severity
        const hateSpeechResult = this.checkHateSpeech(input);
        if (hateSpeechResult.status === 'blocked') return hateSpeechResult;

        const harmfulResult = this.checkHarmfulContent(input);
        if (harmfulResult.status === 'blocked') return harmfulResult;

        const profanityResult = this.checkProfanity(input);
        if (profanityResult.status === 'flagged') return profanityResult;

        const sensitiveResult = this.checkSensitiveTopics(input);
        if (sensitiveResult.status === 'flagged') return sensitiveResult;

        return {
            status: 'allowed',
            reason: 'Content passed all filtering checks.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.92
        };
    }
};
