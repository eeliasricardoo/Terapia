import { TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export function RoomRecord() {
    return (
        <>
            <TabsContent value="record" className="p-4 m-0 flex-1 overflow-y-auto space-y-4 data-[state=active]:flex data-[state=active]:flex-col">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Histórico Recente</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-500">
                        <p>15 Fev - Sessão Regular (Ansiedade Social)</p>
                        <Separator className="my-2" />
                        <p>10 Fev - Primeira Consulta</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Dados do Paciente</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="font-semibold">Nome:</span>
                            <span>Ana Silva</span>
                            <span className="font-semibold">Idade:</span>
                            <span>32 anos</span>
                            <span className="font-semibold">Queixa:</span>
                            <span>Ansiedade, Insônia</span>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="notes" className="p-4 m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col">
                <textarea
                    className="w-full flex-1 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white shadow-sm"
                    placeholder="Faça suas anotações da sessão aqui..."
                ></textarea>
                <div className="mt-4 flex justify-end shrink-0">
                    <Button size="sm">Salvar Evolução</Button>
                </div>
            </TabsContent>
        </>
    )
}
