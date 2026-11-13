<template>
  <div class="w-full h-full flex-1 flex flex-col min-h-0 bg-page md:p-2.5 overflow-hidden">
    <!-- Card fills available width and height without narrow box or empty side gutters -->
    <div class="w-full h-full flex-1 flex flex-col min-h-0 bg-card md:rounded-2xl md:border md:border-border overflow-hidden">
      
      <!-- Thin Top Header Bar (Compact header, leaving rest of screen for content) -->
      <div class="h-10 px-3 sm:px-4 flex items-center justify-between border-b border-border shrink-0 bg-panel">
        <!-- Left: Titles -->
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="text-xs sm:text-sm font-bold text-primary tracking-tight whitespace-nowrap">
            {{ isMentor ? 'Presentation View' : 'Live Session' }}
          </span>
          <span class="text-muted">·</span>
          <span class="text-xs text-secondary font-medium truncate">
            {{ currentStepSubtitle }}
          </span>
        </div>

        <!-- Right: Badges & Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <template v-if="isMentor">
            <!-- Waiting State -->
            <template v-if="!isClassLive && !isClassEnded">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/40 font-medium text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                Waiting
              </span>
              <button
                type="button"
                @click="startClass"
                class="btn-primary px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer active:scale-98"
              >
                Start Class
              </button>
            </template>

            <!-- Live State -->
            <template v-else-if="isClassLive && !isClassEnded">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/40 font-medium text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                Live
              </span>
            </template>

            <!-- Joined Students Panel Toggle -->
            <button
              v-if="!isClassEnded"
              type="button"
              @click="toggleSidePanel('joined')"
              :aria-expanded="isSidePanelOpen && activeSidePanelTab === 'joined'"
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer',
                isSidePanelOpen && activeSidePanelTab === 'joined'
                  ? 'btn-tonal-accent font-bold'
                  : 'btn-secondary'
              ]"
            >
              Joined ({{ connectedStudentsCount }})
            </button>

            <!-- Raised Hands Panel Toggle (shows count even when collapsed) -->
            <button
              v-if="!isClassEnded"
              type="button"
              @click="toggleSidePanel('raised')"
              :aria-expanded="isSidePanelOpen && activeSidePanelTab === 'raised'"
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer',
                raisedHands.length > 0 || (isSidePanelOpen && activeSidePanelTab === 'raised')
                  ? 'btn-tonal-warning font-bold'
                  : 'btn-secondary'
              ]"
            >
              <span
                v-if="raisedHands.length > 0"
                class="w-1.5 h-1.5 rounded-full bg-warning"
              ></span>
              Raised Hands ({{ raisedHands.length }})
            </button>

            <!-- End Class button available on every step before class ends -->
            <button
              v-if="!isClassEnded"
              type="button"
              @click="requestEndClass"
              class="btn-tonal-danger px-2.5 py-1 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              End Class
            </button>

            <!-- Ended State -->
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-raised text-muted border border-border font-medium text-[11px]"
            >
              Class ended
            </span>
          </template>

          <template v-else>
            <span
              v-if="isClassLive && !isClassEnded"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/40 font-medium text-[11px]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Live
            </span>
            <span
              v-if="!isMentor && isClassLive && !isClassEnded && isPracticeStep"
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full font-medium text-[11px] border',
                isPracticeUnlocked
                  ? 'bg-accent-soft text-accent border-accent-border'
                  : 'bg-raised text-secondary border-border'
              ]"
            >
              {{ isPracticeUnlocked ? 'Practice mode' : "Mentor's screen" }}
            </span>
            <span
              v-else-if="isClassEnded"
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-raised text-muted border border-border font-medium text-[11px]"
            >
              Class ended
            </span>
          </template>
        </div>
      </div>

      <!-- MAIN BODY: Content Pane + Optional Narrow Mentor Raised Hands Side Panel -->
      <div class="flex-1 min-h-0 w-full flex flex-col md:flex-row overflow-hidden">
        <!-- Student: Class Ended closing page (replaces any active step/MCQ immediately, non-interactive) -->
        <div
          v-if="!isMentor && isClassEnded"
          key="student-class-ended"
          class="student-step-mirror flex-1 min-w-0 min-h-0 w-full p-2 sm:p-3 flex items-center justify-center overflow-hidden relative pointer-events-none select-none"
          inert
        >
          <div class="w-full max-w-md bg-card rounded-2xl p-6 sm:p-8 border border-border text-center">
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-muted border border-border font-medium text-xs mb-3">
              Class ended
            </div>
            <h2 class="text-xl font-bold text-primary tracking-tight mb-2">
              {{ endedViaReconnect ? 'This class has ended' : 'Thank you for attending the session.' }}
            </h2>
            <p class="text-sm text-secondary">
              {{ endedViaReconnect
                ? 'This session is no longer accepting participants.'
                : 'The mentor has ended the live class.'
              }}
            </p>
          </div>
        </div>

        <!-- Active session content -->
        <template v-else>
          <!-- Mentor OR interactive MCQ/result steps for students -->
          <div
            v-show="!isStepMirroredForStudent"
            key="live-step-wrapper"
            ref="stepWrapperRef"
            :class="[
              'flex-1 min-w-0 min-h-0 w-full p-2 sm:p-3 flex relative',
              !isMentor
                ? 'flex-col items-center overflow-y-auto'
                : 'items-center justify-center overflow-y-auto md:overflow-hidden'
            ]"
          >
            <Navigator />
          </div>

          <!-- Student view for all non-MCQ Vue steps: live read-only mirror of Mentor screen -->
          <div
            v-if="isStepMirroredForStudent"
            key="mirror-step-wrapper"
            ref="mirrorWrapperRef"
            class="student-step-mirror flex-1 min-w-0 min-h-0 w-full p-2 sm:p-3 flex items-center justify-center overflow-y-auto md:overflow-hidden relative pointer-events-none select-none"
            inert
          ></div>
        </template>

        <!-- Mentor: Collapsible Narrow Side Panel (Joined or Raised Hands list) -->
        <aside
          v-if="isMentor && !isClassEnded && isSidePanelOpen"
          :aria-label="activeSidePanelTab === 'joined' ? 'Joined students' : 'Raised hands'"
          class="w-full md:w-60 shrink-0 border-t md:border-t-0 md:border-l border-border bg-panel flex flex-col max-h-56 md:max-h-none min-h-0"
        >
          <!-- Top Row: List Title on Left & One Hide Button on Right -->
          <div class="px-3 py-2 border-b border-border bg-panel flex items-center justify-between shrink-0">
            <span class="text-xs font-bold text-primary">
              {{ activeSidePanelTab === 'joined' ? `Joined (${connectedStudentsCount})` : `Raised Hands (${raisedHands.length})` }}
            </span>
            <button
              type="button"
              @click="isSidePanelOpen = false"
              class="btn-text px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition"
            >
              Hide
            </button>
          </div>

          <!-- List 1: Joined Students List -->
          <div
            v-if="activeSidePanelTab === 'joined'"
            class="flex-1 overflow-y-auto p-2 space-y-1.5"
          >
            <p
              v-if="displayJoinedStudents.length === 0"
              class="text-[11px] text-muted text-center py-4 px-2"
            >
              No students have joined yet.
            </p>

            <div
              v-for="(item, idx) in displayJoinedStudents"
              :key="item.studentId"
              class="bg-card border border-border rounded-lg p-2"
            >
              <!-- Inline Confirmation when Remove is clicked -->
              <div
                v-if="confirmingRemoveStudentId === item.studentId"
                class="flex flex-col gap-1.5"
              >
                <div class="text-[11px] font-medium text-danger leading-tight">
                  Remove {{ item.displayName }} from the class?
                </div>
                <div class="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    @click="cancelRemoveStudent"
                    class="btn-secondary px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    @click="confirmRemoveStudent(item)"
                    class="btn-tonal-danger px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <!-- Normal Row -->
              <div
                v-else
                class="flex items-center justify-between gap-1.5"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="text-[10px] font-semibold text-muted w-3.5 shrink-0">
                    {{ idx + 1 }}.
                  </span>
                  <span
                    class="text-xs font-medium text-primary truncate"
                    :title="item.displayName"
                  >
                    {{ item.displayName }}
                  </span>
                  <span
                    v-if="item.status === 'reconnecting'"
                    class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-warning-soft text-warning border border-warning/40 shrink-0"
                  >
                    Reconnecting
                  </span>
                  <span
                    v-else-if="item.isHandRaised"
                    class="px-1.5 py-0.2 rounded text-[10px] font-medium bg-warning-soft text-warning border border-warning/40 shrink-0"
                  >
                    Hand raised
                  </span>
                </div>

                <button
                  v-if="!isMentorEntry(item)"
                  type="button"
                  @click="promptRemoveStudent(item.studentId)"
                  class="btn-tonal-danger px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer shrink-0"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- List 2: Raised Hands List -->
          <div
            v-else-if="activeSidePanelTab === 'raised'"
            class="flex-1 overflow-y-auto p-2 space-y-1.5"
          >
            <p
              v-if="raisedHands.length === 0"
              class="text-[11px] text-muted text-center py-4 px-2"
            >
              No students have their hand raised.
            </p>

            <div
              v-for="(item, idx) in raisedHands"
              :key="item.studentId"
              class="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-2.5 py-1.5"
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-[10px] font-semibold text-muted w-3.5 shrink-0">
                  {{ idx + 1 }}.
                </span>
                <span
                  class="text-xs font-medium text-primary truncate"
                  :title="studentDisplayNameMap.get(item.studentId) || item.studentName"
                >
                  {{ studentDisplayNameMap.get(item.studentId) || item.studentName }}
                </span>
              </div>
              <button
                type="button"
                @click="lowerStudentHandByMentor(item)"
                class="btn-secondary px-2 py-0.5 rounded-md font-semibold text-[11px] transition cursor-pointer shrink-0 whitespace-nowrap active:scale-98"
              >
                Hand Down
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Thin Bottom Navigation Bar (Mentor only, takes thin compact bar) -->
      <div
        v-if="isMentor && isClassLive && !isClassEnded"
        class="h-10 px-3 sm:px-4 flex items-center justify-between border-t border-border shrink-0 bg-panel"
      >
        <button
          type="button"
          @click="handlePrevStep"
          :disabled="currentStepIndex === 0"
          class="btn-secondary px-3.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer active:scale-98"
        >
          Previous
        </button>

        <!-- Pagination Indicator Dots -->
        <div class="flex items-center gap-1.5">
          <button
            v-for="(dotStep, idx) in totalNavigableSteps"
            :key="idx"
            type="button"
            @click="jumpToStep(idx)"
            class="transition-all cursor-pointer p-0.5"
            :title="hasSummaryStep && idx === totalNavigableSteps - 1 ? 'Results' : 'Step ' + (idx + 1)"
          >
            <span
              v-if="!(hasSummaryStep && idx === totalNavigableSteps - 1)"
              :class="[
                'block rounded-full transition-all duration-200',
                idx === currentStepIndex
                  ? 'w-2 h-2 bg-accent scale-125'
                  : 'w-1.5 h-1.5 bg-border-strong hover:bg-secondary'
              ]"
            ></span>
            <span
              v-else
              :class="[
                'block transition-all duration-200',
                idx === currentStepIndex
                  ? 'w-2 h-2 bg-success rotate-45 scale-125'
                  : 'w-1.5 h-1.5 bg-border-strong rotate-45 hover:bg-secondary'
              ]"
            ></span>
          </button>
        </div>

        <button
          type="button"
          @click="handleNextStep"
          :disabled="currentStepIndex >= totalNavigableSteps - 1"
          class="btn-primary px-3.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer active:scale-98"
        >
          Next
        </button>
      </div>

      <!-- Mentor End Class Confirmation Modal -->
      <div
        v-if="isMentor && showEndClassConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-class-dialog-title"
        @click.self="cancelEndClass"
      >
        <div class="w-full max-w-sm bg-card rounded-2xl border border-border shadow-warm p-5 text-primary">
          <h3 id="end-class-dialog-title" class="text-base font-bold text-primary mb-1.5">
            End the class for everyone?
          </h3>
          <p class="text-xs text-secondary mb-4 leading-relaxed">
            Every student will immediately see the closing screen and will no longer be able to interact with the session. Final MCQ results will remain available for you to review.
          </p>
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              @click="cancelEndClass"
              class="btn-secondary px-3.5 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer active:scale-98"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmEndClass"
              class="btn-tonal-danger px-3.5 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer active:scale-98"
            >
              End Class
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Student Floating Raise Hand Button (fixed bottom-right, outside view-only & inert wrappers) -->
    <div
      v-if="!isMentor && !isClassEnded"
      class="student-floating-hand fixed z-50 group inline-flex items-center"
    >
      <button
        type="button"
        @click="toggleStudentHand"
        aria-label="Raise hand"
        :aria-pressed="isStudentHandRaised"
        :class="[
          'peer w-14 h-14 rounded-full inline-flex items-center justify-center transition-transform active:scale-95 cursor-pointer',
          isStudentHandRaised
            ? 'bg-accent-soft hover:bg-accent-soft/80 border-2 border-accent shadow-warm'
            : 'bg-hand-btn hover:bg-surface-pressed border border-border shadow-warm'
        ]"
      >
        <img
          :src="handIcon"
          alt=""
          class="w-7 h-7 object-contain pointer-events-none select-none"
        />
      </button>
      <span
        role="tooltip"
        class="pointer-events-none opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 transition-opacity absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2.5 py-1 rounded-md bg-panel text-primary border border-border text-[11px] font-medium whitespace-nowrap shadow-warm"
      >
        Raise hand
      </span>
    </div>

    <!-- Mentor Floating Practice Lock/Unlock Button -->
    <div
      v-if="isMentor && isClassLive && !isClassEnded && isPracticeStep"
      class="mentor-floating-practice fixed z-50 group inline-flex items-center"
    >
      <button
        type="button"
        @click="togglePracticeLock"
        :aria-label="isPracticeUnlocked ? 'Lock and present to students' : 'Unlock practice for students'"
        :aria-pressed="isPracticeUnlocked"
        :class="[
          'peer w-14 h-14 rounded-full inline-flex items-center justify-center transition-transform active:scale-95 cursor-pointer',
          isPracticeUnlocked
            ? 'bg-accent-soft hover:bg-accent-soft/80 border-2 border-accent shadow-warm'
            : 'bg-card hover:bg-surface-pressed border border-border shadow-warm'
        ]"
      >
        <img
          :src="isPracticeUnlocked ? padlockIcon : lockIcon"
          alt=""
          class="w-6 h-6 object-contain pointer-events-none select-none mentor-lock-icon"
        />
      </button>
      <span
        role="tooltip"
        class="pointer-events-none opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 transition-opacity absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2.5 py-1 rounded-md bg-panel text-primary border border-border text-[11px] font-medium whitespace-nowrap shadow-warm"
      >
        {{ isPracticeUnlocked ? 'Lock and present to students' : 'Unlock practice for students' }}
      </span>
    </div>

    <!-- Mentor Practice Toast (3s) -->
    <transition name="fade">
      <div
        v-if="isMentor && showMentorToast"
        role="status"
        aria-live="polite"
        class="mentor-practice-toast fixed z-50 px-3.5 py-2 rounded-xl bg-panel text-primary border border-border shadow-warm text-xs font-medium select-none"
      >
        {{ mentorToastMessage }}
      </div>
    </transition>

    <!-- Student Locked Notice (3s) -->
    <transition name="fade">
      <div
        v-if="!isMentor && showStudentLockedNotice"
        role="status"
        aria-live="polite"
        class="student-practice-notice fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-panel text-primary border border-border shadow-warm text-xs font-medium flex items-center gap-2 select-none"
      >
        <img :src="lockIcon" alt="" class="w-4 h-4 object-contain mentor-lock-icon shrink-0" />
        <span>The Mentor locked practice. You are viewing the Mentor's screen.</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, provide, toRef, onMounted, onUnmounted } from 'vue'
