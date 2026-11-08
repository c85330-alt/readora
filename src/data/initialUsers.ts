import { User, RSVPRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    username: 'readoraadmin',
    password: 'cksdn0315!',
    name: '리도라 관리자',
    email: 'readoraadmin@readora.com',
    phone: '403-888-0100',
    gender: '남성',
    role: 'admin',
    createdAt: '2026. 01. 01',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_RSVPS: RSVPRecord[] = [];
