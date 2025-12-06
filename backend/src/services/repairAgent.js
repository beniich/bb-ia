const { v4: uuidv4 } = require('uuid');

/**
 * RepairAgent - AI-powered issue diagnosis and automatic repair
 * 
 * This agent analyzes problems and returns executable repair actions
 * instead of just explanations.
 */
class RepairAgent {
    constructor() {
        this.repairStrategies = {
            'rate_limit': this.handleRateLimit,
            'auth_expired': this.handleAuthExpired,
            'connection_failed': this.handleConnectionFailed,
            'invalid_data': this.handleInvalidData,
            'timeout': this.handleTimeout,
            'quota_exceeded': this.handleQuotaExceeded,
            'api_error': this.handleApiError,
            'workflow_stuck': this.handleWorkflowStuck,
        };
    }

    /**
     * Analyze a problem and return repair actions
     */
    async diagnose(problem) {
        const diagnosis = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            problem: problem,
            category: this.categorize(problem),
            severity: this.assessSeverity(problem),
            rootCause: null,
            repairs: [],
            autoFixable: false,
        };

        // Categorize the problem
        const category = diagnosis.category;

        // Get repair strategy
        const strategy = this.repairStrategies[category];
        if (strategy) {
            const repairs = await strategy.call(this, problem);
            diagnosis.repairs = repairs;
            diagnosis.autoFixable = repairs.some(r => r.autoExecutable);
            diagnosis.rootCause = repairs[0]?.rootCause || 'Unknown';
        } else {
            // Generic AI analysis for unknown problems
            diagnosis.repairs = await this.genericAnalysis(problem);
        }