import Navigator from './Navigator.vue'
import { RealtimeService } from '../services/realtime'
import handIcon from '../assets/hand.png'
import lockIcon from '../assets/lock.png'
import padlockIcon from '../assets/padlock.png'
import {
  captureStepSnapshot,
  applyStepSnapshot,
  showMirrorWaitingPlaceholder
} from '../utils/stepMirror'

// =========================================================================
// PROPS & EMITS
// =========================================================================
const props = defineProps({
  isMentor: {
    type: Boolean,
    default: false
  },
  studentName: {
    type: String,
    default: ''
  },
  studentId: {
    type: String,
    default: ''
  },
  roomCode: {
    type: String,
    required: true
  },
  initialRoomState: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['leave', 'student-removed'])

const storageKey = `presenter_room_state_${props.roomCode}`
const mentorInstanceId = `m_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`

function resolveEffectiveStudentId() {
  if (props.isMentor) return ''
  if (props.studentId) return props.studentId
  try {
    const raw = sessionStorage.getItem('presenter_tab_session_v1')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.studentId) return parsed.studentId
    }
  } catch (_) {}
  return `st_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}
const effectiveStudentId = resolveEffectiveStudentId()
const handStorageKey = `presenter_hand_${props.roomCode}_${effectiveStudentId}`

// =========================================================================
// REACTIVE ROOM STATE
// =========================================================================
const currentStepIndex = ref(0)
const isClassLive = ref(false)
const isClassEnded = ref(false)
const showEndClassConfirm = ref(false)
const endedViaReconnect = ref(false)
const revealedQuestions = ref({})
const practiceUnlockedByStep = ref({})
const showMentorToast = ref(false)
const mentorToastMessage = ref('')
let mentorToastTimer = null
const showStudentLockedNotice = ref(false)
let studentLockedNoticeTimer = null

function triggerMentorToast(msg) {
  if (mentorToastTimer) clearTimeout(mentorToastTimer)
  mentorToastMessage.value = msg
  showMentorToast.value = true
  mentorToastTimer = setTimeout(() => {
    showMentorToast.value = false
    mentorToastTimer = null
  }, 3000)
}

function triggerStudentLockedNotice() {
  if (studentLockedNoticeTimer) clearTimeout(studentLockedNoticeTimer)
  showStudentLockedNotice.value = true
  studentLockedNoticeTimer = setTimeout(() => {
    showStudentLockedNotice.value = false
    studentLockedNoticeTimer = null
  }, 3000)
}

function savePracticeStateToSession() {
  try {
    sessionStorage.setItem(`presenter_practice_unlocked_${props.roomCode}`, JSON.stringify(practiceUnlockedByStep.value))
  } catch (_) {}
}
const studentAnswers = ref({})
const allResponses = ref({})
const activeStudents = ref([])
const raisedHands = ref([])
const joinedStudents = ref([])
const removedStudentIds = ref([])
const isSidePanelOpen = ref(false)
const activeSidePanelTab = ref('joined')
const confirmingRemoveStudentId = ref(null)

const isRaisedHandsOpen = computed({
  get: () => isSidePanelOpen.value && activeSidePanelTab.value === 'raised',
  set: (val) => {
    isSidePanelOpen.value = val
    if (val) activeSidePanelTab.value = 'raised'
  }
})

const connectedStudentsCount = computed(() => joinedStudents.value.length)

const displayJoinedStudents = computed(() => {
  const counts = {}
  return joinedStudents.value.map((student) => {
    const rawName = student.name || 'Student'
    counts[rawName] = (counts[rawName] || 0) + 1
    const occurrence = counts[rawName]
    const displayName = occurrence === 1 ? rawName : `${rawName} (${occurrence})`
    const isHandRaised = raisedHands.value.some(
      (h) =>
        (h.studentId && h.studentId === student.studentId) ||
        (!h.studentId && h.studentName === student.name)
    )
    return {
      ...student,
      displayName,
      isHandRaised
    }
  })
})

const studentDisplayNameMap = computed(() => {
  const map = new Map()
  for (const s of displayJoinedStudents.value) {
    if (s.studentId) {
      map.set(s.studentId, s.displayName)
    }
  }
  return map
})

function isMentorEntry(item) {
  if (!item) return false
  return Boolean(item.isMentor || (props.isMentor && item.studentId === mentorInstanceId))
}

function toggleSidePanel(tab) {
  if (isSidePanelOpen.value && activeSidePanelTab.value === tab) {
    isSidePanelOpen.value = false
    confirmingRemoveStudentId.value = null
  } else {
    activeSidePanelTab.value = tab
    isSidePanelOpen.value = true
    confirmingRemoveStudentId.value = null
  }
}

function promptRemoveStudent(studentId) {
  confirmingRemoveStudentId.value = studentId
}

function cancelRemoveStudent() {
  confirmingRemoveStudentId.value = null
}

function confirmRemoveStudent(item) {
  if (!props.isMentor || !item) return
  confirmingRemoveStudentId.value = null
  const targetId = item.studentId
  const targetName = item.name || item.studentName || item.displayName

  // 1. Add targetId to removedStudentIds list
  if (targetId && !removedStudentIds.value.includes(targetId)) {
    removedStudentIds.value.push(targetId)
  }

  // 2. Remove from joinedStudents
  if (targetId) {
    joinedStudents.value = joinedStudents.value.filter((s) => s.studentId !== targetId)
  } else if (targetName) {
    joinedStudents.value = joinedStudents.value.filter((s) => s.name !== targetName)
  }

  // 3. Remove from activeStudents
  activeStudents.value = activeStudents.value.filter((st) => {
    if (typeof st === 'object' && st !== null) {
      if (targetId && st.studentId === targetId) return false
      return st.name !== targetName
    }
    return st !== targetName
  })

  // 4. Remove from raisedHands
  removeRaisedHand({
    studentId: targetId,
    studentName: targetName,
    removeFromActive: false,
    resetAckOnDisconnect: true
  })

  // 5. Publish student-removed event to channel
  if (realtime) {
    realtime.publish('student-removed', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      studentId: targetId,
      studentName: targetName,
      isRejoinAttempt: false
    })
  }

  // 6. Broadcast updated room state
  broadcastRoomState()
}

function removeStudentFromSession({ studentId, studentName, reason = 'leave' }) {
  if (studentId) {
    joinedStudents.value = joinedStudents.value.filter((s) => s.studentId !== studentId)
  } else if (studentName) {
    joinedStudents.value = joinedStudents.value.filter((s) => s.name !== studentName)
  }
  activeStudents.value = activeStudents.value.filter((st) => {
    if (typeof st === 'object' && st !== null) {
      if (studentId && st.studentId === studentId) return false
      return st.name !== studentName
    }
    return st !== studentName
  })
  removeRaisedHand({
    studentId,
    studentName,
    removeFromActive: false,
    resetAckOnDisconnect: true
  })
}

function handleSelfRemoved(reason = 'active') {
  if (props.isMentor) return
  try {
    localStorage.setItem(`presenter_removed_${props.roomCode}`, effectiveStudentId)
  } catch (_) {}
  emit('student-removed', {
    reason,
    roomCode: props.roomCode,
    studentId: effectiveStudentId
  })
}

const ackSeqByStudent = ref({})
const isStudentHandRaised = ref(false)
const questionAlerts = ref({})
const dismissedAlertIds = ref({})
const alertCooldownUntilByQuestion = ref({})
const cooldownNow = ref(Date.now())

const stepsMeta = ref([])
const mcqQuestionsMeta = ref([])
const syncedQuestionsByStep = ref({})

const stepWrapperRef = ref(null)
const mirrorWrapperRef = ref(null)
const mirroredSnapshotsByStep = ref({})
const lastAcceptedMirrorByStep = new Map()

// =========================================================================
// DYNAMIC STEP METADATA FROM NAVIGATOR / STEPFLOW
// =========================================================================
const totalTagSteps = computed(() => stepsMeta.value.length)
const hasSummaryStep = computed(() => mcqQuestionsMeta.value.length > 0)
const totalNavigableSteps = computed(() => {
  if (totalTagSteps.value === 0) return 1
  return totalTagSteps.value + (hasSummaryStep.value ? 1 : 0)
})

const isSummaryStep = computed(() => {
  return hasSummaryStep.value && totalTagSteps.value > 0 && currentStepIndex.value >= totalTagSteps.value
})

const activeStepMeta = computed(() => {
  if (isSummaryStep.value || totalTagSteps.value === 0) return null
  return stepsMeta.value[currentStepIndex.value] || stepsMeta.value[0] || null
})

const isMcqStep = computed(() => {
  return Boolean(!isSummaryStep.value && activeStepMeta.value?.isMcq)
})

const isPracticeStep = computed(() => {
  return Boolean(!isSummaryStep.value && activeStepMeta.value?.isPractice)
})

const isPracticeUnlocked = computed(() => {
  return Boolean(
    isPracticeStep.value &&
    practiceUnlockedByStep.value[currentStepIndex.value]
  )
})

const isViewStep = computed(() => {
  return Boolean(
    !isSummaryStep.value &&
      activeStepMeta.value &&
      !activeStepMeta.value.isMcq &&
      !activeStepMeta.value.isUnresolved
  )
})

const isStepMirroredForStudent = computed(() => {
  if (props.isMentor) return false
  if (!isViewStep.value) return false
  if (isPracticeStep.value && isPracticeUnlocked.value) {
    return false
  }
  return true
})

const currentStepSubtitle = computed(() => {
  if (!isClassLive.value && !isClassEnded.value) {
    return 'Start when ready'
  }
  if (isClassEnded.value) {
    return 'Session complete'
  }
  if (isSummaryStep.value) {
    return 'MCQ Results'
  }
  if (activeStepMeta.value?.isUnresolved) {
    return 'Configuration Error'
  }
  return activeStepMeta.value?.stepTitle || 'Presentation'
})

function setStepsMeta({ steps, mcqQuestions, runtimeQuestionsByStep }) {
  stepsMeta.value = Array.isArray(steps) ? steps : []
  mcqQuestionsMeta.value = Array.isArray(mcqQuestions) ? mcqQuestions : []

  if (runtimeQuestionsByStep && typeof runtimeQuestionsByStep === 'object') {
    const merged = { ...syncedQuestionsByStep.value }
    let changed = false
    for (const [k, v] of Object.entries(runtimeQuestionsByStep)) {
      if (v && JSON.stringify(merged[k]) !== JSON.stringify(v)) {
        merged[k] = v
        changed = true
      }
    }
    if (changed) {
      syncedQuestionsByStep.value = merged
      if (props.isMentor && isClassLive.value) {
        saveRoomStateCache()
      }
    }
  }

  const maxIdx = Math.max(0, totalNavigableSteps.value - 1)
  if (currentStepIndex.value > maxIdx) {
    currentStepIndex.value = maxIdx
  }
}

provide('stepFlowHost', {
  isMentor: toRef(props, 'isMentor'),
  studentName: toRef(props, 'studentName'),
  roomCode: toRef(props, 'roomCode'),
  currentStepIndex,
  isClassLive,
  isClassEnded,
  revealedQuestions,
  practiceUnlockedByStep,
  studentAnswers,
  allResponses,
  activeStudents,
  syncedQuestionsByStep,
  setStepsMeta,
  onStudentAnswer: handleStudentAnswer,
  onRevealAnswer: handleRevealAnswer,
  onNextStep: handleNextStep,
  requestEndClass
})

// =========================================================================
// MENTOR-TO-STUDENT LIVE SCREEN MIRRORING ENGINE
// =========================================================================
let realtime = null
let mirrorSeq = 0
let lastCapturedSignature = ''
let mirrorObserver = null
let observedWrapperEl = null
let mirrorFlushTimer = null
let lastMirrorPublishAt = 0
let unsubscribeRealtimeReady = null
let retrySyncTimer = null
let alertCooldownTimer = null
let alertSeq = 0
let lastPresenceReannounceAt = 0
let wasConnectionInterrupted = false
let localHandActionSeq = 0
let localHandTarget = false
let hasPendingHandAction = false
let lastKnownMentorAckSeq = 0
let didSendDisconnectSignal = false
const pendingDisconnectTimers = new Map()

const ALERT_COOLDOWN_MS = 5000
const MIRROR_EVENTS = ['input', 'change', 'click', 'pointerup', 'keyup', 'scroll']

function isFromMentor(payload) {
  return Boolean(payload && payload.senderRole === 'mentor')
}

function getMirrorThrottleMs() {
  return realtime && realtime.hasPusherConfigured() ? 85 : 30
}

function readStoredHandState() {
  if (props.isMentor) return null
  try {
    const raw = sessionStorage.getItem(handStorageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.raised === 'boolean') {
      return {
        raised: parsed.raised,
        actionSeq: Number(parsed.actionSeq || 0)
      }
    }
  } catch (_) {}
  return null
}

function writeStoredHandState(raised, actionSeq) {
  if (props.isMentor) return
  try {
    sessionStorage.setItem(
      handStorageKey,
      JSON.stringify({ raised: Boolean(raised), actionSeq: Number(actionSeq || 0) })
    )
  } catch (_) {}
}

function clearStoredHandState() {
  if (props.isMentor) return
  try {
    sessionStorage.removeItem(handStorageKey)
  } catch (_) {}
}

function buildRoomStatePayload() {
  const stepMirror = isViewStep.value
    ? mirroredSnapshotsByStep.value[currentStepIndex.value] || null
    : null

  return {
    senderRole: 'mentor',
    mentorId: mentorInstanceId,
    currentStepIndex: currentStepIndex.value,
    isClassLive: isClassLive.value,
    isClassEnded: isClassEnded.value,
    revealedQuestions: revealedQuestions.value,
    practiceUnlockedByStep: practiceUnlockedByStep.value,
    allResponses: allResponses.value,
    activeStudents: activeStudents.value,
    raisedHands: raisedHands.value,
    joinedStudents: joinedStudents.value,
    removedStudentIds: removedStudentIds.value,
    ackSeqByStudent: ackSeqByStudent.value,
    syncedQuestionsByStep: syncedQuestionsByStep.value,
    stepMirror
  }
}

function saveRoomStateCache() {
  if (!props.isMentor) return
  try {
    localStorage.setItem(storageKey, JSON.stringify(buildRoomStatePayload()))
  } catch (_) {}
}

function broadcastRoomState() {
  if (!props.isMentor) return
  const payload = buildRoomStatePayload()
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload))
  } catch (_) {}

  if (realtime) {
    realtime.publish('state-sync', payload)
  }
}

function captureMentorStepSnapshot({ broadcastMirrorEvent = true, forceNewSnapshot = false } = {}) {
  if (!props.isMentor || !isViewStep.value || isClassEnded.value) return false
  const el = stepWrapperRef.value
  if (!el) return false

  const captured = captureStepSnapshot(el, currentStepIndex.value)
  if (!captured) return false

  const { snapshot, signature } = captured
  if (!forceNewSnapshot && signature === lastCapturedSignature) {
    return false
  }

  lastCapturedSignature = signature
  mirrorSeq += 1
  const enrichedSnapshot = {
    ...snapshot,
    senderRole: 'mentor',
    mentorId: mentorInstanceId,
    seq: mirrorSeq
  }

  mirroredSnapshotsByStep.value = {
    ...mirroredSnapshotsByStep.value,
    [currentStepIndex.value]: enrichedSnapshot
  }
  saveRoomStateCache()
  lastMirrorPublishAt = Date.now()

  if (broadcastMirrorEvent && isClassLive.value && realtime) {
    realtime.publish('step-mirror', enrichedSnapshot)
  }

  return true
}

function scheduleMentorSnapshot(preferImmediate = false) {
  if (!props.isMentor || !isClassLive.value || isClassEnded.value || !isViewStep.value) return
  if (mirrorFlushTimer) return

  const throttleMs = getMirrorThrottleMs()
  const elapsed = Date.now() - lastMirrorPublishAt
  const delay = preferImmediate || elapsed >= throttleMs ? 0 : throttleMs - elapsed

  mirrorFlushTimer = setTimeout(() => {
    mirrorFlushTimer = null
    captureMentorStepSnapshot({ broadcastMirrorEvent: true })
  }, delay)
}

function handleMentorMirrorInteraction(event) {
  const preferImmediate = event.type === 'input' || event.type === 'change'
  scheduleMentorSnapshot(preferImmediate)
}

function teardownMentorMirrorObserver() {
  if (mirrorFlushTimer) {
    clearTimeout(mirrorFlushTimer)
    mirrorFlushTimer = null
  }
  if (mirrorObserver) {
    mirrorObserver.disconnect()
    mirrorObserver = null
  }
  if (observedWrapperEl) {
    for (const evt of MIRROR_EVENTS) {
      observedWrapperEl.removeEventListener(evt, handleMentorMirrorInteraction, true)
    }
    observedWrapperEl = null
  }
}

async function setupMentorMirrorObserver() {
  teardownMentorMirrorObserver()

  if (!props.isMentor || isClassEnded.value || !isViewStep.value) return
  await nextTick()

  const el = stepWrapperRef.value
  if (!el || !props.isMentor || isClassEnded.value || !isViewStep.value) return

  lastCapturedSignature = ''

  if (isClassLive.value) {
    captureMentorStepSnapshot({ broadcastMirrorEvent: true, forceNewSnapshot: true })
    broadcastRoomState()
  }

  observedWrapperEl = el
  mirrorObserver = new MutationObserver(() => {
    scheduleMentorSnapshot(false)
  })
  mirrorObserver.observe(el, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  })

  for (const evt of MIRROR_EVENTS) {
    el.addEventListener(evt, handleMentorMirrorInteraction, { capture: true, passive: true })
  }
}

function markStudentClassEnded(viaReconnect = false) {
  if (props.isMentor) return
  if (!isClassEnded.value) {
    const offlineNow = typeof navigator !== 'undefined' && navigator.onLine === false
    endedViaReconnect.value = Boolean(viaReconnect || wasConnectionInterrupted || offlineNow)
  }
  isClassLive.value = false
  isClassEnded.value = true
  questionAlerts.value = {}
  raisedHands.value = []
  isStudentHandRaised.value = false
  practiceUnlockedByStep.value = {}
  showStudentLockedNotice.value = false
  hasPendingHandAction = false
  localHandTarget = false
  clearStoredHandState()
  if (retrySyncTimer) {
    clearTimeout(retrySyncTimer)
    retrySyncTimer = null
  }
}

function acceptMentorMirrorSnapshot(data) {
  if (props.isMentor || isClassEnded.value) return
  if (!isFromMentor(data)) {
    console.warn('[Security] Ignored step mirror update: Only the Mentor can control step state.')
    return
  }
  if (typeof data.stepIndex !== 'number' || typeof data.html !== 'string') return

  const prev = lastAcceptedMirrorByStep.get(data.stepIndex)
  if (prev && data.mentorId && prev.mentorId === data.mentorId && typeof data.seq === 'number') {
    if (data.seq <= prev.seq) return
  }

  if (data.mentorId && typeof data.seq === 'number') {
    lastAcceptedMirrorByStep.set(data.stepIndex, {
      mentorId: data.mentorId,
      seq: data.seq
    })
  }

  mirroredSnapshotsByStep.value = {
    ...mirroredSnapshotsByStep.value,
    [data.stepIndex]: data
  }
}

function applySyncedRoomState(state, { fromInitialLoad = false } = {}) {
  if (props.isMentor || !state || !isFromMentor(state)) return
  if (isClassEnded.value) return

  if (Array.isArray(state.removedStudentIds) && state.removedStudentIds.includes(effectiveStudentId)) {
    handleSelfRemoved('rejoin')
    return
  }

  if (state.isClassEnded === true) {
    markStudentClassEnded(fromInitialLoad || wasConnectionInterrupted)
    return
  }

  wasConnectionInterrupted = false

  if (typeof state.currentStepIndex === 'number') {
    currentStepIndex.value = state.currentStepIndex
  }
  if (typeof state.isClassLive === 'boolean') {
    isClassLive.value = state.isClassLive
  }
  if (typeof state.isClassEnded === 'boolean') {
    isClassEnded.value = state.isClassEnded
  }
  if (state.revealedQuestions) {
    revealedQuestions.value = { ...revealedQuestions.value, ...state.revealedQuestions }
    try {
      sessionStorage.setItem(`presenter_revealed_questions_${props.roomCode}`, JSON.stringify(revealedQuestions.value))
    } catch (_) {}
  }
  if (state.practiceUnlockedByStep && typeof state.practiceUnlockedByStep === 'object') {
    practiceUnlockedByStep.value = { ...state.practiceUnlockedByStep }
    savePracticeStateToSession()
  }
  if (state.syncedQuestionsByStep && typeof state.syncedQuestionsByStep === 'object') {
    syncedQuestionsByStep.value = {
      ...syncedQuestionsByStep.value,
      ...state.syncedQuestionsByStep
    }
  }
  if (state.allResponses) {
    allResponses.value = { ...allResponses.value, ...state.allResponses }
  }

  // Restore or reconcile studentAnswers with Mentor's accepted state
  if (!props.isMentor && state.allResponses && props.studentName) {
    const updated = { ...studentAnswers.value }
    let changed = false
    for (const [qId, responses] of Object.entries(state.allResponses)) {
      const accepted = responses && responses[props.studentName]
      if (accepted && accepted.selectedOption) {
        if (state.revealedQuestions?.[qId] || !updated[qId]) {
          if (!updated[qId] || updated[qId].selectedOption !== accepted.selectedOption) {
            updated[qId] = {
              selectedOption: accepted.selectedOption,
              isCorrect: accepted.isCorrect,
              timestamp: accepted.timestamp,
              version: accepted.version
            }
            changed = true
          }
        }
      }
    }
    if (changed) {
      studentAnswers.value = updated
      try {
        sessionStorage.setItem(
          `presenter_student_answers_${props.roomCode}_${effectiveStudentId}`,
          JSON.stringify(updated)
        )
      } catch (_) {}
    }
  }
  syncRaisedHandsFromMentor(state, { fromInitialLoad })

  if (Array.isArray(state.activeStudents) && props.studentName && !state.activeStudents.includes(props.studentName)) {
    const now = Date.now()
    if (realtime && now - lastPresenceReannounceAt > 3000) {
      lastPresenceReannounceAt = now
      realtime.publish('student-join', { name: props.studentName, studentId: effectiveStudentId })
    }
  }
  if (state.stepMirror && typeof state.stepMirror.stepIndex === 'number') {
    acceptMentorMirrorSnapshot(state.stepMirror)
  }
}

function syncRaisedHandsFromMentor(state, { fromInitialLoad = false } = {}) {
  if (props.isMentor || !state || !isFromMentor(state) || isClassEnded.value) return

  if (Array.isArray(state.raisedHands)) {
    raisedHands.value = state.raisedHands
  }

  const serverHands = raisedHands.value
  const ackMap = state.ackSeqByStudent && typeof state.ackSeqByStudent === 'object' ? state.ackSeqByStudent : {}
  const ackSeq = Number(ackMap[effectiveStudentId] || 0)
  lastKnownMentorAckSeq = Math.max(lastKnownMentorAckSeq, ackSeq)
  const inServerList = serverHands.some(
    (entry) =>
      entry &&
      (entry.studentId === effectiveStudentId ||
        (!entry.studentId && props.studentName && entry.studentName === props.studentName))
  )

  if (ackSeq >= localHandActionSeq) {
    localHandActionSeq = Math.max(localHandActionSeq, ackSeq)
    hasPendingHandAction = false
    localHandTarget = inServerList
    isStudentHandRaised.value = inServerList
    writeStoredHandState(inServerList, localHandActionSeq)
  } else if (hasPendingHandAction) {
    isStudentHandRaised.value = localHandTarget
    if (!fromInitialLoad && realtime && localHandTarget !== inServerList) {
      realtime.publish(localHandTarget ? 'raise-hand' : 'lower-hand', {
        senderRole: 'student',
        studentId: effectiveStudentId,
        actorStudentId: effectiveStudentId,
        studentName: props.studentName || 'Student',
        actionSeq: localHandActionSeq,
        raisedAt: Date.now()
      })
    }
  }
}

function requestLatestStateFromMentor() {
  if (props.isMentor || !realtime || isClassEnded.value) return
  if (props.studentName) {
    realtime.publish('student-join', { name: props.studentName, studentId: effectiveStudentId })
  } else {
    realtime.publish('request-state', {
      name: 'Student',
      studentId: effectiveStudentId
    })
  }
}

function scheduleStudentSyncRetryIfNeeded() {
  if (props.isMentor) return
  if (retrySyncTimer) {
    clearTimeout(retrySyncTimer)
    retrySyncTimer = null
  }
  if (!isClassLive.value || isClassEnded.value || !isViewStep.value) return
  if (mirroredSnapshotsByStep.value[currentStepIndex.value]) return

  retrySyncTimer = setTimeout(() => {
    retrySyncTimer = null
    if (!props.isMentor && isClassLive.value && !isClassEnded.value && isViewStep.value && !mirroredSnapshotsByStep.value[currentStepIndex.value]) {
      requestLatestStateFromMentor()
    }
  }, 1200)
}

function handleStudentOffline() {
  if (props.isMentor) return
  wasConnectionInterrupted = true
}

function handleStudentOnline() {
  if (props.isMentor || isClassEnded.value) return
  didSendDisconnectSignal = false
  requestLatestStateFromMentor()
}

function handleStudentWakeOrOnline() {
  if (props.isMentor || isClassEnded.value) return
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  didSendDisconnectSignal = false
  requestLatestStateFromMentor()
}

function handleWindowKeydown(event) {
  if (props.isMentor && showEndClassConfirm.value && event.key === 'Escape') {
    cancelEndClass()
  }
}

// =========================================================================
// RAISE HAND FEATURE
// =========================================================================
function getHandKey(studentId, studentName) {
  const sid = typeof studentId === 'string' ? studentId.trim() : ''
  if (sid) return sid
  const sname = typeof studentName === 'string' ? studentName.trim() : ''
  return sname ? `name:${sname}` : ''
}

function cancelDisconnectTimer(studentId, studentName) {
  const cleanName = typeof studentName === 'string' ? studentName.trim() : ''
  const keys = [
    typeof studentId === 'string' ? studentId.trim() : '',
    cleanName ? `name:${cleanName}` : ''
  ].filter(Boolean)

  for (const key of keys) {
    const timer = pendingDisconnectTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      pendingDisconnectTimers.delete(key)
    }
  }
}

function broadcastRaisedHandsState() {
  if (!props.isMentor) return
  saveRoomStateCache()
  if (realtime) {
    realtime.publish('raised-hands-sync', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      raisedHands: raisedHands.value,
      ackSeqByStudent: ackSeqByStudent.value
    })
  }
}

function addRaisedHandByStudent({ studentId, studentName, raisedAt, actionSeq }) {
  if (!props.isMentor || isClassEnded.value) return
  const cleanName = typeof studentName === 'string' ? studentName.trim() : ''
  if (!cleanName) return
  const key = getHandKey(studentId, cleanName)
  if (!key) return

  cancelDisconnectTimer(key, cleanName)

  if (!activeStudents.value.includes(cleanName)) {
    activeStudents.value.push(cleanName)
  }

  if (typeof actionSeq === 'number' && actionSeq > 0) {
    ackSeqByStudent.value = {
      ...ackSeqByStudent.value,
      [key]: Math.max(Number(ackSeqByStudent.value[key] || 0), actionSeq)
    }
  }

  const alreadyRaised = raisedHands.value.some((entry) => entry.studentId === key)
  if (!alreadyRaised) {
    raisedHands.value = [
      ...raisedHands.value,
      {
        studentId: key,
        studentName: cleanName,
        raisedAt: typeof raisedAt === 'number' ? raisedAt : Date.now()
      }
    ]
  }
  broadcastRaisedHandsState()
}

function removeRaisedHand({
  studentId,
  studentName,
  actionSeq,
  removeFromActive = false,
  resetAckOnDisconnect = false
}) {
  if (!props.isMentor) return
  const cleanName = typeof studentName === 'string' ? studentName.trim() : ''
  const key = getHandKey(studentId, cleanName)
  if (!key && !cleanName) return

  if (resetAckOnDisconnect && key) {
    const nextAck = { ...ackSeqByStudent.value }
    delete nextAck[key]
    ackSeqByStudent.value = nextAck
  } else if (typeof actionSeq === 'number' && actionSeq > 0 && key) {
    ackSeqByStudent.value = {
      ...ackSeqByStudent.value,
      [key]: Math.max(Number(ackSeqByStudent.value[key] || 0), actionSeq)
    }
  }

  raisedHands.value = raisedHands.value.filter((entry) => {
    if (key && entry.studentId === key) return false
    if (!key && cleanName && entry.studentName === cleanName) return false
    return true
  })

  if (removeFromActive && cleanName) {
    activeStudents.value = activeStudents.value.filter((name) => name !== cleanName)
  }

  broadcastRaisedHandsState()
}

function lowerStudentHandByMentor(entry) {
  if (!props.isMentor || isClassEnded.value || !entry) return
  const key = entry.studentId
  const cleanName = entry.studentName

  raisedHands.value = raisedHands.value.filter((item) => item.studentId !== key)

  const nextAck = Number(ackSeqByStudent.value[key] || 0) + 1
  ackSeqByStudent.value = {
    ...ackSeqByStudent.value,
    [key]: nextAck
  }

  if (realtime) {
    realtime.publish('mentor-lower-hand', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      studentId: key,
      studentName: cleanName,
      ackSeq: nextAck
    })
  }
  broadcastRaisedHandsState()
}

function toggleStudentHand() {
  if (props.isMentor || isClassEnded.value) return
  const nextRaised = !isStudentHandRaised.value
  localHandActionSeq = Math.max(localHandActionSeq, lastKnownMentorAckSeq) + 1
  localHandTarget = nextRaised
  hasPendingHandAction = true
  isStudentHandRaised.value = nextRaised
  writeStoredHandState(nextRaised, localHandActionSeq)

  if (realtime) {
    realtime.publish(nextRaised ? 'raise-hand' : 'lower-hand', {
      senderRole: 'student',
      studentId: effectiveStudentId,
      actorStudentId: effectiveStudentId,
      studentName: props.studentName || 'Student',
      actionSeq: localHandActionSeq,
      raisedAt: Date.now()
    })
  }
}

function handleStudentPageHide() {
  if (props.isMentor || didSendDisconnectSignal) return
  didSendDisconnectSignal = true
  if (realtime) {
    realtime.publishUnload('student-disconnecting', {
      senderRole: 'student',
      studentId: effectiveStudentId,
      studentName: props.studentName || 'Student'
    })
  }
}

// =========================================================================
// REAL-TIME SYNCHRONIZATION VIA PUSHER
// =========================================================================
function initRealtime() {
  realtime = new RealtimeService(props.roomCode)

  realtime.on('state-sync', (state) => {
    if (props.isMentor) return
    if (!isFromMentor(state)) {
      console.warn('[Security] Ignored state-sync: Only the Mentor can sync room state.')
      return
    }
    applySyncedRoomState(state)
  })

  realtime.on('step-change', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored step-change: Only the Mentor can change steps.')
      return
    }
    if (typeof data.stepIndex === 'number') {
      const targetIdx = data.stepIndex
      const existingSnapshot = mirroredSnapshotsByStep.value[targetIdx]
      if (
        existingSnapshot &&
        typeof data.minMirrorSeq === 'number' &&
        existingSnapshot.mentorId === data.mentorId &&
        typeof existingSnapshot.seq === 'number' &&
        existingSnapshot.seq <= data.minMirrorSeq
      ) {
        const copy = { ...mirroredSnapshotsByStep.value }
        delete copy[targetIdx]
        mirroredSnapshotsByStep.value = copy
      }
      currentStepIndex.value = targetIdx
    }
  })

  realtime.on('step-mirror', (data) => {
    acceptMentorMirrorSnapshot(data)
  })

  realtime.on('reveal-answer', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored reveal-answer: Only the Mentor can reveal answers.')
      return
    }
    if (data && data.questionId) {
      revealedQuestions.value = {
        ...revealedQuestions.value,
        [data.questionId]: true
      }
      try {
        sessionStorage.setItem(`presenter_revealed_questions_${props.roomCode}`, JSON.stringify(revealedQuestions.value))
      } catch (_) {}
    }
  })

  realtime.on('practice-lock', (data) => {
    if (props.isMentor) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored practice-lock: Only the Mentor can lock practice.')
      return
    }
    if (typeof data.stepIndex !== 'number') return
    if (data.stepIndex !== currentStepIndex.value) return

    const wasUnlocked = Boolean(practiceUnlockedByStep.value[data.stepIndex])
    practiceUnlockedByStep.value = {
      ...practiceUnlockedByStep.value,
      [data.stepIndex]: false
    }
    savePracticeStateToSession()
    if (wasUnlocked) {
      triggerStudentLockedNotice()
    }
  })

  realtime.on('practice-unlock', (data) => {
    if (props.isMentor) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored practice-unlock: Only the Mentor can unlock practice.')
      return
    }
    if (typeof data.stepIndex !== 'number') return
    if (data.stepIndex !== currentStepIndex.value) return

    practiceUnlockedByStep.value = {
      ...practiceUnlockedByStep.value,
      [data.stepIndex]: true
    }
    savePracticeStateToSession()
  })

  realtime.on('student-answer', (data) => {
    if (isClassEnded.value) return
    if (!data || !data.questionId || !data.studentName) return

    const qId = data.questionId
    const stName = data.studentName
    const stId = data.studentId || ''

    if (!props.isMentor && !props.isAdmin) return

    // Mentor authority: Question locked once revealed
    if (revealedQuestions.value[qId]) {
      console.warn(`[MCQ] Ignored student-answer for ${qId} from ${stName}: Question is already revealed.`)
      broadcastRoomState()
      return
    }

    if (!activeStudents.value.includes(stName)) {
      activeStudents.value.push(stName)
    }

    if (!allResponses.value[qId]) {
      allResponses.value[qId] = {}
    }

    const existing = allResponses.value[qId][stName]
    const incomingTimestamp = Number(data.timestamp || data.version || 0)

    // Security: Only the student themselves can send or change their own answer
    if (existing?.studentId && stId && existing.studentId !== stId) {
      console.warn(`[Security] Ignored student-answer for ${qId}: Student ID mismatch (${stId} !== ${existing.studentId}).`)
      return
    }

    // Out-of-order check: Discard older timestamps/versions
    if (existing && existing.timestamp && incomingTimestamp && incomingTimestamp < existing.timestamp) {
      console.warn(`[MCQ] Discarded out-of-order student-answer for ${qId} from ${stName} (${incomingTimestamp} < ${existing.timestamp})`)
      return
    }

    const hasPreviousAnswer = Boolean(existing && existing.selectedOption)
    const isAnswerChange = hasPreviousAnswer && existing.selectedOption !== data.selectedOption
    const changeCount = (existing?.changeCount || 0) + (isAnswerChange ? 1 : 0)
    const hasChanged = Boolean(existing?.hasChanged || isAnswerChange || changeCount > 0)

    allResponses.value[qId][stName] = {
      selectedOption: data.selectedOption,
      isCorrect: data.isCorrect,
      timestamp: incomingTimestamp || Date.now(),
      version: incomingTimestamp || Date.now(),
      changeCount,
      hasChanged,
      studentId: stId || existing?.studentId || ''
    }

    if (props.isMentor) {
      broadcastRoomState()
    }
  })

  realtime.on('question-alert', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored question-alert: Only the Mentor can send alerts.')
      return
    }
    if (!data || !data.questionId || !data.alertId || typeof data.message !== 'string') return
    if (!Array.isArray(data.targetStudents)) return

    const stName = props.studentName
    if (!stName || !data.targetStudents.includes(stName)) return
    if (studentAnswers.value[data.questionId]?.selectedOption) return
    if (revealedQuestions.value[data.questionId]) return

    questionAlerts.value = {
      ...questionAlerts.value,
      [data.questionId]: {
        alertId: data.alertId,
        questionId: data.questionId,
        message: data.message,
        sentAt: data.sentAt || Date.now()
      }
    }
  })

  realtime.on('raised-hands-sync', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored raised-hands-sync: Only the Mentor can sync raised hands.')
      return
    }
    syncRaisedHandsFromMentor(data)
  })

  realtime.on('raise-hand', (data) => {
    if (!props.isMentor || isClassEnded.value) return
    if (!data || data.senderRole !== 'student') {
      console.warn('[Security] Ignored raise-hand: Only students can raise their own hand.')
      return
    }
    if (data.actorStudentId && data.studentId && data.actorStudentId !== data.studentId) {
      console.warn('[Security] Ignored raise-hand: Actor mismatch.')
      return
    }
    if (data.targetStudentId && data.studentId && data.targetStudentId !== data.studentId) {
      console.warn('[Security] Ignored raise-hand: Students cannot raise another student hand.')
      return
    }
    addRaisedHandByStudent(data)
  })

  realtime.on('lower-hand', (data) => {
    if (!props.isMentor || isClassEnded.value) return
    if (!data || data.senderRole !== 'student') {
      console.warn('[Security] Ignored lower-hand: Invalid sender role.')
      return
    }
    if (data.actorStudentId && data.studentId && data.actorStudentId !== data.studentId) {
      console.warn('[Security] Ignored lower-hand: Only the Mentor can lower another student hand.')
      return
    }
    if (data.targetStudentId && data.studentId && data.targetStudentId !== data.studentId) {
      console.warn('[Security] Ignored lower-hand: Students cannot lower another student hand.')
      return
    }
    if (data.targetStudentName && data.studentName && data.targetStudentName !== data.studentName) {
      console.warn('[Security] Ignored lower-hand: Target name mismatch.')
      return
    }
    removeRaisedHand({
      studentId: data.studentId,
      studentName: data.studentName,
      actionSeq: data.actionSeq,
      removeFromActive: false
    })
  })

  realtime.on('mentor-lower-hand', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored mentor-lower-hand: Only the Mentor can lower another student hand.')
      return
    }
    const matchesSelf =
      (data.studentId && data.studentId === effectiveStudentId) ||
      (!data.studentId && data.studentName && data.studentName === props.studentName) ||
      (data.studentId === `name:${props.studentName}`)
    if (!matchesSelf) return

    if (typeof data.ackSeq === 'number' && data.ackSeq > 0) {
      localHandActionSeq = Math.max(localHandActionSeq, data.ackSeq)
      lastKnownMentorAckSeq = Math.max(lastKnownMentorAckSeq, data.ackSeq)
    }
    hasPendingHandAction = false
    localHandTarget = false
    isStudentHandRaised.value = false
    writeStoredHandState(false, localHandActionSeq)
  })

  realtime.on('student-leave', (data) => {
    if (!props.isMentor) return
    if (!data || data.senderRole !== 'student') return
    const cleanName = typeof data.studentName === 'string' ? data.studentName.trim() : ''
    const studentId = data.studentId
    const key = getHandKey(studentId, cleanName)
    if (!key && !cleanName) return
    cancelDisconnectTimer(key, cleanName)
    removeStudentFromSession({
      studentId,
      studentName: cleanName,
      reason: 'leave'
    })
    broadcastRoomState()
  })

  realtime.on('student-disconnecting', (data) => {
    if (!props.isMentor) return
    if (!data || data.senderRole !== 'student') return
    const cleanName = typeof data.studentName === 'string' ? data.studentName.trim() : ''
    const studentId = data.studentId
    const key = getHandKey(studentId, cleanName)
    if (!key) return

    cancelDisconnectTimer(key, cleanName)

    // Mark status as 'reconnecting' in joinedStudents
    const target = (studentId && joinedStudents.value.find((s) => s.studentId === studentId)) ||
                   joinedStudents.value.find((s) => s.name === cleanName)
    if (target) {
      target.status = 'reconnecting'
      joinedStudents.value = [...joinedStudents.value]
    }

    const timer = setTimeout(() => {
      pendingDisconnectTimers.delete(key)
      removeStudentFromSession({
        studentId,
        studentName: cleanName,
        reason: 'timeout'
      })
      broadcastRoomState()
    }, 30000)
    pendingDisconnectTimers.set(key, timer)
    broadcastRoomState()
  })

  realtime.on('student-join', (data) => {
    if (!data || !data.name) return
    const cleanName = typeof data.name === 'string' ? data.name.trim() : ''
    const studentId = data.studentId

    if (props.isMentor) {
      // If student was removed, reject/re-signal removal immediately
      if (studentId && removedStudentIds.value.includes(studentId)) {
        realtime.publish('student-removed', {
          senderRole: 'mentor',
          mentorId: mentorInstanceId,
          studentId,
          studentName: cleanName,
          isRejoinAttempt: true
        })
        return
      }

      cancelDisconnectTimer(studentId, cleanName)

      // Add to or update joinedStudents (preserving FIFO join order)
      const existing = studentId
        ? joinedStudents.value.find((s) => s.studentId === studentId)
        : joinedStudents.value.find((s) => s.name === cleanName)
      if (existing) {
        existing.status = 'connected'
        if (studentId) existing.studentId = studentId
      } else {
        joinedStudents.value.push({
          studentId: studentId || `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: cleanName,
          joinedAt: Date.now(),
          status: 'connected'
        })
      }
      joinedStudents.value = [...joinedStudents.value]

      const activeIdx = studentId
        ? activeStudents.value.findIndex(
            (s) => typeof s === 'object' && s.studentId === studentId
          )
        : activeStudents.value.findIndex(
            (s) => (typeof s === 'object' ? s.name === cleanName : s === cleanName)
          )
      if (activeIdx === -1) {
        activeStudents.value.push({ studentId: studentId || '', name: cleanName })
      } else if (typeof activeStudents.value[activeIdx] !== 'object' && studentId) {
        activeStudents.value[activeIdx] = { studentId, name: cleanName }
      }

      if (isClassEnded.value) {
        broadcastRoomState()
        return
      }

      captureMentorStepSnapshot({ broadcastMirrorEvent: false })
      broadcastRoomState()
      return
    }

    if (!isClassEnded.value) {
      if (!activeStudents.value.some((s) => (typeof s === 'string' ? s : s?.name) === cleanName)) {
        activeStudents.value.push(cleanName)
      }
    }
  })

  realtime.on('student-removed', (data) => {
    if (props.isMentor) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored student-removed: Only the Mentor can remove students.')
      return
    }
    if (data.studentId && data.studentId === effectiveStudentId) {
      handleSelfRemoved(data.isRejoinAttempt ? 'rejoin' : 'active')
    }
  })

  realtime.on('request-state', () => {
    if (props.isMentor) {
      if (!isClassEnded.value) {
        captureMentorStepSnapshot({ broadcastMirrorEvent: false })
      }
      broadcastRoomState()
    }
  })

  realtime.on('class-start', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored class-start: Only the Mentor can start the class.')
      return
    }
    isClassLive.value = true
    isClassEnded.value = false
  })

  realtime.on('class-end', (data) => {
    if (props.isMentor) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored class-end: Only the Mentor can end the class.')
      return
    }
    markStudentClassEnded(wasConnectionInterrupted)
  })

  if (!props.isMentor) {
    // Announce presence right away over BroadcastChannel/localStorage & REST trigger
    // so page reloads cancel Mentor's disconnect timer before Pusher finishes connecting.
    requestLatestStateFromMentor()
    scheduleStudentSyncRetryIfNeeded()

    unsubscribeRealtimeReady = realtime.onSubscribed((info) => {
      if (info && info.isReconnect) {
        wasConnectionInterrupted = true
      }
      if (info?.isReconnect || realtime.hasPusherConfigured()) {
        requestLatestStateFromMentor()
        scheduleStudentSyncRetryIfNeeded()
      }
    })
  } else {
    broadcastRoomState()
  }
}

