<template>
  <div class="grid content-center justify-items-center min-h-screen p-6">
    <div
      class="w-full max-w-4xl bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700 p-6 sm:p-10 lh-3">
      <header class="text-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Choose your role</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Select Admin or User to continue.</p>
      </header>

      <main class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <RouterLink to="/admin"
          class="relative group block rounded-2xl overflow-hidden p-6 sm:p-8 text-center transform transition duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          aria-label="Go to Admin">
          <div class="absolute inset-0 bg-linear-to-br from-purple-600 to-indigo-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10 text-white flex flex-col items-center">
            <div class="text-5xl mb-3">🔐</div>
            <div class="text-lg sm:text-xl font-semibold">Admin</div>
            <p class="mt-2 text-sm max-w-xs opacity-90">Manage JSON schema, settings, and administrative controls.</p>
          </div>
        </RouterLink>

        <RouterLink to="/user"
          class="relative group block rounded-2xl overflow-hidden p-6 sm:p-8 text-center transform transition duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
          aria-label="Go to User">
          <div class="absolute inset-0 bg-white/85 dark:bg-gray-700/70 group-hover:backdrop-blur-sm transition"></div>
          <div class="relative z-10 text-gray-900 dark:text-white flex flex-col items-center">
            <div class="text-5xl mb-3">👤</div>
            <div class="text-lg sm:text-xl font-semibold">User</div>
            <p class="mt-2 text-sm max-w-xs opacity-90">Access to JSON schema file render, and fill forms.</p>
          </div>
        </RouterLink>
      </main>
    </div>
  </div>

</template>