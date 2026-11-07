<script setup lang="ts">
defineProps<{
  name: string
  description: string
  icon?: string
  cooldownPercent?: number
  focusPercent?: number
  pulseUsed?: boolean
}>()
</script>

<template>
  <div class="skill-row">
    <div class="skill-icon" :style="{ backgroundImage: icon ? `url(${icon})` : undefined }" />
    <div class="skill-name">{{ name }}</div>
    <div class="skill-description">{{ description }}</div>
    <div
      v-if="cooldownPercent !== undefined"
      class="skill-cooldown"
      :class="{ 'pulse-used': pulseUsed }"
    >
      <div class="skill-cooldown-progress" :style="{ width: `${cooldownPercent}%` }" />
    </div>
    <div v-if="focusPercent !== undefined" class="skill-focus" aria-hidden="true">
      <div class="skill-focus-progress" :style="{ width: `${focusPercent}%` }" />
    </div>
  </div>
</template>

<style scoped>
.skill-row {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 2rem minmax(0, 1fr);
  grid-template-rows: 2rem auto;
  column-gap: 0.55rem;
  row-gap: 0.35rem;
  align-items: center;
}

.skill-icon {
  grid-column: 1;
  grid-row: 1;
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  background: var(--ui-track);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.skill-name {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  font-weight: bold;
  font-size: 0.9rem;
}

.skill-description {
  grid-column: 1 / -1;
  grid-row: 2;
  font-size: 0.7rem;
  line-height: 1.3;
  color: var(--ui-muted);
  text-shadow: 0 1px 1px rgba(0, 18, 31, 0.75);
}

.skill-cooldown {
  position: absolute;
  bottom: 0.2rem;
  left: 0;
  right: 0;
  height: 0.4rem;
  background: var(--ui-track);
}

.skill-cooldown-progress {
  height: 100%;
  background: var(--ui-active);
  transition: width 120ms ease-out;
}

.skill-cooldown.pulse-used {
  animation: cooldown-pulse-spend 460ms cubic-bezier(0.2, 0.8, 0.25, 1);
}

@keyframes cooldown-pulse-spend {
  0% {
    transform: translateX(0);
    background: var(--ui-track);
    box-shadow: none;
  }

  32% {
    transform: translateX(-0.55rem);
    background: #7ae6d8;
    box-shadow: 0 0 0.35rem rgba(50, 214, 194, 0.9);
  }

  70% {
    transform: translateX(0.28rem);
    background: #a4eee4;
    box-shadow: 0 0 0.2rem rgba(50, 214, 194, 0.55);
  }

  100% {
    transform: translateX(0);
    background: var(--ui-track);
    box-shadow: none;
  }
}

.skill-focus {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 0.2rem;
  background: rgba(1, 25, 43, 0.86);
}

.skill-focus-progress {
  height: 100%;
  margin-left: auto;
  background: var(--ui-cyan);
  box-shadow: 0 0 0.35rem rgba(50, 214, 194, 0.9);
  transition: width 100ms linear;
}

@media (prefers-reduced-motion: reduce) {
  .skill-cooldown.pulse-used {
    animation: none;
  }
}
</style>
