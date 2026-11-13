<template>
  <div class="admin-room-view w-full max-w-lg mx-auto px-4 py-4 md:py-6 flex-1 flex flex-col justify-center select-none">
    <div class="bg-card rounded-2xl p-5 sm:p-6 border border-border relative">
      <h1 class="text-xl font-bold text-primary tracking-tight">
        Room Created
      </h1>
      <p class="text-xs text-secondary mt-0.5 mb-4">
        Share the code below with your Mentor and Students
      </p>

      <!-- Dashed Room Code Box (Guaranteed single line, never wraps) -->
      <div class="border-2 border-dashed border-border-strong rounded-xl p-5 text-center bg-raised/50 mb-3">
        <div class="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">
          Room Code
        </div>
        
        <!-- 6 Individual Digit Cells in a Non-Wrapping Flex Row -->
        <div class="flex items-center justify-center gap-2 sm:gap-3.5 select-all whitespace-nowrap flex-nowrap font-mono text-3xl sm:text-4xl font-extrabold text-accent">
          <span
            v-for="(digit, i) in codeDigits"
            :key="i"
            class="inline-flex items-center justify-center w-8 sm:w-10 h-10 sm:h-12 text-center"
          >
            {{ digit }}
          </span>
        </div>
      </div>

      <!-- Copy Code Button -->
      <button
        type="button"
        @click="copyCode"
        :class="[
          'w-full font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs sm:text-sm cursor-pointer active:scale-98',
          isCopied ? 'btn-tonal-success' : 'btn-tonal-accent'
        ]"
      >
        <svg
          v-if="!isCopied"
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg
          v-else
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ isCopied ? 'Copied' : 'Copy Code' }}</span>
      </button>

      <!-- Copy Toast Notification -->
      <transition name="fade">
        <div
          v-if="showCopiedToast"
          class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-raised text-primary border border-border-strong text-xs font-medium px-3.5 py-1.5 rounded-full shadow-warm pointer-events-none"
        >
          Code copied!
        </div>
      </transition>

      <!-- Instructions Section -->
      <div class="mt-4 pt-4 border-t border-border">
        <div class="text-[10px] font-bold text-muted uppercase tracking-wider mb-2.5">
          Instructions
        </div>

        <div class="space-y-2">
          <div class="flex items-start gap-2.5 text-xs text-secondary">
            <span class="w-4 h-4 rounded-full bg-accent-soft text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-accent-border">
              1
            </span>
            <p>Share this code with the Mentor so they can start the class</p>
          </div>

          <div class="flex items-start gap-2.5 text-xs text-secondary">
            <span class="w-4 h-4 rounded-full bg-accent-soft text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-accent-border">
              2
            </span>
            <p>Share this same code with Students so they can join the room</p>
          </div>

          <div class="flex items-start gap-2.5 text-xs text-secondary">
            <span class="w-4 h-4 rounded-full bg-accent-soft text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-accent-border">
              3
            </span>
            <p>The Mentor will begin the session once everyone is ready</p>
          </div>
        </div>
      </div>

      <!-- Back / Actions -->
      <div class="mt-5 pt-3 border-t border-border flex items-center justify-between">
        <button
          type="button"
          @click="$emit('back-home')"
          class="btn-secondary font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer active:scale-98"
        >
          Back to Home
        </button>

        <button
          type="button"
          @click="$emit('join-as-mentor', roomCode)"
          class="btn-primary font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-98"
        >
          <span>Open Mentor view</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  roomCode: {
    type: String,
    required: true
  }
})

defineEmits(['back-home', 'join-as-mentor'])

const showCopiedToast = ref(false)
const isCopied = ref(false)
let copyTimer = null

const codeDigits = computed(() => {
  const code = (props.roomCode || '').replace(/\D/g, '')
  return code.slice(0, 6).split('')
})

function copyCode() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(props.roomCode)
  }
  showCopiedToast.value = true
  isCopied.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    showCopiedToast.value = false
    isCopied.value = false
  }, 1800)
}
</script>
