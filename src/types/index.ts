export type BookCategory = 
  | '문학/소설'
  | '인문/철학'
  | '에세이/이민'
  | '경제/자기계발'
  | '사회/과학'
  | '원서/영문학';

export type CalgaryArea = 
  | '전체'
  | '다운타운 (Downtown)'
  | '켄싱턴 (Kensington)'
  | '벨트라인 (17th Ave SW)'
  | 'NW 크로우풋'
  | 'SW 치눅';

export interface BookClub {
  id: string;
  title: string;
  bookTitle: string;
  author: string;
  publisher?: string;
  category: BookCategory;
  coverImage: string;
  tagline: string;
  description: string;
  whyThisBook: string;
  
  // Host
  hostUserId?: string; // 모임을 개설한 호스트 회원 ID
  hostName: string;
  hostRole: string;
  hostAvatar: string;
  hostBio: string;
  isOfficialHost: boolean; // 운영자 직접 운영 vs 일반/인증 호스트
  
  // Schedule & Venue
  locationType: 'in_person' | 'online';
  area: CalgaryArea;
  venueName: string;
  venueAddress: string;
  parkingInfo: string;
  dateTime: string;
  frequency: string;
  duration: string;
  
  // Capacity & Pricing
  maxSeats: number;
  currentSeats: number;
  feeCAD: number;
  status: 'open' | 'almost_full' | 'closed' | 'cancelled';
  cancelReason?: string;
  
  // Program Details
  discussionTopics: string[];
  shareDiscussionTopics?: boolean; // 호스트가 발제 질문을 사전에 공개할지 여부 (기본값: true)
  preparationGuide: string;
  tags: string[];
}

export interface User {
  id: string;
  username: string; // ID used for login (e.g. chapter85330, calgary_host, calgary_reader)
  password?: string;
  name: string;
  email: string;
  phone: string; // 연락처 필수 입력사항
  gender?: '여성' | '남성' | '기타' | string; // 회원 성별 (관리자 확인 가능)
  role: 'admin' | 'host' | 'user';
  createdAt: string; // 언제 가입했는지
  status: 'active' | 'suspended';
  avatar?: string;
}

export interface RSVPRecord {
  id: string;
  userId?: string;
  clubId: string;
  clubTitle: string;
  bookTitle: string;
  author: string;
  coverImage: string;
  dateTime: string;
  venueName: string;
  venueAddress: string;
  locationType: 'in_person' | 'online';
  participantName: string;
  email: string;
  phone: string;
  motive?: string;
  userNotes?: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled';
  paymentMethod?: string;
  paymentAmountCAD?: number;
  paidAt?: string;
}

export interface HostApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  proposedBook: string;
  proposedAuthor: string;
  preferredArea: string;
  topicIdea: string;
  motivation: string;
  appliedAt: string;
}


