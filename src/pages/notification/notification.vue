<template>
  <div class="notification-page">
    <LoadingSpinner v-if="isLoading" />

    <ErrorAlert v-else-if="error" :message="error" />

    <div v-else class="notification-container">
      <NotificationFilter
        v-model:search-query="searchQuery"
        v-model:selected-filter="selectedFilter"
        v-model:sort-by="sortBy"
        @filter="filterAndSortNotifications"
      />

      <div class="notification-content">
        <NotificationActions :filtered-count="filteredNotifications.length" />
        <NotificationList
          :notifications="paginatedNotifications"
          @notification-click="viewNotification"
        />
        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import router from '@/router';

import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import NotificationFilter from '@/components/notification/NotificationFilter.vue';
import NotificationActions from '@/components/notification/NotificationActions.vue';
import NotificationList from '@/components/notification/NotificationList.vue';

const isLoading = ref(false);
const error = ref('');
const notifications = ref([]);
const searchQuery = ref('');
const selectedFilter = ref('');
const sortBy = ref('date-desc');
const currentPage = ref(1);
const itemsPerPage = 15;

const filteredNotifications = computed(() => {
  let filtered = [...notifications.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (notification) =>
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
    );
  }

  if (selectedFilter.value) {
    if (selectedFilter.value === 'unread') {
      filtered = filtered.filter((notification) => !notification.isRead);
    } else {
      filtered = filtered.filter((notification) => notification.type === selectedFilter.value);
    }
  }

  switch (sortBy.value) {
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'type-desc':
      filtered.sort((a, b) => a.type.localeCompare(b.type));
      break;
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage);
});

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredNotifications.value.slice(start, start + itemsPerPage);
});

const fetchNotifications = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    // 임시 데이터 - 실제로는 API에서 가져와야 함
    const mockNotifications = [];

    notifications.value = mockNotifications;
    currentPage.value = 1;
  } catch (err) {
    error.value = '알림을 불러오는데 실패했습니다.';
    console.error('Notifications fetch error:', err);
  } finally {
    isLoading.value = false;
  }
};

const filterAndSortNotifications = () => {
  currentPage.value = 1;
};

const viewNotification = (notification) => {
  console.log('알림 클릭:', notification);
  // 실제로는 알림 관련 페이지로 이동하거나 읽음 처리
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  padding: 1rem;
}

.notification-container {
  max-width: 375px;
  margin: 0 auto;
  width: 100%;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
