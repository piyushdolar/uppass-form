<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import draggable from 'vuedraggable'
import { useFormStore } from '@/stores/formStore'
import SelectInput from '../components/Inputs/SelectInput.vue'
import TextInput from '../components/Inputs/TextInput.vue'
import type { Schema, Field } from '@/types/schema'

const formStore = useFormStore()
const localSchema = ref<Schema | null>(null)

const enums = [
  { label: 'Text', value: 'Text' },
  { label: 'Email', value: 'Email' },
  { label: 'Radio', value: 'Radio' },
  { label: 'Date', value: 'Date' },
  { label: 'Text Area', value: 'Textarea' },
  { label: 'Number', value: 'Number' }
]

onMounted(async () => {
  await formStore.loadSchema()
  localSchema.value = JSON.parse(JSON.stringify(formStore.schema))
})

const sortableFields = computed({
  get() {
    if (!localSchema.value?.items) return []
    // Sort by existing sequence value first
    return Object.entries(localSchema.value.items)
      .sort((a, b) => (a[1].sequence || 0) - (b[1].sequence || 0))
      .map(([fieldKey, value]) => ({
        ...value,
        key: value.key || fieldKey,
      }))

  },
  set(newOrder) {
    if (!localSchema.value) return
    arrayToObject(newOrder)
  },
})

const arrayToObject = (newArray: Field[]) => {
  const reordered: Record<string, Field> = {}
  newArray.forEach((item, index) => {
    item.sequence = index + 1
    reordered[item.key] = item
  })

  if (localSchema.value) {
    localSchema.value.items = reordered
  }
}

function validateRequiredFields(): boolean {
  if (!localSchema.value) return false

  const requiredKeys = ['full_name', 'duration', 'reason']

  for (const key of requiredKeys) {
    const field = localSchema.value.items[key]
    if (!field) {
      alert(`❌ Field "${key}" must be preset and not empty.`)
      return false
    }
  }

  return true
}



function validateAndSubmit() {
  if (!localSchema.value) return // Exit if schema is not loaded

  // Validate required fields first
  if (!validateRequiredFields()) return

  arrayToObject(sortableFields.value)
  formStore.updateSchema(localSchema.value) // Now TypeScript is happy

  const saved = formStore.saveSchema()

  if (saved) {
    alert('✅ Schema saved successfully to localStorage!')
  } else {
    alert('❌ Failed to save schema. Please try again.')
  }
}


function resetToDefault() {
  if (confirm('Are you sure you want to reset to the default schema? All your changes will be lost.')) {
    formStore.resetToDefault()
    // Wait for reload then update local copy
    setTimeout(() => {
      localSchema.value = JSON.parse(JSON.stringify(formStore.schema))
    }, 100)
  }
}

function handleTypeChange(field: Field, newType: Field['type']) {
  field.type = newType

  // Initialize type-specific structures
  if (newType === 'Number') {
    if (!field.value_constraints) {
      field.value_constraints = {
        maximum: 1000000,
        allow_decimal: 0
      }
    }
  } else {
    delete field.value_constraints
  }

  if (newType === 'Radio' && !field.enum) {
    field.enum = []
  }
}


function deleteField(key: string) {
  // Prevent deletion if it would remove one of the required fields
  const requiredKeys = ['full_name', 'duration', 'reason']
  if (requiredKeys.includes(key)) {
    alert(`❌ Cannot delete required field "${key}".`)
    return
  }

  if (localSchema.value?.items) {
    delete localSchema.value.items[key]
  }
}


