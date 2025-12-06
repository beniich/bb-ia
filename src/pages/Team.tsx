import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Team() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold">Team Members</h1>
                </div>
                <Button>Invite Member</Button>
            </div>

            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>U{i}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">User {i}</h3>
                                    <p className="text-sm text-muted-foreground">user{i}@example.com</p>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">Admin</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
