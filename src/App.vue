<template>
  <div class="h-screen w-screen bg-page flex flex-col text-primary overflow-hidden select-none">
    <!-- Thin Top Navbar -->
    <Navbar
      :role="currentRole"
      :room-code="currentRoomCode"
      @go-home="handleLeave"
      @leave="handleLeave"
    />

    <!-- Main Content Area (Full width & height, no giant margins) -->
    <main class="flex-1 w-full min-h-0 flex flex-col overflow-y-auto md:overflow-hidden relative">
      <!-- 1. Home: Role Selector (Screenshot 1) -->
      <RoleSelector
        v-if="view === 'home'"
        :selected-role="currentRole"
        @select-role="handleSelectRole"
      />

      <!-- 2. Admin: Room Created (Screenshot 2) -->
      <AdminRoomView
        v-else-if="view === 'admin'"
        :room-code="currentRoomCode"
        @back-home="handleLeave"
        @join-as-mentor="joinAsMentor"
      />

      <!-- 3. Mentor: Login (Screenshot 3) -->
      <MentorLoginView
        v-else-if="view === 'mentor-login'"
        @enter-room="handleMentorEnterRoom"
        @back-home="handleLeave"
      />

      <!-- 4. Student: Join Room & Name Entry (Screenshots 5 & 6) -->
      <StudentJoinView
        v-else-if="view === 'student-join'"
        @join-room="handleStudentJoinRoom"
        @back-home="handleLeave"
      />

      <!-- 5. Student: Waiting for Class to Start (Screenshot 7) -->
      <StudentWaiting
        v-else-if="view === 'student-waiting'"
        :room-code="currentRoomCode"
        @leave="handleLeave"
      />

      <!-- 5b. Student: Class Already Ended -->
      <div
        v-else-if="view === 'student-ended'"
        class="w-full max-w-md mx-auto bg-card rounded-2xl p-6 sm:p-8 border border-border text-center my-auto"
      >
        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-secondary border border-border font-medium text-xs mb-3">
          Room {{ currentRoomCode }}
        </div>
        <h2 class="text-xl font-bold text-primary tracking-tight mb-2">
          This class has ended
        </h2>
        <p class="text-sm text-secondary mb-6">
          This session is no longer accepting participants.
        </p>
        <button
          type="button"
          @click="handleLeave"
          class="btn-secondary inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer active:scale-98"
        >
          Back to Home
        </button>
      </div>

      <!-- 5c. Student: Removed by Mentor -->
      <div
        v-else-if="view === 'student-removed'"
        class="w-full max-w-md mx-auto bg-card rounded-2xl p-6 sm:p-8 border border-border text-center my-auto select-none"
      >
        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-raised text-secondary border border-border font-medium text-xs mb-3">
          Room {{ currentRoomCode }}
        </div>
        <h2 class="text-xl font-bold text-primary tracking-tight mb-2">
          {{ isRemovedRejoin ? 'You were removed from this class.' : 'You have been removed from this class by the Mentor.' }}
        </h2>
        <p class="text-sm text-secondary mb-6">
          {{ isRemovedRejoin ? 'You cannot rejoin this session.' : 'You can no longer participate in this session.' }}
        </p>
        <button
          type="button"
          @click="handleLeave"
          class="btn-secondary inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer active:scale-98"
        >
          Leave
        </button>
      </div>

      <!-- 6. Live Class: Presentation & MCQ View (Screenshots 4, 8-15) -->
      <ClassRoom
        v-else-if="view === 'classroom'"
        :is-mentor="currentRole === 'mentor'"
        :student-name="studentDisplayName"
        :student-id="studentId"
        :room-code="currentRoomCode"
        :initial-room-state="initialClassroomState"
        @leave="handleLeave"
        @student-removed="handleStudentRemovedByMentor"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from './components/Navbar.vue'
import RoleSelector from './components/RoleSelector.vue'
import AdminRoomView from './components/AdminRoomView.vue'
import MentorLoginView from './components/MentorLoginView.vue'
import StudentJoinView from './components/StudentJoinView.vue'
import StudentWaiting from './components/StudentWaiting.vue'
import ClassRoom from './components/ClassRoom.vue'
import { RealtimeService } from './services/realtime'

// State
const view = ref('home') // 'home' | 'admin' | 'mentor-login' | 'student-join' | 'student-waiting' | 'student-ended' | 'student-removed' | 'classroom'
const currentRole = ref(null) // null | 'admin' | 'mentor' | 'student'
const currentRoomCode = ref(null)
const studentDisplayName = ref('')
const studentId = ref('')
const initialClassroomState = ref(null)
const isRemovedRejoin = ref(false)

