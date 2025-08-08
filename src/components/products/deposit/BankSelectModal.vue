<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>은행 선택</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      <div class="bank-type-tabs">
        <button
          v-for="type in bankTypes"
          :key="type.value"
          class="tab-btn"
          :class="{ active: activeTab === type.value }"
          @click="setTab(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
      <div class="bank-selection-content">
        <div class="select-all-option">
          <label>
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
            모든 {{ tabLabel }} 선택
          </label>
        </div>
        <div class="bank-grid">
          <div v-for="bank in displayedBanks" :key="bank" class="bank-item">
            <label>
              <input type="checkbox" v-model="selected" :value="bank" @change="syncSelectAll" />
              <div class="bank-logo">
                <div class="bank-logo-placeholder"></div>
              </div>
              <div class="bank-name">{{ bank }}</div>
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="confirm-btn" @click="onConfirm">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
  banks: { type: Array, default: () => [] },
  initialSelectedBanks: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'update:selected-banks']);

// 탭(은행/저축은행) 정의
const bankTypes = [
  { value: 'bank', label: '은행' },
  { value: 'savings', label: '저축은행' },
];
const activeTab = ref('bank');
const selected = ref([]);
const selectAll = ref(false);

// 은행 데이터가 없을 때 사용할 임시 데이터
const defaultBanks = [
  'KB국민은행',
  '신한은행',
  'NH농협은행',
  '우리은행',
  '하나은행',
  'IBK기업은행',
  'BNK저축은행',
  'DK저축은행',
  'HB저축은행',
  'IBK저축은행',
  'JT저축은행',
  'KDB저축은행',
];

// 분류된 은행 배열
const bankCategories = computed(() => {
  const regular = [],
    savings = [];

  // props.banks가 비어있으면 기본 데이터 사용
  const banksToUse = props.banks && props.banks.length > 0 ? props.banks : defaultBanks;

  // 이제 banksToUse는 확실히 데이터가 있는 배열
  banksToUse.forEach((bank) => {
    if (typeof bank === 'string') {
      (bank.includes('저축은행') ? savings : regular).push(bank);
    }
  });

  return { bank: regular, savings: savings };
});
const displayedBanks = computed(() => bankCategories.value[activeTab.value]);
const tabLabel = computed(() => (activeTab.value === 'bank' ? '은행' : '저축은행'));

// 탭 전환
const setTab = (tab) => {
  activeTab.value = tab;
  nextTick(syncSelectAll);
};

// 전체 선택
const toggleSelectAll = () => {
  if (selectAll.value) {
    // 선택된 것 + 현재 탭 은행 union
    const keep =
      activeTab.value === 'bank'
        ? selected.value.filter((b) => bankCategories.value.savings.includes(b))
        : selected.value.filter((b) => bankCategories.value.bank.includes(b));
    selected.value =
      activeTab.value === 'bank'
        ? [...bankCategories.value.bank, ...keep]
        : [...keep, ...bankCategories.value.savings];
  } else {
    // 현재 탭 은행만 해제
    selected.value = selected.value.filter((b) =>
      activeTab.value === 'bank'
        ? bankCategories.value.savings.includes(b)
        : bankCategories.value.bank.includes(b)
    );
  }
};

// 개별 선택시 전체선택 동기화
const syncSelectAll = () => {
  selectAll.value =
    displayedBanks.value.length > 0 &&
    displayedBanks.value.every((bank) => selected.value.includes(bank));
};

// 모달 오픈 시 초기화
watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      selected.value = props.initialSelectedBanks.length
        ? [...props.initialSelectedBanks]
        : [...bankCategories.value.bank];
      activeTab.value = 'bank';
      nextTick(syncSelectAll);
    }
  }
);

const onConfirm = () => {
  emit('update:selected-banks', {
    uiCodes: selected.value,
    apiCodes: selected.value,
  });
  closeModal();
};
const closeModal = () => emit('close');

// 모달 오픈 시 초기화 부분 수정
watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      selected.value = props.initialSelectedBanks.length
        ? [...props.initialSelectedBanks]
        : [...bankCategories.value.bank];

      activeTab.value = 'bank';
      nextTick(() => {
        syncSelectAll();
      });
    }
  }
);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  width: 100%;
  max-width: 430px;
  background: #fff;
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.11);
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
}
.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  position: relative;
  border-bottom: 1px solid var(--color-bg-light);
}
.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}
.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-sub);
}
.bank-type-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-bg-light);
}
.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-sub);
  transition: color 0.15s;
}
.tab-btn.active {
  font-weight: 600;
  color: var(--color-main);
  border-bottom: 2px solid var(--color-main);
  background: var(--color-bg-light);
}
.bank-selection-content {
  padding: 1rem;
  overflow-y: auto;
  max-height: 60vh;
}
.select-all-option {
  margin-bottom: 1rem;
}
.select-all-option label {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-main);
  cursor: pointer;
}
.select-all-option input[type='checkbox'] {
  accent-color: var(--color-main);
  margin-right: 0.5rem;
}
.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.bank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid var(--color-bg-light);
  border-radius: 0.5rem;
  background: #fafbfc;
  transition:
    border 0.15s,
    background 0.15s;
}
.bank-item label {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
}
.bank-logo {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bank-logo-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-bg-light);
  border-radius: 50%;
}
.bank-name {
  font-size: 0.75rem;
  text-align: center;
  color: var(--color-sub);
}
.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
}
.confirm-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-main);
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.confirm-btn:hover {
  background: var(--color-sub);
}
</style>
