<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { playSound } from '@/audio/sounds'
import ModalCloseButton from '@/ui/ModalCloseButton.vue'

/** One bookmark on the book's top or left edge. */
export interface BookTab {
  id: string
  label: string
}

/**
 * The shared paper-book look of the Town modals (see `.documentation/book-modal.md`). A modal
 * wraps this and fills the default slot with its own content. Both bookmark sets are optional:
 * without `topTabs` or `leftTabs` that edge stays empty.
 */
const props = withDefaults(defineProps<{
  /** Accessible name of the dialog, for example the place name. */
  title: string
  topTabs?: BookTab[]
  leftTabs?: BookTab[]
}>(), {
  topTabs: () => [],
  leftTabs: () => [],
})

const emit = defineEmits<{ close: [] }>()

/** Id of the selected top bookmark. */
const top = defineModel<string>('top')
/** Id of the selected left bookmark. */
const left = defineModel<string>('left')

const closeButton = ref<InstanceType<typeof ModalCloseButton>>()

onMounted(() => closeButton.value?.focus())

function selectTop(tab: BookTab) {
  if (top.value === tab.id) return
  playSound('normal-click')
  top.value = tab.id
}

function selectLeft(tab: BookTab) {
  if (left.value === tab.id) return
  playSound('normal-click')
  left.value = tab.id
}
</script>

<template>
  <div class="book-overlay" @click.self="emit('close')" @keydown.esc="emit('close')">
    <div class="book" role="dialog" aria-modal="true" :aria-label="props.title">
      <div v-if="topTabs.length" class="book-tabs book-tabs-top" role="tablist" aria-orientation="horizontal">
        <button
          v-for="tab in topTabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="book-tab"
          :class="{ 'book-tab-selected': top === tab.id }"
          :aria-selected="top === tab.id"
          @click="selectTop(tab)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="leftTabs.length" class="book-tabs book-tabs-left" role="tablist" aria-orientation="vertical">
        <button
          v-for="tab in leftTabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="book-tab"
          :class="{ 'book-tab-selected': left === tab.id }"
          :aria-selected="left === tab.id"
          @click="selectLeft(tab)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="book-cover">
        <div class="book-page">
          <slot />
        </div>
      </div>

      <ModalCloseButton ref="closeButton" :label="`Close ${props.title}`" @click="emit('close')" />
    </div>
  </div>
</template>

<style scoped>
.book-overlay {
  --book-leather: #5a3520;
  --book-leather-dark: #3a2114;
  --book-paper: #f1e2bf;
  --book-paper-edge: #d9c193;
  --book-ink: #3b2a1a;
  --book-tab: #c9a86b;
  --book-tab-selected: #f1e2bf;

  position: absolute;
  inset: 0;
  z-index: 300;
  box-sizing: border-box;
  /* Room above and left of the book for the bookmarks that stick out. */
  padding: 3.2rem 2.5rem 1.4rem 6rem;
  background: rgba(12, 8, 5, 0.66);
  backdrop-filter: blur(3px);
}

.book {
  position: relative;
  width: 100%;
  height: 100%;
}

.book-cover {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0.55rem;
  border: 2px solid var(--book-leather-dark);
  border-radius: 0.45rem;
  background: linear-gradient(145deg, var(--book-leather), var(--book-leather-dark));
  box-shadow: 0 0.8rem 1.8rem rgba(0, 0, 0, 0.75);
}

.book-page {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  border-radius: 0.2rem;
  background:
    radial-gradient(ellipse at center, transparent 60%, rgba(120, 85, 40, 0.18)),
    var(--book-paper);
  box-shadow: inset 0 0 0 1px var(--book-paper-edge), inset 0 0 1.2rem rgba(120, 85, 40, 0.25);
  color: var(--book-ink);
  font-family: Georgia, 'Times New Roman', serif;
}

/* Bookmarks sit behind the cover's edge and stick out of it. */
.book-tabs {
  position: absolute;
  z-index: -1;
  display: flex;
  gap: 0.3rem;
}

.book-tabs-top {
  bottom: calc(100% - 0.3rem);
  left: 1.5rem;
  right: 2.5rem;
  align-items: flex-end;
}

.book-tabs-left {
  top: 1.25rem;
  right: calc(100% - 0.3rem);
  bottom: 1.25rem;
  flex-direction: column;
  align-items: flex-end;
}

.book-tab {
  padding: 0.35rem 0.75rem;
  border: 2px solid var(--book-leather-dark);
  background: var(--book-tab);
  color: var(--book-ink);
  font: bold 0.75rem Georgia, 'Times New Roman', serif;
  cursor: pointer;
  white-space: nowrap;
}

.book-tabs-top .book-tab {
  height: 2rem;
  border-bottom: 0;
  border-radius: 0.35rem 0.35rem 0 0;
}

.book-tabs-left .book-tab {
  max-width: 5.2rem;
  overflow: hidden;
  border-right: 0;
  border-radius: 0.35rem 0 0 0.35rem;
  text-overflow: ellipsis;
}

.book-tab:hover,
.book-tab:focus-visible {
  filter: brightness(1.1);
  outline: none;
}

.book-tab-selected {
  background: var(--book-tab-selected);
}

/* The selected bookmark sticks out further. */
.book-tabs-top .book-tab-selected { height: 2.4rem; }
.book-tabs-left .book-tab-selected { padding-left: 1.15rem; }
</style>
