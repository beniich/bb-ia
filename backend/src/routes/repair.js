const express = require('express');
const router = express.Router();
const repairAgent = require('../services/repairAgent');

/**
 * POST /api/repair/diagnose
 * Analyze a problem and return repair options
 */
router.post('/diagnose', async (req, res) => {
    try {
        const { problem } = req.body;

        if (!problem) {
            return res.status(400).json({ error: 'Problem description is required' });
        }

        const diagnosis = await repairAgent.diagnose(problem);
        res.json(diagnosis);
    } catch (error) {
        console.error('Diagnosis error:', error);
        res.status(500).json({ error: 'Failed to diagnose problem' });
    }
});

/**
 * POST /api/repair/execute
 * Execute a specific repair action
 */
router.post('/execute', async (req, res) => {
    try {
        const { repairId, action } = req.body;

        if (!repairId || !action) {
            return res.status(400).json({ error: 'Repair ID and action are required' });
        }

        const result = await repairAgent.executeRepair(repairId, action);
        res.json(result);
    } catch (error) {
        console.error('Repair execution error:', error);
        res.status(500).json({ error: 'Failed to execute repair' });
    }
});

/**
 * POST /api/repair/auto-fix
 * Automatically diagnose and fix a problem
 */
router.post('/auto-fix', async (req, res) => {
    try {
        const { problem } = req.body;

        if (!problem) {
            return res.status(400).json({ error: 'Problem description is required' });
        }

        // Diagnose
        const diagnosis = await repairAgent.diagnose(problem);

        // Find auto-executable repairs
        const autoFixable = diagnosis.repairs.filter(r => r.autoExecutable);

        if (autoFixable.length === 0) {
            return res.json({
                diagnosis,
                autoFixed: false,
                message: 'No auto-fixable repairs available. Manual intervention required.',
            });
        }

        // Execute first auto-fixable repair
        const repair = autoFixable[0];
        const result = await repairAgent.executeRepair(repair.id, repair);

        res.json({
            diagnosis,
            autoFixed: result.status === 'success',
            repair: result,
            message: result.status === 'success'
                ? `✅ Problem fixed: ${repair.description}`
                : `❌ Auto-fix failed: ${result.error}`,
        });
    } catch (error) {
        console.error('Auto-fix error:', error);
        res.status(500).json({ error: 'Failed to auto-fix problem' });
    }
});

module.exports = router;
