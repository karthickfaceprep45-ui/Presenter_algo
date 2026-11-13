<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

defineProps({
  topic:    { type: String, default: 'Sliding Window Algorithms' },
  subTopic: { type: String, default: 'Contains Duplicate II (LeetCode 219)' }
});

const CODES = {
  java: [
    ['',           'class Solution {'],
    ['fn_entry',   '    public boolean containsNearbyDuplicate(int[] nums, int k) {'],
    ['outer_for',  '        for (int i = 0; i < nums.length - 1; i++) {'],
    ['inner_for',  '            for (int j = i + 1; j <= i + k && j < nums.length; j++) {'],
    ['if_equal',   '                if (nums[i] == nums[j]) {'],
    ['ret_true',   '                    return true;'],
    ['',           '                }'],
    ['',           '            }'],
    ['',           '        }'],
    ['ret_false',  '        return false;'],
    ['',           '    }'],
    ['',           ''],
    ['',           '    public static void main(String[] args) {'],
    ['m_scanner',  '        java.util.Scanner sc = new java.util.Scanner(System.in);'],
    ['m_read_n',   '        int n = sc.nextInt();'],
    ['m_read_k',   '        int k = sc.nextInt();'],
    ['m_alloc',    '        int[] nums = new int[n];'],
    ['m_loop',     '        for (int i = 0; i < n; i++) {'],
    ['m_read_elem','            nums[i] = sc.nextInt();'],
    ['',           '        }'],
    ['m_call',     '        boolean result = new Solution().containsNearbyDuplicate(nums, k);'],
    ['m_print',    '        System.out.println(result);'],
    ['',           '    }'],
    ['',           '}']
  ],
  cpp: [
    ['',           '#include <vector>'],
    ['',           '#include <iostream>'],
    ['',           'using namespace std;'],
    ['',           ''],
    ['',           'class Solution {'],
    ['',           'public:'],
    ['fn_entry',   '    bool containsNearbyDuplicate(vector<int>& nums, int k) {'],
    ['outer_for',  '        for (int i = 0; i < (int)nums.size() - 1; i++) {'],
    ['inner_for',  '            for (int j = i + 1; j <= i + k && j < (int)nums.size(); j++) {'],
    ['if_equal',   '                if (nums[i] == nums[j]) {'],
    ['ret_true',   '                    return true;'],
    ['',           '                }'],
    ['',           '            }'],
    ['',           '        }'],
    ['ret_false',  '        return false;'],
    ['',           '    }'],
    ['',           '};'],
    ['',           ''],
    ['',           'int main() {'],
    ['m_read_n',   '    int n, k;'],
    ['m_scanner',  '    cin >> n >> k;'],
    ['m_alloc',    '    vector<int> nums(n);'],
    ['m_loop',     '    for (int i = 0; i < n; i++) {'],
    ['m_read_elem','        cin >> nums[i];'],
    ['',           '    }'],
    ['m_call',     '    cout << boolalpha << Solution().containsNearbyDuplicate(nums, k) << endl;'],
    ['',           '    return 0;'],
    ['',           '}']
  ],
  python: [
    ['',           'class Solution:'],
    ['fn_entry',   '    def containsNearbyDuplicate(self, nums, k):'],
    ['outer_for',  '        for i in range(len(nums) - 1):'],
    ['inner_for',  '            for j in range(i + 1, min(i + k + 1, len(nums))):'],
    ['if_equal',   '                if nums[i] == nums[j]:'],
    ['ret_true',   '                    return True'],
    ['ret_false',  '        return False'],
    ['',           ''],
    ['',           'def main():'],
    ['m_read_elem','    nums = list(map(int, input().split()))'],
    ['m_read_k',   '    k = int(input())'],
    ['m_call',     '    print(Solution().containsNearbyDuplicate(nums, k))'],
    ['',           ''],
    ['',           'main()']
  ],
  javascript: [
    ['',           '/**'],
    ['',           ' * @param {number[]} nums'],
    ['',           ' * @param {number} k'],
    ['',           ' * @return {boolean}'],
    ['',           ' */'],
    ['fn_entry',   'var containsNearbyDuplicate = function(nums, k) {'],
    ['outer_for',  '    for (let i = 0; i < nums.length - 1; i++) {'],
    ['inner_for',  '        for (let j = i + 1; j <= i + k && j < nums.length; j++) {'],
    ['if_equal',   '            if (nums[i] === nums[j]) {'],
    ['ret_true',   '                return true;'],
    ['',           '            }'],
    ['',           '        }'],
    ['',           '    }'],
    ['ret_false',  '    return false;'],
    ['',           '};'],
    ['',           ''],
    ['',           'function main() {'],
    ['m_read_elem','    const nums = [1, 2, 3, 1];'],
    ['m_read_k',   '    const k = 3;'],
    ['m_call',     '    console.log(containsNearbyDuplicate(nums, k));'],
    ['',           '}'],
    ['',           'main();']
  ],
  c: [
    ['',           '#include <stdio.h>'],
    ['',           '#include <stdbool.h>'],
    ['',           ''],
    ['fn_entry',   'bool containsNearbyDuplicate(int* nums, int n, int k) {'],
    ['outer_for',  '    for (int i = 0; i < n - 1; i++) {'],
    ['inner_for',  '        for (int j = i + 1; j <= i + k && j < n; j++) {'],
    ['if_equal',   '            if (nums[i] == nums[j]) {'],
    ['ret_true',   '                return true;'],
    ['',           '            }'],
    ['',           '        }'],
    ['',           '    }'],
    ['ret_false',  '    return false;'],
    ['',           '}'],
    ['',           ''],
    ['',           'int main() {'],
    ['m_read_n',   '    int n, k;'],
    ['m_scanner',  '    scanf("%d %d", &n, &k);'],
    ['m_alloc',    '    int nums[300];'],
    ['m_loop',     '    for (int i = 0; i < n; i++) {'],
    ['m_read_elem','        scanf("%d", &nums[i]);'],
    ['',           '    }'],
    ['m_call',     '    printf("%s\\n", containsNearbyDuplicate(nums,n,k)?"true":"false");'],
    ['',           '    return 0;'],
    ['',           '}']
  ]
};