function loadInitialOrCachedState() {
  if (!props.isMentor) {
    const storedHand = readStoredHandState()
    if (storedHand) {
      isStudentHandRaised.value = storedHand.raised
      localHandTarget = storedHand.raised
      localHandActionSeq = storedHand.actionSeq
      hasPendingHandAction = storedHand.actionSeq > 0
    }
    try {
      const savedAnswers = sessionStorage.getItem(`presenter_student_answers_${props.roomCode}_${effectiveStudentId}`)
      if (savedAnswers) {
        studentAnswers.value = JSON.parse(savedAnswers)
      }
    } catch (_) {}
    try {
      const savedRevealed = sessionStorage.getItem(`presenter_revealed_questions_${props.roomCode}`)
      if (savedRevealed) {
        revealedQuestions.value = {
          ...revealedQuestions.value,
          ...JSON.parse(savedRevealed)
        }
      }
    } catch (_) {}
    try {
      const savedPractice = sessionStorage.getItem(`presenter_practice_unlocked_${props.roomCode}`)
      if (savedPractice) {
        practiceUnlockedByStep.value = {
          ...practiceUnlockedByStep.value,
          ...JSON.parse(savedPractice)
        }
      }
    } catch (_) {}
  }

  if (!props.isMentor && props.initialRoomState && isFromMentor(props.initialRoomState)) {
    applySyncedRoomState(props.initialRoomState, { fromInitialLoad: true })
    return
  }

  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    const cached = JSON.parse(raw)
    if (!isFromMentor(cached)) return

    if (props.isMentor) {
      if (typeof cached.currentStepIndex === 'number') currentStepIndex.value = cached.currentStepIndex
      if (typeof cached.isClassLive === 'boolean') isClassLive.value = cached.isClassLive
      if (typeof cached.isClassEnded === 'boolean') isClassEnded.value = cached.isClassEnded
      if (cached.revealedQuestions) revealedQuestions.value = cached.revealedQuestions
      if (cached.allResponses) allResponses.value = cached.allResponses
      if (Array.isArray(cached.activeStudents)) activeStudents.value = cached.activeStudents
      if (Array.isArray(cached.joinedStudents)) joinedStudents.value = cached.joinedStudents
      if (Array.isArray(cached.removedStudentIds)) removedStudentIds.value = cached.removedStudentIds
      if (Array.isArray(cached.raisedHands)) {
        raisedHands.value = cached.isClassEnded ? [] : cached.raisedHands
      }
      if (cached.ackSeqByStudent && typeof cached.ackSeqByStudent === 'object') {
        ackSeqByStudent.value = cached.ackSeqByStudent
      }
      if (cached.syncedQuestionsByStep && typeof cached.syncedQuestionsByStep === 'object') {
        syncedQuestionsByStep.value = cached.syncedQuestionsByStep
      }
      return
    }

    applySyncedRoomState(cached, { fromInitialLoad: true })
  } catch (_) {}
}

