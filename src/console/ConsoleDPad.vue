<script setup lang="ts">
import './console-control-well.css'
</script>

<template>
  <div class="d-pad">
    <span class="console-control-well" />
    <span class="d-pad-key d-pad-up"><span>△</span></span>
    <span class="d-pad-key d-pad-right"><span>▷</span></span>
    <span class="d-pad-key d-pad-down"><span>▽</span></span>
    <span class="d-pad-key d-pad-left"><span>◁</span></span>
  </div>
</template>

<style scoped>
.d-pad {
  position: relative;
  width: 9.6rem;
  height: 9.6rem;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.55));
}

.d-pad-key {
  position: absolute;
  display: flex;
  width: 3.55rem;
  height: 4.1rem;
  align-items: center;
  justify-content: center;
  border: none;
  clip-path: polygon(20% 0, 80% 0, 94% 8%, 100% 22%, 100% 60%, 58% 100%, 42% 100%, 0 60%, 0 22%, 6% 8%);
  clip-path: polygon(round 0.52rem, 20% 0, 80% 0, 94% 8%, 100% 22%, 100% 60%, 58% 100%, 42% 100%, 0 60%, 0 22%, 6% 8%);
  background: #111316;
  box-shadow: 0 3px 2px rgba(0, 0, 0, 0.7);
  color: #858a90;
  font: 700 1.05rem/1 "Segoe UI Symbol", sans-serif;
}

.d-pad-key::before {
  content: '';
  position: absolute;
  inset: 2px;
  clip-path: inherit;
  background: linear-gradient(145deg, #50545a, #1b1d20);
  box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.18), inset -1px -1px 1px rgba(0, 0, 0, 0.62);
}

.d-pad-key > span {
  position: relative;
  z-index: 1;
  display: grid;
  width: 1.2rem;
  height: 1.2rem;
  place-items: center;
  margin-bottom: 0.9rem;
}

.d-pad-up > span,
.d-pad-down > span { font-size: 1.08em; }

.d-pad-up { top: 0; left: 3.025rem; }
.d-pad-right { top: 2.75rem; right: 0.25rem; transform: rotate(90deg); }
.d-pad-down { bottom: 0; left: 3.025rem; transform: rotate(180deg); }
.d-pad-left { top: 2.75rem; left: 0.25rem; transform: rotate(-90deg); }

.d-pad-right > span { transform: rotate(-90deg); }
.d-pad-down > span { transform: rotate(-180deg); }
.d-pad-left > span { transform: rotate(90deg); }
</style>