const PSEUDOCODE = [
  'function containsNearbyDuplicate(nums, k):',
  '    // Sliding window: for each i, scan window [i+1 .. i+k]',
  '    for i = 0 to n-2:',
  '        for j = i+1 to min(i+k, n-1):',
  '            if nums[i] == nums[j]:',
  '                return true   // duplicate within distance k',
  '',
  '    return false'
];

// ─── Step Builder ─────────────────────────────────────────────────────────────
function parseNums(raw) {
  return raw.replace(/[^\d,\-\s]/g,'').split(/[,\s]+/).map(x=>parseInt(x.trim(),10)).filter(x=>!isNaN(x)).slice(0,12);
}

function buildSteps(rawNums, kRaw) {
  const steps = [];
  const nums = parseNums(rawNums);
  const k = parseInt(kRaw, 10);
  if (nums.length < 2 || isNaN(k) || k < 1) return steps;
  const N = nums.length;

  const NONE = {iReady:false, jReady:false};
  const I    = {iReady:true,  jReady:false};
  const IJ   = {iReady:true,  jReady:true};

  function snap(i, j, code, phase, ist, extra) {
    return { nums:[...nums], n:N, k, i, j, code, phase, initState:{...ist}, ...extra };
  }

  // ── Input phase ──────────────────────────────────────────────────────────────
  const partial = new Array(N).fill('');
  steps.push({...snap(-1,-1,'m_scanner','input',NONE,{partial:[...partial]}),badge:'Scanner sc = new Scanner(System.in); → Init input.'});
  steps.push({...snap(-1,-1,'m_read_n','input',NONE,{partial:[...partial]}),badge:`int n = sc.nextInt(); → n = ${N}.`});
  steps.push({...snap(-1,-1,'m_read_k','input',NONE,{partial:[...partial]}),badge:`int k = sc.nextInt(); → k = ${k}. Window size limit.`});
  steps.push({...snap(-1,-1,'m_alloc','input',NONE,{partial:[...partial]}),badge:`int[] nums = new int[${N}]; → Allocated.`});
  for (let ii=0;ii<N;ii++) {
    steps.push({...snap(-1,-1,'m_loop','input',NONE,{partial:[...partial],readIdx:ii}),badge:`for i=${ii}; i<${N}: Reading nums[${ii}].`});
    partial[ii]=nums[ii];
    steps.push({...snap(-1,-1,'m_read_elem','input',NONE,{partial:[...partial],readIdx:ii}),badge:`nums[${ii}] = ${nums[ii]}.`});
  }
  steps.push({...snap(-1,-1,'m_loop','input',NONE,{partial:[...partial]}),badge:`for exits. Array read. Calling containsNearbyDuplicate(nums, ${k}).`});
  steps.push({...snap(-1,-1,'m_call','input',NONE,{partial:[...partial]}),badge:`containsNearbyDuplicate(nums, ${k}); → Calling.`});

  // ── containsNearbyDuplicate() ─────────────────────────────────────────────────
  steps.push({...snap(-1,-1,'fn_entry','fn',NONE,{}),badge:`containsNearbyDuplicate(nums, k=${k}) → Entry. Sliding window size k=${k}.`});

  let found = false;
  for (let i = 0; i < N - 1 && !found; i++) {
    // outer for check
    steps.push({...snap(i,-1,'outer_for','outer',I,{outerTrue:i<N-1}),badge:`for(i=${i}; i<${N}-1=${N-1}): ${i}<${N-1} → TRUE. Anchor nums[i]=${nums[i]}.`});

    const jEnd = Math.min(i + k, N - 1);
    for (let j = i + 1; j <= jEnd && !found; j++) {
      // inner for check
      const innerCond = j <= i + k && j < N;
      steps.push({...snap(i,j,'inner_for','inner',IJ,{innerTrue:true}),badge:`for(j=${j}; j<=${i+k} && j<${N}): ${j}<=${i+k}&&${j}<${N} → TRUE. Comparing nums[${i}]=${nums[i]} with nums[${j}]=${nums[j]}.`});

      const isEqual = nums[i] === nums[j];
      steps.push({...snap(i,j,'if_equal','inner',IJ,{isEqual,checkI:i,checkJ:j}),badge:`if(nums[i]==nums[j]): ${nums[i]}${isEqual?'==':'!='  }${nums[j]} → ${isEqual?'TRUE — duplicate within k! Return true.':'FALSE — not a match, continue.'}`});

      if (isEqual) {
        steps.push({...snap(i,j,'ret_true','done',IJ,{foundI:i,foundJ:j,foundVal:nums[i]}),badge:`return true; → nums[${i}]=${nums[i]} == nums[${j}]=${nums[j]}, |i-j|=${j-i} <= k=${k}. Duplicate found!`});
        found = true;
        break;
      }
    }

    if (!found) {
      // inner for exits
      const jExitVal = jEnd + 1;
      steps.push({...snap(i,jExitVal,'inner_for','outer',IJ,{innerTrue:false}),badge:`for(j=${jExitVal}; ...): j=${jExitVal} > i+k=${i+k} → FALSE. Inner loop exits for i=${i}.`});
    }
  }

  if (!found) {
    // outer for exits
    steps.push({...snap(N-1,-1,'outer_for','done',I,{outerTrue:false}),badge:`for(i=${N-1}; i<${N-1}): ${N-1}<${N-1} → FALSE. Outer loop exits.`});
    steps.push({...snap(N-1,-1,'ret_false','done',I,{}),badge:`return false; → No duplicate found within distance k=${k}.`});
  }

  return steps;
}

// ─── Reactive State ───────────────────────────────────────────────────────────
const inputNums   = ref('1,2,3,1');
const inputK      = ref('3');
const lang        = ref('java');
const speed       = ref(650);
const si          = ref(0);
const playing     = ref(false);
const vizHeight   = ref(320);
const tableHeight = ref(60);
const leftWidth   = ref(52);
const rightTab    = ref('code');

const stepsData = reactive({steps: buildSteps('1,2,3,1','3')});
const steps     = computed(()=>stepsData.steps);
const s         = computed(()=>steps.value[Math.max(0,Math.min(si.value,steps.value.length-1))]||{});
const codeLines = computed(()=>CODES[lang.value]||[]);
let playTimer = null;