// Watchers for Mentor observation and Student DOM mirroring
watch(
  [() => props.isMentor, currentStepIndex, isClassLive, isClassEnded, isViewStep, stepWrapperRef],
  () => {
    if (props.isMentor) {
      setupMentorMirrorObserver()
    }
  },
  { immediate: true }
)

watch(
  [
    mirrorWrapperRef,
    currentStepIndex,
    isStepMirroredForStudent,
    () => mirroredSnapshotsByStep.value[currentStepIndex.value]
  ],
  ([el, idx, mirrored, snapshot]) => {
    if (!el || !mirrored) return
    if (snapshot && snapshot.stepIndex === idx) {
      if (retrySyncTimer) {
        clearTimeout(retrySyncTimer)
        retrySyncTimer = null
      }
      applyStepSnapshot(el, snapshot)
    } else {
      showMirrorWaitingPlaceholder(
        el,
        isClassLive.value ? 'Syncing live view...' : 'Waiting for class to start...'
      )
      scheduleStudentSyncRetryIfNeeded()
    }
  },
  { immediate: true, flush: 'post' }
)

// =========================================================================
// MENTOR CLASS NAVIGATION & ACTIONS
// =========================================================================
function clearStaleStepMirrorIfView(idx) {
  const target = stepsMeta.value[idx]
  if (target && !target.isMcq && idx in mirroredSnapshotsByStep.value) {
    const copy = { ...mirroredSnapshotsByStep.value }
    delete copy[idx]
    mirroredSnapshotsByStep.value = copy
  }
}

