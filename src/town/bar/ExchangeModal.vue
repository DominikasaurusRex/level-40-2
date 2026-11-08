<script setup lang="ts">
import { ref } from 'vue'
import BookModal, { type BookTab } from '@/ui/BookModal.vue'

enum ExchangeDirection {
  GoldToXp = 'gold-to-xp',
  XpToGold = 'xp-to-gold',
}

const emit = defineEmits<{ close: [] }>()

const directionTabs: BookTab[] = [
  { id: ExchangeDirection.GoldToXp, label: 'Gold → XP' },
  { id: ExchangeDirection.XpToGold, label: 'XP → Gold' },
]

const selectedDirection = ref<string>()
</script>

<template>
  <BookModal
    v-model:top="selectedDirection"
    title="Exchange"
    :top-tabs="directionTabs"
    @close="emit('close')"
  />
</template>
