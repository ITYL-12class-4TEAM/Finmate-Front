<template>
  <section
    class="carousel"
    role="region"
    aria-roledescription="carousel"
    aria-label="메인 배너"
    @mouseenter="pause()"
    @mouseleave="play()"
  >
    <!-- 슬라이드 트랙 -->
    <div
      ref="trackEl"
      class="track"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      tabindex="0"
      @keydown.left.prevent="prev"
      @keydown.right.prevent="next"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <article
        v-for="(item, i) in items"
        :key="i"
        class="slide"
        role="group"
        :aria-label="`${i + 1} / ${items.length}`"
      >
        <!-- 배경 -->
        <div
          class="bg"
          :style="{
            background: item.bgGradient || undefined,
          }"
        ></div>
        <!-- 콘텐츠 -->
        <div class="content two-col">
          <div class="copy">
            <h2 class="title">{{ item.title }}</h2>
            <p v-if="item.subtitle" class="subtitle">{{ item.subtitle }}</p>
            <RouterLink class="cta" :to="item.to" :aria-label="item.ctaAria || item.ctaText">
              {{ item.ctaText }}
            </RouterLink>
          </div>

          <div v-if="item.illust" class="illustration">
            <img :src="item.illust" :alt="item.illustAlt || ''" />
          </div>
        </div>
      </article>
    </div>

    <div class="dots" role="tablist" aria-label="배너 선택">
      <button
        v-for="(_, i) in items"
        :key="i"
        class="dot"
        :class="{ active: i === currentIndex }"
        role="tab"
        :aria-selected="i === currentIndex"
        :tabindex="i === currentIndex ? 0 : -1"
        @click="go(i)"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  interval: { type: Number, default: 4000 },
  pauseOnHover: { type: Boolean, default: true },
  loop: { type: Boolean, default: true },
  autoPlay: { type: Boolean, default: true },
});

const currentIndex = ref(0);
let timer = null;
const trackEl = ref(null);

// 자동재생
const play = () => {
  if (!props.autoPlay || prefersReducedMotion()) return;
  clear();
  timer = setInterval(() => next(), props.interval);
};
const pause = () => {
  if (!props.pauseOnHover) return;
  clear();
};
const clear = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const go = (i) => {
  currentIndex.value = i;
  restartIfAutoplay();
};
const prev = () => {
  if (currentIndex.value === 0) {
    currentIndex.value = props.loop ? props.items.length - 1 : 0;
  } else {
    currentIndex.value -= 1;
  }
  restartIfAutoplay();
};
const next = () => {
  if (currentIndex.value === props.items.length - 1) {
    currentIndex.value = props.loop ? 0 : currentIndex.value;
  } else {
    currentIndex.value += 1;
  }
  restartIfAutoplay();
};
const restartIfAutoplay = () => {
  if (props.autoPlay) {
    clear();
    play();
  }
};

const handleVisibility = () => {
  if (document.hidden) clear();
  else play();
};

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let startX = 0;
let deltaX = 0;
const onTouchStart = (e) => {
  startX = e.touches[0].clientX;
  deltaX = 0;
  pause();
};
const onTouchMove = (e) => {
  deltaX = e.touches[0].clientX - startX;
};
const onTouchEnd = () => {
  const threshold = 40;
  if (deltaX > threshold) prev();
  else if (deltaX < -threshold) next();
  play();
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibility);
  trackEl.value?.focus?.();
  play();
});

onBeforeUnmount(() => {
  clear();
  document.removeEventListener('visibilitychange', handleVisibility);
});

watch(
  () => props.items?.length,
  () => {
    if (currentIndex.value >= props.items.length) currentIndex.value = 0;
  }
);
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 250px;
  overflow: hidden;
  border-radius: 1.25rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
  background: var(--color-main);
  margin-bottom: 1rem;
  background-color: #f8f8f8;
}

.track {
  display: flex;
  height: 100%;
  transition: transform 500ms ease;
  outline: none;
}

.slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
}

.bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.04);
}

.content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: clamp(1rem, 4vw, 3rem);
  display: grid;
  align-content: center;
  gap: 0.75rem;
}

.content.two-col {
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: clamp(1rem, 3vw, 2.5rem);
}

.copy {
  max-width: 40rem;
}

.title {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: #555;
}

.subtitle {
  margin-top: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
  color: #777;
  word-break: keep-all;
}

.cta {
  display: inline-block;
  margin-top: 0.8rem;
  padding: 0.75rem;
  border-radius: 0.875rem;
  background: var(--color-white);
  color: #555;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
  transition:
    transform 0.15s ease,
    background 0.2s ease;
}
.cta:hover {
  transform: translateY(-1px);
  background: #eeeeee;
}

.illustration {
  display: grid;
  justify-items: end;
  background-color: transparent;
}
.illustration img {
  width: 100%;
  background-color: transparent;
}

.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 44px;
  width: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.nav:hover {
  background: rgba(0, 0, 0, 0.5);
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

.dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}
.dot.active {
  background: #fff;
}
</style>
