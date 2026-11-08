<script setup lang="ts">
import { computed } from 'vue'
import type { MonsterDefinition } from '@/monsters/monster-definition'

const props = defineProps<{ monster: MonsterDefinition }>()

/** Sprite height at scale 1. */
const BASE_HEIGHT_REM = 18

const spriteStyle = computed(() => ({
  height: `${BASE_HEIGHT_REM * (props.monster.sprite.scale ?? 1)}rem`,
  marginBottom: `${props.monster.sprite.groundOffset ?? 0}px`,
}))
</script>

<template>
  <div class="battle-monster">
    <img
      class="sprite"
      :src="monster.sprite.image"
      :alt="monster.name"
      :style="spriteStyle"
      draggable="false"
    />
  </div>
</template>

<style scoped>
.battle-monster {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.sprite {
  display: block;
  max-width: 100%;
  object-fit: contain;
  user-select: none;
  filter: drop-shadow(0 6px 0 rgba(0, 0, 0, 0.35));
}
</style>
