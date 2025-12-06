import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Api() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">API Access</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage your API keys for external access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input readOnly value="sk_live_51Mz..." className="font-mono bg-muted" />
                        <Button variant="outline" size="icon"><Copy className="w-4 h-4" /></Button>
                    </div>
                    <Button>Generate New Key</Button>
                </CardContent>
            </Card>
        </div>
    );
}
