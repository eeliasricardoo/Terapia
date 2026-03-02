"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, CreditCard, Ticket } from "lucide-react"

interface PaymentMethodsProps {
    handlePayment: () => void
    isProcessing: boolean
    isFetchingInfo: boolean
    price: string
    cardForm: {
        cardNumber: string
        setCardNumber: (val: string) => void
        cardName: string
        setCardName: (val: string) => void
        expiry: string
        setExpiry: (val: string) => void
        cvv: string
        setCvv: (val: string) => void
    }
}

export function PaymentMethods({
    handlePayment,
    isProcessing,
    isFetchingInfo,
    price,
    cardForm
}: PaymentMethodsProps) {
    const {
        cardNumber, setCardNumber,
        cardName, setCardName,
        expiry, setExpiry,
        cvv, setCvv
    } = cardForm

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-slate-900">Escolha seu método de pagamento</h2>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1 h-12">
                            <TabsTrigger value="card" className="data-[state=active]:bg-white data-[state=active]:shadow-sm h-10 font-medium">Cartão</TabsTrigger>
                            <TabsTrigger value="pix" className="data-[state=active]:bg-white data-[state=active]:shadow-sm h-10 font-medium">Pix</TabsTrigger>
                            <TabsTrigger value="bill" className="data-[state=active]:bg-white data-[state=active]:shadow-sm h-10 font-medium">Plano</TabsTrigger>
                        </TabsList>

                        <TabsContent value="card" className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Número do cartão</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="cardNumber"
                                        placeholder="0000 0000 0000 0000"
                                        className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cardName">Nome no cartão</Label>
                                <Input
                                    id="cardName"
                                    placeholder="João da Silva"
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Validade (MM/AA)</Label>
                                    <Input
                                        id="expiry"
                                        placeholder="MM/AA"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <div className="relative">
                                        <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="cvv"
                                            placeholder="123"
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg mt-4 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                                onClick={handlePayment}
                                disabled={isProcessing || isFetchingInfo}
                            >
                                {isProcessing ? "Processando..." : `Pagar Agora ${price}`}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-4">
                                <Lock className="h-3 w-3" />
                                Pagamento processado de forma segura
                            </p>
                        </TabsContent>

                        <TabsContent value="pix" className="flex flex-col items-center justify-center text-center py-8 space-y-4">
                            <div className="h-48 w-48 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                                <span className="text-slate-400 text-sm">QR Code Pix</span>
                            </div>
                            <p className="text-sm text-muted-foreground px-8">
                                Escaneie o QR Code acima com o app do seu banco para realizar o pagamento instantâneo.
                            </p>
                            <Button
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg mt-4 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                                onClick={handlePayment}
                                disabled={isProcessing || isFetchingInfo}
                            >
                                {isProcessing ? "Processando..." : "Copiar Código Pix e Finalizar"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="bill" className="space-y-6 mt-6">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-start gap-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                                    <Ticket className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">Plano Corporativo</h3>
                                    <p className="text-slate-600 mt-1 mb-4">
                                        Sua empresa <strong>Tech Solutions</strong> cobre este atendimento.
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100">
                                        <Ticket className="h-4 w-4" />
                                        4 sessões disponíveis este mês
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                                onClick={handlePayment}
                                disabled={isProcessing || isFetchingInfo}
                            >
                                {isProcessing ? "Processando..." : "Confirmar e Usar Saldo"}
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