function onChipsWheel(e){if(e.currentTarget)e.currentTarget.scrollLeft+=e.deltaY;}
function applyInput(){
  const nums=parseNums(inputNums.value);
  const k=parseInt(inputK.value,10);
  if(nums.length<2){alert('Enter at least 2 numbers.');return;}
  if(isNaN(k)||k<1){alert('Enter a valid k (>=1).');return;}
  playing.value=false;stepsData.steps=buildSteps(inputNums.value,inputK.value);si.value=0;
}
function stepBy(d){si.value=Math.max(0,Math.min(steps.value.length-1,si.value+d));}
function togglePlay(){if(!playing.value&&si.value>=steps.value.length-1)si.value=0;playing.value=!playing.value;}
function tick(){
  clearTimeout(playTimer);if(!playing.value)return;
  if(si.value>=steps.value.length-1){playing.value=false;return;}
  playTimer=setTimeout(()=>{si.value=Math.min(steps.value.length-1,si.value+1);tick();},2100-speed.value);
}
watch(playing,v=>{if(v)tick();else clearTimeout(playTimer);});

const codeScrollRef=ref(null);
function scrollActiveCodeLine(){
  nextTick(()=>{
    const c=codeScrollRef.value;if(!c)return;
    const a=c.querySelector('.ll-hl');if(!a)return;
    const cr=c.getBoundingClientRect(),ar=a.getBoundingClientRect();
    if(ar.top<cr.top)c.scrollTop=Math.max(0,c.scrollTop-(cr.top-ar.top)-24);
    else if(ar.bottom>cr.bottom)c.scrollTop=c.scrollTop+(ar.bottom-cr.bottom)+24;
  });
}
watch(()=>s.value.code,scrollActiveCodeLine);
watch(lang,scrollActiveCodeLine);
watch(rightTab,v=>{if(v==='code')scrollActiveCodeLine();});
function onKeydown(e){
  const t=e.target.tagName;
  if(t==='INPUT'||t==='SELECT'||t==='TEXTAREA')return;
  if(e.key==='ArrowRight')stepBy(1);
  if(e.key==='ArrowLeft')stepBy(-1);
  if(e.key===' '){e.preventDefault();togglePlay();}
}

// ─── Computed display ─────────────────────────────────────────────────────────
const initState   = computed(()=>s.value.initState||{iReady:false,jReady:false});
const displayNums = computed(()=>s.value.phase==='input'?(s.value.partial||[]):(s.value.nums||[]));
const displayI    = computed(()=>initState.value.iReady?s.value.i:'?');
const displayJ    = computed(()=>initState.value.jReady?s.value.j:'?');
const displayK    = computed(()=>s.value.k!==undefined?s.value.k:'?');

// window range for current i: [i+1 .. min(i+k, n-1)]
const windowStart = computed(()=>initState.value.iReady&&s.value.i>=0?s.value.i+1:null);
const windowEnd   = computed(()=>initState.value.iReady&&s.value.i>=0?Math.min(s.value.i+s.value.k, s.value.n-1):null);

function numClass(idx){
  const phase=s.value.phase,ist=initState.value;
  if(phase==='input')return s.value.readIdx===idx?'cd-num-reading':'';
  if(!ist.iReady)return '';
  const i=s.value.i,j=s.value.j;
  const fi=s.value.foundI,fj=s.value.foundJ;
  if(phase==='done'&&fi!==undefined){
    if(idx===fi||idx===fj)return 'cd-num-found';
    return '';
  }
  if(phase==='done'&&fi===undefined){
    return 'cd-num-clear';
  }
  if(idx===i)return 'cd-num-i';
  if(ist.jReady&&idx===j&&j<(s.value.n||0))return 'cd-num-j';
  if(ist.iReady&&idx>i&&idx<=i+s.value.k&&idx<(s.value.n||0))return 'cd-num-in-window';
  if(idx<i)return 'cd-num-past';
  return '';
}