const TAB_SESSION_KEY = 'presenter_tab_session_v1'

let studentWaitingRealtime = null
let studentWaitingPollTimer = null

function createStudentId() {
  return `st_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function saveStudentTabSession(session) {
  try {
    sessionStorage.setItem(TAB_SESSION_KEY, JSON.stringify(session))
  } catch (_) {}
}

function clearStudentTabSession() {
  try {
    sessionStorage.removeItem(TAB_SESSION_KEY)
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith('presenter_hand_')) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch (_) {}
}

function cleanupWaitingRealtime() {
  if (studentWaitingPollTimer) {
    clearInterval(studentWaitingPollTimer)
    studentWaitingPollTimer = null
  }
  if (studentWaitingRealtime) {
    studentWaitingRealtime.destroy()
    studentWaitingRealtime = null
  }
}

function generate6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function handleSelectRole(role) {
  if (role === 'admin') {
    currentRole.value = 'admin'
    currentRoomCode.value = generate6DigitCode()
    view.value = 'admin'
  } else if (role === 'mentor') {
    currentRole.value = 'mentor'
    view.value = 'mentor-login'
  } else if (role === 'student') {
    currentRole.value = 'student'
    view.value = 'student-join'
  }
}

function joinAsMentor(roomCode) {
  cleanupWaitingRealtime()
  initialClassroomState.value = null
  currentRole.value = 'mentor'
  currentRoomCode.value = roomCode
  view.value = 'classroom'
}

function handleMentorEnterRoom(code) {
  cleanupWaitingRealtime()
  initialClassroomState.value = null
  currentRole.value = 'mentor'
  currentRoomCode.value = code
  view.value = 'classroom'
}

function enterStudentSession({ roomCode, name, id }) {
  cleanupWaitingRealtime()
  initialClassroomState.value = null
  currentRole.value = 'student'
  currentRoomCode.value = roomCode
  studentDisplayName.value = name

  // Persistent unique student ID per tab session
  let storedSessionStudentId = null
  try {
    storedSessionStudentId = sessionStorage.getItem(`presenter_student_id_${roomCode}`)
  } catch (_) {}
  studentId.value = id || storedSessionStudentId || createStudentId()
  try {
    sessionStorage.setItem(`presenter_student_id_${roomCode}`, studentId.value)
  } catch (_) {}

  saveStudentTabSession({
    role: 'student',
    roomCode,
    name,
    studentId: studentId.value
  })

  // Check if student was previously removed from this room
  let isRemoved = false
  try {
    isRemoved = Boolean(localStorage.getItem(`presenter_removed_${roomCode}`))
  } catch (_) {}

  if (isRemoved) {
    isRemovedRejoin.value = true
    view.value = 'student-removed'
    return
  }

  // Check if class is already live or ended or student is in removed list in cache
  const cachedRaw = localStorage.getItem(`presenter_room_state_${roomCode}`)
  let alreadyLive = false
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw)
      if (parsed && parsed.senderRole === 'mentor') {
        if (Array.isArray(parsed.removedStudentIds) && parsed.removedStudentIds.includes(studentId.value)) {
          try {
            localStorage.setItem(`presenter_removed_${roomCode}`, studentId.value)
          } catch (_) {}
          isRemovedRejoin.value = true
          view.value = 'student-removed'
          return
        }
        if (parsed.isClassEnded) {
          initialClassroomState.value = null
          view.value = 'student-ended'
          return
        }
        if (parsed.isClassLive) {
          initialClassroomState.value = parsed
          alreadyLive = true
        }
      }
    } catch (_) {}
  }

  if (alreadyLive) {
    view.value = 'classroom'
  } else {
    view.value = 'student-waiting'
    listenForClassStart(roomCode)
  }
}

function handleStudentJoinRoom({ roomCode, name }) {
  enterStudentSession({
    roomCode,
    name,
    id: createStudentId()
  })
}

function listenForClassStart(roomCode) {
  cleanupWaitingRealtime()

  studentWaitingRealtime = new RealtimeService(roomCode)

  const sendJoinAndRequest = () => {
    if (!studentWaitingRealtime) return
    if (studentDisplayName.value) {
      studentWaitingRealtime.publish('student-join', {
        name: studentDisplayName.value,
        studentId: studentId.value
      })
    } else {
      studentWaitingRealtime.publish('request-state', {
        name: 'Student',
        studentId: studentId.value
      })
    }
  }

  studentWaitingRealtime.on('class-start', (data) => {
    if (!data || data.senderRole !== 'mentor') return
    initialClassroomState.value = {
      senderRole: 'mentor',
      mentorId: data.mentorId,
      isClassLive: true,
      isClassEnded: false,
      currentStepIndex: 0
    }
    cleanupWaitingRealtime()
    view.value = 'classroom'
  })

  studentWaitingRealtime.on('class-end', (data) => {
    if (!data || data.senderRole !== 'mentor') return
    cleanupWaitingRealtime()
    initialClassroomState.value = null
    view.value = 'student-ended'
  })

  studentWaitingRealtime.on('student-removed', (data) => {
    if (!data || data.senderRole !== 'mentor' || !data.mentorId) {
      console.warn('[Security] Ignored student-removed: Only the Mentor can remove students.')
      return
    }
    if (data.studentId !== studentId.value) return
    try {
      localStorage.setItem(`presenter_removed_${roomCode}`, studentId.value)
    } catch (_) {}
    cleanupWaitingRealtime()
    isRemovedRejoin.value = Boolean(data.isRejoinAttempt)
    view.value = 'student-removed'
  })

  studentWaitingRealtime.on('state-sync', (state) => {
    if (!state || state.senderRole !== 'mentor') return
    if (Array.isArray(state.removedStudentIds) && state.removedStudentIds.includes(studentId.value)) {
      try {
        localStorage.setItem(`presenter_removed_${roomCode}`, studentId.value)
      } catch (_) {}
      cleanupWaitingRealtime()
      isRemovedRejoin.value = true
      view.value = 'student-removed'
      return
    }
    if (state.isClassEnded) {
      cleanupWaitingRealtime()
      initialClassroomState.value = null
      view.value = 'student-ended'
      return
    }
    if (state.isClassLive && !state.isClassEnded) {
      initialClassroomState.value = state
      cleanupWaitingRealtime()
      view.value = 'classroom'
    }
  })

  studentWaitingRealtime.onSubscribed(() => {
    sendJoinAndRequest()
  })

  studentWaitingPollTimer = setInterval(() => {
    sendJoinAndRequest()
  }, 2000)
}

function handleStudentRemovedByMentor({ reason, roomCode, studentId: removedId }) {
  cleanupWaitingRealtime()
  if (roomCode && removedId) {
    try {
      localStorage.setItem(`presenter_removed_${roomCode}`, removedId)
    } catch (_) {}
  }
  isRemovedRejoin.value = reason === 'rejoin'
  view.value = 'student-removed'
}

function handleLeave() {
  if (view.value === 'student-waiting' && studentWaitingRealtime && currentRole.value === 'student') {
    studentWaitingRealtime.publish('student-leave', {
      senderRole: 'student',
      studentId: studentId.value,
      studentName: studentDisplayName.value
    })
  }
  clearStudentTabSession()
  cleanupWaitingRealtime()
  view.value = 'home'
  currentRole.value = null
  currentRoomCode.value = null
  studentDisplayName.value = ''
  studentId.value = ''
  initialClassroomState.value = null
  isRemovedRejoin.value = false
}

function handleWaitingPageHide() {
  if (view.value === 'student-waiting' && studentWaitingRealtime && currentRole.value === 'student') {
    studentWaitingRealtime.publishUnload('student-disconnecting', {
      senderRole: 'student',
      studentId: studentId.value,
      studentName: studentDisplayName.value
    })
  }
}

function handleWaitingWakeOrOnline() {
  if (view.value === 'student-waiting' && studentWaitingRealtime && currentRole.value === 'student') {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    if (studentDisplayName.value) {
      studentWaitingRealtime.publish('student-join', {
        name: studentDisplayName.value,
        studentId: studentId.value
      })
    }
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', handleWaitingPageHide)
    window.addEventListener('offline', handleWaitingPageHide)
    window.addEventListener('online', handleWaitingWakeOrOnline)
    document.addEventListener('visibilitychange', handleWaitingWakeOrOnline)
  }
  try {
    const raw = sessionStorage.getItem(TAB_SESSION_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved && saved.role === 'student' && saved.roomCode && saved.name) {
        enterStudentSession({
          roomCode: saved.roomCode,
          name: saved.name,
          id: saved.studentId
        })
      }
    }
  } catch (_) {}
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pagehide', handleWaitingPageHide)
    window.removeEventListener('offline', handleWaitingPageHide)
    window.removeEventListener('online', handleWaitingWakeOrOnline)
    document.removeEventListener('visibilitychange', handleWaitingWakeOrOnline)
  }
  cleanupWaitingRealtime()
})
</script>
