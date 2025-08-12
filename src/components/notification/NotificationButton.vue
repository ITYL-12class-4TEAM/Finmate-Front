<!-- filepath: /c:/FinMate/Finmate-Front/src/components/notification/NotificationButton.vue -->
<template>
  <div class="notification-button-wrapper">
    <!-- 알림 버튼 -->
    <button class="notification-button" :class="{ active: isDropdownOpen }" @click="toggleDropdown">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="24"
        height="24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>

      <!-- 읽지 않은 알림 수 표시 -->
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 드롭다운 -->
    <NotificationDropdown
      :isOpen="isDropdownOpen"
      :notifications="notifications"
      :unreadCount="unreadCount"
      @close="closeDropdown"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/useNotificationStore';
import NotificationDropdown from './NotificationDropdown.vue';

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

onMounted(async () => {
  await notificationStore.fetchNotifications();
  await notificationStore.fetchUnreadCount();
  notificationStore.connectSSE();
});
</script>

<style scoped>
.notification-button-wrapper {
  position: relative;
}

.notification-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-main);
  padding: 4px;
  transition: color 0.2s ease;
}

.notification-button:hover {
  color: var(--color-sub);
}

.notification-button.active {
  color: var(--color-sub);
}

.notification-button svg {
  width: 24px;
  height: 24px;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
