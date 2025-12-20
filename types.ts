
export type PlanType = 'free' | 'starter' | 'pro';

export interface Plan {
  type: PlanType;
  name: string;
  price: string;
  maxProducts: number;
  maxAccounts: number;
  maxMessages?: number;
  hasAI: boolean;
  hasAudioAI: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  benefits: string;
  paymentMethod: string;
}

export interface User {
  email: string;
  isLoggedIn: boolean;
  plan: PlanType;
  messagesSent: number;
}

export interface WhatsAppAccount {
  id: string;
  number: string;
  status: 'connected' | 'disconnected';
  name: string;
  lastActivity?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export enum AppStatus {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  PRODUCT_CONFIG = 'PRODUCT_CONFIG',
  SIMULATOR = 'SIMULATOR',
  WHATSAPP_CONNECT = 'WHATSAPP_CONNECT',
  PRICING = 'PRICING',
  REPORTS = 'REPORTS'
}
