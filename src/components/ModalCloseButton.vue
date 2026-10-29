<script setup lang="ts">
import { ref } from 'vue'
import { playSound } from '@/audio/sounds'

defineProps<{ label: string }>()
const emit = defineEmits<{ click: [] }>()
const button = ref<HTMLButtonElement>()

defineExpose({ focus: () => button.value?.focus() })

function close() {
  playSound('close')
  emit('click')
}
</script>

<template>
  <button ref="button" type="button" class="modal-close-button" :aria-label="label" @click="close" />
</template>

<style scoped>
.modal-close-button {
  position: absolute;
  top: -1.05rem;
  right: -1.75rem;
  width: 1.65rem;
  height: 1.65rem;
  box-sizing: border-box;
  padding: 0;
  border: 0;
  border-radius: 50%;
  appearance: none;
  background-color: #fff;
  background-image: url('/icons/system/x.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: calc(100% - 0.12rem) calc(100% - 0.12rem);
  cursor: pointer;
  box-shadow: 0 0.2rem 0.45rem rgba(0, 7, 18, 0.55);
}

.modal-close-button:hover,
.modal-close-button:focus-visible {
  box-shadow: 0 0.2rem 0.55rem rgba(49, 226, 212, 0.75);
  outline: 2px solid var(--ui-cyan);
  outline-offset: 1px;
}
</style>
