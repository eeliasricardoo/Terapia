"use client";

import { useActionState } from "react";
import { register } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function RegisterForm() {
    const [errorMessage, dispatch, isPending] = useActionState(
        register,
        undefined
    );

    return (
        <form action={dispatch}>
            <Card className="border-0 shadow-none">
                <CardContent className="grid gap-4 pt-4 px-0">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Juan Pérez"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            minLength={6}
                        />
                    </div>
                    {errorMessage && (
                        <div
                            className="flex h-8 items-end space-x-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="px-0">
                    <Button className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Registrarse
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
