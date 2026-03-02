"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

export function SearchFilters() {
    return (
        <div className="space-y-5">
            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Especialidades</h4>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        "Ansiedade", "Depressão", "Terapia de Casal", "TDAH", "Autoestima",
                        "Carreira", "Burnout", "Luto", "Transtornos Alimentares", "TOC",
                        "Fobias", "Estresse Pós-Traumático"
                    ].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Abordagem Terapêutica</h4>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        "Cognitivo-Comportamental (TCC)", "Psicanálise", "Humanista",
                        "Gestalt-terapia", "Sistêmica", "Psicodrama"
                    ].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium leading-none text-slate-900">Preço por sessão</h4>
                    <span className="text-xs text-muted-foreground">R$ 50 - R$ 300+</span>
                </div>
                <Slider defaultValue={[300]} max={500} step={10} className="py-3" />
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Disponibilidade</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Hoje", "Esta semana", "Próxima semana", "Finais de semana", "Horário noturno"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Idiomas</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Português", "Inglês", "Espanhol", "Francês", "Italiano", "Libras"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Experiência</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Menos de 2 anos", "2-5 anos", "5-10 anos", "Mais de 10 anos"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Gênero</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Feminino", "Masculino", "Não-binário", "Sem preferência"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Formato de Atendimento</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Online", "Presencial", "Híbrido"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Público-Alvo</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Crianças", "Adolescentes", "Adultos", "Idosos", "Casais", "Famílias"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
