<template>
  <div ref="messagesContainer" class="messages-container">
    <WelcomeMessage v-if="messages.length === 0" :is-authenticated="isAuthenticated" />

    <MessageItem
      v-for="message in messages"
      :key="`message-${message.id}`"
      :message="message"
      @navigate-to-post="$emit('navigate-to-post', $event)"
      @navigate-to-more="$emit('navigate-to-more', $event)"
      @navigate-to-survey="$emit('navigate-to-survey')"
    />

    <TypingIndicator v-if="isTyping" />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import MessageItem from './MessageItem.vue';
import WelcomeMessage from './WelcomeMessage.vue';
import TypingIndicator from './TypingIndicator.vue';

defineProps({
  messages: Array,
  isTyping: Boolean,
  isAuthenticated: Boolean,
});

defineEmits(['navigate-to-post', 'navigate-to-more', 'navigate-to-survey']);

const messagesContainer = ref(null);

defineExpose({
  messagesContainer,
});
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--color-bg-light);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}
</style>
