export interface WabaWithContacts {
    id: string
    phoneNumberId: string
    displayPhoneNumber: string
    organizationId: string
    agentId: string

    agent: {
        id: string
        name: string
        url: string
        mensagem?: string | null
    }

    contacts: Contacts[]
}

export interface Contacts {
    id: string
    name?: string | null
    email?: string | null
    phone: string
    leadGoal?: string | null
    startDateConversation: Date
    lastDateConversation?: Date | null
    wabaId: string
}