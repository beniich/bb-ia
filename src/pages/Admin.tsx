import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Admin() {
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [uRes, aRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/audit')
            ]);
            setUsers(uRes.data.users);
            setLogs(aRes.data.logs);
        } catch (e) {
            console.error('Failed to fetch admin data', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const promote = async (id: number) => {
        await api.post(`/admin/users/${id}/promote`);
        fetchData();
    };

    const demote = async (id: number) => {
        await api.post(`/admin/users/${id}/demote`);
        fetchData();
    };

    if (loading) return <div className="p-8">Loading admin panel...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-primary" /> Admin Dashboard
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">ID</th>
                                    <th className="p-4 font-medium">Email</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Plan</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-t hover:bg-muted/50">
                                        <td className="p-4">{u.id}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4">
                                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4">{u.subscriptionPlan || 'Free'}</td>
                                        <td className="p-4">
                                            {u.role !== 'admin' ? (
                                                <Button size="sm" onClick={() => promote(u.id)}>Promote</Button>
                                            ) : (
                                                <Button size="sm" variant="destructive" onClick={() => demote(u.id)}>Demote</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {logs.map((l) => (
                            <div key={l.id} className="flex items-start gap-4 text-sm border-b pb-2">
                                <div className="min-w-[150px] text-muted-foreground">
                                    {new Date(l.createdAt).toLocaleString()}
                                </div>
                                <div className="font-medium min-w-[120px]">{l.action}</div>
                                <div className="text-muted-foreground font-mono text-xs truncate max-w-lg">
                                    {JSON.stringify(l.meta)}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
