<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ term.name }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <p>{{ term.description }}</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "FinancialTermModal",
  props: {
    term: {
      type: Object,
      required: true,
    },
  },
  emits: ["close"],
};
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 31.25rem;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-sub);
  cursor: pointer;
}

.modal-body {
  padding: 1.25rem;
}

.modal-body p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text);
}
</style>
