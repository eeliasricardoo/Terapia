import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, CheckCircle2 } from "lucide-react"

interface ReceiptDialogProps {
    children: React.ReactNode
    session: {
        id: number
        doctor: string
        role: string
        date: string
        time: string
        amount?: number
    }
}

export function ReceiptDialog({ children, session }: ReceiptDialogProps) {
    const amount = session.amount || 150.00
    const transactionId = `TRX-${session.id}-${Math.floor(Math.random() * 1000000)}`
    const issueDate = new Date().toLocaleDateString('pt-BR')

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <DialogTitle>Comprovante de Pagamento</DialogTitle>
                    </div>
                    <DialogDescription>
                        Recibo emitido para a sessão de terapia realizada.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                        <h3 className="text-3xl font-bold text-primary">
                            R$ {amount.toFixed(2).replace('.', ',')}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Especialista</span>
                            <span className="font-medium">{session.doctor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Especialidade</span>
                            <span className="font-medium">{session.role}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Data da Sessão</span>
                            <span className="font-medium">{session.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Horário</span>
                            <span className="font-medium">{session.time}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ID da Transação</span>
                            <span className="font-mono text-xs">{transactionId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Data de Emissão</span>
                            <span className="font-medium">{issueDate}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                    <Button className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
