<template>
  <div>
    <!-- 알림 리스트 -->
    <div class="notifications-list">
      <NotificationItem
        v-for="notification in notifications"
        :key="`notification-${notification.id}`"
        :notification="notification"
        @view="$emit('notification-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import NotificationItem from './NotificationItem.vue';

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['notification-click']);
</script>

<style scoped>
.notifications-list {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  margin-bottom: 1.5rem;
}

.notifications-list:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
}

/* 빈 상태 처리 */
.notifications-list:empty::after {
  content: '알림이 없습니다.';
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-sub);
  font-size: 0.95rem;
  font-weight: 500;
}

/* 로딩 상태 */
.notifications-list.loading {
  opacity: 0.7;
  pointer-events: none;
}

.notifications-list.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(var(--color-light), 0.3), transparent);
  animation: shimmer 2s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* NotificationItem 간격 조정 */
.notifications-list :deep(.notification-item:not(:last-child)) {
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.notifications-list :deep(.notification-item) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notifications-list :deep(.notification-item:hover) {
  background: rgba(45, 51, 107, 0.02);
  transform: translateY(-1px);
}
</style>
