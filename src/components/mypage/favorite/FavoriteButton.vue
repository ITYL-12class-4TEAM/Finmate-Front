<template>
  <button
    class="favorite-btn"
    :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'"
    :disabled="loading || externalLoading"
    @click.stop="handleClick"
  >
    <i
      v-if="!loading && !externalLoading"
      :class="isFavorite ? 'fa-solid fa-star' : 'fa-regular fa-star'"
    ></i>
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
  isFavorite: { type: Boolean, required: true },
  productId: { type: [String, Number], required: true },
  loading: { type: Boolean, default: false },
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
.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e2e8f0;
  background: var(--color-white);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #cbd5e1;
}

.favorite-btn:hover:not(:disabled) {
  border-color: #fbbf24;
  color: #fbbf24;
}

.favorite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.favorite-btn i {
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

/* 즐겨찾기 된 상태 (fa-solid) */
.favorite-btn .fa-solid.fa-star {
  color: #fbbf24;
}

.favorite-btn:hover:not(:disabled) .fa-solid.fa-star {
  color: #f59e0b;
}

/* 즐겨찾기 안된 상태 (fa-regular) */
.favorite-btn .fa-regular.fa-star {
  color: #cbd5e1;
}

.favorite-btn:hover:not(:disabled) .fa-regular.fa-star {
  color: #fbbf24;
}

@media (max-width: 768px) {
  .favorite-btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .favorite-btn i {
    font-size: 0.8125rem;
  }
}
</style>
