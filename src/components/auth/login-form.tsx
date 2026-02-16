"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserAuthForm } from "@/components/auth/user-auth-form"

// Reusing UserAuthForm logic but focusing on existing users
export function LoginForm() {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }

    return (
        <div className={cn("grid gap-6")}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="nome@exemplo.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Senha
                        </Label>
                        <Input
                            id="password"
                            placeholder="Sua senha"
                            type="password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            "Entrar com Email"
                        )}
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Ou continue com
                    </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading} className="gap-2">
                <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                        d="M12.0003 20.45c4.6659 0 8.45-3.7841 8.45-8.45 0-4.6659-3.7841-8.45-8.45-8.45-4.6659 0-8.45 3.7841-8.45 8.45 0 4.6659 3.7841 8.45 8.45 8.45z"
                        fill="currentColor"
                        fillOpacity=".15"
                    />
                    <path
                        d="M20.5999 12.0001c0-0.6274-.069-1.233-.197-1.8183h-8.4026v3.4259h4.8239c-.1981 1.0558-.8099 1.9566-1.7226 2.5645v2.1328h2.7745c1.6256-1.5034 2.5643-3.7153 2.5643-6.1423l-.0014-.1626h.1609z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12.0003 20.4501c2.33 0 4.2885-.7733 5.7196-2.0913l-2.7747-2.1328c-.7767.5186-1.7674.8272-2.9449.8272-2.274 0-4.2023-1.5367-4.8893-3.603h-2.8596v2.2148c1.4116 2.8021 4.3093 4.7851 7.7489 4.7851z"
                        fill="#34A853"
                    />
                    <path
                        d="M7.111 13.4532c-.176-.5251-.276-1.088-.276-1.6732 0-.5852.1001-1.1481.276-1.6732v-2.2148H4.2513c-1.1894 2.3686-1.1894 5.1768 0 7.5454l2.8597-2.2148z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12.0003 6.9932c1.2687-.0025 2.4839.4443 3.4428 1.2684l2.5857-2.5857c-2.333-2.1793-5.6517-2.9351-8.7282-1.9961-3.0766.9389-5.4647 3.327-6.4036 6.4036l2.8368 2.1979c.6917-2.054 2.617-3.5786 4.8865-3.5786z"
                        fill="#EA4335"
                    />
                </svg>
                Google
            </Button>
        </div>
    )
}

// Just export UserAuthForm for consistency elsewhere if needed
export { UserAuthForm } from "@/components/auth/user-auth-form"
