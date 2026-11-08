<script setup lang="ts">
import { ref } from 'vue'
import BookModal, { type BookTab } from '@/ui/BookModal.vue'
import { PlaceId, placeById } from '@/town/town'

/** The Inn's Town repair modal (see `.documentation/town-repair-modal.md`). */
const emit = defineEmits<{ close: [] }>()

/** Not a Town place, only an upgrade entry in this modal. */
const MONUMENT_TAB_ID = 'monument'

function placeTab(id: PlaceId): BookTab {
  return { id, label: placeById(id).name }
}

/**
 * The top bookmarks, left to right. Reorder the lines to change the order. Only places that can
 * be repaired or upgraded belong here, so the Inn is left out.
 */
const tabs: BookTab[] = [
  placeTab(PlaceId.Barracks),
  placeTab(PlaceId.Smithy),
  placeTab(PlaceId.Library),
  placeTab(PlaceId.QuestBoard),
  placeTab(PlaceId.Bar),
  placeTab(PlaceId.Gate),
  { id: MONUMENT_TAB_ID, label: 'Monument' },
]

const selectedTabId = ref<string>()
</script>

<template>
  <BookModal
    v-model:top="selectedTabId"
    title="Rebuild"
    :top-tabs="tabs"
    @close="emit('close')"
  />
</template>