function startClass() {
  if (!props.isMentor || isClassEnded.value) return
  const wasLive = isClassLive.value
  isClassLive.value = true
  isClassEnded.value = false
  currentStepIndex.value = 0
  mirroredSnapshotsByStep.value = {}
  lastCapturedSignature = ''

  nextTick(() => {
    if (realtime) {
      realtime.publish('class-start', {
        senderRole: 'mentor',
        mentorId: mentorInstanceId
      })
    }
    if (wasLive) {
      captureMentorStepSnapshot({ broadcastMirrorEvent: true, forceNewSnapshot: true })
      broadcastRoomState()
    }
  })
}

function requestEndClass() {
  if (!props.isMentor || isClassEnded.value) return
  showEndClassConfirm.value = true
}

function cancelEndClass() {
  showEndClassConfirm.value = false
}

function confirmEndClass() {
  if (!props.isMentor || isClassEnded.value) return
  showEndClassConfirm.value = false
  isClassLive.value = false
  isClassEnded.value = true
  practiceUnlockedByStep.value = {}
  showMentorToast.value = false
  questionAlerts.value = {}
  raisedHands.value = []
  isSidePanelOpen.value = false
  confirmingRemoveStudentId.value = null
  for (const timer of pendingDisconnectTimers.values()) {
    clearTimeout(timer)
  }
  pendingDisconnectTimers.clear()
  if (alertCooldownTimer) {
    clearInterval(alertCooldownTimer)
    alertCooldownTimer = null
  }
  teardownMentorMirrorObserver()
  // Switch Mentor view to final MCQ summary when MCQs exist so final results remain available
  if (hasSummaryStep.value) {
    currentStepIndex.value = Math.max(0, totalNavigableSteps.value - 1)
  }
  if (realtime) {
    realtime.publish('class-end', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId
    })
  }
  broadcastRoomState()
}

