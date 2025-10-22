<script setup lang="ts">
interface Option {
  label: string
  value: string
}

interface Props {
  modelValue: string | null | undefined | number
  id: string
  options: Option[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col space-y-2">
    <div v-for="option in props.options" :key="option.value" class="flex items-center space-x-2">
      <input type="radio" :id="`${props.id}-${option.value}`" :name="props.id" :value="option.value" :checked="props.modelValue === option.value"
        @change="$emit('update:modelValue', option.value)" class="h-4 w-4 text-blue-600 border-gray-300 focus:ring focus:ring-blue-400" />
      <label :for="`${props.id}-${option.value}`" class="text-gray-700">
        {{ option.label }}
      </label>
    </div>
  </div>
</template>