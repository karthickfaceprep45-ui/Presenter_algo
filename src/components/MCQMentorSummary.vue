<template>
  <div class="mcq-mentor-summary w-full max-w-4xl mx-auto flex flex-col justify-center p-2 select-none">
    <!-- Subheader -->
    <div class="flex items-center justify-between mb-3 pb-2 border-b border-border">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-primary tracking-tight leading-tight">
          MCQ Results
        </h2>
        <p class="text-[11px] text-secondary">
          Session complete
        </p>
      </div>

      <button
        v-if="!isClassEnded"
        type="button"
        @click="$emit('end-class')"
        class="btn-tonal-danger inline-flex items-center px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer"
      >
        End Class
      </button>
      <span
        v-else
        class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-muted border border-border font-medium text-xs"
      >
        Class ended
      </span>
    </div>

    <!-- 3 Stat Cards in a row (Compact) -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-card border border-border rounded-xl p-3 text-center">
        <div class="text-2xl font-bold text-primary">
          {{ questions.length }}
        </div>
        <div class="text-[10px] font-semibold text-secondary uppercase tracking-wider mt-0.5">
          Questions
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-3 text-center">
        <div class="text-2xl font-bold text-success">
          {{ totalCorrectAnswers }}
        </div>
        <div class="text-[10px] font-semibold text-secondary uppercase tracking-wider mt-0.5">
          Correct Answers
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-3 text-center">
        <div class="text-2xl font-bold text-accent">
          {{ overallAccuracy }}%
        </div>
        <div class="text-[10px] font-semibold text-secondary uppercase tracking-wider mt-0.5">
          Accuracy
        </div>
      </div>
    </div>

    <!-- Detailed Questions Table (Compact) -->
    <div class="border border-border rounded-xl overflow-hidden bg-card">
      <div class="overflow-x-auto max-h-56 overflow-y-auto">
        <table class="w-full text-left text-xs">
          <thead class="sticky top-0 bg-panel backdrop-blur-xs z-10">
            <tr class="text-muted font-semibold text-[10px] uppercase tracking-wider border-b border-border">
              <th class="py-2 px-3 md:px-4">Question</th>
              <th class="py-2 px-3">Topic</th>
              <th class="py-2 px-2 text-center">Responded</th>
              <th class="py-2 px-2 text-center">Correct</th>
              <th class="py-2 px-3 md:px-4 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border font-medium text-secondary">
            <tr
              v-for="(q, idx) in questionStats"
              :key="q.id"
              class="hover:bg-raised/50 transition"
            >
              <td class="py-2.5 px-3 md:px-4 text-primary font-semibold">
                <div class="truncate max-w-[220px] md:max-w-[360px]" :title="q.question">
                  {{ idx + 1 }}. {{ q.question }}
                </div>
              </td>
              <td class="py-2.5 px-3 text-secondary">
                <span class="inline-flex px-2 py-0.5 rounded-full bg-raised text-secondary border border-border text-[10px] font-medium">
                  {{ q.topic }}
                </span>
              </td>
              <td class="py-2.5 px-2 text-center text-primary font-medium">
                {{ q.responded }}
              </td>
              <td class="py-2.5 px-2 text-center font-semibold text-success">
                {{ q.correct }}
              </td>
              <td class="py-2.5 px-3 md:px-4 text-right font-bold" :class="q.accuracy >= 50 ? 'text-accent' : 'text-secondary'">
                {{ q.accuracy }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  allResponses: {
    type: Object,
    default: () => ({})
  },
  isClassEnded: {
    type: Boolean,
    default: false
  }
})

defineEmits(['end-class'])

const questionStats = computed(() => {
  return props.questions.map((q) => {
    const responses = props.allResponses[q.id] || {}
    const responderList = Object.values(responses)
    const responded = responderList.length
    const correct = responderList.filter(r => r.isCorrect).length
    const accuracy = responded > 0 ? Math.round((correct / responded) * 100) : 0
    return {
      id: q.id,
      question: q.question,
      topic: q.topic || 'General',
      responded,
      correct,
      accuracy
    }
  })
})

const totalCorrectAnswers = computed(() => {
  return questionStats.value.reduce((acc, q) => acc + q.correct, 0)
})

const overallAccuracy = computed(() => {
  const totalResponded = questionStats.value.reduce((acc, q) => acc + q.responded, 0)
  if (totalResponded === 0) return 0
  return Math.round((totalCorrectAnswers.value / totalResponded) * 100)
})
</script>
