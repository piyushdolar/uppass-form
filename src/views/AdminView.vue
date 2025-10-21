<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFormStore } from '@/stores/formStore'
import SelectInput from '../components/Inputs/SelectInput.vue'
import TextInput from '../components/Inputs/TextInput.vue'

const formStore = useFormStore()
const localSchema = ref<any>(null)

const enums = [
  { label: 'Text', value: 'Text' },
  { label: 'Email', value: 'Email' },
  { label: 'Radio', value: 'Radio' },
  { label: 'Date', value: 'Date' },
  { label: 'Text Area', value: 'Textarea' },
  { label: 'Number', value: 'Number' },
  { label: 'Select Box', value: 'Select' },
]

onMounted(async () => {
  await formStore.loadSchema()
  localSchema.value = JSON.parse(JSON.stringify(formStore.schema))
})

function validateAndSubmit() {
  // Update the store with all changes
  formStore.updateSchema(localSchema.value)

  // Save to localStorage
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

function handleTypeChange(field: any, newType: string) {
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
  if (localSchema.value?.items) {
    if (Array.isArray(localSchema.value.items)) {
      localSchema.value.items.splice(Number(key), 1)
    } else {
      delete localSchema.value.items[key]
    }
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
          </div>
        </header>

        <!-- Form -->
        <form @submit.prevent="validateAndSubmit" class="space-y-4">
          <template v-for="(field, key) in (localSchema?.items || {})" :key="key">
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Field Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <TextInput v-model="field.label" :id="`label-${key}`" :placeholder="field.display?.label || ''" />
                </div>

                <!-- Placeholder -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <TextInput v-model="field.placeholder" :id="`placeholder-${key}`" :placeholder="field.display?.placeholder || ''" />
                </div>

                <!-- Max Length -->
                <div v-if="field.props?.maxlength">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Max Length
                  </label>
                  <TextInput v-model="field.props.maxlength" :id="`maxlength-${key}`" type="number" placeholder="Maximum length" />
                </div>

                <!-- Field Type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Field Type
                  </label>
                  <SelectInput :model-value="field.type" @update:model-value="handleTypeChange(field, $event)" :id="`type-${key}`" :options="enums" />
                </div>

                <!-- If input box is select -->
                <div v-if="field.type === 'Select'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Available Options (Comma Separated)
                  </label>
                  <div>
                    <span v-for="badge in field.enum" :key="badge"
                      class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 inset-ring inset-ring-gray-400/20 mr-2 mb-2">
                      {{ badge.label }}
                    </span>
                  </div>
                </div>

                <!-- Required Checkbox -->
                <div>
                  <div class="mt-3">
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" v-model="field.rule" class="form-checkbox h-4 w-4 text-indigo-600 rounded">
                      <span class="text-sm text-gray-700">Field is required</span>
                    </label>
                  </div>

                  <!-- Allow Decimal (for Number type) -->
                  <div v-if="field.type === 'Number' && field.value_constraints" class="mt-2">
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" v-model="field.value_constraints.allow_decimal" class="form-checkbox h-4 w-4 text-indigo-600 rounded">
                      <span class="text-sm text-gray-700">Allow decimal values</span>
                    </label>
                  </div>
                </div>

                <!-- Delete Button -->
                <button type="button" @click="deleteField(key)"
                  class="mt-4 inline-flex items-center px-3 py-1.5 text-sm border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                  🗑️ Delete Field
                </button>
              </div>
            </div>
          </template>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 pt-6 border-t">
            <button type="submit" :disabled="formStore.isSaving"
              class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ formStore.isSaving ? '💾 Saving...' : '💾 Save Changes' }}
            </button>

            <button type="button" @click="localSchema = JSON.parse(JSON.stringify(formStore.schema))"
              class="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
              🔄 Discard Changes
            </button>

            <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleImport" />

            <button type="button" @click="fileInput?.click()"
              class="px-6 py-2.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 font-medium transition-colors">
              📤 Import Schema
            </button>


            <button type="button" @click="formStore.exportSchema()"
              class="px-6 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">
              📥 Export Backup
            </button>

            <button type="button" @click="resetToDefault()" v-if="formStore.hasLocalChanges()"
              class="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">
              ⚠️ Reset to Default
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>