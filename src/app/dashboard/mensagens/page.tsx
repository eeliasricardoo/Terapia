import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Phone, Video, MoreVertical, Paperclip } from "lucide-react"

// Mock Data
const CONVERSATIONS = [
    {
        id: 1,
        name: "Dra. Ana María Rojas",
        role: "Psicóloga Clínica",
        image: "/avatars/01.png",
        lastMessage: "Fico no aguardo da confirmação.",
        time: "14:30",
        unread: 2,
        online: true,
    },
    {
        id: 2,
        name: "Dr. Carlos Fuentes",
        role: "Terapia de Casal",
        image: "/avatars/02.png",
        lastMessage: "A sessão foi ótima, até semana que vem!",
        time: "Ontem",
        unread: 0,
        online: false,
    },
    {
        id: 3,
        name: "Suporte T-rapy",
        role: "Atendimento",
        image: "/avatars/support.png",
        lastMessage: "Como posso ajudar?",
        time: "Seg",
        unread: 0,
        online: true,
    },
]

const MESSAGES = [
    {
        id: 1,
        sender: "doctor",
        content: "Olá João, tudo bem? Como tem passado desde a última sessão?",
        time: "14:00",
    },
    {
        id: 2,
        sender: "me",
        content: "Oi Dra. Ana. Tenho me sentido um pouco melhor, mas ainda ansioso com o trabalho.",
        time: "14:05",
    },
    {
        id: 3,
        sender: "doctor",
        content: "Entendo. Vamos trabalhar isso na nossa sessão de hoje. Você prefere focar em alguma situação específica?",
        time: "14:10",
    },
    {
        id: 4,
        sender: "me",
        content: "Sim, teve uma reunião ontem que foi bem difícil.",
        time: "14:12",
    },
    {
        id: 5,
        sender: "doctor",
        content: "Certo. Anotei aqui para conversarmos. Fico no aguardo da confirmação.",
        time: "14:30",
    },
]

export default function MessagesPage() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
            {/* Sidebar / Conversation List */}
            <Card className="w-full md:w-80 flex flex-col h-full">
                <div className="p-4 border-b space-y-4">
                    <h2 className="font-semibold text-lg">Mensagens</h2>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar conversas..." className="pl-8" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {CONVERSATIONS.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${chat.id === 1 ? 'bg-secondary/50' : 'hover:bg-secondary/20'}`}
                        >
                            <div className="relative">
                                <Avatar>
                                    <AvatarImage src={chat.image} />
                                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {chat.online && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-sm truncate">{chat.name}</p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                    {chat.unread}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="/avatars/01.png" />
                            <AvatarFallback>DA</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">Dra. Ana María Rojas</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-xs text-muted-foreground">Online agora</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                    {MESSAGES.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl p-3 px-4 ${msg.sender === 'me'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-white border rounded-bl-none shadow-sm'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input placeholder="Digite sua mensagem..." className="flex-1" />
                        <Button size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
