<template>
  <div class="w-full h-full flex flex-col items-center justify-center relative min-h-0 overflow-hidden select-none">
    <!-- Image fills available content area while keeping aspect ratio without cropping -->
    <img
      :src="imageSrc"
      :alt="title"
      class="max-w-full max-h-full object-contain rounded-xl select-none border border-border"
    />

    <!-- Subtle bottom overlay caption tag -->
    <div class="absolute bottom-3 left-4 bg-panel/90 backdrop-blur-xs text-primary text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg border border-border">
      {{ title }}
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  isMentor: {
    type: Boolean,
    default: false
  },
  isClassLive: {
    type: Boolean,
    default: false
  },
  stepNumber: {
    type: Number,
    default: 1
  },
  totalSteps: {
    type: Number,
    default: 3
  }
})

const getStepItemMeta = inject('getStepItemMeta', null)
const title = computed(() => {
  const meta = typeof getStepItemMeta === 'function' ? getStepItemMeta() : null
  const num = meta?.stepNumber ?? props.stepNumber
  const total = meta?.totalSteps ?? props.totalSteps
  return `Introduction — ${num} of ${total}`
})
const imageSrc = '/images/slide1.jpg'
</script>
