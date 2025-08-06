<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <button class="back-button" @click="goBack">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <h1 class="header-title">다른 WMTI 투자스타일</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>WMTI 정보를 불러오는 중...</span>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="wmtiList.length === 0" class="empty-state">
        <i class="fa-solid fa-exclamation-circle"></i>
        <p>WMTI 정보를 불러올 수 없습니다.</p>
        <button class="retry-button" @click="fetchWMTIList">
          <i class="fa-solid fa-refresh"></i>
          다시 시도
        </button>
      </div>

      <!-- WMTI 리스트 -->
      <div v-else class="wmti-list">
        <div
          v-for="wmti in wmtiList"
          :key="wmti.id"
          class="wmti-item"
          :class="{ expanded: expandedItem === wmti.id }"
          @click="toggleExpand(wmti.id)"
        >
          <div class="wmti-header">
            <div class="wmti-icon">
              <img
                v-if="getWMTIIcon(wmti.code)"
                :src="getWMTIIcon(wmti.code)"
                :alt="wmti.code"
                @error="handleImageError"
              />
              <span v-else class="wmti-code-text">{{ wmti.code }}</span>
            </div>
            <div class="wmti-info">
              <div class="wmti-code">{{ wmti.code }}</div>
              <div class="wmti-aka">{{ wmti.aka }}</div>
            </div>
            <div class="expand-arrow">
              <i
                class="fa-solid fa-chevron-down"
                :class="{ rotated: expandedItem === wmti.id }"
              ></i>
            </div>
          </div>

          <div v-if="expandedItem === wmti.id" class="wmti-description">
            <p>{{ wmti.description }}</p>
            <div class="wmti-tags">
              <span v-for="tag in wmti.tag.slice(0, 6)" :key="tag" class="tag"> #{{ tag }} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getWMTICodesAPI } from '@/api/wmti';

export default {
  name: 'WMTICollection',
  data() {
    return {
      wmtiList: [],
      expandedItem: null,
      loading: true,
    };
  },
  async mounted() {
    await this.fetchWMTIList();
  },
  methods: {
    async fetchWMTIList() {
      try {
        this.loading = true;
        const res = await getWMTICodesAPI();
        this.wmtiList = res.data || res;
      } catch (error) {
        console.error('WMTI 리스트 가져오기 실패:', error);
        // 에러 처리 - 사용자에게 알림 표시 등
      } finally {
        this.loading = false;
      }
    },

    toggleExpand(itemId) {
      if (this.expandedItem === itemId) {
        this.expandedItem = null;
      } else {
        this.expandedItem = itemId;
      }
    },

    getWMTIIcon(code) {
      // 아이콘이 없을 경우 기본 아이콘 표시
      try {
        return `/assets/images/wmti/${code.toLowerCase()}.png`;
      } catch (error) {
        // 기본 아이콘 또는 텍스트로 대체
        return null;
      }
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--background-gradient);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(0.625rem);
  border-bottom: 0.0625rem solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-spacer {
  width: 2rem;
}

.content {
  padding: 1rem;
}

.wmti-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wmti-item {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.wmti-item:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 1rem rgba(255, 107, 107, 0.15);
}

.wmti-item.expanded {
  transform: none;
  box-shadow: 0 0.25rem 1rem rgba(255, 107, 107, 0.2);
}

.wmti-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.wmti-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wmti-icon img {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.wmti-code-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-align: center;
}

.wmti-info {
  flex: 1;
}

.wmti-code {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.wmti-aka {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

.expand-arrow {
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.expand-arrow .rotated {
  transform: rotate(180deg);
}

.wmti-description {
  padding: 0 1rem 1rem 1rem;
  border-top: 0.0625rem solid rgba(0, 0, 0, 0.05);
  animation: expandDown 0.3s ease-out;
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 18.75rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}

.wmti-description p {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-color);
}

.wmti-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--gradient-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  gap: 1rem;
}

.loading i {
  font-size: 2rem;
  color: var(--primary-color);
}

.loading span {
  font-size: 0.9rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  gap: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-secondary);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

.retry-button {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 1.5625rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.retry-button:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(255, 107, 107, 0.3);
}

@media (max-width: 23.4375rem) {
  .wmti-header {
    padding: 0.875rem;
  }

  .wmti-icon {
    width: 2.75rem;
    height: 2.75rem;
  }

  .wmti-icon img {
    width: 1.75rem;
    height: 1.75rem;
  }

  .wmti-code {
    font-size: 1rem;
  }

  .wmti-aka {
    font-size: 0.85rem;
  }
}
</style>
