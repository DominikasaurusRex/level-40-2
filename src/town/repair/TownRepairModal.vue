<script setup lang="ts">
import { ref } from 'vue'
import BookModal, { type BookTab } from '@/ui/BookModal.vue'
import { PlaceId, placeById } from '@/town/town'

const emit = defineEmits<{ close: [] }>()

const MONUMENT_TAB_ID = 'monument'

function placeTab(id: PlaceId): BookTab {
  return { id, label: placeById(id).name }
}

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
