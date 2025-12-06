"use client"

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
import { PageHeader } from "./PageHeader"
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
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    university: z.string().min(2, "La universidad es obligatoria"),
    academicLevel: z.string().min(1, "El nivel académico es obligatorio"),
    title: z.string().min(2, "El título es obligatorio"),
    diploma: z.instanceof(File).optional(),
    registrationNumber: z.string().min(6, "El número de registro es obligatorio"),
    expirationDate: z.date().optional(),
    license: z.instanceof(File).optional(),
    specializations: z.array(z.string()).min(1, "Agrega al menos una especialización"),
    yearsOfExperience: z.string().min(1, "Los años de experiencia son obligatorios"),
})

export function ProfessionalDataForm() {
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
    }

    return (
        <div className="space-y-8">
            <PageHeader />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Formación Académica */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Formación Académica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="university"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Universidad</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-[44px]"
                                                placeholder="e.g. Universidad Nacional de Colombia"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="academicLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nivel Académico</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="!h-[44px] w-full">
                                                        <SelectValue placeholder="Selecciona el nivel" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="graduacao">Graduación</SelectItem>
                                                    <SelectItem value="especializacao">Especialización</SelectItem>
                                                    <SelectItem value="mestrado">Maestría</SelectItem>
                                                    <SelectItem value="doutorado">Doctorado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-[44px]"
                                                    placeholder="e.g. Psicología"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
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

                    {/* Licencias y Registros */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Licencias y Registros</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Registro Profesional</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-[44px]"
                                                    placeholder="e.g. 123456"
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
                                            <FormLabel>Fecha de Expiración</FormLabel>
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
                                                            format(field.value, "dd/MM/yyyy", { locale: es })
                                                        ) : (
                                                            <span>mm/dd/yyyy</span>
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
                                                label="Licencia Profesional"
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

                    {/* Especialización y Experiencia */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Especialización y Experiencia</CardTitle>
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
                                        <FormLabel>Años de Experiencia</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-[44px]"
                                                type="number"
                                                placeholder="e.g. 5"
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
                        >
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

