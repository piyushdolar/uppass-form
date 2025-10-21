<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  modelValue?: string | number
  id: string
  placeholder?: string
  maxlength?: number
  type?: 'text' | 'number'
}

const props = defineProps<Props>()
</script>

<template>
  <input :id="props.id" :value="props.modelValue" :type="props.type || 'text'" :placeholder="props.placeholder || ''" :maxlength="props.maxlength"
    @input="$emit('update:modelValue', $event.target.value)"
    class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300" />
</template>