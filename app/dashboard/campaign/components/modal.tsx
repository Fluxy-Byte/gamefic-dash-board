'use client'

import { useState, useEffect } from 'react'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { getTemplates } from '@/app/services/templates'
import Fundo from "@/public/Fundo-Whats.jpg"
import { createCampaing } from "@/app/services/campaings"
import { toast } from 'sonner'

interface Contact {
    phone: string
    name: string
    empresa: string
    email: string
}

interface TemplateData {
    id: string
    name: string
    language: string
    status: string
    category: string
    components: Array<{
        type: string
        text?: string
    }>
}

interface DisparoAtivoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    phoneNumberId: string
    idOrganizacao: string
}

export default function DisparoAtivoModal({
    open,
    onOpenChange,
    phoneNumberId,
    idOrganizacao,
}: DisparoAtivoModalProps) {
    const [campaignName, setCampaignName] = useState('')
    const [templates, setTemplates] = useState<TemplateData[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
    const [variables, setVariables] = useState<string[]>([])
    const [variableValues, setVariableValues] = useState<Record<string, string>>({})
    const [useContactData, setUseContactData] = useState<Record<string, boolean>>({})
    const [contacts, setContacts] = useState<Contact[]>([])
    const [csvStats, setCsvStats] = useState<{
        total: number
        withName: number
        withCompany: number
        withEmail: number
    } | null>(null)
    const [csvError, setCsvError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Carregar templates na abertura do modal
    useEffect(() => {
        if (open) {
            const loadTemplates = async () => {
                try {
                    const data = await getTemplates(phoneNumberId)
                    console.log(data.templates)
                    setTemplates(data.templates)
                    setLoading(false)
                } catch (error) {
                    console.error('Erro ao carregar templates:', error)
                    toast.error('Erro ao carregar templates')
                    setLoading(false)
                }
            }
            loadTemplates()
        }
    }, [open])

    // Extrair variáveis do template
    const extractVariables = (template: TemplateData): string[] => {
        const bodyComponent = template.components.find((c) => c.type === 'BODY')
        if (!bodyComponent || !bodyComponent.text) return []

        const regex = /\{\{(\d+)\}\}/g
        const matches = bodyComponent.text.matchAll(regex)
        const vars: string[] = []

        for (const match of matches) {
            const index = parseInt(match[1], 10) - 1
            vars[index] = `Parâmetro ${match[1]}`
        }

        return vars.filter(Boolean)
    }

    // Ao selecionar template
    const handleTemplateChange = (templateId: string) => {
        const template = templates.find((t) => t.id === templateId)
        if (template) {
            setSelectedTemplate(template)
            const vars = extractVariables(template)
            setVariables(vars)
            setVariableValues({})
            setUseContactData({})
        }
    }

    // Processar CSV
    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setCsvError(null)
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const csv = e.target?.result as string
                const lines = csv.split('\n').filter((line) => line.trim())

                if (lines.length < 2) {
                    setCsvError('CSV deve conter pelo menos um contato')
                    return
                }

                // Pular header
                const dataLines = lines.slice(1)
                const parsedContacts: Contact[] = []
                let validContacts = 0
                let withName = 0
                let withCompany = 0
                let withEmail = 0

                for (const line of dataLines) {
                    const [name, phone, empresa, email] = line.split(',').map((s) => s.trim())

                    // Validação: telefone é obrigatório
                    if (!phone) {
                        setCsvError(
                            `Contato com dados incompletos encontrado. Telefone é obrigatório.`
                        )
                        toast.error(`Contato com dados incompletos encontrado. Telefone é obrigatório.`)
                        return
                    }
                    console.log(parsedContacts)
                    parsedContacts.push({
                        phone,
                        name: name || '',
                        empresa: empresa || '',
                        email: email || '',
                    })

                    if (name) withName++
                    if (empresa) withCompany++
                    if (email) withEmail++
                }

                setContacts(parsedContacts)
                setCsvStats({
                    total: parsedContacts.length,
                    withName,
                    withCompany,
                    withEmail,
                })
            } catch (error) {
                setCsvError('Erro ao processar CSV. Verifique o formato.')
                toast.error('Erro ao processar CSV. Verifique o formato.')
            }
        }

        reader.readAsText(file)
    }

    // Construir JSON para enviar à API
    const buildPayload = () => {
        const numbers = contacts.map((contact) => {
            const parametersBody: string[] = []

            // Adicionar variáveis na ordem
            variables.forEach((_, index) => {
                const key = `var_${index}`
                if (useContactData[key]) {
                    // Usar dado do contato baseado no índice ou padrão
                    if (index === 0 && contact.name) {
                        parametersBody.push(contact.name)
                    } else if (index === 1 && contact.empresa) {
                        parametersBody.push(contact.empresa)
                    } else {
                        parametersBody.push(variableValues[key] || '')
                    }
                } else {
                    parametersBody.push(variableValues[key] || '')
                }
            })

            return {
                phone: contact.phone,
                name: contact.name,
                empresa: contact.empresa,
                email: contact.email,
                parametersHeader: [],
                parametersBody,
            }
        })

        if (!selectedTemplate) return null

        return {
            payload: {
                numbers,
                template_name: selectedTemplate.name,
                type: 'template',
                language: selectedTemplate.language,
            },
            phone_number_id: phoneNumberId,
            name_campanha: campaignName,
            id_organizacao: idOrganizacao,
            category: selectedTemplate.category,
        }
    }

    // Enviar para API
    const handleSubmit = async () => {
        if (!campaignName || !selectedTemplate || contacts.length === 0) {
            setCsvError('Preencha todos os campos obrigatórios')
            return
        }

        const payload = buildPayload()
        if (!payload) return

        try {
            // Aqui você chama sua API
            console.log('Payload a enviar:', payload)
            // const response = await fetch('/api/disparo', { method: 'POST', body: JSON.stringify(payload) })
            // if (!response.ok) throw new Error('Erro ao enviar')

            //const result = await createCampaing(payload)


            // if (result.status == true) {
            //     toast.success("Sucesso ao carregar campanha para disparo")
            // } else {
            //     toast.error(result.message)
            // }
            // Sucesso
            onOpenChange(false)
            resetForm()
        } catch (error) {
            toast.error('Erro ao enviar campanha')
            setCsvError('Erro ao enviar campanha')
        }
    }

    const resetForm = () => {
        setCampaignName('')
        setSelectedTemplate(null)
        setVariables([])
        setVariableValues({})
        setUseContactData({})
        setContacts([])
        setCsvStats(null)
        setCsvError(null)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Criar Campanha de Disparo</AlertDialogTitle>
                    <AlertDialogDescription>
                        Configure os detalhes da sua campanha de mensagens
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Nome da Campanha */}
                    <div className='space-y-2'>
                        <Label htmlFor='campaign-name'>Nome da Campanha *</Label>
                        <Input
                            id='campaign-name'
                            placeholder='Ex: Black Friday 2024'
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                        />
                    </div>

                    {/* Seleção de Template */}
                    <div className='space-y-2'>
                        <Label htmlFor='template-select'>Template *</Label>
                        {loading ? (
                            <div className='text-sm text-muted-foreground'>Carregando templates...</div>
                        ) : (
                            <Select onValueChange={handleTemplateChange}>
                                <SelectTrigger id='template-select'>
                                    <SelectValue placeholder='Selecione um template' />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name} - {template.status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Informações do Template Selecionado */}
                    {selectedTemplate && (
                        <Card className='p-4 bg-muted/50'>
                            <div className='text-sm space-y-1 flex flex-col gap-3'>
                                <p className="px-3 py-6 rounded-lg text-black bg-cover bg-center shadow-md"
                                    style={{ backgroundImage: `url(${Fundo.src})` }}>
                                    <span className='flex flex-col gap-2 bg-green-700 w-auto rounded-lg p-3'>
                                        {selectedTemplate.components.length > 0 && selectedTemplate.components.map((t: any, i) => {
                                            if (t.type == "HEADER" && t.format != "TEXT") {
                                                return (
                                                    <h1 key={i} className='text-xl w-full bg-neutral-700 text-white flex justify-center items-center px-2 py-6 rounded-lg'>
                                                        {t.text ?? ""}
                                                    </h1>
                                                )
                                            } else if (t.type == "HEADER" && t.format == "TEXT") {
                                                return (
                                                    <h1 key={i} className='text-xl'>
                                                        {t.text ?? ""}
                                                    </h1>
                                                )
                                            } else if (t.type == "BODY") {
                                                return (
                                                    <h3 key={i} className='text-base'>
                                                        {t.text ?? ""}
                                                    </h3>
                                                )
                                            } else if (t.type == "FOOTER") {
                                                return (
                                                    <p key={i} className='text-xs'>
                                                        {t.text ?? ""}
                                                    </p>
                                                )
                                            } else if (t.type == "BUTTONS") {
                                                t.buttons.map((b: any) => (
                                                    <p key={i} className='text-xs'>
                                                        {b.text ?? ""}
                                                    </p>
                                                ))
                                            } else {
                                                return (
                                                    <h3 key={i} className='text-base'>
                                                        {t.text ?? ""}
                                                    </h3>
                                                )
                                            }
                                        })}
                                    </span>
                                </p>
                                <p>
                                    <strong>Status:</strong> {selectedTemplate.status}
                                </p>
                                <p>
                                    <strong>Idioma:</strong> {selectedTemplate.language}
                                </p>
                                <p>
                                    <strong>Categoria:</strong> {selectedTemplate.category}
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* Variáveis do Template */}
                    {variables.length > 0 && (
                        <div className='space-y-3 border rounded-lg p-4'>
                            <h3 className='font-semibold text-sm'>Parâmetros do Template</h3>
                            {variables.map((variable, index) => (
                                <div key={index} className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <Label htmlFor={`var-${index}`}>{variable}</Label>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`use-contact-${index}`}
                                                checked={useContactData[`var_${index}`] || false}
                                                onCheckedChange={(checked) => {
                                                    setUseContactData({
                                                        ...useContactData,
                                                        [`var_${index}`]: checked as boolean,
                                                    })
                                                }}
                                            />
                                            <label
                                                htmlFor={`use-contact-${index}`}
                                                className='text-xs text-muted-foreground cursor-pointer'
                                            >
                                                Usar dados do contato
                                            </label>
                                        </div>
                                    </div>
                                    {!useContactData[`var_${index}`] && (
                                        <Input
                                            id={`var-${index}`}
                                            placeholder='Digite o valor do parâmetro'
                                            value={variableValues[`var_${index}`] || ''}
                                            onChange={(e) => {
                                                setVariableValues({
                                                    ...variableValues,
                                                    [`var_${index}`]: e.target.value,
                                                })
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload de CSV */}
                    <div className='space-y-3'>
                        <Label>Anexar Contatos (CSV) *</Label>
                        <div className='border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition'>
                            <input
                                type='file'
                                accept='.csv'
                                onChange={handleCsvUpload}
                                className='hidden'
                                id='csv-input'
                            />
                            <label htmlFor='csv-input' className='cursor-pointer flex flex-col items-center gap-2'>
                                <Upload className='h-8 w-8 text-muted-foreground' />
                                <span className='text-sm font-medium'>Anexar contatos</span>
                                <span className='text-xs text-muted-foreground'>
                                    Formato esperado: Nome, Empresa, Telefone, Email
                                </span>
                            </label>
                        </div>

                        {/* Estatísticas do CSV */}
                        {csvStats && (
                            <Card className='p-4 bg-green-50 dark:bg-green-950'>
                                <div className='flex items-start gap-2'>
                                    <CheckCircle2 className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                                    <div className='text-sm space-y-1 flex-1'>
                                        <p className='font-semibold text-green-900 dark:text-green-100'>
                                            {csvStats.total} contatos importados
                                        </p>
                                        <p className='text-green-800 dark:text-green-200'>
                                            • {csvStats.withName} com nome
                                        </p>
                                        <p className='text-green-800 dark:text-green-200'>
                                            • {csvStats.withCompany} com empresa
                                        </p>
                                        <p className='text-green-800 dark:text-green-200'>
                                            • {csvStats.withEmail} com email
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Mensagem de Erro */}
                    {csvError && (
                        <Alert variant='destructive'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{csvError}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className='flex gap-3 justify-end'>
                    <AlertDialogCancel onClick={resetForm}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={!campaignName || !selectedTemplate || contacts.length === 0}
                    >
                        Enviar Campanha
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
