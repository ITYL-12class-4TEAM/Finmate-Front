<template>
  <button
    @click="toggleWishlist"
    class="wishlist-btn"
    :class="{ active: isInWishlist }"
    aria-label="관심상품 등록"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      :fill="isInWishlist ? '#ff5757' : 'none'"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      ></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { wishlistAPI } from '@/api/favorite'; // 경로는 실제 파일 위치에 맞게 조정하세요

// props 정의
const props = defineProps({
  productId: {
    type: [Number, String],
    required: true,
  },
  saveTrm: {
    type: [Number, String],
    default: null,
  },
  intrRateType: {
    type: String,
    default: null,
  },
});

// 관심상품 상태
const isInWishlist = ref(false);

// 관심상품 상태 확인 (초기 로딩 시)
const checkWishlistStatus = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('토큰이 없어 관심상품 상태 확인을 건너뜁니다.');
      return; // 로그인하지 않은 경우 체크하지 않음
    }

    // 관심상품 목록을 가져와서 현재 상품이 포함되어 있는지 확인
    const wishlistItems = await wishlistAPI.getList();

    // 현재 상품이 관심상품 목록에 있는지 확인
    const isWishlisted = wishlistItems.some(
      (item) =>
        String(item.productId) === String(props.productId) &&
        (props.saveTrm === null || String(item.saveTrm) === String(props.saveTrm)) &&
        (props.intrRateType === null || item.intrRateType === props.intrRateType)
    );

    isInWishlist.value = isWishlisted;
    console.log(`관심상품 상태 확인: productId=${props.productId}, 결과=${isInWishlist.value}`);
  } catch (error) {
    console.error('관심상품 상태 확인 중 오류 발생:', error);
  }
};

// 관심상품 추가/제거 토글
const toggleWishlist = async () => {
  // 현재 상태 저장
  const currentState = isInWishlist.value;

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('로그인이 필요합니다.');
      alert('로그인 후 이용 가능합니다.');
      return;
    }

    console.log('관심상품 토글 요청 시작, 현재 상태:', currentState ? '관심상품 O' : '관심상품 X');

    // 낙관적 UI 업데이트 (즉시 상태 변경)
    isInWishlist.value = !currentState;

    if (currentState) {
      // 관심상품 제거 요청
      await removeFromWishlist();
    } else {
      // 관심상품 추가 요청
      await addToWishlist();
    }

    console.log('관심상품 토글 완료, 최종 상태:', isInWishlist.value ? '추가됨' : '제거됨');
  } catch (error) {
    console.error('관심상품 토글 중 오류 발생:', error);

    // 오류 발생 시 원래 상태로 복원
    isInWishlist.value = currentState;

    alert('관심상품 등록/해제 중 오류가 발생했습니다.');
  }
};

// 관심상품 추가
const addToWishlist = async () => {
  try {
    console.log('관심상품 추가 시작 - 데이터:', {
      productId: Number(props.productId),
      saveTrm: props.saveTrm ? Number(props.saveTrm) : null,
      intrRateType: props.intrRateType,
    });

    // wishlistAPI를 사용하여 관심상품 추가
    const result = await wishlistAPI.add(Number(props.productId));

    console.log('관심상품 추가 완료:', result);
    return result;
  } catch (error) {
    console.error('관심상품 추가 중 오류 발생:', error);
    throw error;
  }
};

// 관심상품 제거
const removeFromWishlist = async () => {
  try {
    console.log('관심상품 제거 요청:', {
      productId: props.productId,
    });

    // wishlistAPI를 사용하여 관심상품 제거
    const result = await wishlistAPI.remove(props.productId);

    console.log('관심상품 제거 완료:', result);
    return result;
  } catch (error) {
    console.error('관심상품 제거 중 오류 발생:', error);
    throw error;
  }
};

// props 변경 시 상태 다시 확인
watch([() => props.productId, () => props.saveTrm, () => props.intrRateType], () => {
  checkWishlistStatus();
});

// 컴포넌트 마운트 시 관심상품 상태 확인
onMounted(() => {
  console.log('WishlistButton 마운트 - props 값 확인:', {
    productId: props.productId,
    saveTrm: props.saveTrm,
    intrRateType: props.intrRateType,
  });
  checkWishlistStatus();
});
</script>

<style scoped>
.wishlist-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.wishlist-btn svg {
  width: 24px;
  height: 24px;
  color: var(--color-sub);
}

.wishlist-btn:hover svg {
  color: var(--color-main);
}

.wishlist-btn.active svg {
  color: #ff5757;
  fill: #ff5757;
}
</style>
