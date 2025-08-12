<template>
  <div class="home">
    <BannerCarousel :items="banners" />
    <ProductList />
    <HotPostList />
  </div>
</template>

<script setup>
import ProductList from '@/components/home/ProductList.vue';
import HotPostList from '@/components/home/HotPostList.vue';
import BannerCarousel from '@/components/home/BannerCarousel.vue';

import wmtiImg from '@/assets/images/banner_wmti.png';
import productImg from '@/assets/images/banner_product.png';
import communityImg from '@/assets/images/banner_community.png';
import portfolioImg from '@/assets/images/banner_portfolio.png';

const banners = [
  {
    title: '나의 WMTI는 무엇일까?',
    subtitle: '5분 투자 성향 진단으로 맞춤형 금융상품을 추천받아보세요.',
    ctaText: '성향 진단하러 가기',
    to: { name: 'BasicSurvey' },
    bgGradient: 'linear-gradient(180deg, #FFF6E9 0%, #FFEAD2 100%)',
    illust: wmtiImg,
  },
  {
    title: '금융상품 한눈에 비교',
    subtitle: '예·적금을 깔끔 비교하고, 최적의 상품을 찾아보세요.',
    ctaText: '상품 검색하러 가기',
    to: { name: 'ProductDeposit' },
    bgGradient: 'linear-gradient(180deg, #E6F9F6 0%, #D9F0FB 100%)',
    illust: productImg,
  },
  {
    title: '커뮤니티에서 묻고 답해요',
    subtitle: '유저들의 경험담, 노하우, 꿀팁을 확인하세요.',
    ctaText: '커뮤니티 보러 가기',
    to: { name: 'CommunityList' },
    bgGradient: 'linear-gradient(180deg, #F2EEFC 0%, #E8E0FB 100%)',
    illust: communityImg,
  },
  {
    title: '나의 포트폴리오 확인해요',
    subtitle: '나의 자산을 관리하고, 비교 분석도 받아보세요.',
    ctaText: '포트폴리오 보러 가기',
    to: { name: 'Portfolio' },
    bgGradient: 'linear-gradient(180deg, #FFF1F1 0%, #FFE3E3 100%)',
    illust: portfolioImg,
  },
];
</script>

<style scoped>
.home {
  max-width: 430px;
  margin: 0 auto;
}
</style>
