<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
}>()

const parts = computed(() => props.text.split(/(Power)/g).filter(Boolean))
</script>

<template>
  <span><template v-for="(part, index) in parts" :key="index"><strong v-if="part === 'Power'" class="skill-description-power">{{ part }}</strong><template v-else>{{ part }}</template></template></span>
</template>

<style scoped>
.skill-description-power {
  color: var(--ui-enemy-hp, #d95b63);
  font-weight: bold;
}
</style>
