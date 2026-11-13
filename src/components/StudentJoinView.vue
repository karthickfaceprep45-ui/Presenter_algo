<template>
  <div class="student-join-view w-full max-w-sm mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col justify-center select-none">
    <div class="bg-card rounded-2xl p-5 sm:p-6 border border-border">
      <!-- STEP 1: Enter Room Code -->
      <div v-if="step === 1">
        <h1 class="text-xl font-bold text-primary tracking-tight">
          Join a Room
        </h1>
        <p class="text-xs text-secondary mt-0.5 mb-5">
          Enter the 6-digit code provided by your Admin
        </p>

        <form @submit.prevent="handleCodeSubmit">
          <label for="student-room-code" class="block text-xs font-semibold text-primary mb-1.5">
            Room Code
          </label>
          <input
            id="student-room-code"
            type="text"
            v-model="inputCode"
            maxlength="6"
            placeholder="211313"
            autofocus
            class="w-full text-center text-3xl font-extrabold tracking-[0.2em] py-3 px-4 rounded-xl border-2 border-accent focus:outline-none focus:ring-2 focus:ring-accent text-primary bg-card placeholder:text-muted font-mono whitespace-nowrap transition"
          />

          <p v-if="codeError" class="text-xs text-danger mt-1.5 font-medium">
            {{ codeError }}
          </p>

          <button
            type="submit"
            :disabled="inputCode.trim().length !== 6"
            class="btn-primary w-full mt-4 font-semibold py-3 rounded-xl transition text-xs sm:text-sm active:scale-98 cursor-pointer"
          >
            Continue
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

      <!-- STEP 2: Enter Student Display Name -->
      <div v-else-if="step === 2">
        <h1 class="text-xl font-bold text-primary tracking-tight">
          Your Name
        </h1>
        <p class="text-xs text-secondary mt-0.5 mb-5">
          This name will be shown to the Mentor
        </p>

        <form @submit.prevent="handleNameSubmit">
          <label for="student-display-name" class="block text-xs font-semibold text-primary mb-1.5">
            Display Name
          </label>
          <input
            id="student-display-name"
            type="text"
            v-model="displayName"
            placeholder="e.g. Alex Smith"
            autofocus
            class="w-full py-2.5 px-3.5 rounded-xl border border-border-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent text-primary bg-card placeholder:text-muted text-xs sm:text-sm transition"
            :class="{ 'border-danger': nameError }"
          />

          <p v-if="nameError" class="text-xs text-danger mt-1.5 font-medium">
            Please enter your name.
          </p>

          <button
            type="submit"
            class="btn-primary w-full mt-4 font-semibold py-3 rounded-xl transition text-xs sm:text-sm active:scale-98 cursor-pointer"
          >
            Join Room
          </button>

          <button
            type="button"
            @click="step = 1"
            class="btn-secondary mt-3 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer active:scale-98"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['join-room', 'back-home'])

const step = ref(1)
const inputCode = ref('')
const codeError = ref('')
const displayName = ref('')
const nameError = ref(false)

function handleCodeSubmit() {
  const code = inputCode.value.replace(/\D/g, '').trim()
  if (code.length !== 6) {
    codeError.value = 'Please enter a valid 6-digit room code.'
    return
  }
  let isRemoved = false
  try {
    isRemoved = Boolean(localStorage.getItem(`presenter_removed_${code}`))
  } catch (_) {}
  if (isRemoved) {
    emit('join-room', {
      roomCode: code,
      name: ''
    })
    return
  }
  codeError.value = ''
  step.value = 2
}

function handleNameSubmit() {
  const name = displayName.value.trim()
  if (!name) {
    nameError.value = true
    return
  }
  nameError.value = false
  emit('join-room', {
    roomCode: inputCode.value.trim(),
    name
  })
}
</script>
