import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Smile, MessageSquare, ClipboardList, PenLine } from 'lucide-react'
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
              isPsychologist ? 'grid-cols-3' : 'grid-cols-1'
            )}
          >
            {isPsychologist && (
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
          {isPsychologist && (
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