        return diagnosis;
    }

    /**
     * Execute a specific repair action
     */
    async executeRepair(repairId, repairAction) {
        const result = {
            repairId,
            action: repairAction.action,
            status: 'pending',
            startedAt: new Date().toISOString(),
            completedAt: null,
            output: null,
            error: null,
        };

        try {
            // Simulate repair execution based on action type
            switch (repairAction.action) {
                case 'add_delay':
                    result.output = { delayMs: repairAction.params.delayMs, applied: true };
                    break;
                case 'refresh_token':
                    result.output = { tokenRefreshed: true, expiresIn: 3600 };
                    break;
                case 'retry_with_backoff':
                    result.output = { retryCount: 3, backoffMultiplier: 2 };
                    break;
                case 'transform_data':
                    result.output = { transformed: true, fieldsFixed: repairAction.params.fields };
                    break;
                case 'switch_endpoint':
                    result.output = { newEndpoint: repairAction.params.fallbackUrl };
                    break;
                case 'increase_timeout':
                    result.output = { newTimeout: repairAction.params.timeoutMs };
                    break;
                case 'scale_down':
                    result.output = { reducedBy: '50%', newRate: repairAction.params.newRate };
                    break;
                case 'restart_workflow':
                    result.output = { restarted: true, fromStep: repairAction.params.fromStep };
                    break;
                default:
                    result.output = { executed: true };
            }

            result.status = 'success';
            result.completedAt = new Date().toISOString();
        } catch (error) {
            result.status = 'failed';
            result.error = error.message;
            result.completedAt = new Date().toISOString();
        }

        return result;
    }

    // Problem categorization
    categorize(problem) {
        const text = (problem.description || problem.message || '').toLowerCase();

        if (text.includes('429') || text.includes('rate limit') || text.includes('too many')) {
            return 'rate_limit';
        }
        if (text.includes('401') || text.includes('unauthorized') || text.includes('token expired')) {
            return 'auth_expired';
        }
        if (text.includes('connection') || text.includes('network') || text.includes('econnrefused')) {
            return 'connection_failed';
        }
        if (text.includes('invalid') || text.includes('validation') || text.includes('schema')) {
            return 'invalid_data';
        }
        if (text.includes('timeout') || text.includes('timed out')) {
            return 'timeout';
        }
        if (text.includes('quota') || text.includes('limit exceeded')) {
            return 'quota_exceeded';
        }
        if (text.includes('stuck') || text.includes('hanging') || text.includes('not responding')) {
            return 'workflow_stuck';
        }
        return 'api_error';
    }

    assessSeverity(problem) {
        const text = (problem.description || problem.message || '').toLowerCase();
        if (text.includes('critical') || text.includes('fatal') || text.includes('data loss')) {
            return 'critical';
        }
        if (text.includes('error') || text.includes('failed')) {
            return 'high';
        }
        if (text.includes('warning') || text.includes('slow')) {
            return 'medium';
        }
        return 'low';
    }

    // Repair strategies
    async handleRateLimit(problem) {
        return [{
            id: uuidv4(),
            action: 'add_delay',
            description: 'Add delay between API calls to respect rate limits',
            rootCause: 'Too many API requests in a short time period',
            autoExecutable: true,
            params: { delayMs: 1000 },
        }, {
            id: uuidv4(),
            action: 'retry_with_backoff',
            description: 'Implement exponential backoff for retries',
            rootCause: 'Too many API requests in a short time period',
            autoExecutable: true,
            params: { initialDelay: 1000, maxRetries: 5, multiplier: 2 },
        }];
    }

    async handleAuthExpired(problem) {
        return [{
            id: uuidv4(),
            action: 'refresh_token',
            description: 'Automatically refresh the expired authentication token',
            rootCause: 'OAuth token has expired',
            autoExecutable: true,
            params: { integration: problem.integration || 'unknown' },
        }];
    }

    async handleConnectionFailed(problem) {
        return [{
            id: uuidv4(),
            action: 'retry_with_backoff',
            description: 'Retry connection with exponential backoff',
            rootCause: 'Network connectivity issue or service unavailable',
            autoExecutable: true,
            params: { initialDelay: 2000, maxRetries: 3, multiplier: 2 },
        }, {
            id: uuidv4(),
            action: 'switch_endpoint',
            description: 'Switch to fallback endpoint if available',
            rootCause: 'Primary endpoint unreachable',
            autoExecutable: false,
            params: { fallbackUrl: problem.fallbackUrl || null },
        }];
    }

    async handleInvalidData(problem) {
        return [{
            id: uuidv4(),
            action: 'transform_data',
            description: 'Transform data to match expected schema',
            rootCause: 'Data format mismatch between source and destination',
            autoExecutable: true,
            params: { fields: problem.invalidFields || [] },
        }];
    }

    async handleTimeout(problem) {
        return [{
            id: uuidv4(),
            action: 'increase_timeout',
            description: 'Increase timeout duration for slow operations',
            rootCause: 'Operation takes longer than allowed timeout',
            autoExecutable: true,
            params: { timeoutMs: 60000 },
        }, {
            id: uuidv4(),
            action: 'retry_with_backoff',
            description: 'Retry the operation',
            rootCause: 'Temporary slowdown',
            autoExecutable: true,
            params: { initialDelay: 5000, maxRetries: 2, multiplier: 1.5 },
        }];
    }

    async handleQuotaExceeded(problem) {
        return [{
            id: uuidv4(),
            action: 'scale_down',
            description: 'Reduce request frequency to stay within quota',
            rootCause: 'API quota exceeded for current billing period',
            autoExecutable: true,
            params: { newRate: '50%' },
        }, {
            id: uuidv4(),
            action: 'notify_upgrade',
            description: 'Notify user to upgrade their plan',
            rootCause: 'Plan limits reached',
            autoExecutable: false,
            params: {},
        }];
    }

    async handleApiError(problem) {
        return [{
            id: uuidv4(),
            action: 'retry_with_backoff',
            description: 'Retry the failed API call',
            rootCause: 'Temporary API error',
            autoExecutable: true,
            params: { initialDelay: 1000, maxRetries: 3, multiplier: 2 },
        }];
    }

    async handleWorkflowStuck(problem) {
        return [{
            id: uuidv4(),
            action: 'restart_workflow',
            description: 'Restart workflow from the last successful step',
            rootCause: 'Workflow execution stalled',
            autoExecutable: true,
            params: { fromStep: problem.lastSuccessfulStep || 0 },
        }];
    }

    async genericAnalysis(problem) {
        return [{
            id: uuidv4(),
            action: 'manual_review',
            description: 'This issue requires manual investigation',
            rootCause: 'Unable to automatically determine root cause',
            autoExecutable: false,
            params: { problem },
        }];
    }
}

module.exports = new RepairAgent();
