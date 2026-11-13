<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <main class="page">
    <section class="card">
      <h1 class="title">Counter</h1>
      <p class="value" aria-live="polite">{{ count }}</p>

      <div class="actions">
        <button class="btn btn-primary" @click="count++">Count +1</button>
        <button class="btn btn-secondary" :disabled="count === 0" @click="count = 0">
          Reset
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: inherit;
}

.card {
  width: 100%;
  max-width: 360px;
  padding: 32px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.value {
  margin: 20px 0 28px;
  font-size: 72px;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 11px 16px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}
</style>
