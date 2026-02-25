"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "@/components/layout/Footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Lock, CreditCard, ShieldCheck, Ticket, Check, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getPsychologistById } from "@/lib/actions/psychologists"
import { createSession } from "@/lib/actions/sessions"
import { useRouter } from "next/navigation"

function PaymentContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL Params
    const doctorId = searchParams.get("doctor")
    const date = searchParams.get("date") // Format typically YYYY-MM-DD
    const time = searchParams.get("time") // Format HH:MM

    // Fetch States
    const [userId, setUserId] = useState<string | null>(null)
    const [doctorName, setDoctorName] = useState("Carregando...")
    const [price, setPrice] = useState("R$ --,--")
    const [priceRaw, setPriceRaw] = useState(0)
    const [isFetchingInfo, setIsFetchingInfo] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Form inputs
    const [cardNumber, setCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvv, setCvv] = useState("")

    useEffect(() => {
        const loadCheckoutInfo = async () => {
            setIsFetchingInfo(true)

            // 1. Get current user
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            // 2. Get psychologist info
            if (doctorId) {
                const psych = await getPsychologistById(doctorId)
                if (psych) {
                    setDoctorName(psych.profile?.full_name ? `Dr(a). ${psych.profile.full_name}` : "Psicólogo(a)")
                    if (psych.price_per_session) {
                        setPriceRaw(Number(psych.price_per_session))
                        setPrice(`R$ ${Number(psych.price_per_session).toFixed(2).replace('.', ',')}`)
                    } else {
                        setPrice("Gratuito")
                    }
                }
            }
            setIsFetchingInfo(false)
        }

        loadCheckoutInfo()
    }, [doctorId])

    const handlePayment = async () => {
        if (!userId || !doctorId || !date || !time) {
            alert("Informações de agendamento incompletas. Por favor, volte ao perfil do psicólogo.")
            return
        }

        setIsProcessing(true)

        try {
            // Setup exactly ISO date for database
            const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

            // Call Database Server Action
            const result = await createSession({
                patientId: userId,
                psychologistId: doctorId,
                scheduledAt: scheduledAt,
                durationMinutes: 50 // Default duration
            })

            if (!result.success) {
                throw new Error(result.error || "Falha ao processar agendamento")
            }

            // Show success animation
            setIsSuccess(true)
            window.scrollTo(0, 0)
        } catch (error: any) {
            console.error("Payment error:", error)
            alert(error.message || "Erro no processamento do pagamento.")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <main className="flex-1 container py-12 max-w-7xl">
                {/* Breadcrumb integrado ao conteúdo */}
                <div className="mb-8">
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/busca" className="hover:text-blue-600 transition-colors">
                            Buscar Psicólogos
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-slate-700 font-medium">Pagamento</span>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
                        <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
                            <Check className="h-12 w-12 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">Pagamento confirmado e sessão agendada!</h1>
                        <p className="text-slate-600 mb-8">Te enviamos um e-mail com todos os detalhes da sua sessão.</p>

                        <Card className="w-full bg-white border-none shadow-md mb-8 text-left overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                        <AvatarImage src="/avatars/01.png" />
                                        <AvatarFallback>SP</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Profissional</p>
                                        <p className="font-bold text-lg text-slate-900">{doctorName}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Data e Hora</p>
                                        <p className="font-medium text-slate-900">
                                            {date ? `${date}` : "15 de Outubro, 2024"}<br />
                                            <span className="text-slate-600">às {time || "09:00"}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">ID da Transação</p>
                                        <p className="font-font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit text-sm">
                                            PAY-{Math.floor(Math.random() * 1000000)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 w-full">
                            <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-md" onClick={() => window.location.href = '/dashboard/sessoes'}>
                                Ver detalhes da sessão
                            </Button>
                            <Button variant="ghost" className="w-full text-slate-600 hover:bg-slate-100" onClick={() => window.location.href = '/dashboard'}>
                                Ir para meu painel
                            </Button>
                        </div>
                        <p className="text-sm text-slate-400 mt-8">
                            Se tiver alguma dúvida, não hesite em <a href="#" className="underline hover:text-blue-600">contatar o suporte</a>.
                        </p>
                    </div>
                ) : (
                    <>
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
                                    <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative">
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
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
            <PaymentContent />
        </Suspense>
    )
}
