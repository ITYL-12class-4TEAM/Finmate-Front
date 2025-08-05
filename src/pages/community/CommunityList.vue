<template>
  <div class="community-list">
    <!-- 상단: 글 작성 버튼 -->
    <div class="top-bar">
      <button class="write-button" @click="goToWritePage">+ 글 작성</button>
    </div>

    <!-- 금융 성향 필터 -->
    <!-- <section class="filter-section">
      <div class="filter-label">금융 성향</div>
      <div class="tendency-group">
        <button
          v-for="option in tendencyOptions"
          :key="option"
          class="tendency-button"
          :class="{ selected: selectedTendency.includes(option) }"
          @click="toggleTendency(option)"
        >
          {{ option }}
        </button>
      </div>
    </section> -->

    <!-- 상품군 & 속성 필터 -->
    <section class="filter-section">
      <!-- 상품군 -->
      <div class="filter-group">
        <div class="filter-label">상품군</div>
        <div class="tag-list">
          <button
            v-for="tag in productTags"
            :key="tag"
            class="tag-button"
            :class="{ selected: selectedProducts.includes(tag) }"
            @click="toggleProduct(tag)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- 게시글 목록 -->
    <section class="post-list">
      <p v-if="filteredPosts.length === 0" class="empty-message">조건에 맞는 게시글이 없습니다.</p>
      <PostCard
        v-for="post in filteredPosts"
        v-else
        :key="post.id"
        :post="post"
        @click="goToDetailPage(post.id)"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPostsAPI } from '@/api/posts';
import { mockPosts } from './communityMock';
import PostCard from '@/components/community/PostCard.vue';

const router = useRouter();
const posts = ref([]);
const boardId = 1; // 자유게시판

// 게시글 목록 불러오기
// 테스트용 mock 전환용 flag
const useMock = false;

const fetchPosts = async () => {
  try {
    posts.value = useMock ? mockPosts : await getPostsAPI(boardId);
  } catch (e) {
    console.error('게시물 불러오기 실패:', e);
    alert('게시물을 불러오지 못했습니다.');
  }
};

onMounted(fetchPosts);

// 필터 옵션
// const tendencyOptions = ['A', 'I', 'P', 'B', 'W', 'M', 'C', 'L'];
const productTags = ['예금', '적금', '펀드', '보험'];

const selectedTendency = ref([]);
const selectedProducts = ref([]);

// 공통 토글 헬퍼
const toggleItem = (listRef, item) => {
  const index = listRef.value.indexOf(item);
  index === -1 ? listRef.value.push(item) : listRef.value.splice(index, 1);
};

// 필터 선택 핸들러
// const toggleTendency = (t) => toggleItem(selectedTendency, t);
const toggleProduct = (t) => toggleItem(selectedProducts, t);

// 필터링 로직
const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const hasTendency =
      selectedTendency.value.length === 0 ||
      selectedTendency.value.every((t) => post.tendency.includes(t));
    const hasProduct =
      selectedProducts.value.length === 0 || selectedProducts.value.includes(post.productType);

    return hasTendency && hasProduct;
  });
});

// 라우팅
const goToWritePage = () => router.push({ name: 'CommunityWrite' });
const goToDetailPage = (id) => router.push({ name: 'CommunityDetail', params: { id } });
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.write-button {
  background-color: var(--color-sub);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.8rem;
}

.filter-section {
  padding: 16px;
  border: 2px solid var(--color-bg-light);
  border-radius: 20px;
  margin-bottom: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tendency-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tendency-button {
  width: 3rem;
  height: 2rem;
  border: 2px solid var(--color-light);
  border-radius: 10px;
  background-color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.tendency-button.selected {
  background-color: var(--color-light);
}

.filter-group {
  margin-bottom: 16px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-button {
  font-size: 0.8rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  border: 2px solid var(--color-bg-light);
  background-color: white;
  font-weight: 600;
}

.tag-button.selected {
  background-color: var(--color-light);
  border-color: var(--color-light);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
