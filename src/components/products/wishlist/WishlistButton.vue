<template>
  <button
    class="wishlist-btn"
    :class="{ active: isInWishlist }"
    :aria-label="isInWishlist ? '관심상품 제거' : '관심상품 등록'"
    @click="toggleWishlist"
  >
    <svg
      :class="{ filled: isInWishlist }"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { wishlistAPI } from '@/api/favorite';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const route = useRoute();

// props 정의
const productId = route.params.id;
const saveTrm = route.query.saveTrm ?? 6;
const intrRateType = route.query.intrRateType ?? 'S';

// 관심상품 상태
const isInWishlist = ref(false);
const isProcessing = ref(false);

// 관심상품 상태 확인
const checkWishlistStatus = async () => {
  try {
    const response = await wishlistAPI.isFavorite(productId);
    isInWishlist.value = response.body.data;
  } catch (error) {
    console.error('관심상품 상태 확인 중 오류 발생:', error);
  }
};

// 관심상품 추가/제거 토글
const toggleWishlist = async () => {
  if (isProcessing.value) return;

  isProcessing.value = true;

  if (isInWishlist.value) {
    await removeFavorite();
    isInWishlist.value = false;
  } else {
    await addFavorite();
    isInWishlist.value = true;
  }
};

const removeFavorite = async () => {
  try {
    await wishlistAPI.remove(productId);
    showToast('즐겨찾기에서 삭제되었습니다!', 'warning');
  } catch (error) {
    console.error('관심상품 토글 중 오류 발생:', error);
  } finally {
    isProcessing.value = false;
  }
};

const addFavorite = async () => {
  try {
    await wishlistAPI.add({
      productId: productId,
      intrRateType: intrRateType,
      saveTrm: saveTrm,
    });
    showToast('즐겨찾기에 추가되었습니다!', 'success');
  } catch (err) {
    console.error('관심상품 토글 중 오류 발생:', err);
  } finally {
    isProcessing.value = false;
  }
};

onMounted(checkWishlistStatus);
</script>

<style scoped>
.wishlist-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.wishlist-btn svg {
  width: 2rem;
  height: 2rem;
  color: var(--color-sub);
  fill: none;
  align-self: flex-start;
}

.wishlist-btn:hover svg {
  color: var(--color-main);
}

.wishlist-btn svg.filled {
  fill: #ffe344;
}
</style>
