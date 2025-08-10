<template>
  <div class="demo-page">
    <!-- 상단 네비게이션 바 (모바일 기준) -->
    <nav class="mobile-nav">
      <div class="nav-left">
        <h1>FinMate</h1>
      </div>

      <div class="nav-right">
        <!-- 알림 버튼 컴포넌트 -->
        <NotificationButton
          :notifications="notifications"
          :unreadCount="unreadCount"
          @markAllAsRead="markAllAsRead"
          @markAsRead="markSingleAsRead"
          @notificationClick="handleNotificationClick"
        />
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <h2>Welcome to FinMate</h2>
      <p>Click the notification bell in the top right to see the dropdown demo.</p>

      <!-- 알림 생성 테스트 버튼들 -->
      <div class="test-buttons">
        <button @click="addTestNotification('success')" class="test-btn success">
          Add Success Notification
        </button>
        <button @click="addTestNotification('warning')" class="test-btn warning">
          Add Warning Notification
        </button>
        <button @click="addTestNotification('error')" class="test-btn error">
          Add Error Notification
        </button>
        <button @click="addTestNotification('info')" class="test-btn info">
          Add Info Notification
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import NotificationButton from '../notification/components/NotificationButton.vue';

const notifications = ref([
  {
    id: 1,
    title: 'Storage Almost Full',
    message: 'Your storage is 85% full. Consider upgrading your plan.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 2,
    title: 'New Feature Available',
    message: 'Check out our new dashboard analytics feature.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: 3,
    title: 'Connection Failed',
    message: 'Unable to sync your data. Please check your connection.',
    type: 'error',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
]);

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.isRead).length;
});

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.isRead = true;
  });
};

const markSingleAsRead = (notification) => {
  const index = notifications.value.findIndex((n) => n.id === notification.id);
  if (index !== -1) {
    notifications.value[index].isRead = true;
  }
};

const handleNotificationClick = (notification) => {
  console.log('Notification clicked:', notification);
  markSingleAsRead(notification);
};

const addTestNotification = (type) => {
  const newId = Math.max(...notifications.value.map((n) => n.id)) + 1;
  const titles = {
    success: 'Operation Successful',
    warning: 'Warning Alert',
    error: 'Error Occurred',
    info: 'Information Update',
  };
  const messages = {
    success: 'Your action was completed successfully.',
    warning: 'Please check this warning message.',
    error: 'An error has occurred, please try again.',
    info: 'Here is some important information for you.',
  };

  notifications.value.unshift({
    id: newId,
    title: titles[type],
    message: messages[type],
    type: type,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
};
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: #0f0f23;
  color: #e5e7eb;
}

.mobile-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #1a1a3a;
  border-bottom: 1px solid #2a2a4a;
}

.nav-left h1 {
  color: #e5e7eb;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.main-content {
  padding: 2rem 1rem;
  max-width: 768px;
  margin: 0 auto;
}

.main-content h2 {
  margin: 0 0 1rem 0;
  color: #e5e7eb;
}

.main-content p {
  color: #9ca3af;
  margin-bottom: 2rem;
}

.test-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
}

.test-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-btn.success {
  background: #10b981;
  color: white;
}

.test-btn.success:hover {
  background: #059669;
}

.test-btn.warning {
  background: #f59e0b;
  color: white;
}

.test-btn.warning:hover {
  background: #d97706;
}

.test-btn.error {
  background: #ef4444;
  color: white;
}

.test-btn.error:hover {
  background: #dc2626;
}

.test-btn.info {
  background: #3b82f6;
  color: white;
}

.test-btn.info:hover {
  background: #2563eb;
}

@media (max-width: 375px) {
  .mobile-nav {
    padding: 0.75rem;
  }

  .nav-left h1 {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 1.5rem 1rem;
  }

  .test-buttons {
    gap: 0.75rem;
  }
}
</style>
