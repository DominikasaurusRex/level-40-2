<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ModalCloseButton from './ModalCloseButton.vue'

const emit = defineEmits<{ close: [] }>()
const closeButton = ref<InstanceType<typeof ModalCloseButton>>()

onMounted(() => closeButton.value?.focus())

function keepFocus(event: KeyboardEvent) {
  event.preventDefault()
  closeButton.value?.focus()
}
</script>

<template>
  <div class="credits-overlay" @click.self="emit('close')" @keydown.esc="emit('close')" @keydown.tab="keepFocus">
    <div class="credits-dialog" role="dialog" aria-modal="true" aria-labelledby="credits-title">
      <div class="credits-modal">
        <h3 id="credits-title">Credits</h3>

        <section class="credits-section">
          <h4>Coding, Game Design, Lead Programming, Vision</h4>
          <p class="dev-credit">
            <img class="dev-logo" src="/credits/Dominikasaurus.svg" alt="" />
            DominikasaurusRex
          </p>
        </section>

        <section class="credits-section">
          <h4>Monsters, Backgrounds &amp; Sounds</h4>
          <p class="dev-credit">
            <img class="etrian-logo" src="/credits/Etrian_Odyssey_logo.png" alt="" />
            Etrian Odyssey <br/>
            — Atlus / Sega of America Inc..
          </p>
          <p>
            Monster design: Shin Nagasawa. <br />
            Background design: internal Atlus team members.<br />
            Art design: Kiyono Komatsuzaki, Luna Nemoto.
          </p>
          <p>
            Sprites and backgrounds uploaded by
            <a href="https://www.spriters-resource.com/profile/arcafa/" target="_blank" rel="noopener">Arcafa</a>
            on The Spriters Resource.
            Sound effects uploaded by
            <a href="https://sounds.spriters-resource.com/profile/cooper/" target="_blank" rel="noopener">Cooper</a>
            on The Sounds Resource.
            Music uploaded on
            <a href="https://www.101soundboards.com/boards/1622258-etrian-odyssey-iii-the-drowned-city-ds-dsi-sound-effects" target="_blank" rel="noopener">101soundboards</a>.
          </p>
        </section>

        <section class="credits-section">
          <h4>Icons</h4>
          <p>
            <a href="https://www.flaticon.com/authors/magnific" target="_blank" rel="noopener">Magnific</a>
            — Flaticon: stone axe, animals and nature, martial arts, gaming, Viking, role playing, medieval,
            Native Americans, United Arab Emirates, Ireland, royalty, Aztec, magic, close, speaker, attack, sword,
            shield, heart, spark, quick, bleeding is Smashicons, death, RPG, restroom, and man icons.
          </p>
          <p>
            <a href="https://www.flaticon.com/authors/pongsakornred" target="_blank" rel="noopener">pongsakornRed</a> — swords icons.<br />
            <a href="https://www.flaticon.com/authors/iconic-panda" target="_blank" rel="noopener">Iconic Panda</a> — sword icons.<br />
            <a href="https://www.flaticon.com/authors/smalllikeart" target="_blank" rel="noopener">smalllikeart</a> — wind icons.<br />
            <a href="https://www.flaticon.com/authors/good-ware" target="_blank" rel="noopener">Good Ware</a> — dagger icons.<br />
            <a href="https://www.flaticon.com/authors/ab-design" target="_blank" rel="noopener">AB Design</a> — swap icons.<br />
            <a href="https://www.flaticon.com/authors/gravisio" target="_blank" rel="noopener">gravisio</a> — recover icons.<br />
            <a href="https://www.flaticon.com/authors/smashicons" target="_blank" rel="noopener">Smashicons</a> — bleeding icons.
          </p>
          <p>
            <a href="https://www.magnific.com/author/kjpargeter" target="_blank" rel="noopener">kjpargeter</a> — Freepik: wood texture.
          </p>
        </section>

        <section class="credits-section">
          <h4>Built With</h4>
          <p>Vue.js and Pinia.</p>
        </section>
      </div>
      <ModalCloseButton ref="closeButton" class="credits-close-offset" label="Close credits" @click="emit('close')" />
    </div>
  </div>
</template>

<style scoped>
.credits-overlay {
  position: absolute;
  inset: 0;
  z-index: 210;
  display: grid;
  place-items: center;
  background: rgba(0, 11, 25, 0.76);
  backdrop-filter: blur(3px);
}

.credits-dialog {
  position: relative;
  width: min(34rem, calc(100% - 4rem));
  max-height: calc(100% - 3rem);
}

.credits-modal {
  width: 100%;
  max-height: 31rem;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 1.4rem 1.5rem 1.25rem;
  border: 3px solid var(--ui-ink);
  border-radius: 0.35rem;
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, #126f80, #06465e 58%, #02273e);
  box-shadow: 0 0.8rem 1.8rem rgba(0, 7, 18, 0.78);
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.credits-modal h3 {
  margin: 0 1.5rem 1rem 0;
  font-size: 1.2rem;
}

.credits-section + .credits-section {
  margin-top: 1.1rem;
}

.credits-section h4 {
  margin: 0 0 0.35rem;
  color: var(--ui-active);
  font-size: 0.82rem;
  letter-spacing: 0.03em;
}

.credits-section p {
  margin: 0 0 0.5rem;
  font-size: 0.76rem;
  line-height: 1.45;
}

.credits-section p:last-child {
  margin-bottom: 0;
}

.credits-section .dev-credit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.dev-logo {
  flex: none;
  width: 2.0rem;
  height: 2.0rem;
  object-fit: contain;
}

.etrian-logo {
  flex: none;
  width: 5.6rem;
  height: 2.6rem;
  object-fit: contain;
}

.credits-section a {
  color: var(--ui-cyan);
}

.credits-dialog :deep(.credits-close-offset) {
  right: -0.5rem;
}
</style>
