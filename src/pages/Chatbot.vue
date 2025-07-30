<template>
  <div class="flex flex-col h-[80vh] max-w-4xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
    <div class="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 border-b border-gray-200">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 text-lg">
          🤖
        </div>
        <div>
          <h5 class="text-lg font-semibold mb-0">핀메이트 AI 어시스턴트</h5>
          <small class="text-blue-100">금융 상담 도우미</small>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 bg-gray-50" ref="messagesContainer">
      <div v-if="messages.length === 0" class="text-center py-8">
        <div class="text-6xl text-blue-500 mb-4">💬</div>
        <h6 class="text-lg font-semibold text-gray-800 mb-2">안녕하세요! 핀메이트 AI입니다</h6>
        <p class="text-gray-500">금융 상품이나 투자에 대해 궁금한 것이 있으면 언제든 물어보세요!</p>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        class="mb-4 flex"
        :class="{ 'justify-end': message.isUser, 'justify-start': !message.isUser }"
      >
        <div class="max-w-[70%] px-4 py-3 rounded-2xl relative"
             :class="message.isUser 
               ? 'bg-blue-500 text-white rounded-br-md' 
               : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'"
        >
          <div class="leading-relaxed">{{ message.text }}</div>
          <div class="text-xs opacity-70 mt-1">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div v-if="isTyping" class="mb-4 flex justify-start">
        <div class="max-w-[70%] px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-white border-t border-gray-200">
      <div class="flex gap-2">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          type="text"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="메시지를 입력하세요..."
          :disabled="isTyping"
        />
        <button
          @click="sendMessage"
          class="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          :disabled="!userInput.trim() || isTyping"
        >
          ↗️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const messages = ref([])
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

const sendMessage = async () => {
  if (!userInput.value.trim()) return

  const userMessage = {
    id: Date.now(),
    text: userInput.value,
    isUser: true,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const currentInput = userInput.value
  userInput.value = ''

  await scrollToBottom()

  // 봇 응답 시뮬레이션
  isTyping.value = true
  
  setTimeout(async () => {
    const botResponse = {
      id: Date.now() + 1,
      text: getBotResponse(currentInput),
      isUser: false,
      timestamp: new Date()
    }

    messages.value.push(botResponse)
    isTyping.value = false
    await scrollToBottom()
  }, 1500)
}

const getBotResponse = (input) => {
  const responses = {
    default: "죄송합니다. 잘 이해하지 못했어요. 금융 상품이나 투자에 대해 더 구체적으로 질문해 주세요.",
    greeting: ["안녕하세요", "hi", "hello", "안녕"].some(word => input.toLowerCase().includes(word)) 
      ? "안녕하세요! 핀메이트 AI입니다. 금융 상담이 필요하시면 언제든 말씀해 주세요!" : null,
    savings: ["예금", "적금", "저축"].some(word => input.includes(word))
      ? "예금 상품에 관심이 있으시군요! 현재 금리가 높은 정기예금과 자유적금 상품들을 추천해 드릴 수 있어요. 어떤 조건을 우선시하시나요?" : null,
    investment: ["투자", "펀드", "주식"].some(word => input.includes(word))
      ? "투자에 관심이 있으시네요! 먼저 WMTI 투자성향 검사를 받아보시는 것을 추천드려요. 본인의 투자 성향에 맞는 상품을 찾을 수 있습니다." : null,
    wmti: ["wmti", "성향", "검사"].some(word => input.includes(word))
      ? "WMTI는 투자자의 성향을 파악하는 검사입니다. 20개의 간단한 문항으로 본인의 투자 성향을 알아볼 수 있어요. 검사를 시작해 보시겠어요?" : null
  }

  return responses.greeting || responses.savings || responses.investment || responses.wmti || responses.default
}

const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  // 초기 환영 메시지 (옵션)
  // const welcomeMessage = {
  //   id: Date.now(),
  //   text: "안녕하세요! 핀메이트 AI입니다. 무엇을 도와드릴까요?",
  //   isUser: false,
  //   timestamp: new Date()
  // }
  // messages.value.push(welcomeMessage)
})
</script>

<style scoped>
/* 스크롤바 스타일링 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .h-\[80vh\] {
    height: 100vh;
  }
  
  .rounded-xl {
    border-radius: 0;
  }
  
  .max-w-\[70\%\] {
    max-width: 85%;
  }
}
</style>