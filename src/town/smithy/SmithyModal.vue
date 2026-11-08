<script setup lang="ts">
import { ref } from 'vue'
import BookModal, { type BookTab } from '@/ui/BookModal.vue'
import { weaponFamilies } from '@/weapons/weapon-families'

const emit = defineEmits<{ close: [] }>()

const familyTabs: BookTab[] = weaponFamilies.map(family => ({ id: family.id, label: family.name }))

const selectedFamilyId = ref<string>()
</script>

<template>
  <BookModal
    v-model:top="selectedFamilyId"
    title="Weapons"
    :top-tabs="familyTabs"
    @close="emit('close')"
  />
</template>
