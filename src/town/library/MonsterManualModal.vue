<script setup lang="ts">
import { computed, ref } from 'vue'
import BookModal, { type BookTab } from '@/ui/BookModal.vue'
import { areaById, areas, AreaId, stagesOf } from '@/monsters/areas'

const emit = defineEmits<{ close: [] }>()

const areaTabs: BookTab[] = areas.map(area => ({ id: area.id, label: area.name }))

const selectedAreaId = ref<string>()
const selectedStage = ref<string>()

const stageTabs = computed<BookTab[]>(() => {
  const id = selectedAreaId.value
  if (!id || !Object.values(AreaId).includes(id as AreaId)) return []
  return stagesOf(areaById(id as AreaId)).map(stage => ({ id: String(stage), label: String(stage) }))
})
</script>

<template>
  <BookModal
    v-model:top="selectedAreaId"
    v-model:left="selectedStage"
    title="Monster Manual"
    :top-tabs="areaTabs"
    :left-tabs="stageTabs"
    @close="emit('close')"
  />
</template>
