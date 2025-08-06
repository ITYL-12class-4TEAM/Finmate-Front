<template>
  <button
    class="favorite-btn"
    :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
    :disabled="loading || externalLoading"
    @click.stop="handleClick"
  >
    <i
      v-if="!loading && !externalLoading"
      class="fa-solid fa-star"
      :class="{ 'is-favorite': isFavorite }"
    ></i>
    <!-- 로딩 중일 때 스피너 표시 -->
    <i v-else class="fa-solid fa-spinner fa-spin"></i>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { useModal } from '@/composables/useModal';
import { wishlistAPI } from '../../../api/favorite';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const { showModal } = useModal();

const props = defineProps({
  isFavorite: {
    type: Boolean,
    required: true,
  },
  productId: {
    type: [String, Number],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['remove-favorite', 'add-favorite']);

const externalLoading = ref(false);

const handleClick = async () => {
  if (props.isFavorite) {
    await removeFavorite();
  } else {
    await addFavorite();
  }
};

const removeFavorite = async () => {
  const confirmed = await showModal('즐겨찾기에서 삭제하시겠습니까?');
  if (!confirmed) return;

  externalLoading.value = true;
  try {
    await wishlistAPI.remove(props.productId);
    emit('remove-favorite');
    showToast('즐겨찾기에서 삭제되었습니다!', 'success');
  } catch (err) {
    showToast('즐겨찾기 삭제에 실패했습니다.', 'error');
    console.error('Remove favorite error:', err);
  } finally {
    externalLoading.value = false;
  }
};

const addFavorite = async () => {
  externalLoading.value = true;
  try {
    await wishlistAPI.add(props.productId);
    emit('add-favorite');
    showToast('즐겨찾기에 추가되었습니다!', 'success');
  } catch (err) {
    showToast('즐겨찾기 추가에 실패했습니다.', 'error');
    console.error('Add favorite error:', err);
  } finally {
    externalLoading.value = false;
  }
};
</script>
<style scoped>
/* 즐겨찾기 버튼 */
.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.favorite-btn i {
  font-size: 1rem;
  color: #f59e0b;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  transform: scale(1.05);
}

.favorite-btn:hover i {
  color: #d97706;
  transform: scale(1.1);
}

.favorite-btn:active {
  transform: scale(0.95);
}
</style>
