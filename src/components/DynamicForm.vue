<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import TextInput from './Inputs/TextInput.vue'
import RadioInput from './Inputs/RadioInput.vue'
import SelectInput from './Inputs/SelectInput.vue'
import type { Schema } from '@/types/schema'

const props = defineProps<{ schema: Schema }>()
const form = reactive<Record<string, string | number | null>>({})
const errors = reactive<Record<string, string>>({})
const submitMessage = ref('')

function initForm() {
  const sch = props.schema
  if (!sch) return

  // clear form and errors
  for (const k of Object.keys(form)) delete form[k]
  for (const k of Object.keys(errors)) delete errors[k]
  submitMessage.value = ''

  const items = sch.items || {}
  for (const key of Object.keys(items)) {
    const fld = items[key]
    if (!fld) continue

    if (fld.prefill?.value !== undefined) {
      form[key] = fld.prefill.value
    } else if (fld.type === 'Date' && key === 'start_date') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      form[key] = tomorrow.toISOString().split('T')[0] ?? ''
    } else {
      form[key] = fld.type === 'Radio' ? null : ''
    }
  }
}


watch(() => props.schema, initForm, { immediate: true })

function validateAndSubmit() {
  for (const k of Object.keys(errors)) delete errors[k]
  submitMessage.value = ''
  let ok = true
  const sch = props.schema
  if (!sch) return
  const items = sch.items || {}
  console.log(form)
  for (const key of Object.keys(items)) {
    const fld = items[key]
    if (!fld) continue
    const val = form[key]

    // Required validation
    if (fld.rule) {
      if (val === '' || val === null || val === undefined) {
        errors[key] = 'This field is required'
        ok = false
      }
    }

    // Number validation for decimal constraint
    if (fld.type === 'Number' && val !== '') {
      const allowDecimal = fld.value_constraints?.allow_decimal
      if (allowDecimal === 0 && !Number.isInteger(Number(val))) {
        errors[key] = 'Decimals are not allowed'
        ok = false
      }
    }
  }

  if (ok) {
    submitMessage.value = 'Validation passed'

    // Alert the user entered values
    alert('Form submitted:\n' + JSON.stringify(form, null, 2))
  }
}

</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 sm:p-8">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-gray-900"> {{ props.schema?.label || 'Form' }}</h1>
        <p v-if="props.schema" class="text-xs text-gray-500 mt-1">
          Schema: {{ props.schema.name }}
        </p>
      </div>

      <!-- User page redirection -->
      <router-link to="/admin" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 text-xs font-medium">
        👤 Open Admin Page
      </router-link>
    </header>

    <form @submit.prevent="validateAndSubmit" class="space-y-4">
      <template v-for="(field, key) in (props.schema?.items || {})" :key="key">
        <div v-if="field.visible">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.display?.label || field.name }}
            <span v-if="field.rule" class="text-red-500">*</span>
          </label>

          <template v-if="field.type === 'Text'">
            <TextInput v-model="form[key]" :id="key" :placeholder="field.display?.placeholder || ''" :maxlength="field.props?.maxlength" />
          </template>

          <template v-else-if="field.type === 'Number'">
            <input type="number" v-model.number="form[key]" :step="field.value_constraints?.allow_decimal === 0 ? '1' : 'any'"
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200" />

          </template>

          <template v-else-if="field.type === 'Radio'">
            <RadioInput v-model="form[key]" :id="key" :options="field.enum || []" />
          </template>

          <template v-else-if="field.type === 'Date'">
            <input type="date" v-model="form[key]" class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </template>

          <template v-else-if="field.type === 'Textarea'">
            <textarea v-model="form[key]" rows="4" class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
              :placeholder="field.display?.placeholder || ''"></textarea>
          </template>

          <template v-else-if="field.type === 'Select'">
            <SelectInput v-model="form[key]" :id="`select-${field.key}`" :options="field.enum" />
          </template>

          <div v-if="errors[key]" class="text-xs text-red-500 mt-1">{{ errors[key] }}</div>
        </div>
      </template>

      <div class="pt-4 flex items-center gap-3">
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Validate</button>
        <div v-if="submitMessage" class="text-sm text-green-600 ml-auto">{{ submitMessage }}</div>
      </div>
    </form>
  </div>
</template>