function publishStepChange(idx) {
  if (!realtime) return
  realtime.publish('step-change', {
    stepIndex: idx,
    minMirrorSeq: mirrorSeq,
    senderRole: 'mentor',
    mentorId: mentorInstanceId
  })
}

function navigateMentorToStep(targetIdx) {
  if (Object.values(practiceUnlockedByStep.value).some(Boolean)) {
    practiceUnlockedByStep.value = {}
    if (realtime) {
      realtime.publish('practice-lock', {
        stepIndex: currentStepIndex.value,
        senderRole: 'mentor',
        mentorId: mentorInstanceId
      })
    }
  }
  clearStaleStepMirrorIfView(targetIdx)
  currentStepIndex.value = targetIdx
  publishStepChange(targetIdx)
  const targetMeta = stepsMeta.value[targetIdx]
  if (!targetMeta || targetMeta.isMcq || targetIdx >= totalTagSteps.value) {
    broadcastRoomState()
  }
}

function togglePracticeLock() {
  if (!props.isMentor || isClassEnded.value || !isPracticeStep.value) return
  const currentIdx = currentStepIndex.value
  const currentlyUnlocked = Boolean(practiceUnlockedByStep.value[currentIdx])
  const nextUnlocked = !currentlyUnlocked

  practiceUnlockedByStep.value = {
    ...practiceUnlockedByStep.value,
    [currentIdx]: nextUnlocked
  }

  triggerMentorToast(
    nextUnlocked ? 'Practice unlocked for students' : 'Locked. Students are viewing your screen.'
  )

  if (!nextUnlocked) {
    captureMentorStepSnapshot({ broadcastMirrorEvent: true, forceNewSnapshot: true })
  }

  if (realtime) {
    realtime.publish(nextUnlocked ? 'practice-unlock' : 'practice-lock', {
      stepIndex: currentIdx,
      senderRole: 'mentor',
      mentorId: mentorInstanceId
    })
  }
  broadcastRoomState()
}

