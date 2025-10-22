<script setup lang="ts">
import { RouterView } from 'vue-router'
import pkg from '../package.json'
const version = pkg?.version || '1.0.0'
</script>

<template>
  <div class="bg-gray-100 rounded-lg shadow">
    <header class="sticky top-0 z-20 bg-white border-b px-4 py-3 rounded-t-lg">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-xl font-bold text-gray-800 hover:text-blue-600">UpPass</router-link>
          <nav aria-label="Main navigation" class="hidden sm:flex items-center space-x-2">
            <router-link to="/" class="text-sm text-gray-600 hover:text-blue-600 px-3 py-1 rounded">Home</router-link>
            <router-link to="/admin" class="text-sm text-gray-600 hover:text-blue-600 px-3 py-1 rounded">Admin</router-link>
            <router-link to="/user" class="text-sm text-gray-600 hover:text-blue-600 px-3 py-1 rounded">User</router-link>
          </nav>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-sm text-gray-600 p-4 flex items-center space-x-4 divide-x divide-gray-200">
            <div class="pr-4"><span class="font-semibold">Received:</span> Tue, Oct 21, 10:59 AM</div>
            <div class="px-4"><span class="font-semibold">Submit Date:</span> 22/10/2025 3:30 PM</div>
            <div class="text-xs text-gray-500/80 px-2 py-0.5 rounded-md bg-gray-100">v{{ version }}</div>
          </div>
        </div>
      </div>
    </header>


    <RouterView />
  </div>
</template>