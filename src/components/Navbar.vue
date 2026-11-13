<template>
  <header class="bg-panel border-b border-border sticky top-0 z-30 shrink-0 h-11 w-full px-4 sm:px-6 flex items-center justify-between select-none">
    <!-- Brand / Logo -->
    <button
      type="button"
      @click="$emit('go-home')"
      class="text-lg font-bold text-accent hover:opacity-90 tracking-tight transition-opacity cursor-pointer flex items-center gap-2"
    >
      <span>Presenter</span>
    </button>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 text-xs">
      <!-- Room Code Badge -->
      <span
        v-if="role && roomCode"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-soft text-accent font-semibold text-xs tracking-wide border border-accent-border"
      >
        Room {{ roomCode }}
      </span>

      <!-- Role Badge -->
      <span
        v-if="role"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-secondary font-medium text-xs capitalize border border-border"
      >
        {{ role }}
      </span>

      <!-- Theme Toggle Button (before Leave) -->
      <button
        type="button"
        @click="toggleTheme"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        class="btn-secondary p-1.5 rounded-lg cursor-pointer flex items-center justify-center transition"
      >
        <!-- Moon in light theme -->
        <svg
          v-if="theme === 'light'"
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <!-- Sun in dark theme -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>

      <!-- Leave Link -->
      <button
        v-if="role"
        type="button"
        @click="$emit('leave')"
        class="btn-text px-2.5 py-1 rounded-lg font-semibold text-xs ml-1 cursor-pointer transition"
      >
        Leave
      </button>
    </div>
  </header>
</template>

<script setup>
import { useTheme } from '../utils/theme'

defineProps({
  role: {
    type: String,
    default: null
  },
  roomCode: {
    type: String,
    default: null
  }
})

defineEmits(['go-home', 'leave'])

const { theme, toggleTheme } = useTheme()
</script>
