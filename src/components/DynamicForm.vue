<script setup lang="ts">
import { defineProps, reactive, watch, ref } from 'vue'
import TextInput from './Inputs/TextInput.vue'
import RadioInput from './Inputs/RadioInput.vue'

const props = defineProps<{ schema: any }>()

const form = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})
const submitMessage = ref('')

function initForm() {
  // accept either a ref-wrapped schema or a plain object
  const sch = props.schema && props.schema.value ? props.schema.value : props.schema
  if (!sch) return
  // clear
  for (const k of Object.keys(form)) delete form[k]
  for (const k of Object.keys(errors)) delete errors[k]
  submitMessage.value = ''

  const items = sch.items || {}
  for (const key of Object.keys(items)) {
    const fld = items[key]
    if (fld?.prefill?.value !== undefined) form[key] = fld.prefill.value
    else form[key] = fld.type === 'Radio' ? null : ''
  }
  if (sch.days) {
    const key = sch.days.name || 'days'
    form[key] = sch.days?.prefill?.value ?? ''
  }
}

watch(() => props.schema, initForm, { immediate: true })

function validateAndSubmit() {
  for (const k of Object.keys(errors)) delete errors[k]
  submitMessage.value = ''
  let ok = true
  const sch = props.schema && props.schema.value ? props.schema.value : props.schema
  if (!sch) return
  const items = sch.items || {}
  for (const key of Object.keys(items)) {
    const fld = items[key]
    const val = form[key]
    // Required validation
    if (fld.rule && fld.rule.includes('required')) {
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
  if (sch.days) {
    const k = sch.days.name || 'days'
    const max = sch.days.value_constraints?.maximum
    if (max !== undefined && Number(form[k]) > max) {
      errors[k] = `Maximum allowed is ${max}`
      ok = false
    }
  }

  if (ok) {
    submitMessage.value = 'Validation passed — ready to submit.'
    // for now just log the form

    console.log('Form data:', JSON.parse(JSON.stringify(form)))
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 sm:p-8">
    <header class="mb-4">
      <h1 class="text-xl font-semibold text-gray-900">{{ (props.schema && props.schema.value ? props.schema.value.label : props.schema?.label) ||
        'Form' }}</h1>
      <p v-if="props.schema && (props.schema.value ? props.schema.value.name : props.schema?.name)" class="text-xs text-gray-500 mt-1">
        Schema: {{ props.schema && props.schema.value ? props.schema.value.name : props.schema?.name }}
      </p>
    </header>

    <form @submit.prevent="validateAndSubmit" class="space-y-4">
      <template v-for="(field, key) in (props.schema?.items || {})" :key="key">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.display?.label || field.name }}</label>

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

          <div v-if="errors[key]" class="text-xs text-red-500 mt-1">{{ errors[key] }}</div>
        </div>
      </template>

      <div v-if="props.schema && (props.schema.value ? props.schema.value.days : props.schema?.days)" class="pt-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ (props.schema && props.schema.value ? props.schema.value.days.display?.label :
          props.schema?.days?.display?.label) || 'days' }}</label>
        <input type="number"
          v-model.number="form[(props.schema && props.schema.value ? props.schema.value.days.name : props.schema?.days?.name) || 'days']"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <div v-if="errors[(props.schema && props.schema.value ? props.schema.value.days.name : props.schema?.days?.name) || 'days']"
          class="text-xs text-red-500 mt-1">
          {{ errors[(props.schema && props.schema.value ? props.schema.value.days.name : props.schema?.days?.name) || 'days'] }}
        </div>
      </div>

      <div class="pt-4 flex items-center gap-3">
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Validate</button>
        <div v-if="submitMessage" class="text-sm text-green-600 ml-auto">{{ submitMessage }}</div>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Minimal scoped rules; layout provided by Tailwind utilities */
</style>