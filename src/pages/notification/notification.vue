<template>
  <div class="notification-page">
    <div class="notification-header">
      <div class="header-left">
        <h1>알림</h1>
        <span class="notification-count">총 {{ notifications.length }}개 알림</span>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}개 읽지 않음</span>
      </div>
      <div class="header-actions">
        <select v-model="selectedType" @change="filterNotifications" class="filter-select">
          <option value="">전체</option>
          <option value="INFO">일반</option>
          <option value="SYSTEM">시스템</option>
          <option value="PRODUCT">상품</option>
        </select>
        <select v-model="selectedReadStatus" @change="filterNotifications" class="filter-select">
          <option value="">전체</option>
          <option value="false">읽지 않음</option>
          <option value="true">읽음</option>
        </select>
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-read">
          모두 읽음 처리
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>알림을 불러오는 중...</p>
    </div>

    <div v-else-if="notifications.length === 0" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="48"
        height="48"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      <h3>알림이 없습니다</h3>
      <p>새로운 알림이 오면 여기에 표시됩니다.</p>
    </div>

    <div v-else class="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">
          <!-- 일반 알림 -->
          <div v-if="notification.type === 'INFO'" class="icon-wrapper info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          <!-- 보안 알림 -->
          <div v-else-if="notification.type === 'SYSTEM'" class="icon-wrapper system">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>

          <!-- 상품 알림 -->
          <div v-else-if="notification.type === 'PRODUCT'" class="icon-wrapper product">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H3.75m0 0h15.75m0 0h.375c.621 0 1.125.504 1.125 1.125V6h-.75a.75.75 0 0 1-.75-.75V4.5m0 0h-15.75m0 0v-.375c0-.621.504-1.125 1.125-1.125h.375M6 2.25h1.5m0 0v-.375a.375.375 0 0 1 .375-.375H8.5m0 0h1.5m0 0v-.375a.375.375 0 0 1 .375-.375H11.25m0 0H12m0 0h.75m0 0v-.375a.375.375 0 0 1 .375-.375H13.5m0 0h1.5m0 0h.75m0 0v-.375a.375.375 0 0 1 .375-.375H16.5m0 0h.75m0 0v-.375a.375.375 0 0 1 .375-.375H18"
              />
            </svg>
          </div>

          <!-- 기본 알림 -->
          <div v-else class="icon-wrapper default">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
        </div>

        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>

        <div class="notification-actions">
          <div v-if="!notification.isRead" class="unread-indicator"></div>
          <button
            v-if="!notification.isRead"
            @click.stop="markSingleAsRead(notification)"
            class="read-btn"
          >
            읽음 처리
          </button>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="loadPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          이전
        </button>

        <button
          v-for="page in displayPages"
          :key="page"
          @click="loadPage(page)"
          :class="{ active: page === currentPage }"
          class="page-btn"
        >
          {{ page }}
        </button>

        <button
          @click="loadPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const router = useRouter();
const notificationStore = useNotificationStore();

const isLoading = ref(true);
const notifications = ref([]);
const selectedType = ref('');
const selectedReadStatus = ref('');

// 스토어 상태를 구독
const totalPages = computed(() => notificationStore.totalPages);
const currentPage = computed(() => notificationStore.currentPage);
const unreadCount = computed(() => notificationStore.unreadCount);

// 페이지네이션 표시 계산
const displayPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const range = 2;

  let start = Math.max(1, current - range);
  let end = Math.min(total, current + range);

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

onMounted(async () => {
  await loadNotifications();
});

const loadNotifications = async (page = 1) => {
  try {
    isLoading.value = true;
    const result = await notificationStore.fetchNotifications(
      page,
      20,
      selectedType.value || null,
      selectedReadStatus.value !== '' ? selectedReadStatus.value === 'true' : null
    );

    if (result.success) {
      notifications.value = notificationStore.notifications;
    } else {
      showToast('알림을 불러오는데 실패했습니다.', 'error');
    }
  } catch (error) {
    showToast('알림을 불러오는데 실패했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const filterNotifications = () => {
  loadNotifications(1);
};

const loadPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    loadNotifications(page);
  }
};

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    await markSingleAsRead(notification);
  }

  if (notification.link) {
    router.push(notification.link);
  }
};

const markSingleAsRead = async (notification) => {
  const result = await notificationStore.markAsRead(notification.id);
  if (result.success) {
    notification.isRead = true;
    showToast('알림을 읽음 처리했습니다.');
  }
};

const markAllAsRead = async () => {
  try {
    const result = await notificationStore.markAllAsRead();
    if (result.success) {
      notifications.value.forEach((n) => (n.isRead = true));
      showToast('모든 알림을 읽음 처리했습니다.');
    } else {
      showToast('알림 읽음 처리에 실패했습니다.', 'error');
    }
  } catch (error) {
    showToast('알림 읽음 처리에 실패했습니다.', 'error');
  }
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
.notification-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-header h1 {
  font-size: 1.5rem;
  color: var(--color-main);
  margin: 0;
}

.notification-count {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.unread-badge {
  display: inline-block;
  background: var(--color-accent);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-light);
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.mark-all-read {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.mark-all-read:hover {
  background: var(--color-sub);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-light);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.notification-item.unread {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-color: var(--color-main);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.1);
}

.notification-icon {
  flex-shrink: 0;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.icon-wrapper.info {
  background: #e3f2fd;
  color: #1976d2;
}

.icon-wrapper.system {
  background: #e8f5e8;
  color: #388e3c;
}

.icon-wrapper.product {
  background: #fff3e0;
  color: #f57c00;
}

.icon-wrapper.default {
  background: #f5f5f5;
  color: var(--color-main);
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
}

.notification-content p {
  margin: 0 0 0.75rem 0;
  color: var(--color-sub);
  font-size: 0.875rem;
  line-height: 1.5;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--color-light-text);
}

.notification-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  flex-shrink: 0;
}

.read-btn {
  background: transparent;
  color: var(--color-main);
  border: 1px solid var(--color-main);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.read-btn:hover {
  background: var(--color-main);
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-light);
  background: white;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-bg-light);
}

.page-btn.active {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-light);
  border-top: 4px solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-sub);
}

.empty-state svg {
  color: var(--color-light);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .notification-page {
    padding: 1rem;
  }

  .notification-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .filter-select {
    width: 100%;
  }

  .notification-item {
    padding: 1rem;
  }

  .notification-actions {
    align-items: center;
  }
}
</style>
