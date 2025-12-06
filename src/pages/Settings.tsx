import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Settings() {
    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                    <SettingsIcon className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Workspace Name</Label>
                        <Input defaultValue="My Awesome Workspace" />
                    </div>
                    <div className="space-y-2">
                        <Label>Support Email</Label>
                        <Input defaultValue="support@company.com" />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    );
}
