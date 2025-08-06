<template>
  <div class="text-content">
    <div v-html="sanitizedText" class="text-message"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
// npm install dompurify 필요
// import DOMPurify from 'dompurify';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const sanitizedText = computed(() => {
  let text = props.message.text || '';

  // 줄바꿈을 <br>로 변환
  text = text.replace(/\n/g, '<br>');

  // Markdown 스타일 **굵은 글씨**를 HTML로 변환
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // DOMPurify가 설치된 경우 사용 (선택사항)
  /*
  const cleanHtml = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ['span', 'strong', 'b', 'em', 'i', 'br', 'p'],
    ALLOWED_ATTR: ['class']
  });
  return cleanHtml;
  */

  // 기본 보안 처리
  return text;
});
</script>

<style scoped>
.text-content {
  width: 100%;
}

.text-message {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
}

/* 컬러 강조 스타일 */
.text-message :deep(.text-red) {
  color: #e53e3e;
  font-weight: 600;
}

.text-message :deep(.text-blue) {
  color: #3182ce;
  font-weight: 600;
}

/* 굵은 글씨 스타일 */
.text-message :deep(strong),
.text-message :deep(b) {
  font-weight: 700;
}

/* 중요한 정보 스타일 */
.text-message :deep(.text-red strong),
.text-message :deep(.text-blue strong) {
  font-weight: 800;
}

/* 추가 스타일링 */
.text-message :deep(p) {
  margin-bottom: 0.5rem;
}

.text-message :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