function handleNextStep() {
  if (!props.isMentor || isClassEnded.value) return
  if (currentStepIndex.value < totalNavigableSteps.value - 1) {
    navigateMentorToStep(currentStepIndex.value + 1)
  }
}

function handlePrevStep() {
  if (!props.isMentor || isClassEnded.value) return
  if (currentStepIndex.value > 0) {
    navigateMentorToStep(currentStepIndex.value - 1)
  }
}

function jumpToStep(idx) {
  if (!props.isMentor || isClassEnded.value) return
  if (idx >= 0 && idx < totalNavigableSteps.value) {
    navigateMentorToStep(idx)
  }
}

function handleRevealAnswer(payload) {
  if (!props.isMentor || isClassEnded.value) return
  if (!payload || !payload.questionId) return
  revealedQuestions.value = {
    ...revealedQuestions.value,
    [payload.questionId]: true
  }
  try {
    sessionStorage.setItem(`presenter_revealed_questions_${props.roomCode}`, JSON.stringify(revealedQuestions.value))
  } catch (_) {}
  if (realtime) {
    realtime.publish('reveal-answer', {
      questionId: payload.questionId,
      senderRole: 'mentor',
      mentorId: mentorInstanceId
    })
  }
  broadcastRoomState()
}

function getUnansweredStudentsForQuestion(questionId) {
  if (!questionId) return []
  const qResponses = allResponses.value[questionId] || {}
  const uniqueNames = []
  const seen = new Set()

  for (const st of activeStudents.value) {
    const name = typeof st === 'string' ? st : st?.name
    if (name && !seen.has(name)) {
      seen.add(name)
      uniqueNames.push(name)
    }
  }

  return uniqueNames.filter(name => !qResponses[name]?.selectedOption)
}

