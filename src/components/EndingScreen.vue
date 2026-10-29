<script setup lang="ts">
import MenuButton from './MenuButton.vue'

defineProps<{ continueReady: boolean }>()
const emit = defineEmits<{ continue: [] }>()
</script>

<template>
  <section class="ending-screen" aria-label="The end">
    <div class="ending-shade" aria-hidden="true" />
    <img class="fin-art" src="/cutscene/fin.webp" alt="Fin" />
    <Transition name="continue-appear">
      <MenuButton
        v-if="continueReady"
        class="ending-continue"
        highlighted
        @click="emit('continue')"
      >Continue</MenuButton>
    </Transition>
  </section>
</template>

<style scoped>
.ending-screen {
  position: absolute;
  inset: 0;
  z-index: 350;
  overflow: hidden;
  background: #061d2c url('/areas/field_bg.webp') center / cover no-repeat;
}

.ending-shade {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, rgba(98, 238, 239, 0.035) 0 1px, transparent 1px 4px),
    radial-gradient(circle at 50% 34%, rgba(49, 226, 212, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(0, 24, 43, 0.16), rgba(1, 41, 60, 0.5) 54%, rgba(0, 14, 28, 0.84)),
    linear-gradient(90deg, rgba(0, 20, 38, 0.5), transparent 24% 76%, rgba(0, 20, 38, 0.5));
}

.fin-art {
  position: absolute;
  top: 44%;
  left: 50%;
  width: 24rem;
  max-width: 75%;
  height: auto;
  transform: translate(-50%, -50%);
  filter:
    drop-shadow(0.1rem 0 0 #000)
    drop-shadow(-0.1rem 0 0 #000)
    drop-shadow(0 0.1rem 0 #000)
    drop-shadow(0 -0.1rem 0 #000)
    drop-shadow(0 0.16rem 0.22rem rgba(0, 0, 0, 0.9));
}

.ending-continue {
  position: absolute;
  bottom: 2rem;
  right: 0;
  left: 0;
  width: 17rem;
  margin-inline: auto;
}

.ending-continue :deep(.menu-button) {
  width: 100%;
}

.continue-appear-enter-active {
  transition: opacity 450ms ease-out, translate 450ms ease-out;
}

.continue-appear-enter-from {
  opacity: 0;
  translate: 0 0.7rem;
}

@media (prefers-reduced-motion: reduce) {
  .continue-appear-enter-active { transition: none; }
}
</style>
