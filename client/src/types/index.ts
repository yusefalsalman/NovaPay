export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  accountNumber: string;
  currency: string;
  balance: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  accountNumber: string;
  balance: number;
  user?: {
    id: string;
    fullName: string;
    email: string;
    accountNumber: string;
    balance: number;
    currency: string;
  };
}

export interface TransferRequest {
  recipientIdentifier: string; // Account Number or Email
  amount: number;
  description?: string;
}

export interface TransferResponse {
  transactionId: string;
  referenceId: string;
  amount: number;
  recipientAccountNumber: string;
  remainingBalance: number;
  createdAt: string;
}

export type TransactionType = 'TopUp' | 'Transfer';
export type EntryType = 'Debit' | 'Credit';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed';

export interface TransactionHistoryItem {
  ledgerEntryId: string;
  transactionId: string;
  referenceId: string;
  transactionType: TransactionType;
  entryType: EntryType;
  amount: number;
  balanceAfter: number;
  description?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amountInCents: number;
}
