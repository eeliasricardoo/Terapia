import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  MessageSquare,
  ClipboardList,
  PenLine,
  Info,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react'
import { RoomChat } from '@/components/video/RoomChat'
import { RoomRecord } from '@/components/video/RoomRecord'
import { RoomEvolution } from '@/components/video/RoomEvolution'
import { cn } from '@/lib/utils'

interface RoomSidebarProps {
  isPsychologist?: boolean
  activeTab?: string
  onTabChange?: (value: string) => void
  appointmentId?: string
}

export function RoomSidebar({
  isPsychologist,
  activeTab,
  onTabChange,
  appointmentId,
}: RoomSidebarProps) {
  return (
    <div className="flex-1 bg-white border-l border-zinc-200 flex flex-col min-w-[360px] max-w-[460px] shadow-sm z-10 transition-all">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <div className="px-5 py-4 border-b border-zinc-100 bg-white">
          <TabsList
            className={cn(
              'grid w-full h-11 p-1 bg-zinc-100',
              isPsychologist ? 'grid-cols-3' : 'grid-cols-2'
            )}
          >
            {isPsychologist ? (
              <>
                <TabsTrigger
                  value="record"
                  className="text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-400"
                >
                  <ClipboardList className="h-3.5 w-3.5 mr-2" />
                  Prontuário
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-400"
                >
                  <PenLine className="h-3.5 w-3.5 mr-2" />
                  Evolução
                </TabsTrigger>
              </>
            ) : (
              <TabsTrigger
                value="info"
                className="text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-400"
              >
                <Info className="h-3.5 w-3.5 mr-2" />
                Sessão
              </TabsTrigger>
            )}
            <TabsTrigger
              value="chat"
              className="text-[11px] font-bold uppercase tracking-tight data-[state=active]:bg-white data-[state=active]:text-zinc-950 text-zinc-400"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {isPsychologist ? (
            <>
              <TabsContent
                value="record"
                className="m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col overflow-auto"
              >
                <RoomRecord appointmentId={appointmentId} />
              </TabsContent>
              <TabsContent
                value="notes"
                className="m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col overflow-auto"
              >
                <RoomEvolution appointmentId={appointmentId} />
              </TabsContent>
            </>
          ) : (
            <TabsContent
              value="info"
              className="m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col overflow-auto p-6 space-y-8"
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 py-8 bg-zinc-50 rounded-[32px] border border-zinc-100">
                  <div className="h-20 w-20 rounded-full bg-zinc-200 border-4 border-white shadow-sm flex items-center justify-center text-zinc-400">
                    <User className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight leading-none">
                      Ambiente de Cuidado
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 px-6">
                      Sessão individual confidencial e segura
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                    <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Segurança
                      </p>
                      <p className="text-sm font-bold text-zinc-900">Conexão P2P Criptografada</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                    <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Duração
                      </p>
                      <p className="text-sm font-bold text-zinc-900">Sessão de 50 minutos</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-950 rounded-3xl text-white space-y-4 relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
                  <h4 className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Lembrete Importante
                  </h4>
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    Aproveite este espaço para focar em você. Tente eliminar distrações e mantenha o
                    ambiente silencioso para uma melhor experiência terapêutica.
                  </p>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent
            value="chat"
            className="m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
          >
            <RoomChat />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
