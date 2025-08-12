<template>
  <div class="favorite-item" @click="handleCardClick">
    <FavoriteItemHeader :favorite="favorite" @remove-favorite="$emit('remove-favorite', $event)" />

    <div class="item-content">
      <FavoriteItemInfo :favorite="favorite" />
    </div>

    <div class="click-indicator">
      <i class="fa-solid fa-chevron-right"></i>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import FavoriteItemHeader from './ProductItemHeader.vue';
import FavoriteItemInfo from './ProductItemInfo.vue';

const router = useRouter();

const props = defineProps({
  favorite: { type: Object, required: true },
});

const emit = defineEmits(['remove-favorite', 'click-favorite']);

const handleCardClick = async (event) => {
  console.log('즐겨찾기 카드 클릭됨:', props.favorite);

  const subcategory = props.favorite.subcategoryName;
  const productId = props.favorite.productId;
  const saveTrm = props.favorite.saveTrm;
  const intrRateType = props.favorite.intrRateType;
  const rsrvValue = props.favorite.rstvValue;

  let routePath = '';
  let query = {};

  if (subcategory === '정기예금') {
    routePath = `/products/deposit/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
  } else if (subcategory === '자유적금') {
    routePath = `/products/savings/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
    if (rsrvValue) query.rsrvType = rsrvValue;
  } else if (subcategory === '연금저축') {
    routePath = `/products/pension/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
  } else {
    routePath = `/products/unknown/${productId}`;
  }

  try {
    // 강제로 페이지 새로고침을 위해 현재 페이지인지 확인
    const currentRoute = router.currentRoute.value;
    const targetRoute = { path: routePath, query };

    // 같은 경로라면 강제 새로고침
    if (currentRoute.path === routePath) {
      const currentQuery = JSON.stringify(currentRoute.query);
      const targetQuery = JSON.stringify(query);

      if (currentQuery !== targetQuery) {
        await router.push(targetRoute);
      } else {
        // 완전히 같은 페이지라면 페이지 새로고침
        window.location.href =
          routePath +
          (Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '');
        return;
      }
    } else {
      // 다른 페이지로 이동
      await router.push(targetRoute);
    }

    emit('click-favorite', props.favorite);
  } catch (err) {
    console.error('페이지 이동 실패:', err);
    // 라우터 이동 실패 시 직접 페이지 이동
    window.location.href =
      routePath + (Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '');
  }
};
</script>

<style scoped>
.favorite-item {
  background: var(--color-white);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
  /* 오른쪽에 여백 추가 */
  padding-right: 3rem;
}

.favorite-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.item-content {
  margin-top: 0.75rem;
}

.click-indicator {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #cbd5e1;
  transition: all 0.2s ease;
  opacity: 0;
  /* 클릭 영역 확보 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: transparent;
}

.favorite-item:hover .click-indicator {
  opacity: 1;
  color: var(--color-main);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.click-indicator i {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .favorite-item {
    padding: 0.875rem;
    /* 모바일에서도 오른쪽 여백 */
    padding-right: 2.5rem;
  }

  .item-content {
    margin-top: 0.625rem;
  }

  .click-indicator {
    right: 0.875rem;
    opacity: 0.5;
    width: 1.75rem;
    height: 1.75rem;
  }

  .click-indicator i {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .favorite-item {
    padding: 0.75rem;
    padding-right: 2.25rem;
  }

  .click-indicator {
    right: 0.75rem;
    width: 1.5rem;
    height: 1.5rem;
  }

  .click-indicator i {
    font-size: 0.75rem;
  }
}
</style>
