<script setup lang="ts">
interface Option {
  label: string
  value: string
}

interface Props {
  modelValue: string | number | null | undefined
  id: string
  options?: Option[]
  placeholder?: string
}

const props = defineProps<Props>()
</script>

<template>
  <select :id="props.id" :value="props.modelValue" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300">
    <option value="" disabled>{{ props.placeholder || 'Select' }}</option>
    <option v-for="option in props.options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>