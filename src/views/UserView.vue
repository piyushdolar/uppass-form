<script setup lang="ts">
import { onMounted } from 'vue'
import { useFormStore } from '@/stores/formStore'
import DynamicForm from '@/components/DynamicForm.vue'

const formStore = useFormStore()

onMounted(() => {
  formStore.loadSchema()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
    <div class="w-full max-w-3xl">
      <div v-if="!formStore.isLoaded" class="rounded-lg bg-white p-8 shadow flex items-center justify-center">
        <div class="text-center">
          <svg class="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4"></circle>
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
          </svg>
          <div class="text-sm text-gray-600">Loading schema…</div>
        </div>
      </div>

      <div v-else>
        <DynamicForm :schema="formStore.schema" />
      </div>
    </div>
  </div>
</template>