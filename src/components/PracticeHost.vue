<template>
  <div class="practice-host w-full h-full flex flex-col min-h-0 relative select-text">
    <!-- Thin Banner Above Practice Visualizer -->
    <div
      class="mb-2 w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border border-border bg-panel shrink-0"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
        <span class="text-xs text-secondary font-medium truncate">
          Practice mode. Your changes are private. The Mentor and other students cannot see them.
        </span>
      </div>
      <button
        type="button"
        @click="resetPractice"
        class="btn-secondary px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition active:scale-98"
      >
        Reset practice
      </button>
    </div>

    <!-- Active Private Instance of the Step Component -->
    <div class="practice-instance-wrapper flex-1 min-h-0 w-full flex items-center justify-center overflow-y-auto md:overflow-hidden relative">
      <component
        :is="component"
        :key="instanceKey"
        v-bind="stepProps"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  component: {
    type: [Object, Function],
    required: true
  },
  stepProps: {
    type: Object,
    default: () => ({})
  }
})

const instanceKey = ref(0)

function resetPractice() {
  instanceKey.value++
}
</script>