const fileInput = ref<HTMLInputElement | null>(null)

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const result = await formStore.importSchema(file)
  if (result.success) {
    alert('✅ Schema imported successfully!')
    localSchema.value = JSON.parse(JSON.stringify(formStore.schema))
  } else {
    alert(`❌ Failed to import schema: ${result.message}`)
  }

  target.value = '' // reset input
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
    <div class="w-full max-w-3xl rounded-lg bg-white p-4 shadow">
      <!-- Loading State -->
      <div v-if="!formStore.isLoaded" class="flex items-center justify-center">
        <div class="text-center">
          <svg class="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4"></circle>
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
          </svg>
          <div class="text-sm text-gray-600">Loading schema…</div>
        </div>
      </div>

      <!-- Loaded State -->
      <div v-else-if="localSchema">
        <!-- Header with Status Badge -->
        <header class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-semibold text-gray-900">
                {{ localSchema.label || 'Form' }} - Admin Panel
              </h1>
              <p class="text-xs text-gray-500 mt-1">
                Schema: {{ localSchema.name }}
              </p>
            </div>

            <!-- Status Badge -->
            <div v-if="formStore.hasLocalChanges()" class="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              📝 Using Custom Schema
            </div>
            <div v-else class="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              📄 Using Default Schema
            </div>

            <!-- User page redirection -->
            <router-link to="/user" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 text-sm font-medium">
              👤 Open User Page
            </router-link>
          </div>
        </header>

        <!-- Form -->
        <form @submit.prevent="validateAndSubmit" class="space-y-4">
          <draggable v-model="sortableFields" item-key="key" animation="200" ghost-class="opacity-60" handle=".drag-handle">
            <template #item="{ element }">
              <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-3">
                <div class="flex items-center justify-between mb-3">
                  <span class="cursor-grab text-gray-400 drag-handle" title="Drag to reorder">☰</span>
                  <span class="text-xs text-gray-500">Seq: {{ element.sequence }}</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Field Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                    <TextInput v-model="element.label" :id="`label-${element.key}`" :placeholder="element.display?.label || ''" />
                  </div>

                  <!-- Placeholder -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                    <TextInput v-model="element.placeholder" :id="`placeholder-${element.key}`" :placeholder="element.display?.placeholder || ''" />
                  </div>

                  <!-- Max Length -->
                  <div v-if="element?.maxlength">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Max Length
                    </label>
                    <TextInput v-model="element.maxlength" :id="`maxlength-${element.key}`" type="number" placeholder="Maximum length" />
                  </div>

                  <!-- Field Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                    <span v-if="element.type === 'Select'">
                      Select Box (Not changable)
                    </span>
                    <SelectInput v-else :model-value="element.type" :id="`select-${element.key}`"
                      @update:model-value="handleTypeChange(element, $event)" :options="enums" />
                  </div>

                  <!-- If input box is select -->
                  <div v-if="element.type === 'Select'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Available Options (Comma Separated)
                    </label>
                    <div>
                      <span v-for="badge in element.enum" :key="badge"
                        class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 inset-ring inset-ring-gray-400/20 mr-2 mb-2">
                        {{ badge.label }}
                      </span>
                    </div>
                  </div>

                  <!-- Required Checkbox -->
                  <div>
                    <div class="mt-3">
                      <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" v-model="element.visible" class="form-checkbox h-4 w-4 text-indigo-600 rounded">
                        <span class="text-sm text-gray-700">Make field visible?</span>
                      </label>
                    </div>

                    <div class="mt-3">
                      <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" v-model="element.rule" class="form-checkbox h-4 w-4 text-indigo-600 rounded">
                        <span class="text-sm text-gray-700">Field is required</span>
                      </label>
                    </div>

                    <!-- Allow Decimal (for Number type) -->
                    <div v-if="element.type === 'Number' && element.value_constraints" class="mt-2">
                      <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" v-model="element.value_constraints.allow_decimal"
                          class="form-checkbox h-4 w-4 text-indigo-600 rounded">
                        <span class="text-sm text-gray-700">Allow decimal values</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Delete -->
                <button type="button" @click="deleteField(element.key)"
                  class="mt-4 inline-flex items-center px-3 py-1.5 text-sm border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                  🗑️ Delete Field
                </button>
              </div>
            </template>
          </draggable>


          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 pt-6 border-t">
            <button type="submit" :disabled="formStore.isSaving"
              class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ formStore.isSaving ? '💾 Saving...' : '💾 Save Changes' }}
            </button>

            <button type="button" @click="localSchema = JSON.parse(JSON.stringify(formStore.schema))"
              class="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
              🔄 Discard Changes
            </button>

            <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleImport" />

            <button type="button" @click="fileInput?.click()"
              class="px-4 py-2.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 font-medium transition-colors">
              📤 Import Schema
            </button>


            <button type="button" @click="formStore.exportSchema()"
              class="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">
              📥 Export Backup
            </button>

            <button type="button" @click="resetToDefault()" v-if="formStore.hasLocalChanges()"
              class="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">
              ⚠️ Reset to Default
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>