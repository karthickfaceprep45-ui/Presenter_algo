<template>
  <div
    :class="[
      'question-view-wrapper w-full flex flex-col justify-center max-w-5xl mx-auto p-1 sm:p-2',
      isMentor ? 'h-full' : 'my-auto'
    ]"
  >
    <!-- STUDENT VIEW (Compact) -->
    <div v-if="!isMentor" class="question-view-student w-full max-w-2xl mx-auto flex flex-col justify-center">
      <!-- Badges -->
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-primary border border-border font-semibold text-xs">
          Question {{ questionNumber }} / {{ totalQuestions }}
        </span>
        <span
          v-if="!isRevealed"
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent-border font-medium text-xs"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
          MCQ Active
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-secondary border border-border font-medium text-xs"
        >
          Answer revealed
        </span>
      </div>

      <!-- Alert Banner (shown only to unanswered students when alerted by Mentor) -->
      <div
        v-if="visibleStudentAlert"
        role="alert"
        class="student-question-alert mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-xs sm:text-sm text-warning"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-warning shrink-0"></span>
          <span class="font-medium">{{ visibleStudentAlert.message }}</span>
        </div>
        <button
          type="button"
          @click="dismissStudentAlert"
          class="btn-secondary px-2.5 py-0.5 rounded-md font-semibold text-[11px] shrink-0 transition cursor-pointer"
        >
          Dismiss
        </button>
      </div>

      <!-- Question Text -->
      <h2 class="text-sm sm:text-base md:text-lg font-bold text-primary leading-snug mb-3">
        {{ questionData.question }}
      </h2>

      <!-- Options List -->
      <div class="space-y-2">
        <button
          v-for="opt in questionData.options"
          :key="getOptionId(opt)"
          type="button"
          :disabled="isRevealed || isSessionEnded"
          @click="selectOption(getOptionId(opt))"
          :class="[
            'mcq-option-row w-full p-2.5 sm:p-3 rounded-xl border-2 text-left font-medium flex items-center justify-between gap-3 transition text-xs sm:text-sm min-h-[46px] sm:min-h-[50px]',
            getStudentOptionClass(opt)
          ]"
        >
          <!-- Left Side: Option Letter Badge & Text -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <span
              :class="[
                'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition',
                getStudentOptionBadgeClass(opt)
              ]"
            >
              {{ opt.label || getOptionId(opt) }}
            </span>

            <span class="flex-1 truncate sm:whitespace-normal text-primary font-medium leading-snug">
              {{ opt.text }}
            </span>
          </div>

          <!-- Right Side Status Label (Visible after reveal, reserved space) -->
          <div
            v-if="isRevealed"
            class="mcq-option-status-label shrink-0 flex items-center justify-end text-xs font-semibold select-none pl-2"
          >
            <!-- Case 1: Student answer AND correct -->
            <span
              v-if="isStudentOption(opt) && isOptionCorrect(opt)"
              class="inline-flex items-center gap-1.5 text-success whitespace-nowrap"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Your answer, correct</span>
            </span>

            <!-- Case 2: Student answer AND wrong -->
            <span
              v-else-if="isStudentOption(opt) && !isOptionCorrect(opt)"
              class="inline-flex items-center gap-1.5 text-danger whitespace-nowrap"
            >
              <span>Your answer</span>
            </span>

            <!-- Case 3: Correct answer (not student answer) -->
            <span
              v-else-if="isOptionCorrect(opt)"
              class="inline-flex items-center gap-1.5 text-success whitespace-nowrap"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Correct answer</span>
            </span>
          </div>
        </button>
      </div>

      <!-- Action Button (Submit / Update Answer / Answer Submitted) - Removed after reveal -->
      <div v-if="!isRevealed" class="mt-3">
        <button
          type="button"
          :disabled="isSubmitDisabled"
          @click="handleSubmit"
          :class="[
            'w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition',
            isSubmitDisabled
              ? 'bg-raised text-muted border border-border cursor-not-allowed opacity-60'
              : 'btn-primary cursor-pointer'
          ]"
        >
          {{ submitButtonText }}
        </button>
      </div>

      <!-- Subtitle line before reveal -->
      <p
        v-if="hasSubmitted && !isRevealed"
        class="text-xs text-secondary text-center mt-2.5 leading-relaxed"
      >
        Your answer is submitted. You can change it until the Mentor shows the correct answer.
      </p>

      <!-- Result Message directly below options after reveal -->
      <div
        v-if="isRevealed"
        role="status"
        aria-live="polite"
        :class="[
          'w-full rounded-xl border p-3 sm:p-3.5 mt-3 flex items-start gap-3 text-left transition',
          resultContainerClass
        ]"
      >
        <!-- Inline SVG Icon matching state -->
        <!-- Case 1: Correct -->
        <svg
          v-if="isStudentCorrect"
          class="w-5 h-5 text-success shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <!-- Case 2: Incorrect -->
        <svg
          v-else-if="hasSubmitted"
          class="w-5 h-5 text-danger shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <!-- Case 3: No answer submitted -->
        <svg
          v-else
          class="w-5 h-5 text-secondary shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <div class="flex-1 min-w-0">
          <div :class="['text-xs sm:text-sm font-bold leading-tight mb-0.5', resultTitleColorClass]">
            {{ resultMessageTitle }}
          </div>
          <div class="text-xs sm:text-sm font-medium text-secondary leading-relaxed">
            {{ resultMessageDetail }}
          </div>
        </div>
      </div>
    </div>

    <!-- MENTOR VIEW (Two columns, compact) -->
    <div v-else class="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <!-- Left Column: Question & Controls (7 of 12) -->
      <div class="lg:col-span-7 flex flex-col">
        <!-- Badges -->
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-primary border border-border font-semibold text-xs">
            Question {{ questionNumber }} / {{ totalQuestions }}
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-secondary border border-border font-medium text-xs">
            {{ questionData.topic }}
          </span>
        </div>

        <!-- Question Text -->
        <h2 class="text-sm sm:text-base md:text-lg font-bold text-primary leading-snug mb-3">
          {{ questionData.question }}
        </h2>

        <!-- Options List -->
        <div class="space-y-2 mb-3">
          <div
            v-for="opt in questionData.options"
            :key="opt.label"
            :class="[
              'w-full p-2.5 sm:p-3 rounded-xl border font-medium flex items-center gap-3 transition text-xs sm:text-sm',
              getMentorOptionClass(opt.label)
            ]"
          >
            <span
              :class="[
                'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition',
                getMentorOptionBadgeClass(opt.label)
              ]"
            >
              {{ opt.label }}
            </span>
            <span class="flex-1">{{ opt.text }}</span>
          </div>
        </div>

        <!-- Mentor Action Buttons (Inline & Compact) -->
        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            v-if="!isRevealed"
            type="button"
            @click="emitReveal"
            class="btn-tonal-success px-3.5 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Show Correct Answer
          </button>
          <button
            v-else
            type="button"
            disabled
            class="px-3.5 py-1.5 rounded-lg font-medium text-xs cursor-default"
          >
            Answer Revealed
          </button>

          <button
            type="button"
            @click="emitNext"
            :disabled="!isRevealed"
            class="btn-primary px-3.5 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Next Question
          </button>

          <div class="flex items-center gap-2 sm:ml-auto sm:pl-2.5 sm:border-l sm:border-border">
            <button
              type="button"
              @click="emitAlert"
              :disabled="isAlertDisabled"
              class="btn-tonal-warning px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              {{ alertCooldownSeconds > 0 ? `Alert (${alertCooldownSeconds}s)` : 'Alert' }}
            </button>
            <span class="text-xs text-secondary font-medium whitespace-nowrap">
              {{ unansweredCountText }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right Column: Live Responses Card (5 of 12) -->
      <div class="lg:col-span-5 bg-card border border-border rounded-xl p-3 sm:p-4">
        <h3 class="text-[11px] font-bold text-muted uppercase tracking-wider mb-2.5">
          Live Responses
        </h3>

        <!-- 3 Stat Tiles -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="bg-raised rounded-lg p-2 border border-border text-center">
            <div class="text-xl font-bold text-accent">
              {{ activeStudentsCount }}
            </div>
            <div class="text-[10px] text-secondary font-medium">Active</div>
          </div>

          <div class="bg-raised rounded-lg p-2 border border-border text-center">
            <div class="text-xl font-bold text-success">
              {{ correctCount }}
            </div>
            <div class="text-[10px] text-secondary font-medium">Correct</div>
          </div>

          <div class="bg-raised rounded-lg p-2 border border-border text-center">
            <div class="text-xl font-bold text-danger">
              {{ incorrectCount }}
            </div>
            <div class="text-[10px] text-secondary font-medium">Incorrect</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-[11px] text-secondary font-medium mb-1">
            <span>Answered {{ answeredCount }}</span>
            <span v-if="activeStudentsCount > 0">
              {{ Math.round((answeredCount / activeStudentsCount) * 100) }}%
            </span>
          </div>
          <div class="w-full bg-raised rounded-full h-1.5 overflow-hidden border border-border">
            <div
              class="bg-accent h-full rounded-full transition-all duration-300"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Student Responses List (Compact with scrollbar if long) -->
        <div class="border-t border-border pt-2.5">
          <div class="text-[11px] font-semibold text-secondary mb-2">
            Participants ({{ studentResponsesList.length }})
          </div>

          <div
            v-if="studentResponsesList.length === 0"
            class="text-[11px] text-muted italic text-center py-3 bg-raised/40 rounded-lg border border-dashed border-border"
          >
            Waiting for student responses...
          </div>

          <div v-else class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <div
              v-for="st in studentResponsesList"
              :key="st.studentName"
              class="flex items-center justify-between bg-raised px-2.5 py-1.5 rounded-lg border border-border text-xs"
            >
              <span class="font-medium text-primary truncate max-w-[120px]" :title="st.studentName">
                {{ st.studentName }}
              </span>

              <div class="flex items-center gap-1.5">
                <span
                  v-if="st.hasChanged"
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-panel text-secondary border border-border"
                >
                  Changed
                </span>

                <span v-if="st.selectedOption" class="font-bold text-primary text-xs">
                  {{ st.selectedOption }}
                </span>

                <span
                  v-if="!st.selectedOption"
                  class="px-2 py-0.5 rounded-full bg-panel text-muted border border-border font-medium text-[10px]"
                >
                  Waiting
                </span>
                <span
                  v-else-if="st.isCorrect"
                  class="px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/30 font-semibold text-[10px]"
                >
                  Correct
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full bg-danger-soft text-danger border border-danger/30 font-semibold text-[10px]"
                >
                  Incorrect
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'

const mcqAlertContext = inject('mcqAlertContext', null)
const getStepItemMeta = inject('getStepItemMeta', null)
const stepFlowHost = inject('stepFlowHost', null)

const props = defineProps({
  questionData: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    default: 1
  },
  totalQuestions: {
    type: Number,
    default: 3
  },
  isMentor: {
    type: Boolean,
    default: false
  },
  studentName: {
    type: String,
    default: ''
  },
  studentAnswers: {
    type: Object,
    default: () => ({})
  },
  allResponses: {
    type: Object,
    default: () => ({})
  },
  activeStudents: {
    type: Array,
    default: () => []
  },
  isRevealed: {
    type: Boolean,
    default: false
  },
  isClassEnded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit-answer', 'reveal-answer', 'next-question'])

const isSessionEnded = computed(() => props.isClassEnded || Boolean(stepFlowHost?.isClassEnded?.value))

const currentStepMeta = typeof getStepItemMeta === 'function' ? getStepItemMeta() : null
const effectiveQuestionId = computed(() => {
  const meta = typeof getStepItemMeta === 'function' ? getStepItemMeta() : currentStepMeta
  return meta?.stepQuestionKey || props.questionData?.id || `step_${props.questionNumber}`
})

watch(
  () => props.questionData,
  (qData) => {
    const meta = typeof getStepItemMeta === 'function' ? getStepItemMeta() : currentStepMeta
    if (qData && typeof meta?.reportQuestionData === 'function') {
      meta.reportQuestionData(qData)
    }
  },
  { immediate: true }
)

// --- Option ID and Correctness Resolution ---
function getOptionId(opt) {
  if (!opt) return ''
  if (typeof opt === 'string' || typeof opt === 'number') return String(opt).trim()
  if (opt.id !== undefined && opt.id !== null) return String(opt.id).trim()
  if (opt.label !== undefined && opt.label !== null) return String(opt.label).trim()
  if (opt.value !== undefined && opt.value !== null) return String(opt.value).trim()
  return ''
}

function getCorrectOptionId(qData) {
  if (!qData) return ''
  if (qData.correctOptionId !== undefined && qData.correctOptionId !== null) {
    return String(qData.correctOptionId).trim()
  }
  if (qData.correctAnswer !== undefined && qData.correctAnswer !== null) {
    return String(qData.correctAnswer).trim()
  }
  if (qData.correctOption !== undefined && qData.correctOption !== null) {
    return String(qData.correctOption).trim()
  }
  return ''
}

function formatOptionFullText(opt) {
  if (!opt) return ''
  const label = opt.label || opt.id || ''
  const text = opt.text || ''
  if (label && text) return `${label}. ${text}`
  return text || label || ''
}

// --- Student Logic ---
const submittedAnswer = computed(() => {
  return props.studentAnswers[effectiveQuestionId.value]?.selectedOption || null
})

const hasSubmitted = computed(() => {
  return Boolean(submittedAnswer.value)
})

const studentSelectedOptionId = computed(() => {
  const ans = submittedAnswer.value
  if (!ans) return ''
  return String(ans).trim()
})

const correctOptionId = computed(() => {
  return getCorrectOptionId(props.questionData)
})

const isStudentCorrect = computed(() => {
  if (!hasSubmitted.value || !studentSelectedOptionId.value || !correctOptionId.value) return false
  return studentSelectedOptionId.value === correctOptionId.value
})

function isOptionCorrect(opt) {
  const oId = getOptionId(opt)
  const cId = correctOptionId.value
  return Boolean(oId && cId && oId === cId)
}

function isStudentOption(opt) {
  if (!hasSubmitted.value || !studentSelectedOptionId.value) return false
  const oId = getOptionId(opt)
  return Boolean(oId && oId === studentSelectedOptionId.value)
}

const studentSelectedOptionObj = computed(() => {
  if (!hasSubmitted.value || !studentSelectedOptionId.value) return null
  return (props.questionData.options || []).find(
    (opt) => getOptionId(opt) === studentSelectedOptionId.value
  ) || null
})

const correctOptionObj = computed(() => {
  if (!correctOptionId.value) return null
  return (props.questionData.options || []).find(
    (opt) => getOptionId(opt) === correctOptionId.value
  ) || null
})

const localSelectedOption = ref(submittedAnswer.value)

watch(
  () => [effectiveQuestionId.value, submittedAnswer.value],
  ([newQId, newAns], [oldQId] = []) => {
    if (newQId !== oldQId) {
      localSelectedOption.value = newAns
    } else if (newAns && !localSelectedOption.value) {
      localSelectedOption.value = newAns
    }
  },
  { immediate: true }
)

watch(
  () => props.isRevealed || isSessionEnded.value,
  (locked) => {
    if (locked) {
      localSelectedOption.value = submittedAnswer.value
    }
  }
)

function selectOption(labelOrId) {
  if (props.isRevealed || isSessionEnded.value) return
  localSelectedOption.value = labelOrId
}

const submitButtonText = computed(() => {
  if (props.isRevealed || isSessionEnded.value) {
    return hasSubmitted.value ? 'Answer Submitted' : 'Submit'
  }
  if (!hasSubmitted.value) {
    return 'Submit'
  }
  if (localSelectedOption.value !== submittedAnswer.value) {
    return 'Update Answer'
  }
  return 'Answer Submitted'
})

const isSubmitDisabled = computed(() => {
  if (props.isRevealed || isSessionEnded.value) return true
  if (!localSelectedOption.value) return true
  if (hasSubmitted.value && localSelectedOption.value === submittedAnswer.value) return true
  return false
})

function handleSubmit() {
  if (isSubmitDisabled.value || props.isRevealed || isSessionEnded.value) return
  if (!localSelectedOption.value) return
  const isCorrect = localSelectedOption.value === correctOptionId.value
  emit('submit-answer', {
    questionId: effectiveQuestionId.value,
    selectedOption: localSelectedOption.value,
    isCorrect,
    timestamp: Date.now(),
    version: Date.now()
  })
}

function getStudentOptionClass(opt) {
  const optId = getOptionId(opt)
  const isCorrect = isOptionCorrect(opt)
  const isStudent = isStudentOption(opt)

  if (props.isRevealed || isSessionEnded.value) {
    if (isCorrect) {
      return 'border-success bg-success-soft text-primary cursor-default'
    }
    if (isStudent && !isCorrect) {
      return 'border-danger bg-danger-soft text-primary cursor-default'
    }
    return 'border-border bg-card text-primary cursor-default'
  }

  if (optId === localSelectedOption.value) {
    return 'border-accent bg-accent-soft text-primary font-semibold cursor-pointer'
  }

  return 'border-border-strong bg-card hover:bg-raised text-primary cursor-pointer'
}

function getStudentOptionBadgeClass(opt) {
  const optId = getOptionId(opt)
  const isCorrect = isOptionCorrect(opt)
  const isStudent = isStudentOption(opt)

  if (props.isRevealed || isSessionEnded.value) {
    if (isCorrect) {
      return 'bg-success text-on-accent font-bold'
    }
    if (isStudent && !isCorrect) {
      return 'bg-danger text-on-accent font-bold'
    }
    return 'bg-raised text-secondary font-bold'
  }

  if (optId === localSelectedOption.value) {
    return 'bg-accent text-on-accent font-bold'
  }

  return 'bg-raised text-secondary font-bold'
}

const resultContainerClass = computed(() => {
  if (isStudentCorrect.value) {
    return 'bg-success-soft border-success/30'
  }
  if (hasSubmitted.value) {
    return 'bg-danger-soft border-danger/30'
  }
  return 'bg-raised border-border'
})

const resultTitleColorClass = computed(() => {
  if (isStudentCorrect.value) return 'text-success'
  if (hasSubmitted.value) return 'text-danger'
  return 'text-primary'
})

const resultMessageTitle = computed(() => {
  if (isStudentCorrect.value) return 'Correct'
  if (hasSubmitted.value) return 'Incorrect'
  return 'No answer submitted'
})

const resultMessageDetail = computed(() => {
  const studentFormatted = studentSelectedOptionObj.value
    ? formatOptionFullText(studentSelectedOptionObj.value)
    : (submittedAnswer.value ? String(submittedAnswer.value).trim() : '')
  const correctFormatted = correctOptionObj.value
    ? formatOptionFullText(correctOptionObj.value)
    : (correctOptionId.value ? String(correctOptionId.value).trim() : '')

  if (isStudentCorrect.value) {
    return `You answered ${studentFormatted}.`
  }
  if (hasSubmitted.value) {
    return `You answered ${studentFormatted}. The correct answer is ${correctFormatted}.`
  }
  return `The correct answer is ${correctFormatted}.`
})

// --- Mentor Logic ---
function emitReveal() {
  emit('reveal-answer', { questionId: effectiveQuestionId.value })
}

function emitNext() {
  emit('next-question', { questionId: effectiveQuestionId.value })
}

function getMentorOptionClass(opt) {
  const label = typeof opt === 'object' && opt !== null ? getOptionId(opt) : String(opt).trim()
  const correct = correctOptionId.value
  if (props.isRevealed) {
    if (label === correct) {
      return 'border-2 border-success bg-success-soft text-primary font-semibold'
    }
    return 'border border-border bg-card text-muted'
  }
  return 'border border-border-strong bg-card text-primary'
}

function getMentorOptionBadgeClass(opt) {
  const label = typeof opt === 'object' && opt !== null ? getOptionId(opt) : String(opt).trim()
  const correct = correctOptionId.value
  if (props.isRevealed && label === correct) {
    return 'bg-success text-on-accent font-bold'
  }
  return 'bg-raised text-secondary font-bold'
}

// --- Live Responses Analytics ---
const currentQResponses = computed(() => {
  return props.allResponses[effectiveQuestionId.value] || {}
})

const unansweredCount = computed(() => {
  return studentResponsesList.value.filter(st => !st.selectedOption).length
})

const unansweredCountText = computed(() => {
  return unansweredCount.value === 1
    ? '1 student has not answered'
    : `${unansweredCount.value} students have not answered`
})

const alertCooldownSeconds = computed(() => {
  if (!mcqAlertContext) return 0
  const until = mcqAlertContext.alertCooldownUntilByQuestion.value[effectiveQuestionId.value] || 0
  const remainingMs = until - mcqAlertContext.cooldownNow.value
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0
})

const isAlertDisabled = computed(() => {
  return props.isRevealed || unansweredCount.value === 0 || alertCooldownSeconds.value > 0
})

function emitAlert() {
  if (!props.isMentor || isAlertDisabled.value || !mcqAlertContext) return
  mcqAlertContext.sendQuestionAlert(effectiveQuestionId.value)
}

const visibleStudentAlert = computed(() => {
  if (props.isMentor || !mcqAlertContext) return null
  if (hasSubmitted.value || props.isRevealed || isSessionEnded.value) return null
  const qId = effectiveQuestionId.value
  const alert = mcqAlertContext.questionAlerts.value[qId]
  if (!alert) return null
  if (mcqAlertContext.dismissedAlertIds.value[qId] === alert.alertId) return null
  return alert
})

function dismissStudentAlert() {
  if (!mcqAlertContext) return
  const alert = visibleStudentAlert.value
  if (!alert) return
  mcqAlertContext.dismissQuestionAlert(effectiveQuestionId.value, alert.alertId)
}

const activeStudentsCount = computed(() => {
  const knownActive = props.activeStudents.length
  const responderCount = Object.keys(currentQResponses.value).length
  return Math.max(knownActive, responderCount, 1)
})

const answeredCount = computed(() => {
  return Object.values(currentQResponses.value).filter(r => Boolean(r && r.selectedOption)).length
})

const correctCount = computed(() => {
  return Object.values(currentQResponses.value).filter(r => Boolean(r && r.selectedOption && r.isCorrect)).length
})

const incorrectCount = computed(() => {
  return Object.values(currentQResponses.value).filter(r => Boolean(r && r.selectedOption && !r.isCorrect)).length
})

const progressPercentage = computed(() => {
  if (activeStudentsCount.value === 0) return 0
  return Math.min(100, Math.round((answeredCount.value / activeStudentsCount.value) * 100))
})

const studentResponsesList = computed(() => {
  const list = []
  const recorded = new Set()

  for (const [stName, resp] of Object.entries(currentQResponses.value)) {
    list.push({
      studentName: stName,
      selectedOption: resp.selectedOption,
      isCorrect: resp.isCorrect,
      hasChanged: Boolean(resp.hasChanged || (resp.changeCount && resp.changeCount > 0))
    })
    recorded.add(stName)
  }

  for (const st of props.activeStudents) {
    const name = typeof st === 'string' ? st : st.name
    if (name && !recorded.has(name)) {
      list.push({
        studentName: name,
        selectedOption: null,
        isCorrect: false,
        hasChanged: false
      })
      recorded.add(name)
    }
  }

  return list
})
</script>

<style scoped>
.question-view-student {
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
}
</style>
