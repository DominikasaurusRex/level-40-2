<template>
  <div class="battle-player-panel" aria-label="Player">
    <div class="decoration left" aria-hidden="true" />
    <div class="player-content">
      <div class="hp-strip" />
      <div class="slot-row">
        <div v-for="slot in 3" :key="`weapon-${slot}`" class="slot" />
      </div>
      <div class="slot-row">
        <div v-for="slot in 3" :key="`skill-${slot}`" class="slot" />
      </div>
    </div>
    <div class="decoration right" aria-hidden="true" />
  </div>
</template>

<style scoped>
/*
 * The player's HP, weapons, and skills (see mockup-battle.png), flanked by decorative image areas.
 * The content has an HP strip on top, the three weapons below it, the three skills at the bottom.
 * Only the shape for now.
 */
.battle-player-panel {
  display: grid;
  grid-template-columns: 9rem 1fr 9rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-top: 3px solid var(--ui-border);
  background: var(--ui-panel-strong);
}

/* Room for the style images left and right of the content. */
.decoration {
  background: var(--ui-ink);
}

.decoration.left {
  border-right: 2px solid var(--ui-border-soft);
}

.decoration.right {
  border-left: 2px solid var(--ui-border-soft);
}

.player-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
  padding: 0.4rem 0.5rem 0.5rem;
}

.hp-strip {
  flex: 0 0 1.8rem;
  border: 2px solid var(--ui-border-soft);
  border-radius: 0.25rem;
  background: var(--ui-track);
}

.slot-row {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.slot {
  border: 2px solid var(--ui-border-soft);
  border-radius: 0.25rem;
  background: var(--ui-ink);
}
</style>
