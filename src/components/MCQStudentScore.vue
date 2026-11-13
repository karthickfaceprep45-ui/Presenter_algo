<template>
  <div class="mcq-student-score w-full max-w-2xl mx-auto my-auto flex flex-col justify-center p-2 select-none">
    <!-- Header -->
    <div class="mb-3">
      <h2 class="text-base sm:text-lg font-bold text-primary tracking-tight leading-tight">
        Your Results
      </h2>
      <p class="text-[11px] text-secondary">
        MCQ session complete
      </p>
    </div>

    <!-- Score Summary Banner Card (Compact) -->
    <div class="bg-card border border-border rounded-xl p-3 sm:p-4 flex items-center gap-4 mb-3">
      <!-- Circular Ring Score -->
      <div
        :class="[
          'w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex flex-col items-center justify-center shrink-0 bg-raised',
          scoreAccuracy >= 70 ? 'border-success text-success' : 'border-warning text-warning'
        ]"
      >
        <span class="text-base sm:text-lg font-extrabold leading-none">
          {{ correctCount }}
        </span>
        <span class="text-[9px] font-semibold text-muted mt-0.5">
          / {{ questions.length }}
        </span>
      </div>

      <!-- Feedback Text -->
      <div>
        <h3 class="text-sm sm:text-base font-bold text-primary">
          {{ feedbackHeadline }}
        </h3>
        <p class="text-xs text-secondary mt-0.5">
          You answered {{ correctCount }} of {{ questions.length }} questions correctly ({{ scoreAccuracy }}%).
        </p>
      </div>
    </div>

    <!-- Question-by-Question Detailed Review (Compact scrollable list) -->
    <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
      <div
        v-for="(q, idx) in questions"
        :key="q.id"
        class="bg-card rounded-xl border border-border p-3"
      >
        <!-- Header -->
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold text-muted tracking-wider uppercase">
            Question {{ idx + 1 }} — {{ q.topic }}
          </span>

          <span
            v-if="isQuestionCorrect(q.id)"
            class="px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/30 text-[10px] font-semibold"
          >
            Correct
          </span>
          <span
            v-else
            class="px-2 py-0.5 rounded-full bg-danger-soft text-danger border border-danger/30 text-[10px] font-semibold"
          >
            Incorrect
          </span>
        </div>

        <!-- Question text -->
        <h4 class="text-xs sm:text-sm font-bold text-primary mb-2 leading-snug">
          {{ q.question }}
        </h4>

        <!-- Options Review -->
        <div class="space-y-1.5">
          <div
            v-for="opt in q.options"
            :key="opt.label"
            :class="[
              'p-2 rounded-lg border text-xs font-medium flex items-center gap-2.5 transition',
              getReviewOptionClass(q, opt.label)
            ]"
          >
            <span
              :class="[
                'w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0',
                getReviewBadgeClass(q, opt.label)
              ]"
            >
              {{ opt.label }}
            </span>
            <span class="flex-1">{{ opt.text }}</span>
          </div>
        </div>
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
  studentAnswers: {
    type: Object,
    default: () => ({})
  }
})

const correctCount = computed(() => {
  return props.questions.filter((q) => {
    const ans = props.studentAnswers[q.id]
    return ans && ans.isCorrect
  }).length
})

const scoreAccuracy = computed(() => {
  if (props.questions.length === 0) return 0
  return Math.round((correctCount.value / props.questions.length) * 100)
})

const feedbackHeadline = computed(() => {
  const acc = scoreAccuracy.value
  if (acc === 100) return 'Outstanding Score!'
  if (acc >= 75) return 'Great Job!'
  if (acc >= 50) return 'Well Done!'
  return 'Nice Effort!'
})

function isQuestionCorrect(questionId) {
  const ans = props.studentAnswers[questionId]
  return Boolean(ans && ans.isCorrect)
}

function getReviewOptionClass(q, label) {
  const ans = props.studentAnswers[q.id]
  const isCorrectOption = label === q.correctAnswer
  const isSelectedByStudent = ans && ans.selectedOption === label

  if (isCorrectOption) {
    return 'border-2 border-success bg-success-soft text-success font-semibold'
  }
  if (isSelectedByStudent && !isCorrectOption) {
    return 'border-2 border-danger bg-danger-soft text-danger font-semibold'
  }
  return 'border border-border bg-card text-muted opacity-80'
}

function getReviewBadgeClass(q, label) {
  const ans = props.studentAnswers[q.id]
  const isCorrectOption = label === q.correctAnswer
  const isSelectedByStudent = ans && ans.selectedOption === label

  if (isCorrectOption) {
    return 'bg-success text-on-accent font-bold'
  }
  if (isSelectedByStudent && !isCorrectOption) {
    return 'bg-danger text-on-accent font-bold'
  }
  return 'bg-raised text-muted'
}
</script>
