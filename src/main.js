import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './assets/styles/common.css';

import 'bootstrap';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/useAuthStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 앱 초기화 시 인증 상태 복원
const authStore = useAuthStore();
authStore.initialize().then(() => {
  console.log('인증 상태 초기화 완료');
});

app.mount('#app');
