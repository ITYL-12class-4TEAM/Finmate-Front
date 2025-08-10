<template>
  <div class="notification-item" @click="$emit('view', notification)">
    <!-- 알림 타입 뱃지 -->
    <div class="notification-badge">
      <NotificationBadge :type="'type'" :value="notification.type" />
    </div>

    <!-- 제목 및 미리보기 -->
    <div class="notification-content">
      <div class="notification-title-wrapper">
        <div class="notification-title">
          {{ truncateText(notification.title, 30) }}
        </div>
        <div class="notification-preview">
          {{ truncateText(notification.message, 60) }}
        </div>
      </div>

      <!-- 알림 정보 -->
      <div class="notification-meta">
        <div class="meta-left">
          <span class="read-status" :class="{ unread: !notification.isRead }">
            {{ notification.isRead ? '읽음' : '읽지 않음' }}
          </span>
        </div>
        <span class="date">{{ formatDate(notification.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import NotificationBadge from './common/NotificationBadge.vue';

defineProps({
  notification: {
    type: Object,
    required: true,
  },
});

defineEmits(['view']);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

const truncateText = (text, length) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.notification-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.5) 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.notification-item:hover {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.02) 0%, rgba(248, 249, 252, 0.8) 100%);
  transform: translateY(-1px);
}

.notification-item:active {
  transform: translateY(0);
}

.notification-badge {
  align-self: flex-start;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.notification-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.notification-item:hover .notification-title {
  color: #1e2347;
}

.notification-preview {
  font-size: 0.875rem;
  color: var(--color-sub);
  line-height: 1.5;
  opacity: 0.9;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-light);
  margin-top: 0.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.read-status {
  display: flex;
  align-items: center;
  color: var(--color-sub);
  font-weight: 500;
  font-size: 0.8rem;
}

.read-status.unread {
  color: #3b82f6;
  font-weight: 600;
}

.date {
  font-size: 0.75rem;
  color: var(--color-light);
  opacity: 0.8;
  font-weight: 500;
}

/* 포커스 상태 */
.notification-item:focus {
  outline: 2px solid rgba(74, 144, 226, 0.3);
  outline-offset: 2px;
}

/* 선택 방지 */
.notification-item {
  user-select: none;
}

/* 미묘한 구분선 효과 */
.notification-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1.25rem;
  right: 1.25rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(185, 187, 204, 0.3) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:not(:last-child)::after {
  opacity: 1;
}
</style>
