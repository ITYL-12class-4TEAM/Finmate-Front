<template>
  <div class="score-grid">
    <!-- A vs I -->
    <div class="score-item">
      <div class="dimension-header">
        <span class="dimension-label">A vs I</span>
      </div>
      <div class="bidirectional-bar">
        <div class="bar-left">
          <span class="bar-info" :class="{ dominant: aLetter === 'A' }">
            A {{ Math.round(aScore) }}%
          </span>
          <div
            v-if="aLetter === 'A'"
            class="bar-progress left bar-a"
            :style="{ width: aScore + '%' }"
          ></div>
        </div>
        <div class="bar-center">50</div>
        <div class="bar-right">
          <div
            v-if="aLetter === 'I'"
            class="bar-progress right bar-i"
            :style="{ width: iScore + '%' }"
          ></div>
          <span class="bar-info" :class="{ dominant: aLetter === 'I' }">
            I {{ Math.round(iScore) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- P vs B -->
    <div class="score-item">
      <div class="dimension-header">
        <span class="dimension-label">P vs B</span>
      </div>
      <div class="bidirectional-bar">
        <div class="bar-left">
          <span class="bar-info" :class="{ dominant: pLetter === 'P' }">
            P {{ Math.round(pScore) }}%
          </span>
          <div
            v-if="pLetter === 'P'"
            class="bar-progress left bar-p"
            :style="{ width: pScore + '%' }"
          ></div>
        </div>
        <div class="bar-center">50</div>
        <div class="bar-right">
          <div
            v-if="pLetter === 'B'"
            class="bar-progress right bar-b"
            :style="{ width: bScore + '%' }"
          ></div>
          <span class="bar-info" :class="{ dominant: pLetter === 'B' }">
            B {{ Math.round(bScore) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- M vs W -->
    <div class="score-item">
      <div class="dimension-header">
        <span class="dimension-label">M vs W</span>
      </div>
      <div class="bidirectional-bar">
        <div class="bar-left">
          <span class="bar-info" :class="{ dominant: mLetter === 'M' }">
            M {{ Math.round(mScore) }}%
          </span>
          <div
            v-if="mLetter === 'M'"
            class="bar-progress left bar-m"
            :style="{ width: mScore + '%' }"
          ></div>
        </div>
        <div class="bar-center">50</div>
        <div class="bar-right">
          <div
            v-if="mLetter === 'W'"
            class="bar-progress right bar-w"
            :style="{ width: wScore + '%' }"
          ></div>
          <span class="bar-info" :class="{ dominant: mLetter === 'W' }">
            W {{ Math.round(wScore) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- L vs C -->
    <div class="score-item">
      <div class="dimension-header">
        <span class="dimension-label">L vs C</span>
      </div>
      <div class="bidirectional-bar">
        <div class="bar-left">
          <span class="bar-info" :class="{ dominant: lLetter === 'L' }">
            L {{ Math.round(lScore) }}%
          </span>
          <div
            v-if="lLetter === 'L'"
            class="bar-progress left bar-l"
            :style="{ width: lScore + '%' }"
          ></div>
        </div>
        <div class="bar-center">50</div>
        <div class="bar-right">
          <div
            v-if="lLetter === 'C'"
            class="bar-progress right bar-c"
            :style="{ width: cScore + '%' }"
          ></div>
          <span class="bar-info" :class="{ dominant: lLetter === 'C' }">
            C {{ Math.round(cScore) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props 정의
defineProps({
  // WMTI 점수들
  aScore: {
    type: Number,
    required: true,
  },
  iScore: {
    type: Number,
    required: true,
  },
  pScore: {
    type: Number,
    required: true,
  },
  bScore: {
    type: Number,
    required: true,
  },
  mScore: {
    type: Number,
    required: true,
  },
  wScore: {
    type: Number,
    required: true,
  },
  lScore: {
    type: Number,
    required: true,
  },
  cScore: {
    type: Number,
    required: true,
  },
  // 우세한 글자들
  aLetter: {
    type: String,
    required: true,
  },
  pLetter: {
    type: String,
    required: true,
  },
  mLetter: {
    type: String,
    required: true,
  },
  lLetter: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
/* 점수 그리드 */
.score-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dimension-header {
  text-align: center;
}

.dimension-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-main);
  background: rgba(45, 51, 107, 0.1);
  padding: 0.375rem 0.875rem;
  border-radius: 0.875rem;
  display: inline-block;
}

/* 양방향 막대그래프 */
.bidirectional-bar {
  display: flex;
  align-items: center;
  height: 2.25rem;
  background: rgba(185, 187, 204, 0.1);
  border-radius: 1.125rem;
  padding: 0.25rem;
  position: relative;
}

.bar-left,
.bar-right {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar-left {
  justify-content: flex-start;
  padding-left: 0.75rem;
}

.bar-right {
  justify-content: flex-end;
  padding-right: 0.75rem;
}

.bar-center {
  width: 1.75rem;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-sub);
  background: var(--color-white);
  border-radius: 0.625rem;
  padding: 0.25rem 0;
  z-index: 2;
  border: 0.125rem solid rgba(185, 187, 204, 0.3);
}

.bar-progress {
  height: 1.375rem;
  border-radius: 0.625rem;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  animation: progressLoad 1.2s ease-out 0.6s both;
}

.bar-progress.left {
  right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.bar-progress.right {
  left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.bar-info {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-sub);
  z-index: 3;
  position: relative;
  transition: all 0.3s ease;
}

.bar-info.dominant {
  font-weight: 800;
  color: var(--color-main);
  text-shadow: 0.0625rem 0.125rem rgba(45, 51, 107, 0.2);
  transform: scale(1.05);
}

/* 각 차원별 색상 */
.bar-a,
.bar-i {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.bar-p,
.bar-b {
  background: linear-gradient(90deg, #e67e22, #f8c471);
}

.bar-m,
.bar-w {
  background: linear-gradient(90deg, #27ae60, #58d68d);
}

.bar-l,
.bar-c {
  background: linear-gradient(90deg, #8e44ad, #bb8fce);
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1.875rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressLoad {
  from {
    width: 0;
  }
}

/* 반응형 */
@media (max-width: 30rem) {
  .bidirectional-bar {
    height: 2rem;
  }

  .bar-progress {
    height: 1.25rem;
  }

  .bar-center {
    width: 1.5rem;
    font-size: 0.65rem;
  }

  .bar-info {
    font-size: 0.75rem;
  }
}
</style>
