export const mockPosts = [
  {
    id: 1,
    title: '20대 직장인, 보험 뭐가 좋을까요?',
    content: '금리가 높은 편인가요? 조언 부탁드려요!',
    createdAt: [2025, 7, 25, 14, 7, 12],
    likes: 1,
    comments: 10,
    tendency: 'APWC',
    productType: '보험',
  },
  {
    id: 2,
    title: '적금과 청년도약계좌 차이점이 궁금해요',
    content: '둘 중 뭐가 더 나을까요? 의견이 궁금합니다~',
    createdAt: [2025, 7, 25, 9, 11, 12],
    likes: 6,
    comments: 8,
    tendency: 'IBML',
    productType: '적금',
  },
  {
    id: 3,
    title: '펀드 설명 부탁합니다',
    content:
      '펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?펀드가 뭔지 잘 모르겠습니다. 구체적으로 잘 설명해주실 분 있나요?',
    createdAt: [2025, 7, 24, 11, 57, 12],
    likes: 5,
    comments: 7,
    tendency: 'ABWL',
    productType: '펀드',
  },
];

export const mockPost = {
  id: 1,
  authorImage: '/authorImg.jpg',
  nickname: '곰돌이',
  createdAt: [2025, 7, 25, 14, 7, 12],
  title: '20대 직장인, 적금 뭐가 좋을까요?',
  content:
    '안녕하세요! 올해 사회초년생이 된 20대입니다. 매달 일정 금액을 적금으로 넣으려고 하는데, 어떤 상품이 좋을지 고민이에요. 금리도 중요하지만 중도해지 조건이나 우대금리 조건도 궁금합니다. 경험 있으신 분들 조언 부탁드려요!',
  imageUrl: '',
  tags: ['적금', '추천'],
  likes: 13,
  scraps: 6,
};

export const mockComments = [
  {
    id: 1,
    nickname: '곰돌이',
    content: '댓글 많이 부탁드립니다!',
    createdAt: [2025, 7, 25, 14, 34, 12],
    isMine: true,
    liked: false,
    likeCount: 3,
  },
  {
    id: 2,
    nickname: '초보저축',
    content: '신한은행 금리 얼마인가요?',
    createdAt: [2025, 7, 25, 21, 3, 12],
    isMine: false,
    liked: true,
    likeCount: 1,
  },
];
