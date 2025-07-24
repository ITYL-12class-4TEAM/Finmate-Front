<template>
  <div class="community-list">
    <!-- 상단: 글 작성 버튼 -->
    <div class="top-bar">
      <button class="write-button" @click="goToWritePage">+ 글 작성</button>
    </div>

    <!-- 금융 성향 필터 -->
    <section class="filter-section">
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
    </section>

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
      <!-- 속성 -->
      <div class="filter-group">
        <div class="filter-label">속성</div>
        <div class="tag-list">
          <button
            v-for="tag in typeTags"
            :key="tag"
            class="tag-button"
            :class="{ selected: selectedTypes.includes(tag) }"
            @click="toggleType(tag)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- 게시글 목록 -->
    <section class="post-list">
      <p v-if="filteredPosts.length === 0" class="empty-message">
        조건에 맞는 게시글이 없습니다.
      </p>
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="post-card"
        @click="goToDetailPage(post.id)"
      >
        <div class="post-card-inner">
          <h4 class="post-title">{{ post.title }}</h4>
          <p class="post-content">{{ post.content }}</p>
          <div class="post-meta">
            <div class="post-stats">
              <span aria-label="좋아요 수">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.0"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                {{ post.likes }}
              </span>
              <span aria-label="댓글 수">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.0"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                  />
                </svg>
                {{ post.comments }}
              </span>
            </div>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { getPosts } from '@/api/posts';

const router = useRouter();

const goToWritePage = () => {
  router.push({ name: 'CommunityWrite' });
};

const goToDetailPage = (id) => {
  router.push({ name: 'CommunityDetail', params: { id: id } });
};

const posts = ref([]);

const fetchPosts = async () => {
  try {
    // TODO: API 요청으로 게시물 GET
    posts.value = await getPosts();
    console.log('getPosts: ', posts.value);
    // posts.value = [
    //   {
    //     id: 1,
    //     title: '20대 직장인, 보험 뭐가 좋을까요?',
    //     content: '금리가 높은 편인가요? 조언 부탁드려요!',
    //     createdAt: '2025-07-23T14:40:00',
    //     likes: 1,
    //     comments: 10,
    //     tendency: 'APWC',
    //     productType: '보험',
    //     tag: '추천',
    //   },
    //   {
    //     id: 2,
    //     title: '적금과 청년도약계좌 차이점이 궁금해요',
    //     content: '둘 중 뭐가 더 나을까요? 의견이 궁금합니다~',
    //     createdAt: '2025-07-22T10:15:00',
    //     likes: 6,
    //     comments: 8,
    //     tendency: 'IBML',
    //     productType: '적금',
    //     tag: '질문',
    //   },
    //   {
    //     id: 3,
    //     title: '펀드 설명 부탁합니다',
    //     content:
    //       '펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?',
    //     createdAt: '2025-07-21T10:15:00',
    //     likes: 5,
    //     comments: 7,
    //     tendency: 'ABWL',
    //     productType: '펀드',
    //     tag: '자유',
    //   },
    // ];
  } catch (e) {
    console.log(e);
    alert('게시물을 불러오지 못했습니다.');
  }
};

onMounted(() => {
  fetchPosts();
});

const tendencyOptions = ['A', 'I', 'P', 'B', 'W', 'M', 'C', 'L'];
const productTags = ['예금', '적금', '펀드', '보험'];
const typeTags = ['추천', '질문', '경험', '자유'];

const selectedTendency = ref([]);
const selectedProducts = ref([]);
const selectedTypes = ref([]);

const toggleTendency = (option) => {
  selectedTendency.value.includes(option)
    ? (selectedTendency.value = selectedTendency.value.filter(
        (t) => t !== option
      ))
    : selectedTendency.value.push(option);
};

const toggleProduct = (tag) => {
  selectedProducts.value.includes(tag)
    ? (selectedProducts.value = selectedProducts.value.filter((t) => t !== tag))
    : selectedProducts.value.push(tag);
};

const toggleType = (tag) => {
  selectedTypes.value.includes(tag)
    ? (selectedTypes.value = selectedTypes.value.filter((t) => t !== tag))
    : selectedTypes.value.push(tag);
};

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const tendencyMatch =
      selectedTendency.value.length === 0 ||
      selectedTendency.value.every((t) => post.tendency.includes(t));
    const productMatch =
      selectedProducts.value.length === 0 ||
      selectedProducts.value.includes(post.productType);
    const typeMatch =
      selectedTypes.value.length === 0 ||
      selectedTypes.value.includes(post.tag);
    return tendencyMatch && productMatch && typeMatch;
  });
});

// const formatDate = (dateStr) => {
//   const now = dayjs();
//   const postDate = dayjs(dateStr);
//   return postDate.isSame(now, 'day')
//     ? postDate.format('HH:mm')
//     : postDate.format('MM/DD');
// };

// 날짜 배열 -> "MM/DD HH:mm" 포맷 문자열로 변환
const formatDate = (arr) => {
  if (!arr || arr.length < 6) return '';
  const [year, month, day, hour, minute] = arr;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};
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
.post-card {
  border: 2px solid var(--color-light);
  border-radius: 16px;
  padding: 1rem;
  height: 8.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.post-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.post-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
.post-content {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}
.post-stats {
  display: flex;
  gap: 1rem;
}
.post-stats span {
  display: flex;
  gap: 0.2rem;
  align-items: center;
  justify-content: center;
}
.post-stats svg {
  width: 1.2rem;
}

.empty-message {
  text-align: center;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2rem;
}
</style>
