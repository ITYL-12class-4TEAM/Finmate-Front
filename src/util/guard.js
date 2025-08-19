import { useAuthStore } from '@/stores/useAuthStore';
import { useModalStore } from '@/stores/useModalStore';
import router from '@/router';

export async function authGuard(to, from, next) {
  const authStore = useAuthStore();
  const modalStore = useModalStore();

  const requiresAuth = to.meta.requiresAuth;
  const isLoggedIn = authStore.isAuthenticated;
  const isGuestOnly = to.meta.guestOnly === true;

  const needsAdditionalInfo =
    authStore.needsAdditionalInfo ||
    (isLoggedIn &&
      authStore.user &&
      (!authStore.user.nickname || !authStore.user.birthDate || !authStore.user.gender));

  if (needsAdditionalInfo) {
    const allowedPaths = ['/login/signup', '/signup', '/auth/oauth2/redirect'];

    if (!allowedPaths.includes(to.path)) {
      next({
        path: '/login/signup',
        query: {
          socialSignup: 'true',
          name: authStore.user?.username,
          email: authStore.user?.email,
          required: 'true',
          from: to.path,
        },
        replace: true,
      });
      return;
    }
    next();
    return;
  }

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

  if (isGuestOnly && isLoggedIn) {
    if (to.path === '/login/signup' || to.path === '/signup') {
      next();
      return;
    }

    next('/');
    return;
  }

  next();
}
