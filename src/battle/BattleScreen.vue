<script setup lang="ts">
import { stageMonsters } from '@/monsters/stages'
import BattleMonster from '@/battle/BattleMonster.vue'
import BattlePlayerPanel from '@/battle/BattlePlayerPanel.vue'

// TODO: comes from the run once runs exist; stage 1 for now.
const monster = stageMonsters[0]!
</script>

<template>
  <section class="battle-screen" aria-label="Battle">
    <div class="monster-area">
      <BattleMonster :monster="monster" />
    </div>
    <div class="player-area">
      <BattlePlayerPanel />
    </div>
  </section>
</template>

<style scoped>
.battle-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.45rem;
  background: #061d2c;
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

/* Full width; between the log and the player panel as in mockup-battle.png. */
.monster-area {
  flex: 1;
  min-height: 0;
  margin-top: 3.5rem;
}

/* Bottom strip: player HP, weapons, and skills. */
.player-area {
  flex: 0 0 10.5rem;
}
</style>
