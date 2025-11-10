// Translation strings for the customer intake form
// Supports multiple languages for badminton center customers

export type Language = 'en' | 'ko' | 'zh';

export interface Translations {
  // Header
  formTitle: string;
  
  // Customer section
  customerDetails: string;
  fullName: string;
  contactNumber: string;
  emailAddress: string;
  
  // Racket section
  racketDetails: string;
  racketBrand: string;
  racketModel: string;
  stringTypePreference: string;
  
  // Service section
  serviceType: string;
  standardService: string;
  standardServiceDesc: string;
  premiumService: string;
  premiumServiceDesc: string;
  
  // Notes section
  additionalNotes: string;
  
  // Actions
  submitOrder: string;
  submitting: string;
  
  // Success message
  thankYou: string;
  orderRecorded: string;
  readyForNext: string;
  
  // Placeholders
  enterFullName: string;
  enterPhoneNumber: string;
  enterEmail: string;
  selectBrand: string;
  enterRacketModel: string;
  selectStringType: string;
  additionalNotesPlaceholder: string;
  
  // Brand options
  other: string;
  
  // String options
  otherStringType: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    formTitle: 'Customer & Racket Information',
    customerDetails: 'Customer Details',
    fullName: 'Full Name',
    contactNumber: 'Contact Number',
    emailAddress: 'Email Address',
    racketDetails: 'Racket Details',
    racketBrand: 'Racket Brand',
    racketModel: 'Racket Model',
    stringTypePreference: 'String Type Preference',
    serviceType: 'Service Type',
    standardService: 'Standard Service',
    standardServiceDesc: 'Regular stringing service',
    premiumService: 'Premium Service',
    premiumServiceDesc: 'Express + quality guarantee',
    additionalNotes: 'Additional Notes',
    submitOrder: 'Submit Order',
    submitting: 'Submitting...',
    thankYou: 'Thank You!',
    orderRecorded: 'Your order has been recorded.',
    readyForNext: 'Ready for next submission…',
    enterFullName: 'Enter your full name',
    enterPhoneNumber: 'Enter your phone number',
    enterEmail: 'Enter your email (optional)',
    selectBrand: 'Select brand',
    enterRacketModel: 'Enter racket model',
    selectStringType: 'Select string type (optional)',
    additionalNotesPlaceholder: 'Any special instructions or requests...',
    other: 'Other',
    otherStringType: 'Other (specify in notes)',
  },
  ko: {
    formTitle: '고객 및 라켓 정보',
    customerDetails: '고객 정보',
    fullName: '성명',
    contactNumber: '연락처',
    emailAddress: '이메일 주소',
    racketDetails: '라켓 정보',
    racketBrand: '라켓 브랜드',
    racketModel: '라켓 모델',
    stringTypePreference: '스트링 타입',
    serviceType: '서비스 유형',
    standardService: '표준 서비스',
    standardServiceDesc: '일반 스트링 서비스',
    premiumService: '프리미엄 서비스',
    premiumServiceDesc: '빠른 배송 + 품질 보증',
    additionalNotes: '추가 사항',
    submitOrder: '주문 제출',
    submitting: '제출 중...',
    thankYou: '감사합니다!',
    orderRecorded: '주문이 접수되었습니다.',
    readyForNext: '다음 주문 대기 중…',
    enterFullName: '성명을 입력하세요',
    enterPhoneNumber: '전화번호를 입력하세요',
    enterEmail: '이메일을 입력하세요 (선택사항)',
    selectBrand: '브랜드 선택',
    enterRacketModel: '라켓 모델을 입력하세요',
    selectStringType: '스트링 타입 선택 (선택사항)',
    additionalNotesPlaceholder: '특별한 요청사항이나 지시사항...',
    other: '기타',
    otherStringType: '기타 (비고란에 기재)',
  },
  zh: {
    formTitle: '客户和球拍信息',
    customerDetails: '客户信息',
    fullName: '姓名',
    contactNumber: '联系电话',
    emailAddress: '电子邮箱',
    racketDetails: '球拍信息',
    racketBrand: '球拍品牌',
    racketModel: '球拍型号',
    stringTypePreference: '球线类型',
    serviceType: '服务类型',
    standardService: '标准服务',
    standardServiceDesc: '常规穿线服务',
    premiumService: '高级服务',
    premiumServiceDesc: '快速 + 质量保证',
    additionalNotes: '附加说明',
    submitOrder: '提交订单',
    submitting: '提交中...',
    thankYou: '谢谢！',
    orderRecorded: '您的订单已记录。',
    readyForNext: '准备下一个提交…',
    enterFullName: '请输入您的姓名',
    enterPhoneNumber: '请输入您的电话号码',
    enterEmail: '请输入您的电子邮箱（可选）',
    selectBrand: '选择品牌',
    enterRacketModel: '请输入球拍型号',
    selectStringType: '选择球线类型（可选）',
    additionalNotesPlaceholder: '任何特殊说明或要求...',
    other: '其他',
    otherStringType: '其他（请在备注中说明）',
  },
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}
