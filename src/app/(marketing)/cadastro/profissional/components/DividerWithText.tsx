import { Separator } from "@/components/ui/separator"

interface DividerWithTextProps {
    text: string
}

export function DividerWithText({ text }: DividerWithTextProps) {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    {text}
                </span>
            </div>
        </div>
    )
}

