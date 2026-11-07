<script setup lang="ts">
import './console-control-well.css'
</script>

<template>
  <div class="action-buttons">
    <span class="console-control-well" />
    <div class="action-button action-button-up">△</div>
    <div class="action-button action-button-right">○</div>
    <div class="action-button action-button-down">x</div>
    <div class="action-button action-button-left">□</div>
  </div>
</template>

<style scoped>
.action-buttons {
  --console-control-well-inset: 0.55rem;
  position: relative;
  width: 9.6rem;
  height: 9.6rem;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.55));
}

.action-button {
  position: absolute;
  z-index: 1;
  display: flex;
  width: 2.8rem;
  height: 2.8rem;
  align-items: center;
  justify-content: center;
  border: 2px solid #111316;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #666b70, #303338 58%, #15171a);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, 0.18), 0 4px 3px rgba(0, 0, 0, 0.65);
  color: #aeb3b8;
  font: 700 1.15rem/1 "Segoe UI Symbol", sans-serif;
  text-shadow: 0 1px #0b0c0d;
}

.action-button-up { top: -0.3rem; left: 3.4rem; }
.action-button-right { top: 3.4rem; right: -0.3rem; }
.action-button-down { bottom: -0.3rem; left: 3.4rem; font: 400 1.35rem/1 Arial, sans-serif; }
.action-button-left { top: 3.4rem; left: -0.3rem; }
</style>
