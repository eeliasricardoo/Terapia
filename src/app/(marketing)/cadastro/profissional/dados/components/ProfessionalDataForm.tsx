"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./FileUpload"
import { SpecializationTags } from "./SpecializationTags"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    university: z.string().min(2, "A universidade é obrigatória"),
    academicLevel: z.string().min(1, "O nível acadêmico é obrigatório"),
    title: z.string().min(2, "O título é obrigatório"),
    diploma: z.instanceof(File).optional(),
    registrationNumber: z.string().min(6, "O número de registro é obrigatório"),
    expirationDate: z.date().optional(),
    license: z.instanceof(File).optional(),
    specializations: z.array(z.string()).min(1, "Adicione pelo menos uma especialização"),
    yearsOfExperience: z.string().min(1, "Os anos de experiência são obrigatórios"),
})

export function ProfessionalDataForm() {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            university: "",
            academicLevel: "",
            title: "",
            registrationNumber: "",
            specializations: [],
            yearsOfExperience: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // TODO: Integrate with Supabase
        console.log(values)
        // Navigate to next step
        router.push('/cadastro/profissional/disponibilidad')
    }

    return (
        <>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Dados Profissionais
                </h1>
                <p className="text-muted-foreground">
                    Complete suas informações profissionais para continuar.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Formação Acadêmica */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Formação Acadêmica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="university"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Universidade</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-[44px]"
                                                placeholder="ex. Universidade de São Paulo"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="academicLevel"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Nível Acadêmico</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="!h-[44px] w-full">
                                                        <SelectValue placeholder="Selecione o nível" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="graduacao">Graduação</SelectItem>
                                                    <SelectItem value="especializacao">Especialização</SelectItem>
                                                    <SelectItem value="mestrado">Mestrado</SelectItem>
                                                    <SelectItem value="doutorado">Doutorado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="min-h-[20px]">
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Título</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-[44px]"
                                                    placeholder="ex. Psicologia"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="min-h-[20px]">
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="diploma"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                                label="Diploma"
                                                value={field.value || null}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Licenças e Registros */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Licenças e Registros</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Registro Profissional</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-[44px]"
                                                    placeholder="ex. 123456"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="expirationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data de Expiração</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full h-[44px] justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                                        ) : (
                                                            <span>dd/mm/aaaa</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date: Date | undefined) => {
                                                            field.onChange(date)
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="license"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                                label="Licença Profissional"
                                                value={field.value || null}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Especialização e Experiência */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Especialização e Experiência</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="specializations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <SpecializationTags
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="yearsOfExperience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Anos de Experiência</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-[44px]"
                                                type="number"
                                                placeholder="ex. 5"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            className="font-bold h-[44px]"
                            disabled={!form.formState.isValid}
                            style={{
                                backgroundColor: 'hsl(340 72% 61%)',
                                color: 'white'
                            }}
                        >
                            Próximo
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    )
}

