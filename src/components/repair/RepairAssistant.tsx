import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wrench, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RepairAction {
    id: string;
    action: string;
    description: string;
    rootCause: string;
    autoExecutable: boolean;
    params: Record<string, unknown>;
}

interface Diagnosis {
    id: string;
    timestamp: string;
    problem: Record<string, unknown>;
    category: string;
    severity: string;
    rootCause: string | null;
    repairs: RepairAction[];
    autoFixable: boolean;
}

interface RepairResult {
    diagnosis: Diagnosis;
    autoFixed: boolean;
    repair?: {
        repairId: string;
        action: string;
        status: string;
        output: Record<string, unknown>;
    };
    message: string;
}

const API_BASE = 'http://localhost:4001/api';

export function RepairAssistant() {
    const [problemDescription, setProblemDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
    const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDiagnose = async () => {
        if (!problemDescription.trim()) return;

        setIsLoading(true);
        setError(null);
        setDiagnosis(null);
        setRepairResult(null);

        try {
            const response = await fetch(`${API_BASE}/repair/diagnose`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problem: { description: problemDescription } }),
            });

            if (!response.ok) throw new Error('Failed to diagnose problem');

            const data = await response.json();
            setDiagnosis(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoFix = async () => {
        if (!problemDescription.trim()) return;

        setIsLoading(true);
        setError(null);
        setRepairResult(null);

        try {
            const response = await fetch(`${API_BASE}/repair/auto-fix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problem: { description: problemDescription } }),
            });

            if (!response.ok) throw new Error('Failed to auto-fix problem');

            const data = await response.json();
            setRepairResult(data);
            setDiagnosis(data.diagnosis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteRepair = async (repair: RepairAction) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/repair/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repairId: repair.id, action: repair }),
            });

            if (!response.ok) throw new Error('Failed to execute repair');

            const result = await response.json();
            setRepairResult({
                diagnosis: diagnosis!,
                autoFixed: result.status === 'success',
                repair: result,
                message: result.status === 'success'
                    ? `✅ Repair completed: ${repair.description}`
                    : `❌ Repair failed: ${result.error}`,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Wrench className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Repair Assistant</CardTitle>
                            <CardDescription>
                                L'IA qui ne répond pas, mais qui répare.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Problem Input */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Décrivez votre problème</CardTitle>
                    <CardDescription>
                        Décrivez l'erreur, le comportement inattendu ou le problème rencontré.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Ex: Mon workflow Google Sheets échoue avec l'erreur '429 Too Many Requests'..."
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />

                    <div className="flex gap-3">
                        <Button
                            onClick={handleDiagnose}
                            disabled={isLoading || !problemDescription.trim()}
                            variant="outline"
                            className="flex-1"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 mr-2" />
                            )}
                            Diagnostiquer
                        </Button>

                        <Button
                            onClick={handleAutoFix}
                            disabled={isLoading || !problemDescription.trim()}
                            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4 mr-2" />
                            )}
                            Réparer automatiquement
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-500">
                            <XCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Repair Result */}
            {repairResult && (
                <Card className={repairResult.autoFixed ? 'border-green-500/50 bg-green-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {repairResult.autoFixed ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            )}
                            <CardTitle className="text-lg">
                                {repairResult.autoFixed ? 'Réparation réussie!' : 'Action requise'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{repairResult.message}</p>
                        {repairResult.repair?.output && (
                            <pre className="mt-4 p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                                {JSON.stringify(repairResult.repair.output, null, 2)}
                            </pre>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Diagnosis Results */}
            {diagnosis && !repairResult && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Diagnostic</CardTitle>
                            <div className="flex gap-2">
                                <Badge variant="outline">{diagnosis.category}</Badge>
                                <Badge className={getSeverityColor(diagnosis.severity)}>
                                    {diagnosis.severity}
                                </Badge>
                            </div>
                        </div>
                        {diagnosis.rootCause && (
                            <CardDescription>
                                <strong>Cause racine:</strong> {diagnosis.rootCause}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-4">Réparations disponibles:</h4>
                        <div className="space-y-3">
                            {diagnosis.repairs.map((repair) => (
                                <div
                                    key={repair.id}
                                    className="p-4 rounded-lg border bg-muted/30 flex items-start justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{repair.description}</span>
                                            {repair.autoExecutable && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Auto
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Action: <code className="bg-muted px-1 rounded">{repair.action}</code>
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleExecuteRepair(repair)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Exécuter'
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Example Problems */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Exemples de problèmes</CardTitle>
                    <CardDescription>Cliquez sur un exemple pour le tester</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            'Erreur 429 Too Many Requests sur Google Sheets',
                            'Token OAuth expiré pour Slack',
                            'Connection timeout avec l\'API Notion',
                            'Workflow bloqué à l\'étape 3 depuis 10 minutes',
                            'Données invalides: champ "email" manquant',
                            'Quota API dépassé pour le mois',
                        ].map((example) => (
                            <Button
                                key={example}
                                variant="ghost"
                                className="justify-start h-auto py-2 px-3 text-left text-sm"
                                onClick={() => setProblemDescription(example)}
                            >
                                {example}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default RepairAssistant;
