import { useAuthStore } from '@/stores/useAuthStore';
import { useModalStore } from '@/stores/useModalStore';
import { useToast } from '@/composables/useToast';
import router from '@/router';

export async function authGuard(to, from, next) {
  const authStore = useAuthStore();
  const modalStore = useModalStore();
  const { showToast } = useToast();

  const requiresAuth = to.meta.requiresAuth;
  const isLoggedIn = authStore.isAuthenticated;
  const isGuestOnly = to.meta.guestOnly === true;

  // 소셜 회원가입 미완료 강제 이동
  const signupPending = localStorage.getItem('signupPending') === 'true';
  const SIGNUP_PATH = '/login/signup';
  const SIGNUP_WHITELIST = [SIGNUP_PATH];
  if (signupPending && !SIGNUP_WHITELIST.includes(to.path)) {
    showToast('추가 정보를 입력해주세요.', 'warning');
    next({ path: SIGNUP_PATH, query: { socialSignup: 'true' } });
    return;
  }

  // 로그인 안 한 유저가 인증 필요한 페이지 접근 시
  if (requiresAuth && !isLoggedIn) {
    const confirmed = await modalStore.showModal(
      '로그인이 필요한 기능입니다.\n로그인 하시겠습니까?'
    );

    if (confirmed) {
      next({ path: '/login', query: { redirect: to.fullPath } });
    } else {
      const fallback = from.fullPath && from.fullPath !== to.fullPath ? from.fullPath : '/';
      router.replace(fallback);
      next(false);
    }
    return;
  }

  // 로그인한 유저가 로그인/회원가입 페이지 접근 시
  if (isGuestOnly && isLoggedIn) {
    next('/');
    return;
  }

  next();
}
