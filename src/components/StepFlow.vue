<script>
import {
  Comment,
  Fragment,
  Text,
  computed,
  defineComponent,
  h,
  inject,
  onErrorCaptured,
  provide,
  ref
} from 'vue'
import MCQMentorSummary from './MCQMentorSummary.vue'
import MCQStudentScore from './MCQStudentScore.vue'
import PracticeHost from './PracticeHost.vue'

const DEFAULT_TITLES_BY_TAG = {
  StepImage1: 'Introduction',
  StepImage2: 'Key Concepts',
  StepImage3: 'Practical Application',
  Counter: 'Interactive Demo'
}

function formatTagTitle(tagName) {
  if (!tagName) return 'Presentation Step'
  if (DEFAULT_TITLES_BY_TAG[tagName]) return DEFAULT_TITLES_BY_TAG[tagName]
  return tagName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d+)/g, '$1 $2')
    .trim()
}

function flattenSlotVNodes(vnodes, out = []) {
  if (!Array.isArray(vnodes)) return out
  for (const vnode of vnodes) {
    if (!vnode || vnode.type === Comment) continue
    if (vnode.type === Text) {
      if (typeof vnode.children === 'string' && vnode.children.trim() === '') continue
      out.push(vnode)
      continue
    }
    if (vnode.type === Fragment && Array.isArray(vnode.children)) {
      flattenSlotVNodes(vnode.children, out)
      continue
    }
    out.push(vnode)
  }
  return out
}

function isTruthyMcqProp(props) {
  if (!props || !('mcq' in props)) return false
  const val = props.mcq
  return val !== false && val !== 'false'
}

function isTruthyPracticeProp(props) {
  if (!props || !('practice' in props)) return false
  const val = props.practice
  return val !== false && val !== 'false'
}

function omitInternalProps(props) {
  if (!props) return {}
  const cleaned = {}
  for (const [k, v] of Object.entries(props)) {
    if (k === 'mcq' || k === 'practice' || k === 'key' || k === 'ref') continue
    cleaned[k] = v
  }
  return cleaned
}

function filterDeclaredProps(compType, available) {
  const declared = compType?.props
  if (!declared) return {}
  const keys = Array.isArray(declared) ? declared : Object.keys(declared)
  const matched = {}
  for (const k of keys) {
    if (k in available) matched[k] = available[k]
  }
  return matched
}

function renderMentorErrorCard(title, details, hint) {
  return h(
    'div',
    {
      role: 'alert',
      class:
        'w-full max-w-lg mx-auto bg-card rounded-2xl border border-danger/40 p-5 sm:p-6 text-left'
    },
    [
      h(
        'div',
        {
          class:
            'inline-flex items-center px-2.5 py-0.5 rounded-full bg-danger-soft text-danger border border-danger/40 font-semibold text-[11px] mb-2.5'
        },
        'Navigator Configuration Error'
      ),
      h('h3', { class: 'text-base sm:text-lg font-bold text-primary mb-1.5' }, title),
      h('p', { class: 'text-xs sm:text-sm text-secondary leading-relaxed mb-3' }, details),
      hint
        ? h(
            'div',
            {
              class:
                'text-xs text-primary bg-raised border border-border rounded-xl px-3.5 py-2.5 font-mono break-all'
            },
            hint
          )
        : null
    ]
  )
}

