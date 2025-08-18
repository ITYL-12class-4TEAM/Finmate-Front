<template>
  <div class="notification-dropdown-overlay" v-if="isOpen" @click="$emit('close')">
    <div class="notification-dropdown" @click.stop>
      <div class="dropdown-header">
        <h3>알림</h3>
        <button
          @click="handleMarkAllAsRead"
          :disabled="unreadCount === 0 || isMarkingAllAsRead"
          class="mark-all-read-btn"
          :class="{ loading: isMarkingAllAsRead }"
        >
          <span v-if="!isMarkingAllAsRead">모두 읽음</span>
          <span v-else>처리중...</span>
        </button>
      </div>

      <div class="unread-count">읽지 않은 알림 {{ unreadCount }}개</div>

      <div class="dropdown-list">
        <div v-if="limitedNotifications.length === 0" class="empty-state">
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
          <TransitionGroup name="notification" tag="div">
            <div
              v-for="notification in limitedNotifications"
              :key="notification.notificationId"
              class="dropdown-notification-item"
              :class="{
                unread: !notification.isRead,
                'mark-as-read': markedAsReadIds.has(notification.notificationId),
              }"
              @click="handleNotificationClick(notification)"
            >
              <div class="item-icon" :class="`type-${notification.type}`">
                <i :class="getTypeIcon(notification.type)"></i>
              </div>

              <div class="item-content">
                <div class="item-header">
                  <h4>{{ notification.title }}</h4>
                </div>
                <p class="item-message">{{ truncateMessage(notification.message) }}</p>
                <div class="item-footer">
                  <span class="item-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const { showToast } = useToast();
const notificationStore = useNotificationStore();

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] },
  unreadCount: { type: Number, default: 0 },
});

const emit = defineEmits(['close']);

const isMarkingAllAsRead = ref(false);
const markedAsReadIds = ref(new Set());

const limitedNotifications = computed(() => {
  return props.notifications.filter((notification) => !notification.isRead).slice(0, 5);
});

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    markedAsReadIds.value.add(notification.notificationId);
    await handleMarkAsRead(notification);

    setTimeout(() => {
      markedAsReadIds.value.delete(notification.notificationId);
    }, 300);
  }

  if (notification.targetUrl) {
    router.push(notification.targetUrl);
  }
  emit('close');
};

const handleMarkAsRead = async (notification) => {
  const result = await notificationStore.markAsRead(notification.notificationId);
  if (!result.success) {
    showToast(result.message || '읽음 처리 실패', 'error');
  }
};

const handleMarkAllAsRead = async () => {
  if (isMarkingAllAsRead.value || props.unreadCount === 0) return;

  isMarkingAllAsRead.value = true;
  const unreadNotifications = props.notifications.filter((n) => !n.isRead);

  unreadNotifications.forEach((notification, index) => {
    setTimeout(() => {
      markedAsReadIds.value.add(notification.notificationId);
    }, index * 50);
  });

  const result = await notificationStore.markAllAsRead();

  if (result.success) {
    setTimeout(() => {
      markedAsReadIds.value.clear();
      isMarkingAllAsRead.value = false;
    }, 1000);
  } else {
    showToast(result.message || '읽음 처리 실패', 'error');
    markedAsReadIds.value.clear();
    isMarkingAllAsRead.value = false;
  }
};

const getTypeIcon = (type) => {
  const icons = {
    POST_COMMENT: 'fas fa-comment',
    POST_LIKE: 'fas fa-heart',
    COMMENT_REPLY: 'fas fa-reply',
    HOT_POST: 'fas fa-fire',
  };
  return icons[type] || 'fas fa-bell';
};

const truncateMessage = (message) => {
  if (message && message.length > 80) {
    return message.substring(0, 80) + '...';
  }
  return message || '';
};

const formatTime = (dateString) => {
  if (Array.isArray(dateString)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
    dateString = new Date(year, month - 1, day, hour, minute, second);
  }

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
  background: var(--color-white);
  border: 1px solid var(--color-bg-light);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.1);
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
  border-bottom: 1px solid var(--color-bg-light);
  background: var(--color-white);
}

.dropdown-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}

.mark-all-read-btn {
  font-size: 0.8rem;
  color: var(--color-main);
  font-weight: 600;
  background: none;
  border: 1px solid var(--color-main);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-all-read-btn:hover:not(:disabled) {
  background: var(--color-main);
  color: var(--color-white);
}

.mark-all-read-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-light);
  border-color: var(--color-light);
}

.mark-all-read-btn.loading {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.unread-count {
  padding: 0.75rem 1.5rem;
  font-size: 0.8rem;
  color: var(--color-sub);
  border-bottom: 1px solid var(--color-bg-light);
  background: var(--color-bg-light);
}

.dropdown-list {
  max-height: 320px;
  overflow-y: auto;
  background: var(--color-white);
}

.notification-items {
  position: relative;
}

.dropdown-notification-item {
  position: relative;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-bg-light);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-white);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.dropdown-notification-item:hover {
  background: var(--color-bg-light);
}

.dropdown-notification-item:last-child {
  border-bottom: none;
}

.dropdown-notification-item.unread {
  background: var(--color-white);
  border-left: 3px solid var(--color-main);
}

.dropdown-notification-item.mark-as-read {
  background: rgba(45, 51, 107, 0.05) !important;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.2s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.notification-move {
  transition: transform 0.2s ease;
}

.item-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-weight: 600;
  font-size: 1rem;
}

.item-icon.type-POST_COMMENT {
  background: #10b981; /* 녹색 - 댓글 */
}

.item-icon.type-POST_LIKE {
  background: #ef4444; /* 빨간색 - 좋아요 */
}

.item-icon.type-HOT_POST {
  background: #f59e0b; /* 주황색 - 인기글 */
}

.item-icon.type-COMMENT_REPLY {
  background: #8b5cf6; /* 보라색 - 댓글 답글 */
}

.item-icon.type-SYSTEM {
  background: var(--color-sub); /* 시스템 알림 */
}

.item-icon.type-INFO {
  background: var(--color-main); /* 일반 정보 */
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
  color: var(--color-main);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.25;
}

.item-message {
  color: var(--color-sub);
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
  color: var(--color-light);
  font-size: 0.7rem;
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
  color: var(--color-main);
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.empty-desc {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin: 0;
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
