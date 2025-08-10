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
    </button>

    <!-- 드롭다운 -->
    <NotificationDropdown
      :isOpen="isDropdownOpen"
      :notifications="notifications"
      :unreadCount="unreadCount"
      @close="closeDropdown"
      @markAllAsRead="$emit('markAllAsRead')"
      @markAsRead="$emit('markAsRead', $event)"
      @viewAll="handleViewAll"
      @notificationClick="handleNotificationClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import NotificationDropdown from './NotificationDropdown.vue';

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['markAllAsRead', 'markAsRead', 'notificationClick']);

const router = useRouter();
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleViewAll = () => {
  closeDropdown();
  router.push('/notifications');
};

const handleNotificationClick = (notification) => {
  emit('notificationClick', notification);
  closeDropdown();
};
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
}

.notification-button:hover {
  color: var(--color-main);
}

.notification-button.active {
  color: var(--color-main);
}

.notification-button svg {
  width: 24px;
  height: 24px;
  color: var(--color-main);
}
</style>