export default defineComponent({
  name: 'StepFlow',
  setup(_, { slots }) {
    const host = inject('stepFlowHost', null)
    const runtimeQuestionsByStep = ref({})
    const capturedErrorByStep = ref({})
    let lastSyncedSignature = ''
    let pendingSyncQueued = false

    let currentStepMetaSnapshot = {
      stepIndex: 0,
      stepNumber: 1,
      totalSteps: 1,
      isMcq: false,
      stepQuestionKey: 'step_0',
      reportQuestionData: () => {}
    }
    provide('getStepItemMeta', () => currentStepMetaSnapshot)

    function reportRuntimeQuestionData(stepIdx, qData) {
      if (!qData || typeof qData !== 'object') return
      const existing = runtimeQuestionsByStep.value[stepIdx]
      if (
        existing &&
        existing.question === qData.question &&
        existing.correctAnswer === qData.correctAnswer &&
        existing.topic === qData.topic
      ) {
        return
      }
      runtimeQuestionsByStep.value = {
        ...runtimeQuestionsByStep.value,
        [stepIdx]: { ...qData }
      }
    }

    onErrorCaptured((err) => {
      const idx = host ? host.currentStepIndex.value : 0
      capturedErrorByStep.value = {
        ...capturedErrorByStep.value,
        [idx]: err?.message || 'Unexpected error rendering this step component.'
      }
      return false
    })

    const isMentor = computed(() => (host ? Boolean(host.isMentor.value) : true))
    const currentIdx = computed(() => (host ? Number(host.currentStepIndex.value || 0) : 0))

    function syncHostMetadata(parsedSteps, mcqQuestions) {
      if (!host || typeof host.setStepsMeta !== 'function') return
      const signature =
        parsedSteps
          .map(
            (s) =>
              `${s.index}:${s.tagName}:${s.isMcq ? 1 : 0}:${s.isPractice ? 1 : 0}:${s.isUnresolved ? 1 : 0}:${s.stepTitle}`
          )
          .join('|') +
        '::' +
        mcqQuestions.map((q) => `${q.id}:${q.question}:${q.topic}:${q.correctAnswer}`).join('|')

      if (signature === lastSyncedSignature || pendingSyncQueued) return
      pendingSyncQueued = true
      Promise.resolve().then(() => {
        pendingSyncQueued = false
        lastSyncedSignature = signature
        host.setStepsMeta({
          steps: parsedSteps.map((s) => ({
            index: s.index,
            tagName: s.tagName,
            stepTitle: s.stepTitle,
            isMcq: s.isMcq,
            isPractice: s.isPractice,
            isUnresolved: s.isUnresolved,
            stepQuestionKey: s.stepQuestionKey
          })),
          mcqQuestions,
          runtimeQuestionsByStep: runtimeQuestionsByStep.value
        })
      })
    }

    return () => {
      const rawChildren = flattenSlotVNodes(slots.default ? slots.default() : [])

      let mcqCounter = 0
      const mcqQuestions = []
      const parsedSteps = rawChildren.map((vnode, index) => {
        const isText = vnode.type === Text
        const isUnresolved = isText || typeof vnode.type === 'string'
        const tagName = isText
          ? String(vnode.children || '').trim() || `TextNode#${index + 1}`
          : typeof vnode.type === 'string'
            ? vnode.type
            : vnode.type?.__name || vnode.type?.name || `Step${index + 1}`
        const isMcq = !isUnresolved && isTruthyMcqProp(vnode.props)
        const isPractice = !isUnresolved && !isMcq && isTruthyPracticeProp(vnode.props)
        const stepQuestionKey = `step_${index}`
        const mcqNumber = isMcq ? ++mcqCounter : 0

        let normalizedQuestion = null
        if (isMcq) {
          const rawQ =
            runtimeQuestionsByStep.value[index] ||
            vnode.type?.questionData ||
            host?.syncedQuestionsByStep?.value?.[index] ||
            null
          if (rawQ && typeof rawQ === 'object') {
            normalizedQuestion = {
              ...rawQ,
              id: stepQuestionKey
            }
          } else {
            normalizedQuestion = {
              id: stepQuestionKey,
              topic: formatTagTitle(tagName),
              question: `Question ${mcqNumber}`,
              options: [],
              correctAnswer: ''
            }
          }
          mcqQuestions.push(normalizedQuestion)
        }

        return {
          index,
          vnode,
          isUnresolved,
          tagName,
          stepTitle: isMcq ? 'Knowledge Check' : formatTagTitle(tagName),
          isMcq,
          isPractice,
          mcqNumber,
          stepQuestionKey,
          normalizedQuestion
        }
      })

      syncHostMetadata(parsedSteps, mcqQuestions)

      const totalTagSteps = parsedSteps.length
      const hasSummaryStep = mcqQuestions.length > 0
      const idx = currentIdx.value
      const unresolvedSteps = parsedSteps.filter((s) => s.isUnresolved)

      // 1. Empty Navigator.vue list
      if (totalTagSteps === 0) {
        if (isMentor.value) {
          return renderMentorErrorCard(
            'No steps configured in Navigator.vue',
            'Your <StepFlow> list in Navigator.vue is empty. Add at least one step tag to begin the presentation.',
            '<StepFlow>\n  <StepImage1 />\n</StepFlow>'
          )
        }
        return h(
          'div',
          { class: 'text-xs text-muted font-medium text-center py-8' },
          'Waiting for session steps...'
        )
      }

      // 2. Post-MCQ Results screen (after all listed tags when at least one MCQ exists)
      if (hasSummaryStep && idx >= totalTagSteps) {
        const summaryComp = isMentor.value ? MCQMentorSummary : MCQStudentScore
        return h(summaryComp, {
          key: isMentor.value ? 'mcq-summary-mentor' : 'mcq-summary-student',
          questions: mcqQuestions,
          allResponses: host?.allResponses?.value || {},
          studentAnswers: host?.studentAnswers?.value || {},
          isClassEnded: Boolean(host?.isClassEnded?.value),
          onEndClass: () => host?.requestEndClass?.()
        })
      }

      const activeStep = parsedSteps[idx] || parsedSteps[0]

      // Keep current step metadata snapshot up to date for child steps without mutating reactive refs during render
      currentStepMetaSnapshot = {
        stepIndex: activeStep.index,
        stepNumber: activeStep.index + 1,
        totalSteps: totalTagSteps,
        isMcq: activeStep.isMcq,
        isPractice: activeStep.isPractice,
        stepQuestionKey: activeStep.stepQuestionKey,
        reportQuestionData: (qData) => reportRuntimeQuestionData(activeStep.index, qData)
      }

      // 3. Unresolved / missing component file for the active step
      if (activeStep.isUnresolved) {
        if (isMentor.value) {
          return renderMentorErrorCard(
            `Step "${activeStep.tagName}" was not found`,
            `Step ${activeStep.index + 1} in Navigator.vue (<${activeStep.tagName} />) does not match any .vue file in src/steps/ or src/components/.`,
            `Create src/steps/${activeStep.tagName}.vue (or src/components/${activeStep.tagName}.vue), or update the tag in src/components/Navigator.vue.`
          )
        }
        return h(
          'div',
          { class: 'text-xs text-muted font-medium text-center py-8' },
          'Step content unavailable.'
        )
      }

      // 4. Runtime render error captured from active step component
      const runtimeErr = capturedErrorByStep.value[activeStep.index]
      if (runtimeErr && isMentor.value) {
        return renderMentorErrorCard(
          `Failed to display <${activeStep.tagName} />`,
          runtimeErr,
          `Check src/steps/${activeStep.tagName}.vue or src/components/${activeStep.tagName}.vue.`
        )
      }

      // 5. On student view steps (!isMcq), render PracticeHost if practice is unlocked, otherwise wait for mirror
      if (!isMentor.value && !activeStep.isMcq) {
        const isPracticeUnlocked = Boolean(
          activeStep.isPractice && host?.practiceUnlockedByStep?.value?.[activeStep.index]
        )
        if (activeStep.isPractice && isPracticeUnlocked) {
          const tagProps = omitInternalProps(activeStep.vnode.props)
          return h(PracticeHost, {
            key: `practice-step-${activeStep.index}`,
            component: activeStep.vnode.type,
            stepProps: tagProps
          })
        }

        if (activeStep.vnode.type && typeof activeStep.vnode.type.__asyncLoader === 'function') {
          activeStep.vnode.type.__asyncLoader().catch(() => {})
        }
        return null
      }

      // 6. Build props & listeners for the single active step component
      const tagProps = omitInternalProps(activeStep.vnode.props)
      const sharedHostProps = {
        isMentor: isMentor.value,
        isClassLive: Boolean(host?.isClassLive?.value),
        isClassEnded: Boolean(host?.isClassEnded?.value),
        roomCode: host?.roomCode?.value || '',
        stepNumber: activeStep.index + 1,
        totalSteps: totalTagSteps
      }

      let finalProps
      if (activeStep.isMcq) {
        const revealedMap = host?.revealedQuestions?.value || {}
        const legacyId = activeStep.vnode.type?.questionData?.id
        const isRevealed = Boolean(
          revealedMap[activeStep.stepQuestionKey] || (legacyId && revealedMap[legacyId])
        )
        const mcqProps = {
          ...sharedHostProps,
          studentName: host?.studentName?.value || '',
          questionNumber: activeStep.mcqNumber,
          totalQuestions: mcqQuestions.length,
          studentAnswers: host?.studentAnswers?.value || {},
          allResponses: host?.allResponses?.value || {},
          activeStudents: host?.activeStudents?.value || [],
          isRevealed,
          questions: mcqQuestions,
          onSubmitAnswer: (payload) => host?.onStudentAnswer?.(payload),
          onRevealAnswer: (payload) => host?.onRevealAnswer?.(payload),
          onNextQuestion: () => host?.onNextStep?.(),
          onEndClass: () => host?.requestEndClass?.()
        }
        finalProps = {
          ...mcqProps,
          ...tagProps,
          key: `step-${activeStep.index}-${activeStep.tagName}`
        }
      } else {
        const matchedHostProps = filterDeclaredProps(activeStep.vnode.type, sharedHostProps)
        finalProps = {
          ...matchedHostProps,
          ...tagProps,
          key: `step-${activeStep.index}-${activeStep.tagName}`
        }
      }

      const activeVNode = h(activeStep.vnode.type, finalProps)

      // Show non-blocking warning on Mentor screen if another tag later in Navigator.vue is missing
      if (isMentor.value && unresolvedSteps.length > 0) {
        const missingNames = unresolvedSteps.map((s) => `<${s.tagName} />`).join(', ')
        return h('div', { class: 'w-full h-full flex flex-col min-h-0' }, [
          h(
            'div',
            {
              role: 'alert',
              class:
                'mb-2 px-3 py-1.5 rounded-lg border border-warning/40 bg-warning-soft text-warning text-xs font-medium shrink-0 text-center'
            },
            `Unmatched step tag(s) in Navigator.vue: ${missingNames}`
          ),
          h('div', { class: 'flex-1 min-h-0 flex items-center justify-center' }, [activeVNode])
        ])
      }

      return activeVNode
    }
  }
})
</script>
