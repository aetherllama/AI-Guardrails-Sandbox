// Input Validator Service
const InputValidator = {
    MAX_INPUT_LENGTH: 1000,

    // Rate limiting tracker
    requestTimestamps: [],
    RATE_LIMIT_WINDOW: 60000, // 60 seconds
    MAX_REQUESTS_PER_WINDOW: 10,

    // Prompt injection patterns
    injectionPatterns: [
        /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
        /disregard\s+(your|all)\s+(rules?|instructions?|guidelines?)/gi,
        /forget\s+(everything|all|your)\s+(you|instructions?)/gi,
        /\b(jailbreak|dan\s*mode|developer\s*mode)\b/gi,
        /you\s+are\s+now\s+(a|an)\s+\w+\s+without\s+(any\s+)?restrictions?/gi,
        /pretend\s+(you\s+)?(are|have)\s+no\s+(rules?|limits?|restrictions?)/gi,
        /system\s*prompt/gi,
        /reveal\s+(your|the)\s+(instructions?|prompt|rules)/gi,
        /bypass\s+(security|filters?|restrictions?)/gi
    ],

    // XSS and injection patterns
    xssPatterns: [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /<[^>]*on\w+\s*=/gi,
        /javascript\s*:/gi,
        /<iframe[\s\S]*?>/gi,
        /<object[\s\S]*?>/gi,
        /<embed[\s\S]*?>/gi,
        /\{\{[\s\S]*?\}\}/g,  // Template injection
        /\$\{[\s\S]*?\}/g,     // Template literals
        /<%[\s\S]*?%>/g        // Server-side templates
    ],

    // SQL injection patterns
    sqlPatterns: [
        /'\s*(or|and)\s*'?\d*\s*=\s*'?\d*/gi,
        /;\s*(drop|delete|update|insert)\s+/gi,
        /union\s+(all\s+)?select/gi,
        /--\s*$/gm
    ],

    checkPromptInjection(input) {
        const detected = [];

        for (const pattern of this.injectionPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches);
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Prompt injection attempt detected. This input attempts to override AI instructions.',
                detectedItems: detected.map(d => `Injection: "${d.trim()}"`),
                sanitizedOutput: null,
                confidence: 0.95
            };
        }

        return {
            status: 'allowed',
            reason: 'No prompt injection detected.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.88
        };
    },

    checkLength(input) {
        if (input.length > this.MAX_INPUT_LENGTH) {
            return {
                status: 'blocked',
                reason: `Input exceeds maximum allowed length of ${this.MAX_INPUT_LENGTH} characters.`,
                detectedItems: [`Length: ${input.length}/${this.MAX_INPUT_LENGTH} characters`],
                sanitizedOutput: input.substring(0, this.MAX_INPUT_LENGTH) + '...[TRUNCATED]',
                confidence: 1.0
            };
        }

        return {
            status: 'allowed',
            reason: 'Input length is within acceptable limits.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 1.0
        };
    },

    checkFormat(input) {
        const detected = [];

        // Check for XSS
        for (const pattern of this.xssPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `XSS: "${m}"`));
            }
        }

        // Check for SQL injection
        for (const pattern of this.sqlPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                detected.push(...matches.map(m => `SQL Injection: "${m}"`));
            }
        }

        if (detected.length > 0) {
            return {
                status: 'blocked',
                reason: 'Potentially malicious code patterns detected in input.',
                detectedItems: [...new Set(detected)],
                sanitizedOutput: this.sanitizeInput(input),
                confidence: 0.96
            };
        }

        return {
            status: 'allowed',
            reason: 'Input format validation passed.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.9
        };
    },

    sanitizeInput(input) {
        let sanitized = input;

        // Remove script tags
        sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '[SCRIPT REMOVED]');

        // Escape HTML entities
        sanitized = sanitized
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');

        // Remove template syntax
        sanitized = sanitized.replace(/\{\{[\s\S]*?\}\}/g, '[TEMPLATE REMOVED]');
        sanitized = sanitized.replace(/\$\{[\s\S]*?\}/g, '[TEMPLATE REMOVED]');

        return sanitized;
    },

    checkRateLimit() {
        const now = Date.now();

        // Remove old timestamps outside the window
        this.requestTimestamps = this.requestTimestamps.filter(
            ts => now - ts < this.RATE_LIMIT_WINDOW
        );

        if (this.requestTimestamps.length >= this.MAX_REQUESTS_PER_WINDOW) {
            return {
                status: 'blocked',
                reason: 'Rate limit exceeded. Please wait before making more requests.',
                detectedItems: [`${this.requestTimestamps.length} requests in last 60 seconds`],
                sanitizedOutput: null,
                confidence: 1.0
            };
        }

        // Record this request
        this.requestTimestamps.push(now);

        return {
            status: 'allowed',
            reason: 'Request rate is within acceptable limits.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 1.0
        };
    },

    // Main check function
    check(input) {
        // Check rate limit first
        const rateLimitResult = this.checkRateLimit();
        if (rateLimitResult.status === 'blocked') return rateLimitResult;

        // Check length
        const lengthResult = this.checkLength(input);
        if (lengthResult.status === 'blocked') return lengthResult;

        // Check for prompt injection
        const injectionResult = this.checkPromptInjection(input);
        if (injectionResult.status === 'blocked') return injectionResult;

        // Check format/XSS/SQL
        const formatResult = this.checkFormat(input);
        if (formatResult.status === 'blocked') return formatResult;

        return {
            status: 'allowed',
            reason: 'Input passed all validation checks.',
            detectedItems: [],
            sanitizedOutput: null,
            confidence: 0.93
        };
    }
};
