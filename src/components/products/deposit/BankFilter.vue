<template>
  <div class="bank-filter">
    <h3 class="filter-title">은행 선택</h3>
    <div class="bank-check-group">
      <label class="bank-checkbox">
        <input type="checkbox" v-model="selectAllBanks" @change="toggleAllBanks" />
        <span>전체 선택</span>
      </label>
    </div>
    <div class="bank-check-group">
      <label class="bank-checkbox">
        <input
          type="checkbox"
          v-model="selectedBanks"
          value="savings_all"
          @change="handleBankSelection"
        />
        <span>저축은행</span>
      </label>
    </div>
    <div class="bank-list">
      <label v-for="bank in regularBanks" :key="bank" class="bank-checkbox bank-option">
        <input
          type="checkbox"
          v-model="selectedBanks"
          :value="bank"
          @change="handleBankSelection"
        />
        <span>{{ bank }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  banks: { type: Array, default: () => [] },
  initialSelectedBanks: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:selected-banks']);

const selectedBanks = ref([]);
const selectAllBanks = ref(false);

const bankCategories = computed(() => {
  const regular = [],
    savings = [];
  props.banks?.forEach((bank) => {
    if (typeof bank === 'string') {
      (bank.includes('저축은행') ? savings : regular).push(bank);
    }
  });
  return { regularBanks: regular, savingsBanks: savings };
});

const regularBanks = computed(() => bankCategories.value.regularBanks);
const savingsBanks = computed(() => bankCategories.value.savingsBanks);

const allBankCodes = computed(() => {
  const codes = [...regularBanks.value];
  if (savingsBanks.value.length > 0) codes.push('savings_all');
  return codes;
});

const toggleAllBanks = () => {
  selectedBanks.value = selectAllBanks.value ? [...allBankCodes.value] : [];
  emitSelectedBanks();
};

const handleBankSelection = () => {
  selectAllBanks.value =
    allBankCodes.value.length > 0 && selectedBanks.value.length === allBankCodes.value.length;
  emitSelectedBanks();
};

const emitSelectedBanks = () => {
  let apiReadyBankCodes = [...selectedBanks.value];
  const idx = apiReadyBankCodes.indexOf('savings_all');
  if (idx !== -1) apiReadyBankCodes.splice(idx, 1, ...savingsBanks.value);
  emit('update:selected-banks', {
    uiCodes: selectedBanks.value,
    apiCodes: apiReadyBankCodes,
  });
};

onMounted(() => {
  nextTick(() => {
    selectedBanks.value = [...regularBanks.value];
    handleBankSelection();
  });
});

watch(
  () => props.banks,
  (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0 && selectedBanks.value.length === 0) {
      nextTick(() => {
        selectedBanks.value = [...bankCategories.value.regularBanks];
        handleBankSelection();
      });
    }
  },
  { deep: true }
);
</script>

<style scoped>
.bank-filter {
  padding: 1.25rem 1rem;
  background: #fff;
  border-radius: 0.75rem;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.08);
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 1.25rem;
}

.bank-check-group {
  margin-bottom: 0.75rem;
}

.bank-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.bank-checkbox {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-main);
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.bank-checkbox input[type='checkbox'] {
  accent-color: var(--color-main);
  width: 1rem;
  height: 1rem;
  margin-right: 0.3rem;
  border-radius: 0.25rem;
}

.bank-option {
  margin-bottom: 0.5rem;
}

@media (max-width: 430px) {
  .bank-filter {
    max-width: 100vw;
    padding: 1rem 0.75rem;
  }
  .bank-checkbox {
    font-size: 0.92rem;
  }
}
</style>
