<template>
  <div class="mentor-login-view w-full max-w-sm mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col justify-center select-none">
    <div class="bg-card rounded-2xl p-5 sm:p-6 border border-border">
      <h1 class="text-xl font-bold text-primary tracking-tight">
        Mentor Login
      </h1>
      <p class="text-xs text-secondary mt-0.5 mb-5">
        Enter the room code to access your controls
      </p>

      <form @submit.prevent="handleSubmit">
        <label for="mentor-room-code" class="block text-xs font-semibold text-primary mb-1.5">
          Room Code
        </label>
        <input
          id="mentor-room-code"
          type="text"
          v-model="inputCode"
          maxlength="6"
          placeholder="211313"
          autofocus
          class="w-full text-center text-3xl font-extrabold tracking-[0.2em] py-3 px-4 rounded-xl border-2 border-accent focus:outline-none focus:ring-2 focus:ring-accent text-primary bg-card placeholder:text-muted font-mono whitespace-nowrap transition"
        />

        <p v-if="errorMsg" class="text-xs text-danger mt-1.5 font-medium">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="inputCode.trim().length !== 6"
          class="btn-primary w-full mt-4 font-semibold py-3 rounded-xl transition text-xs sm:text-sm active:scale-98 cursor-pointer"
        >
          Enter Room
        </button>

        <button
          type="button"
          @click="$emit('back-home')"
          class="btn-secondary mt-3 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer active:scale-98"
        >
          Back
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['enter-room', 'back-home'])

const inputCode = ref('')
const errorMsg = ref('')

function handleSubmit() {
  const code = inputCode.value.replace(/\D/g, '').trim()
  if (code.length !== 6) {
    errorMsg.value = 'Please enter a valid 6-digit room code.'
    return
  }
  errorMsg.value = ''
  emit('enter-room', code)
}
</script>
