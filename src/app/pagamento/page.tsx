"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Lock, CreditCard, ShieldCheck, Ticket } from "lucide-react"

export default function PaymentPage() {
    const searchParams = useSearchParams()
    const doctorId = searchParams.get("doctor")
    const date = searchParams.get("date")
    const time = searchParams.get("time")

    // Mock data based on query params (in a real app, fetch details)
    const doctorName = "Dra. Sofía Pérez"
    const price = "R$ 150,00"

    const [cardNumber, setCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvv, setCvv] = useState("")

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar isLoggedIn={true} userRole="client" />

            <main className="flex-1 container py-12 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Finalizar Pagamento Seguro</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Seu pagamento é 100% seguro. Todos os dados são criptografados.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Order Summary */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 text-slate-900">Resumo da sua compra</h2>
                        <Card className="overflow-hidden border-none shadow-lg">
                            <div className="h-48 bg-gradient-to-br from-teal-600 to-emerald-800 relative">
                                <div className="absolute inset-0 bg-black/10" />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-6 text-slate-900">Sessão de Terapia Individual</h3>

                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Profissional:</span>
                                        <span className="font-medium text-slate-900">{doctorName}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Data:</span>
                                        <span className="font-medium text-slate-900">{date || "15 de Outubro, 2024"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Hora:</span>
                                        <span className="font-medium text-slate-900">{time || "09:00"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-500">Duração:</span>
                                        <span className="font-medium text-slate-900">50 minutos</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                                    <span className="font-bold text-lg text-slate-900">Total a pagar:</span>
                                    <span className="font-extrabold text-2xl text-blue-600">{price}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Method */}
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

                                        <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg mt-4 shadow-md transition-all hover:shadow-lg">
                                            Pagar Agora {price}
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
                                        <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg mt-4 shadow-md transition-all hover:shadow-lg">
                                            Copiar Código Pix
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="bill" className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-4">
                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Plano Corporativo</h3>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    Sua empresa <strong>Tech Solutions</strong> cobre este atendimento.
                                                </p>
                                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100">
                                                    <Ticket className="h-4 w-4" />
                                                    4 sessões disponíveis este mês
                                                </div>
                                            </div>
                                        </div>

                                        <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg mt-4 shadow-md transition-all hover:shadow-lg">
                                            Confirmar e Usar Saldo
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
