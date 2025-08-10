<template>
  <div class="notification-dropdown-overlay" v-if="isOpen" @click="$emit('close')">
    <div class="notification-dropdown" @click.stop>
      <!-- 헤더 -->
      <div class="dropdown-header">
        <h3>알림</h3>
        <button @click="$emit('markAllAsRead')" class="mark-all-read-btn">모두 읽음</button>
      </div>

      <!-- 읽지 않은 알림 수 -->
      <div class="unread-count">읽지 않은 알림 {{ unreadCount }}개</div>

      <!-- 알림 목록 -->
      <div class="dropdown-list">
        <div v-if="notifications.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              width="32"
              height="32"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <p class="empty-title">알림이 없습니다</p>
          <p class="empty-desc">모든 알림을 확인했습니다!</p>
        </div>

        <div v-else class="notification-items">
          <div
            v-for="notification in limitedNotifications"
            :key="notification.id"
            class="dropdown-notification-item"
            :class="{ unread: !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="item-icon" :class="`type-${notification.type}`">
              <span>{{ getTypeIcon(notification.type) }}</span>
            </div>

            <div class="item-content">
              <div class="item-header">
                <h4>{{ notification.title }}</h4>
              </div>
              <p class="item-message">
                {{ truncateMessage(notification.message) }}
              </p>
              <div class="item-footer">
                <span class="item-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div v-if="notifications.length > 0" class="dropdown-footer">
        <button @click="$emit('viewAll')" class="view-all-btn">전체 알림 보기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  notifications: {
    type: Array,
    default: () => [],
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'markAllAsRead', 'markAsRead', 'viewAll', 'notificationClick']);

// 최대 5개까지만 표시
const limitedNotifications = computed(() => {
  return props.notifications.slice(0, 5);
});

const handleNotificationClick = (notification) => {
  emit('notificationClick', notification);
};

const getTypeIcon = (type) => {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };
  return icons[type] || 'ℹ';
};

const truncateMessage = (message) => {
  if (message.length > 80) {
    return message.substring(0, 80) + '...';
  }
  return message;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString();
};
</script>

<style scoped>
.notification-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.notification-dropdown {
  width: 100%;
  max-width: 384px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.mark-all-read-btn {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mark-all-read-btn:hover {
  color: #6b7280;
}

.unread-count {
  padding: 0.75rem 1.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dropdown-list {
  max-height: 320px;
  overflow-y: auto;
  background: white;
}

.empty-state {
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  background: var(--color-bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-icon svg {
  color: var(--color-light);
}

.empty-title {
  color: var(--color-sub);
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.empty-desc {
  color: var(--color-light);
  font-size: 0.875rem;
  margin: 0;
}

.notification-items {
  display: flex;
  flex-direction: column;
}

.dropdown-notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: white;
}

.dropdown-notification-item:hover {
  background: #f9fafb;
}

.dropdown-notification-item:last-child {
  border-bottom: none;
}

.dropdown-notification-item.unread {
  background: white;
}

.dropdown-notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.item-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.item-icon.type-success {
  background: #10b981;
}

.item-icon.type-warning {
  background: #f59e0b;
}

.item-icon.type-error {
  background: #ef4444;
}

.item-icon.type-info {
  background: var(--color-main);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.item-header h4 {
  font-weight: 500;
  color: #374151;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.25;
}

.item-message {
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.4;
  margin: 0.25rem 0 0.5rem 0;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.item-time {
  color: #9ca3af;
  font-size: 0.7rem;
}

.dropdown-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-light);
  background: var(--color-bg-light);
}

.view-all-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--color-main);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: var(--color-sub);
}

@media (max-width: 375px) {
  .notification-dropdown {
    max-width: 320px;
  }

  .dropdown-header {
    padding: 1rem;
  }

  .unread-count {
    padding: 0.75rem 1rem;
  }

  .dropdown-notification-item {
    padding: 0.75rem;
  }
}
</style>
