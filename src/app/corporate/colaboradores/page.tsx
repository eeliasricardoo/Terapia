import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EmployeesPage() {
    // Mock Data
    const employees = [
        {
            id: 1,
            name: "Carlos Silva",
            email: "carlos.silva@company.com",
            role: "Engenheiro de Software",
            status: "Ativo",
            sessionsUsed: 4,
            lastSession: "2023-10-25",
        },
        {
            id: 2,
            name: "Mariana Costa",
            email: "mariana.costa@company.com",
            role: "Product Manager",
            status: "Ativo",
            sessionsUsed: 2,
            lastSession: "2023-10-20",
        },
        {
            id: 3,
            name: "João Santos",
            email: "joao.santos@company.com",
            role: "Designer",
            status: "Pendente",
            sessionsUsed: 0,
            lastSession: "-",
        },
        {
            id: 4,
            name: "Ana Oliveira",
            email: "ana.oliveira@company.com",
            role: "RH",
            status: "Ativo",
            sessionsUsed: 8,
            lastSession: "2023-10-28",
        },
        {
            id: 5,
            name: "Pedro Souza",
            email: "pedro.souza@company.com",
            role: "Marketing",
            status: "Inativo",
            sessionsUsed: 1,
            lastSession: "2023-09-15",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-2xl">Colaboradores</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie o acesso e benefícios do seu time.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Convidar Colaborador
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Convidar Colaborador</DialogTitle>
                            <DialogDescription>
                                Envie um convite por email para que o colaborador ative sua conta.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nome
                                </Label>
                                <Input id="name" placeholder="Nome completo" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input id="email" placeholder="email@empresa.com" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Cargo
                                </Label>
                                <Input id="role" placeholder="Ex: Desenvolvedor" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Enviar Convite</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome ou email..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sessões (Mês)</TableHead>
                            <TableHead>Última Sessão</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.email}`} />
                                            <AvatarFallback>{employee.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span>{employee.name}</span>
                                            <span className="text-xs text-muted-foreground">{employee.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={employee.status === "Ativo" ? "default" : employee.status === "Pendente" ? "outline" : "secondary"}
                                        className={employee.status === "Ativo" ? "bg-green-500 hover:bg-green-600" : ""}
                                    >
                                        {employee.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${(employee.sessionsUsed / 4) * 100}%` }}></div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{employee.sessionsUsed}/4</span>
                                    </div>
                                </TableCell>
                                <TableCell>{employee.lastSession}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