function startCooldownTicker() {
  if (alertCooldownTimer) return
  alertCooldownTimer = setInterval(() => {
    const now = Date.now()
    cooldownNow.value = now
    const hasActive = Object.values(alertCooldownUntilByQuestion.value).some(ts => ts > now)
    if (!hasActive) {
      clearInterval(alertCooldownTimer)
      alertCooldownTimer = null
    }
  }, 250)
}

function sendQuestionAlert(questionId) {
  if (!props.isMentor || isClassEnded.value || !questionId) return
  if (revealedQuestions.value[questionId]) return

  const now = Date.now()
  const cooldownUntil = alertCooldownUntilByQuestion.value[questionId] || 0
  if (now < cooldownUntil) return

  const targetStudents = getUnansweredStudentsForQuestion(questionId)
  if (targetStudents.length === 0) return

  alertCooldownUntilByQuestion.value = {
    ...alertCooldownUntilByQuestion.value,
    [questionId]: now + ALERT_COOLDOWN_MS
  }
  cooldownNow.value = now
  startCooldownTicker()

  alertSeq += 1
  if (realtime) {
    realtime.publish('question-alert', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      alertId: `alert_${mentorInstanceId}_${alertSeq}_${now}`,
      questionId,
      targetStudents,
      message: 'Please select an option.',
      sentAt: now
    })
  }
}

function dismissQuestionAlert(questionId, alertId) {
  if (!questionId || !alertId) return
  dismissedAlertIds.value = {
    ...dismissedAlertIds.value,
    [questionId]: alertId
  }
}

provide('mcqAlertContext', {
  questionAlerts,
  dismissedAlertIds,
  alertCooldownUntilByQuestion,
  cooldownNow,
  sendQuestionAlert,
  dismissQuestionAlert
})

function handleStudentAnswer(payload) {
  if (props.isMentor || isClassEnded.value) return
  if (!payload || !payload.questionId) return
  const { questionId, selectedOption, isCorrect, timestamp, version } = payload

  // Reject local change if question is already revealed
  if (revealedQuestions.value[questionId]) return

  const effectiveTimestamp = Number(timestamp || version || Date.now())

  studentAnswers.value = {
    ...studentAnswers.value,
    [questionId]: {
      selectedOption,
      isCorrect,
      timestamp: effectiveTimestamp,
      version: effectiveTimestamp
    }
  }

  try {
    sessionStorage.setItem(
      `presenter_student_answers_${props.roomCode}_${effectiveStudentId}`,
      JSON.stringify(studentAnswers.value)
    )
  } catch (_) {}

  const activeAlert = questionAlerts.value[questionId]
  if (activeAlert) {
    dismissQuestionAlert(questionId, activeAlert.alertId)
  }

  if (realtime) {
    realtime.publish('student-answer', {
      questionId,
      studentId: effectiveStudentId,
      studentName: props.studentName || 'Student',
      selectedOption,
      isCorrect,
      timestamp: effectiveTimestamp,
      version: effectiveTimestamp
    })
  }
}

onMounted(() => {
  loadInitialOrCachedState()
  initRealtime()

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleWindowKeydown)
    if (!props.isMentor) {
      window.addEventListener('offline', handleStudentOffline)
      window.addEventListener('online', handleStudentOnline)
      window.addEventListener('pagehide', handleStudentPageHide)
      document.addEventListener('visibilitychange', handleStudentWakeOrOnline)
    }
  }
})

onUnmounted(() => {
  teardownMentorMirrorObserver()
  for (const timer of pendingDisconnectTimers.values()) {
    clearTimeout(timer)
  }
  pendingDisconnectTimers.clear()
  if (alertCooldownTimer) {
    clearInterval(alertCooldownTimer)
    alertCooldownTimer = null
  }
  if (retrySyncTimer) {
    clearTimeout(retrySyncTimer)
    retrySyncTimer = null
  }
  if (unsubscribeRealtimeReady) {
    unsubscribeRealtimeReady()
    unsubscribeRealtimeReady = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleWindowKeydown)
    if (!props.isMentor) {
      window.removeEventListener('offline', handleStudentOffline)
      window.removeEventListener('online', handleStudentOnline)
      window.removeEventListener('pagehide', handleStudentPageHide)
      document.removeEventListener('visibilitychange', handleStudentWakeOrOnline)
    }
  }
  if (!props.isMentor && realtime) {
    let hasTabSession = false
    try {
      hasTabSession = Boolean(sessionStorage.getItem('presenter_tab_session_v1'))
    } catch (_) {}
    if (!hasTabSession) {
      realtime.publish('student-leave', {
        senderRole: 'student',
        studentId: effectiveStudentId,
        studentName: props.studentName || 'Student'
      })
    }
  }
  if (mentorToastTimer) clearTimeout(mentorToastTimer)
  if (studentLockedNoticeTimer) clearTimeout(studentLockedNoticeTimer)
  if (realtime) realtime.destroy()
})
</script>

<style scoped>
.student-step-mirror,
.student-step-mirror :deep(*) {
  pointer-events: none !important;
}

.student-floating-hand {
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  right: calc(24px + env(safe-area-inset-right, 0px));
}

.mentor-floating-practice {
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  right: calc(24px + env(safe-area-inset-right, 0px));
}

.mentor-practice-toast {
  bottom: calc(128px + env(safe-area-inset-bottom, 0px));
  right: calc(24px + env(safe-area-inset-right, 0px));
}
</style>
