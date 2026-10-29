<script setup lang="ts">
import ConsoleScreen from './ConsoleScreen.vue'
import ConsoleDPad from './ConsoleDPad.vue'
import ConsoleActionButtons from './ConsoleActionButtons.vue'

const emit = defineEmits<{
  openMenu: []
}>()
</script>

<template>
  <div class="console-shell">
    <svg class="console-shape-definitions" aria-hidden="true">
      <defs>
        <clipPath id="console-body-shape" clipPathUnits="objectBoundingBox">
          <path d="M .185 0 H .815 Q .828 0 .836 .014 L .852 .041 Q .86 .055 .878 .055 H .94 C .98 .055 1 .18 1 .28 V .72 C 1 .82 .98 .945 .94 .945 H .878 Q .86 .945 .852 .959 L .836 .986 Q .828 1 .815 1 H .185 Q .172 1 .164 .986 L .148 .959 Q .14 .945 .122 .945 H .06 C .02 .945 0 .82 0 .72 V .28 C 0 .18 .02 .055 .06 .055 H .122 Q .14 .055 .148 .041 L .164 .014 Q .172 0 .185 0 Z" />
        </clipPath>
      </defs>
    </svg>

    <span class="shoulder-button shoulder-left" aria-hidden="true" />
    <span class="shoulder-button shoulder-right" aria-hidden="true" />
    <span class="strap-loop" aria-hidden="true" />

    <div class="console-body">
      <div class="left-controls" aria-hidden="true">
        <ConsoleDPad />
      </div>

      <ConsoleScreen @open-menu="emit('openMenu')"><slot /></ConsoleScreen>

      <div class="right-controls" aria-hidden="true">
        <ConsoleActionButtons />
      </div>
      <div class="power-light" aria-hidden="true"><span /> POWER</div>
      <div class="speaker" aria-hidden="true"><span v-for="line in 6" :key="line" /></div>
    </div>
  </div>
</template>

<style scoped>
/* The full console always exists; App.vue fits the bezel and lets the body overflow on small screens. */
.console-shell {
    position: relative;
    width: max-content;
    isolation: isolate;
    -webkit-user-select: none;
    user-select: none;
}

.console-shape-definitions {
    position: absolute;
    width: 0;
    height: 0;
}

.console-body {
    --body-light: #62666b;
    --body: #41454a;
    --body-dark: #292c30;
    position: relative;
    display: grid;
    grid-template-columns: 10rem max-content 10rem;
    align-items: center;
    gap: 1.25rem;
    box-sizing: border-box;
    padding: 1rem 2rem 0.85rem;
    border: none;
    clip-path: url('#console-body-shape');
    background: #17191c;
    /* Non-inset shadows go through drop-shadow, not box-shadow: Firefox miscomputes the
       objectBoundingBox clip-path's coordinate space when an outer box-shadow is present
       on the same element, rendering the curves much thicker than in Chrome (bug 1684757). */
    box-shadow: inset 0 4px 3px rgba(255, 255, 255, 0.2), inset 0 -8px 8px rgba(0, 0, 0, 0.28);
    filter: drop-shadow(0 8px 0 #17191c) drop-shadow(0 18px 26px rgba(0, 0, 0, 0.38));
}

.console-body::before {
    content: '';
    position: absolute;
    inset: 4px;
    clip-path: url('#console-body-shape');
    background:
      radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.045) 0 0.4px, rgba(0, 0, 0, 0.025) 0.6px, transparent 0.9px) 0 0 / 3px 3px,
      linear-gradient(165deg, rgba(255, 255, 255, 0.2), transparent 20%),
      linear-gradient(180deg, var(--body-light), var(--body) 55%, var(--body-dark));
}

  .shoulder-button {
    position: absolute;
    top: 0.45rem;
    z-index: -1;
    width: 10.25rem;
    height: 3.25rem;
    border: 3px solid #555a60;
    background: linear-gradient(#f0f1f2, #9ca1a6 60%, #656a70);
    box-shadow: inset 0 2px rgba(255, 255, 255, 0.8), 0 3px 3px rgba(0, 0, 0, 0.55);
  }

  .shoulder-left {
    left: 3.8rem;
    border-radius: 4.25rem 0.65rem 0.8rem 1.7rem / 1.85rem 0.55rem 0.7rem 1.3rem;
    transform: rotate(-3deg);
  }

  .shoulder-right {
    right: 3.8rem;
    border-radius: 0.65rem 4.25rem 1.7rem 0.8rem / 0.55rem 1.85rem 1.3rem 0.7rem;
    transform: rotate(3deg);
  }

  .strap-loop {
    position: absolute;
    bottom: 0.2rem;
    left: 3.2rem;
    width: 12rem;
    height: 6rem;
    box-sizing: border-box;
    padding: 0.5rem;
    outline: 3px solid #17191c;
    border-radius: 0 0 0 5rem;
  }

  .strap-loop::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 0.5rem;
    border-radius: inherit;
    background:
      linear-gradient(165deg,
        #686d72 0%,
        #c9cdd0 18%,
        #f1f2f2 31%,
        #969ba0 48%,
        #d8dbdd 68%,
        #666b70 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }

  .strap-loop::after {
    content: '';
    position: absolute;
    inset: 0.5rem;
    border: 3px solid #17191c;
    border-radius: 0 0 0 4.5rem;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.28);
  }

  .left-controls, .right-controls {
    position: relative;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .power-light {
    position: absolute;
    bottom: 7rem;
    left: 2.5rem;
    color: #b6bbc0;
    font: 700 0.52rem/1 Arial, sans-serif;
    letter-spacing: 0.08em;
  }

  .power-light span {
    display: inline-block;
    width: 0.55rem;
    height: 0.55rem;
    margin-right: 0.25rem;
    border-radius: 50%;
    background: #80de6a;
    box-shadow: 0 0 0.5rem #a9ff91;
    vertical-align: -0.05rem;
  }

  .speaker {
    position: absolute;
    bottom: 5rem;
    right: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    transform: rotate(-9deg);
  }

  .speaker span {
    display: block;
    width: 4.5rem;
    height: 0.25rem;
    border-radius: 999px;
    background: #17191c;
    box-shadow: 0 1px rgba(255, 255, 255, 0.12);
  }
</style>
