<template>
  <section class="battle-screen" aria-label="Battle">
    <p class="placeholder">battle-screen works</p>
  </section>
</template>

<style scoped>
.battle-screen {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 0.45rem;
  background: #061d2c;
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.placeholder {
  margin: 0;
  font-size: 1.6rem;
  text-shadow: 0 2px 0 var(--ui-ink);
}
</style>
