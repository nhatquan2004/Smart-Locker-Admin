export type TSettingTone = 'blue' | 'green' | 'orange' | 'red' | 'slate'

export type TSettingInputKind = 'text' | 'number' | 'select'
export type TSettingValue = string | number | boolean

export type TSettingOption = {
    label: string
    value: string
}

export type TSettingStatItem = {
    id: string
    sectionId: string
    label: string
    value: string
    helper: string
    tone: TSettingTone
}

export type TSettingRowBase = {
    id: string
    icon: string
    label: string
    description: string
}

export type TSettingInputRow = TSettingRowBase & {
    type: 'input'
    inputKind?: TSettingInputKind
    value: string
    unit?: string
    placeholder?: string
    options?: TSettingOption[]
    required?: boolean
    min?: number
    max?: number
}

export type TSettingToggleRow = TSettingRowBase & {
    type: 'toggle'
    enabled: boolean
}

export type TSettingRow = TSettingInputRow | TSettingToggleRow

export type TSettingSection = {
    id: string
    title: string
    description: string
    badge?: string
    rows: TSettingRow[]
}

export type TSettingsOverview = {
    stats: TSettingStatItem[]
    sections: TSettingSection[]
}
