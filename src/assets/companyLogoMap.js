const keywordToLogoMap = {
  흥국: 'heungkuk.png',
  하나: 'hana.png',
  국민: 'kb.png',
  KB: 'kb.png',
  신한: 'shinhan.png',
  농협: 'nh.png',
  NH: 'nh.png',
  우리: 'woori.png',
  교보: 'kyobo.png',
  삼성: 'samsung.png',
  한화: 'hanwha.png',
  키움: 'kiwoom.png',
  다올: 'daol.png',
  디비: 'db.png',
  DB: 'db.png',
  카카오: 'kakao.png',
  토스: 'toss.png',
  IBK: 'ibk.png',
  중소기업은행: 'ibk.png',
  SC: 'sc.png',
  스탠다드차타드: 'sc.png',
  산업은행: 'kdb.png',
  KDB: 'kdb.png',
  애큐온: 'aqoon.png',
  부산: 'busan.png',
  광주: 'gwangju.png',
  전북: 'jeonbuk.png',
  제주: 'jeju.png',
  수협: 'suhyup.png',
  유안타: 'yuanta.png',
  유진: 'eugene.png',
  OK: 'ok.png',
  SBI: 'sbi.png',
  OSB: 'osb.png',
  JT: 'jt.png',
  케이뱅크: 'kbank.png',
  신영: 'shinyoung.png',
};

export function resolveCompanyLogo(kor_co_nm) {
  for (const keyword in keywordToLogoMap) {
    if (kor_co_nm.includes(keyword)) {
      return keywordToLogoMap[keyword];
    }
  }
  return 'default.png';
}
