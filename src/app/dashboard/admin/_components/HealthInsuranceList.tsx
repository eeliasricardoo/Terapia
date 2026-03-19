'use client'

import { useState } from 'react'
import {
  createHealthInsurance,
  deleteHealthInsurance,
  updateHealthInsurance,
} from '@/lib/actions/admin'
import { Plus, Trash2, Search, HeartPulse, Loader2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type HealthInsurance = {
  id: string
  name: string
  logoUrl?: string | null
  createdAt: Date
}

export function HealthInsuranceList({
  initialInsurances,
}: {
  initialInsurances: HealthInsurance[]
}) {
  const [insurances, setInsurances] = useState(initialInsurances)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedInsurance, setSelectedInsurance] = useState<HealthInsurance | null>(null)
  const [newName, setNewName] = useState('')
  const [editName, setEditName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filtered = insurances.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('Informe o nome da operadora.')
      return
    }

    setIsSubmitting(true)
    const result = await createHealthInsurance(newName)

    if (result.success && result.data) {
      toast.success('Plano de saúde cadastrado com sucesso!')
      setInsurances((prev) =>
        [...prev, result.data as HealthInsurance].sort((a, b) => a.name.localeCompare(b.name))
      )
      setNewName('')
      setIsAddDialogOpen(false)
    } else {
      toast.error(result.error || 'Erro ao cadastrar plano de saúde.')
    }
    setIsSubmitting(false)
  }

  const handleEdit = async () => {
    if (!selectedInsurance || !editName.trim()) {
      toast.error('Informe o nome da operadora.')
      return
    }

    setIsSubmitting(true)
    const result = await updateHealthInsurance(selectedInsurance.id, editName)

    if (result.success && result.data) {
      toast.success('Plano de saúde atualizado com sucesso!')
      setInsurances((prev) =>
        prev.map((i) => (i.id === selectedInsurance.id ? (result.data as HealthInsurance) : i))
      )
      setIsEditDialogOpen(false)
      setSelectedInsurance(null)
      setEditName('')
    } else {
      toast.error(result.error || 'Erro ao atualizar plano de saúde.')
    }
    setIsSubmitting(false)
  }

  const openEditDialog = (insurance: HealthInsurance) => {
    setSelectedInsurance(insurance)
    setEditName(insurance.name)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o plano "${name}"? Isso pode afetar psicólogos e pacientes vinculados.`
      )
    ) {
      return
    }

    setIsDeleting(id)
    const result = await deleteHealthInsurance(id)

    if (result.success) {
      toast.success('Plano de saúde excluído com sucesso.')
      setInsurances((prev) => prev.filter((i) => i.id !== id))
    } else {
      toast.error(result.error || 'Erro ao excluir plano de saúde.')
    }
    setIsDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar por operadora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  Operadora
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  Data de Cadastro
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                        <HeartPulse className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                          {i.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(i.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-primary hover:bg-primary/5"
                      onClick={() => openEditDialog(i)}
                      disabled={isDeleting === i.id}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(i.id, i.name)}
                      disabled={isDeleting === i.id}
                    >
                      {isDeleting === i.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                      <HeartPulse className="h-10 w-10 mb-2 opacity-20" />
                      <p className="font-medium text-sm">
                        {searchTerm
                          ? 'Nenhum plano encontrado na busca.'
                          : 'Nenhum plano de saúde cadastrado.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Plano de Saúde</DialogTitle>
            <DialogDescription>
              Cadastre uma nova operadora de saúde para que psicólogos possam aceitá-la e pacientes
              possam utilizá-la.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-neutral-900">
                Nome da Operadora
              </label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Unimed, Bradesco Saúde, Amil..."
                className="focus-visible:ring-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting || !newName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Cadastrar Plano'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plano de Saúde</DialogTitle>
            <DialogDescription>
              Altere o nome da operadora de saúde. Isso será refletido em todo o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-semibold text-neutral-900">
                Nome da Operadora
              </label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ex: Unimed, Bradesco Saúde, Amil..."
                className="focus-visible:ring-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedInsurance(null)
                setEditName('')
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting || !editName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