// ─── Resizers ──────────────────────────────────────────────────────────────────
const mainRef=ref(null),leftColRef=ref(null),hResizerRef=ref(null),vizResizerRef=ref(null),tableResizerRef=ref(null);
function initHResizer(){
  const rsz=hResizerRef.value,main=mainRef.value;if(!rsz||!main)return;
  let dragging=false,startX=0,startW=0;
  const onDown=e=>{dragging=true;startX=e.clientX;startW=leftColRef.value.offsetWidth;rsz.classList.add('drag');document.body.style.userSelect='none';};
  const onMove=e=>{if(!dragging)return;const mW=main.offsetWidth;leftWidth.value=(Math.max(200,Math.min(mW-200,startW+e.clientX-startX))/mW)*100;};
  const onUp=()=>{if(!dragging)return;dragging=false;rsz.classList.remove('drag');document.body.style.userSelect='';};
  rsz.addEventListener('mousedown',onDown);document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  return()=>{rsz.removeEventListener('mousedown',onDown);document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
}
function initVResizer(elRef,valueRef,minH,maxH){
  const rsz=elRef.value;if(!rsz)return;
  let dragging=false,startY=0,startH=0;
  const onDown=e=>{dragging=true;startY=e.clientY;startH=valueRef.value;rsz.classList.add('drag');document.body.style.userSelect='none';e.preventDefault();};
  const onMove=e=>{if(!dragging)return;valueRef.value=Math.max(minH,Math.min(maxH,startH+(e.clientY-startY)));};
  const onUp=()=>{if(!dragging)return;dragging=false;rsz.classList.remove('drag');document.body.style.userSelect='';};
  rsz.addEventListener('mousedown',onDown);document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  return()=>{rsz.removeEventListener('mousedown',onDown);document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
}
let cleanupFns=[];
onMounted(()=>{
  document.addEventListener('keydown',onKeydown);
  cleanupFns.push(initHResizer());
  cleanupFns.push(initVResizer(vizResizerRef,vizHeight,220,750));
  cleanupFns.push(initVResizer(tableResizerRef,tableHeight,50,200));
});
onBeforeUnmount(()=>{
  document.removeEventListener('keydown',onKeydown);
  clearTimeout(playTimer);
  cleanupFns.forEach(fn=>fn&&fn());
});
</script>

<template>
  <div class="slide-wrapper">
    <div class="slide-body">
      <div class="row-main">
        <div class="ll-root">
          <!-- Toolbar -->
          <div class="ll-toolbar">
            <div class="ll-input-group">
              <label>nums[]:</label>
              <input type="text" v-model="inputNums" class="ll-text-input cd-nums-input" @keyup.enter="applyInput" placeholder="e.g. 1,2,3,1" />
            </div>
            <div class="ll-input-group">
              <label>k:</label>
              <input type="number" min="1" v-model="inputK" class="ll-text-input" style="width:54px" @keyup.enter="applyInput" placeholder="3" />
            </div>
            <button class="ll-viz-btn" @click="applyInput">&#9654; Visualize</button>
            <div class="ll-nav-controls">
              <button class="ll-nav-btn" @click="stepBy(-steps.length)">&#171;</button>
              <button class="ll-nav-btn" @click="stepBy(-1)">&#8249; Prev</button>
              <button class="ll-play-btn" @click="togglePlay">{{ playing ? '\u23F8 Pause' : '\u25B6 Play' }}</button>
              <button class="ll-nav-btn" @click="stepBy(1)">Next &#8250;</button>
              <button class="ll-nav-btn" @click="stepBy(steps.length)">&#187;</button>
            </div>
          </div>

          <div class="ll-main" ref="mainRef">
            <!-- Left col -->
            <div class="ll-left-col" ref="leftColRef" :style="{ width: leftWidth + '%' }">
              <div class="ll-viz-wrap" :style="{ height: vizHeight + 'px' }">
                <div class="ll-perm-area">
                  <!-- Chips -->
                  <div class="ll-ptrs ll-ptrs-compact" @wheel.passive="onChipsWheel">
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">n</span><b class="ll-c-blue">{{ s.n || displayNums.length }}</b></span>
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">k</span><b class="ll-c-orange">{{ displayK }}</b></span>
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">i</span><b class="ll-c-orange">{{ displayI }}</b></span>
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">j</span><b class="ll-c-blue">{{ displayJ }}</b></span>
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">nums[i]</span><b class="ll-c-orange">{{ initState.iReady&&s.nums&&s.i>=0?s.nums[s.i]:'?' }}</b></span>
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">nums[j]</span><b class="ll-c-blue">{{ initState.jReady&&s.nums&&s.j>=0&&s.j<(s.n||0)?s.nums[s.j]:'?' }}</b></span>
                    <span class="ll-ptr-chip-inline"><span class="ll-chip-label">result</span><b :class="s.phase==='done'?(s.foundI!==undefined?'ll-c-found':'ll-c-green'):'ll-c-muted'">{{ s.phase==='done'?(s.foundI!==undefined?'true':'false'):'—' }}</b></span>
                  </div>

                  <!-- BOARD CONTAINER -->
                  <div class="ll-board-container">


                    <!-- Tier 1: Array -->
                    <div class="cd-tier-title">
                      int[] nums
                      <span class="cd-badge">n = {{ s.n || displayNums.length }}</span>
                      <span v-if="initState.iReady&&s.phase!=='input'" class="cd-badge cd-badge-k">k = {{ displayK }}</span>
                    </div>
                    <div class="cd-array-frame">
                      <!-- Window bracket bar -->
                      <div v-if="initState.iReady&&s.phase!=='input'&&s.phase!=='done'" class="cd-window-bracket-row">
                        <div
                          v-for="(val, idx) in displayNums"
                          :key="'wb-'+idx"
                          class="cd-window-bracket-cell"
                          :class="{
                            'cd-wbc-anchor':  idx===s.i,
                            'cd-wbc-window':  windowStart!==null&&idx>=windowStart&&idx<=windowEnd,
                            'cd-wbc-j':       initState.jReady&&idx===s.j&&s.j<(s.n||0)
                          }"
                        ></div>
                      </div>
                      <!-- Pointer labels -->
                      <div class="cd-ptr-row">
                        <div v-for="(val, idx) in displayNums" :key="'ptr-'+idx" class="cd-ptr-cell">
                          <span v-if="initState.iReady&&s.phase!=='input'&&s.phase!=='done'&&idx===s.i" class="cd-ptr-label cd-ptr-i">i</span>
                          <span v-if="initState.jReady&&s.phase!=='input'&&s.phase!=='done'&&idx===s.j&&s.j<(s.n||0)" class="cd-ptr-label cd-ptr-j">j</span>
                        </div>
                      </div>
                      <!-- Number boxes -->
                      <div class="cd-num-row">
                        <div
                          v-for="(val, idx) in displayNums"
                          :key="'n-'+idx"
                          class="cd-num-box"
                          :class="numClass(idx)"
                        >
                          <span class="cd-num-val">{{ val !== '' ? val : '\u00A0' }}</span>
                          <span class="cd-num-idx">[{{ idx }}]</span>
                        </div>
                      </div>
                      <!-- Window info label -->
                      <div v-if="initState.iReady&&s.phase!=='input'&&s.phase!=='done'" class="cd-window-label">
                        Anchor: i={{ s.i }} (nums[i]={{ s.nums&&s.nums[s.i] }})
                        &nbsp;|&nbsp; Window: [{{ s.i+1 }}..{{ Math.min(s.i+s.k,s.n-1) }}]
                        &nbsp;|&nbsp; k={{ displayK }}
                      </div>
                    </div>

                    <!-- Tier 2: Comparison panel (shown during inner loop) -->
                    <div v-if="initState.jReady&&s.phase==='inner'" class="cd-cmp-panel">
                      <div class="cd-cmp-cell cd-cmp-i">
                        <span class="cd-cmp-lbl">nums[i={{ s.i }}]</span>
                        <span class="cd-cmp-val">{{ s.nums&&s.nums[s.i] }}</span>
                      </div>
                      <div class="cd-cmp-op" :class="{'cd-op-eq':s.isEqual,'cd-op-neq':s.isEqual===false}">
                        <span>{{ s.isEqual===true ? '==' : s.isEqual===false ? '!=' : 'vs' }}</span>
                      </div>
                      <div class="cd-cmp-cell cd-cmp-j">
                        <span class="cd-cmp-lbl">nums[j={{ s.j }}]</span>
                        <span class="cd-cmp-val">{{ s.nums&&s.nums[s.j] }}</span>
                      </div>
                      <div class="cd-dist-chip">
                        <span class="cd-dist-lbl">|i-j|</span>
                        <span class="cd-dist-val" :class="{'cd-dist-ok':s.j-s.i<=s.k}">{{ s.j-s.i }}</span>
                        <span class="cd-dist-limit">&le; k={{ s.k }}</span>
                      </div>
                    </div>

                    <!-- Result banner -->
                    <div v-if="s.phase==='done'" class="cd-result-banner" :class="s.foundI!==undefined?'cd-result-true':'cd-result-false'">
                      <span class="cd-result-icon">{{ s.foundI!==undefined ? '&#10003;' : '&#10007;' }}</span>
                      <span v-if="s.foundI!==undefined">
                        nums[{{ s.foundI }}] = nums[{{ s.foundJ }}] = <b>{{ s.foundVal }}</b>
                        &nbsp;|&nbsp; |{{ s.foundI }}-{{ s.foundJ }}| = {{ s.foundJ-s.foundI }} &le; k={{ s.k }}
                        &nbsp;&rarr;&nbsp; <b>return true</b>
                      </span>
                      <span v-else>
                        No duplicate pair found within distance k={{ displayK }} &nbsp;&rarr;&nbsp; <b>return false</b>
                      </span>
                    </div>

                  </div>
                  <!-- END ll-board-container -->
                </div>
              </div>

              <div class="ll-vresizer" ref="vizResizerRef"></div>

              <!-- Legend -->
              <div class="ll-legend">
                <span class="ll-leg"><span class="ll-legdot" style="background:#fff7ed;border:1.5px solid #f97316;"></span>i (anchor)</span>
                <span class="ll-leg"><span class="ll-legdot" style="background:#eff6ff;border:1.5px solid #3b82f6;"></span>j (scan)</span>
                <span class="ll-leg"><span class="ll-legdot cd-legdot-window"></span>window</span>
                <span class="ll-leg"><span class="ll-legdot cd-legdot-found"></span>duplicate found</span>
                <span class="ll-leg"><span class="ll-legdot cd-legdot-past"></span>processed</span>
              </div>

              <!-- Call Stack -->
              <div class="ll-table-area" :style="{ height: tableHeight + 'px' }">
                <div class="ll-table-title">Call Stack &mdash; Current Execution Frame</div>
                <div class="ll-stack-line">
                  <template v-if="s.phase==='input'">
                    <div class="ll-frame ll-frame-cur">main() &nbsp; <span class="ll-fname">n</span>=<span class="ll-c-blue" style="font-weight:700">{{ s.n || displayNums.length }}</span>, <span class="ll-fname">k</span>=<span class="ll-c-orange" style="font-weight:700">{{ displayK }}</span><span class="ll-now"> &#9668; active</span></div>
                  </template>
                  <template v-else>
                    <div class="ll-frame" style="color:var(--text2);">main()</div>
                    <div class="ll-frame ll-frame-cur" style="margin-left:14px">
                      containsNearbyDuplicate(nums, k={{ displayK }}) &nbsp;
                      <span class="ll-fname">i</span>=<span class="ll-c-orange" style="font-weight:700">{{ displayI }}</span>
                      <template v-if="initState.jReady">, <span class="ll-fname">j</span>=<span class="ll-c-blue" style="font-weight:700">{{ displayJ }}</span></template>
                      <span class="ll-now"> &#9668; active</span>
                    </div>
                  </template>
                </div>
              </div>

              <div class="ll-vresizer" ref="tableResizerRef"></div>

              <!-- Badge -->
              <div class="ll-badge-wrap">
                <div class="ll-badge" :class="{'ll-badge-error':s.badge&&(s.badge.includes('FALSE')||s.badge.includes('false')||s.badge.includes('!=')),'ll-badge-success':s.badge&&(s.badge.includes('TRUE')||s.badge.includes('true')||s.badge.includes('MATCH'))}">
                  {{ s.badge || 'Ready to visualize Contains Duplicate II.' }}
                </div>
              </div>
            </div>

            <div class="ll-resizer" ref="hResizerRef"></div>

            <!-- Right col -->
            <div class="ll-right-col">
              <div class="ll-code-panel">
                <div class="ll-code-header">
                  <div class="ll-tabbar">
                    <button class="ll-tab-btn" :class="{active:rightTab==='code'}"       @click="rightTab='code'">Code</button>
                    <button class="ll-tab-btn" :class="{active:rightTab==='pseudo'}"     @click="rightTab='pseudo'">Pseudocode</button>
                    <button class="ll-tab-btn" :class="{active:rightTab==='complexity'}" @click="rightTab='complexity'">Complexity</button>
                  </div>
                  <select v-if="rightTab==='code'" v-model="lang" class="ll-lang-select">
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <div v-if="rightTab==='code'" class="ll-code-scroll" ref="codeScrollRef">
                  <pre class="ll-pre"><span v-for="(line,idx) in codeLines" :key="idx" class="ll-codeline" :class="{'ll-hl':line[0]&&line[0]===s.code}">{{ line[1]===''?' ':line[1] }}</span></pre>
                </div>
                <div v-else-if="rightTab==='pseudo'" class="ll-code-scroll">
                  <pre class="ll-pre"><span v-for="(line,idx) in PSEUDOCODE" :key="idx" class="ll-codeline">{{ line }}</span></pre>
                </div>
                <div v-else class="ll-info-scroll">
                  <h3 class="ll-cx-heading">Contains Duplicate II (LeetCode 219) &mdash; Complexity Analysis</h3>
                  <p class="ll-cx-intro">
                    Given integer array <code>nums</code> and integer <code>k</code>, return <code>true</code> if there
                    exist indices <code>i</code> and <code>j</code> such that <code>nums[i] == nums[j]</code> and
                    <code>|i - j| &le; k</code>. The sliding window approach fixes anchor <code>i</code> and scans
                    the next <code>k</code> positions with pointer <code>j</code>.
                  </p>
                  <h4 class="ll-cx-sub">Step-by-step Breakdown</h4>
                  <table class="ll-complexity-table">
                    <thead><tr><th>Operation</th><th>Time</th><th>Space</th><th>Reason</th></tr></thead>
                    <tbody>
                      <tr><td>Outer loop (i)</td><td class="ll-cx-mid">O(n)</td><td class="ll-cx-good">O(1)</td><td>Iterates over each anchor element</td></tr>
                      <tr><td>Inner loop (j)</td><td class="ll-cx-mid">O(k)</td><td class="ll-cx-good">O(1)</td><td>Scans at most k positions per i</td></tr>
                      <tr><td>Comparison</td><td class="ll-cx-good">O(1)</td><td class="ll-cx-good">O(1)</td><td>Direct array index comparison</td></tr>
                      <tr><td><strong>Total</strong></td><td class="ll-cx-mid"><strong>O(n &times; k)</strong></td><td class="ll-cx-good"><strong>O(1)</strong></td><td>No extra data structures</td></tr>
                    </tbody>
                  </table>
                  <h4 class="ll-cx-sub">Overall Complexity</h4>
                  <div class="ll-cx-summary-grid">
                    <div class="ll-cx-card ll-cx-card-mid"><div class="ll-cx-card-label">Time</div><div class="ll-cx-card-val">O(n&times;k)</div><div class="ll-cx-card-note">Nested loops, k comparisons per anchor</div></div>
                    <div class="ll-cx-card ll-cx-card-good"><div class="ll-cx-card-label">Space</div><div class="ll-cx-card-val">O(1)</div><div class="ll-cx-card-note">Two integer pointers only</div></div>
                    <div class="ll-cx-card ll-cx-card-good"><div class="ll-cx-card-label">Extra DS</div><div class="ll-cx-card-val">None</div><div class="ll-cx-card-note">Pure sliding window, no HashSet</div></div>
                  </div>
                  <div class="ll-note">
                    <strong>Key insight:</strong> For each anchor position <code>i</code>, only indices within
                    <code>[i+1, i+k]</code> can satisfy the constraint <code>|i-j| &le; k</code>. So the inner
                    loop only needs to check at most <code>k</code> neighbours. This is O(1) extra space
                    at the cost of O(n&times;k) time vs the HashSet approach which is O(n) time / O(k) space.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ll-root *{box-sizing:border-box;}
.ll-root *,.ll-root,.row-main{scrollbar-width:none!important;-ms-overflow-style:none!important;}
.ll-root *::-webkit-scrollbar,.ll-root::-webkit-scrollbar,.row-main::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;}
.ll-root{
  --coral:#F04D4D;--coral-dark:#d93e3e;--coral-light:#fff0f0;
  --bg:#f5f6fa;--surface:#ffffff;--surface2:#f1f4f9;
  --border:#e2e8f0;--border2:#cbd5e1;
  --text:#1e293b;--text2:#475569;--muted:#94a3b8;
  --blue:#3b82f6;--blue-light:#eff6ff;
  --green:#22c55e;--green-light:#f0fdf4;
  --orange:#f97316;--orange-light:#fff7ed;
  --purple:#9333ea;--purple-light:#f3e8ff;
  --red:#ef4444;--red-dark:#991b1b;--red-light:#fef2f2;
  --found:#7c3aed;
  --shadow-sm:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --radius:8px;--radius-sm:6px;
  background:var(--bg);color:var(--text);
  font-family:'Segoe UI',system-ui,sans-serif;font-size:12.5px;
  display:flex;flex-direction:column;height:100%;overflow:hidden;width:100%;
}
@keyframes cd-found-flash{0%{background:#ede9fe;transform:scale(1.15);}60%{background:#ddd6fe;}100%{transform:scale(1);}}

.slide-wrapper{width:100%;height:100%;font-size:.8rem;font-weight:400;}
.slide-body{display:flex;flex-direction:column;border-radius:4px;height:100%;}
.row-main{width:100%;height:100%;overflow-x:auto;overflow-y:hidden;}
.ll-toolbar{display:flex;align-items:center;gap:6px;padding:6.5px 12px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap;box-shadow:var(--shadow-sm);}
.ll-input-group{display:flex;align-items:center;gap:4px;}
.ll-input-group label{font-size:11px;color:var(--muted);font-weight:700;}
.ll-text-input{background:var(--surface);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius-sm);padding:3px 6px;font-size:11.5px;font-family:monospace;}
.ll-text-input:focus{outline:none;border-color:var(--coral);box-shadow:0 0 0 3px rgba(240,77,77,.1);}
.cd-nums-input{width:190px;}
.ll-viz-btn{background:var(--coral);color:#fff;border:none;padding:5px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:11.5px;font-weight:600;box-shadow:var(--shadow-sm);transition:filter .15s;}
.ll-viz-btn:hover{filter:brightness(1.08);}
.ll-nav-controls{display:flex;margin-left:auto;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;}
.ll-nav-btn{background:var(--surface2);border:1px solid var(--border2);color:var(--text2);padding:4px 9px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;font-weight:500;transition:all .15s;white-space:nowrap;}
.ll-nav-btn:hover{background:var(--surface);border-color:var(--coral);color:var(--coral);}
.ll-play-btn{background:var(--blue-light);border:1px solid var(--blue);color:var(--blue);min-width:68px;font-weight:600;padding:4px 9px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;transition:all .15s;}
.ll-play-btn:hover{background:var(--blue);color:#fff;}
.ll-main{display:flex;flex:1;overflow:hidden;position:relative;}
.ll-left-col{display:flex;flex-direction:column;overflow:hidden;min-width:220px;max-width:75%;}
.ll-resizer{width:5px;cursor:col-resize;background:var(--border);flex-shrink:0;transition:background .15s;position:relative;z-index:20;}
.ll-resizer:hover,.ll-resizer.drag{background:var(--coral);}
.ll-right-col{display:flex;flex-direction:column;flex:1;overflow:hidden;min-width:0;height:100%;}
.ll-viz-wrap{flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--border);position:relative;overflow-x:auto;overflow-y:auto;}
.ll-perm-area{display:flex;flex-direction:column;align-items:stretch;min-height:100%;width:100%;min-width:0;box-sizing:border-box;}
.ll-ptrs{display:flex;gap:8px;flex-wrap:wrap;padding:4px 14px;min-height:28px;width:100%;box-sizing:border-box;min-width:0;align-items:center;}
.ll-ptrs-compact{flex-wrap:nowrap;gap:6px;padding:3px 14px 5px;min-height:0;overflow-x:auto;overflow-y:hidden;}
.ll-ptr-chip-inline{display:inline-flex;align-items:center;gap:4px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:2px 8px;font-size:11px;font-family:monospace;white-space:nowrap;flex-shrink:0;line-height:1.4;}
.ll-chip-label{color:#8899aa;font-weight:500;margin-right:2px;}
.ll-c-blue{color:var(--blue);}.ll-c-green{color:var(--green);}.ll-c-orange{color:var(--orange);}.ll-c-found{color:var(--found);font-weight:800;}.ll-c-muted{color:var(--muted);}

/* ─── Board Container ─────────────────────────────────────────────────────── */
.ll-board-container{display:flex;flex-direction:column;align-items:flex-start;padding:6px 14px 10px;gap:8px;min-width:0;width:100%;}



/* Tier title */
.cd-tier-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-family:'Consolas',monospace;border-left:3px solid var(--coral);padding-left:6px;display:flex;align-items:center;gap:6px;}
.cd-badge{font-size:9px;color:var(--muted);background:var(--surface2);border:1px solid var(--border);border-radius:3px;padding:0 4px;font-weight:500;}
.cd-badge-k{background:#fff7ed;border-color:#fdba74;color:#c2410c;}

/* Array frame */
.cd-array-frame{background:#f8fafc;border:1px solid var(--border);border-radius:var(--radius);padding:6px 10px 6px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:2px;width:100%;box-sizing:border-box;}
.cd-window-bracket-row{display:flex;gap:4px;height:5px;}
.cd-window-bracket-cell{width:44px;height:5px;border-radius:2px;flex-shrink:0;background:transparent;transition:background .15s;}
.cd-wbc-anchor{background:#fdba74;}
.cd-wbc-window{background:#bfdbfe;}
.cd-wbc-j{background:#fef08a;}
.cd-ptr-row{display:flex;gap:4px;min-height:18px;align-items:flex-end;}
.cd-ptr-cell{width:44px;display:flex;justify-content:center;align-items:flex-end;gap:2px;flex-shrink:0;}
.cd-ptr-label{font-size:8.5px;font-weight:800;font-family:monospace;padding:1px 4px;border-radius:3px;line-height:1.2;white-space:nowrap;}
.cd-ptr-i{background:#fff7ed;color:#c2410c;border:1px solid #fdba74;}
.cd-ptr-j{background:#eff6ff;color:#1d4ed8;border:1px solid #93c5fd;}
.cd-num-row{display:flex;gap:4px;flex-wrap:nowrap;}
.cd-num-box{width:44px;height:50px;border-radius:var(--radius-sm);background:#e2e8f0;border:1.5px solid #94a3b8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex-shrink:0;transition:all .2s ease;}
.cd-num-val{font-family:'Cascadia Code','Fira Code',monospace;font-size:14px;font-weight:900;color:var(--text);line-height:1;}
.cd-num-idx{font-family:monospace;font-size:7.5px;color:var(--muted);font-weight:600;}

/* Cell states */
.cd-num-reading  {background:#fef9c3!important;border:2px solid #eab308!important;}
.cd-num-i        {background:#fff7ed!important;border:2px solid #f97316!important;box-shadow:0 0 8px rgba(249,115,22,.35);transform:scale(1.06);}
.cd-num-j        {background:#eff6ff!important;border:2px solid var(--blue)!important;box-shadow:0 0 8px rgba(59,130,246,.35);transform:scale(1.06);}
.cd-num-in-window{background:#bfdbfe!important;border:1.5px solid var(--blue)!important;}
.cd-num-found    {background:#ede9fe!important;border:2px solid #9333ea!important;box-shadow:0 0 10px rgba(147,51,234,.45);animation:cd-found-flash .4s ease;}
.cd-num-past     {background:#f1f5f9!important;border:1.5px solid #e2e8f0!important;opacity:.45;}
.cd-num-clear    {background:#d1fae5!important;border:1.5px solid #6ee7b7!important;}
.cd-window-label {font-size:9px;color:var(--muted);font-family:monospace;margin-top:2px;}

/* Comparison panel */
.cd-cmp-panel{display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);flex-wrap:wrap;width:100%;box-sizing:border-box;}
.cd-cmp-cell{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 12px;border-radius:var(--radius-sm);min-width:70px;}
.cd-cmp-i  {background:#fff7ed;border:1.5px solid #fdba74;}
.cd-cmp-j  {background:#eff6ff;border:1.5px solid #93c5fd;}
.cd-cmp-lbl{font-size:8.5px;color:var(--muted);font-weight:700;font-family:monospace;}
.cd-cmp-val{font-size:20px;font-weight:900;font-family:monospace;color:var(--text);}
.cd-cmp-op {font-size:18px;font-weight:900;color:var(--muted);min-width:30px;text-align:center;}
.cd-op-eq  {color:#9333ea!important;}
.cd-op-neq {color:#94a3b8!important;}
.cd-dist-chip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 10px;border-radius:var(--radius-sm);background:var(--surface2);border:1.5px solid var(--border);margin-left:auto;}
.cd-dist-lbl{font-size:8px;color:var(--muted);font-family:monospace;font-weight:700;}
.cd-dist-val{font-size:16px;font-weight:900;font-family:monospace;color:var(--text);}
.cd-dist-ok {color:var(--green)!important;}
.cd-dist-limit{font-size:8.5px;color:var(--muted);}

/* Result banner */
.cd-result-banner{display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:var(--radius-sm);border-left:4px solid;font-size:12px;font-weight:700;width:100%;box-sizing:border-box;}
.cd-result-true {background:#ede9fe;border-color:#9333ea;color:#6d28d9;}
.cd-result-false{background:#f0fdf4;border-color:#22c55e;color:#15803d;}
.cd-result-icon {font-size:16px;font-weight:900;flex-shrink:0;}

/* Legend */
.cd-legdot-window{background:#bfdbfe;border:1.5px solid var(--blue);display:inline-block;width:11px;height:11px;border-radius:3px;}
.cd-legdot-found {background:#ede9fe;border:1.5px solid #9333ea;display:inline-block;width:11px;height:11px;border-radius:3px;}
.cd-legdot-past  {background:#f1f5f9;border:1.5px solid #e2e8f0;display:inline-block;width:11px;height:11px;border-radius:3px;opacity:.5;}

/* Shared */
.ll-vresizer{height:5px;cursor:row-resize;background:var(--border);flex-shrink:0;transition:background .15s;position:relative;z-index:20;}
.ll-vresizer:hover,.ll-vresizer.drag{background:var(--coral);}
.ll-legend{display:flex;flex-wrap:wrap;gap:6px 14px;padding:6px 12px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--surface2);}
.ll-leg{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text2);font-weight:500;}
.ll-legdot{width:11px;height:11px;border-radius:3px;flex-shrink:0;display:inline-block;}
.ll-table-area{flex-shrink:0;padding:8px 14px;border-bottom:1px solid var(--border);overflow-x:hidden;overflow-y:auto;background:var(--surface);min-width:0;box-sizing:border-box;text-align: left;}
.ll-table-title{font-size:10px;color:var(--muted);margin-bottom:4px;font-style:italic;}
.ll-stack-line{font-family:'Consolas',monospace;font-size:12px;line-height:1.8;}
.ll-frame{font-family:'Consolas',monospace;font-size:11.5px;color:var(--text2);padding:1px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ll-frame-cur{color:var(--orange);background:var(--orange-light);border-radius:4px;padding:1px 5px;}
.ll-fname{color:var(--text2);}.ll-now{color:var(--orange);font-size:10px;margin-left:6px;}
.ll-badge-wrap{padding:6px 10px;border-bottom:1px solid var(--border);flex-shrink:0;min-height:36px;display:flex;align-items:center;background:var(--surface);}
.ll-badge{display:inline-block;padding:4px 12px;border-radius:var(--radius-sm);border-left:3px solid var(--coral);background:var(--coral-light);font-size:11px;color:var(--coral-dark);line-height:1.4;word-break:break-word;font-weight:500;}
.ll-badge-error{border-left-color:var(--red)!important;background:var(--red-light)!important;color:var(--red-dark)!important;}
.ll-badge-success{border-left-color:#9333ea!important;background:#ede9fe!important;color:#6d28d9!important;}
.ll-code-panel{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.ll-code-header{display:flex;align-items:center;gap:6px;padding:5px 12px;background:var(--surface);border-bottom:1px solid var(--border);box-shadow:var(--shadow-sm);flex-shrink:0;flex-wrap:wrap;}
.ll-tabbar{display:flex;gap:3px;flex-wrap:wrap;}
.ll-tab-btn{padding:4px 9px;font-size:10.5px;font-weight:600;border:1px solid var(--border2);background:var(--surface2);color:var(--text2);border-radius:var(--radius-sm);cursor:pointer;transition:all .15s ease;white-space:nowrap;}
.ll-tab-btn:hover{border-color:var(--coral);color:var(--coral);}
.ll-tab-btn.active{background:var(--coral);border-color:var(--coral);color:#fff;}
.ll-lang-select{margin-left:auto;padding:4px 24px 4px 8px;font-size:11px;font-weight:500;border:1px solid var(--border2);border-radius:var(--radius-sm);background:var(--surface2);color:var(--text);cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;min-width:95px;transition:border-color .15s;}
.ll-lang-select:focus{outline:none;border-color:var(--coral);box-shadow:0 0 0 3px rgba(240,77,77,.1);}
.ll-code-scroll{flex:1;overflow:auto;background:#f8fafc;padding:10px 14px;min-width:0;}
.ll-pre{margin:0;font-family:'Cascadia Code','Fira Code','Consolas',monospace;font-size:11px;line-height:1.5;color:var(--text);white-space:pre;padding-bottom:150px;text-align: start;}
.ll-codeline{display:block;padding:0 14px;margin:0 -14px;}
.ll-hl{background:#dcfce7;color:#15803d;font-weight:600;border-left:3px solid var(--green);border-radius:3px;}
.ll-info-scroll{flex:1;overflow:auto;padding:12px 16px;background:var(--surface);color:var(--text2);font-size:12px;line-height:1.55;}
.ll-info-scroll h3,.ll-info-scroll h4{color:var(--text);margin:0 0 6px;}
.ll-info-scroll p{margin:0 0 6px;}
.ll-info-scroll code{background:var(--surface2);padding:1px 4px;border-radius:3px;font-family:'Cascadia Code',monospace;font-size:11px;color:var(--coral-dark);}
.ll-cx-heading{font-size:13px;font-weight:700;}
.ll-cx-intro{font-size:10.5px;margin:0 0 10px;line-height:1.55;}
.ll-cx-sub{font-size:11px;font-weight:700;color:var(--text2);margin:10px 0 4px;border-bottom:1px solid var(--border);padding-bottom:3px;}
.ll-complexity-table{width:100%;border-collapse:collapse;font-size:10.5px;margin:8px 0;}
.ll-complexity-table th,.ll-complexity-table td{border:1px solid var(--border);padding:4px 8px;text-align:left;}
.ll-complexity-table th{background:var(--surface2);font-weight:700;color:var(--text2);}
.ll-cx-good{color:#15803d;font-weight:700;}.ll-cx-mid{color:#b45309;font-weight:700;}
.ll-cx-summary-grid{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px;}
.ll-cx-card{flex:1;min-width:90px;border-radius:var(--radius-sm);padding:8px 10px;text-align:center;border:1.5px solid var(--border);}
.ll-cx-card-good{background:#f0fdf4;border-color:#86efac;color:#15803d;}
.ll-cx-card-mid{background:#fff7ed;border-color:#fed7aa;color:#c2410c;}
.ll-cx-card-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;opacity:.7;margin-bottom:4px;}
.ll-cx-card-val{font-size:13px;font-weight:800;font-family:monospace;margin-bottom:3px;}
.ll-cx-card-note{font-size:8.5px;opacity:.75;line-height:1.3;}
.ll-note{background:#fefce8;border:1px solid #fef08a;border-left:3px solid #eab308;padding:6px 10px;font-size:10.5px;color:#854d0e;border-radius:0 4px 4px 0;margin-top:10px;margin-bottom:120px;}
.ll-speed-wrap{display:flex;align-items:center;gap:6px;}
.ll-speed-wrap input[type="range"]{width:80px;accent-color:var(--coral);}
</style>
