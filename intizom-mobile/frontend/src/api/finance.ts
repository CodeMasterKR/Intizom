import { apiClient } from './client';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'health' | 'education'
  | 'entertainment' | 'shopping' | 'utilities' | 'other_expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTransactionDto {
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  note?: string;
}

export interface MonthStat {
  month: number;
  income: number;
  expense: number;
  balance: number;
}

export const financeApi = {
  getTransactions: async (year: number, month: number): Promise<Transaction[]> => {
    const { data } = await apiClient.get('/finance/transactions', { params: { year, month } });
    return data;
  },

  create: async (dto: CreateTransactionDto): Promise<Transaction> => {
    const { data } = await apiClient.post('/finance/transactions', dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> => {
    const { data } = await apiClient.patch(`/finance/transactions/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/finance/transactions/${id}`);
  },

  getStats: async (year: number): Promise<MonthStat[]> => {
    const { data } = await apiClient.get('/finance/stats', { params: { year } });
    return data;
  },
};
