import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Schema {
  name: string
  label: string
  items: Record<string, any>
  meta?: Record<string, any>
}

export const useFormStore = defineStore('formStore', () => {
  const schema = ref<Schema | null>(null)
  const isLoaded = ref(false)
  const isSaving = ref(false)
  const STORAGE_KEY = 'admin_schema'

  async function loadSchema() {
    try {
      // First, try to load from localStorage
      const stored = localStorage.getItem(STORAGE_KEY)

      if (stored) {
        schema.value = JSON.parse(stored)
        isLoaded.value = true
        console.log('✅ Loaded schema from localStorage')
        return
      }

      // If no localStorage data, load from default file
      const res = await fetch('/schema.json')
      const data = await res.json()
      schema.value = data
      isLoaded.value = true
      console.log('✅ Loaded schema from default file')
    } catch (err) {
      console.error('❌ Failed to load schema:', err)
      isLoaded.value = false
    }
  }

  function updateSchema(newSchema: Schema) {
    schema.value = newSchema
  }

  function saveSchema() {
    if (!schema.value) {
      console.error('❌ No schema to save')
      return false
    }

    isSaving.value = true
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schema.value))
      console.log('✅ Schema saved to localStorage')
      return true
    } catch (err) {
      console.error('❌ Failed to save schema to localStorage:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  function resetToDefault() {
    // Remove localStorage data
    localStorage.removeItem(STORAGE_KEY)
    console.log('🔄 Reset to default - localStorage cleared')

    // Reload from default file
    schema.value = null
    isLoaded.value = false
    loadSchema()
  }

  async function importSchema(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Basic structure validation
      if (
        !data.name ||
        !data.label ||
        typeof data.items !== 'object' ||
        Array.isArray(data.items)
      ) {
        throw new Error('Invalid schema structure')
      }

      // Replace existing schema and save
      schema.value = data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      isLoaded.value = true
      console.log('📤 Imported new schema successfully')

      return { success: true }
    } catch (err: any) {
      console.error('❌ Failed to import schema:', err)
      return { success: false, message: err.message || 'Invalid schema file' }
    }
  }

  function exportSchema() {
    if (!schema.value) return

    const blob = new Blob([JSON.stringify(schema.value, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${schema.value.name || 'schema'}_backup.json`
    a.click()
    URL.revokeObjectURL(url)
    console.log('📥 Schema exported')
  }

  function hasLocalChanges() {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  return {
    schema,
    isLoaded,
    isSaving,
    loadSchema,
    updateSchema,
    saveSchema,
    resetToDefault,
    importSchema,
    exportSchema,
    hasLocalChanges,
  }
})
