<script setup lang="ts">
</script>

<template>
  <section class="town-screen" aria-labelledby="town-title">
    <h1 id="town-title" class="town-title">Town</h1>
  </section>
</template>

<style scoped>
.town-screen {
  position: absolute;
  inset: 0;
  display: grid;
  box-sizing: border-box;
  place-items: center;
  overflow: hidden;
  border-radius: 0.45rem;
  background: #061d2c;
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.town-title {
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 0 3px 0 var(--ui-ink);
}
</style>
