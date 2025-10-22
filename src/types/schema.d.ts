// src/types/schema.d.ts

export interface Field {
  name: string
  key: string
  type: 'Text' | 'Email' | 'Radio' | 'Date' | 'Textarea' | 'Number' | 'Select'
  visible?: boolean | Record<string, string>
  rule?: boolean
  sequence?: number
  layout?: string
  label?: string
  placeholder?: string
  enum?: { label: string; value: string }[]
  value_constraints?: {
    maximum?: number
    allow_decimal?: 0 | 1
  }
  prefill?: {
    value: string | number | null
  }
  display?: {
    label?: string
    placeholder?: string
  }
  props?: {
    maxlength?: number
    [key: string]: string | number | boolean | undefined
  }
  builder?: {
    type: string
  }
}

export interface Schema {
  name: string
  label: string
  items: Record<string, Field>
}
