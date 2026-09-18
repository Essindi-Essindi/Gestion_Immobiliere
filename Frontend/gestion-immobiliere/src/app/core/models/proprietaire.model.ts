export interface Proprietaire {
  id: string;
  userId: string;
  companyName?: string;
  siret?: string;
  address: Address;
  bankDetails?: BankDetails;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  subscriptionEndDate?: Date;
  propertiesCount: number;
  tenantsCount: number;
  monthlyRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  complement?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface BankDetails {
  iban: string;
  bic: string;
  accountHolder: string;
}

export type SubscriptionPlan = 'FREE' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export interface SubscriptionPlanDetails {
  name: SubscriptionPlan;
  price: number;
  maxProperties: number;
  maxTenants: number;
  features: string[];
}