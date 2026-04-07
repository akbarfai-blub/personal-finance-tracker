export type Category = 'Food' | 'Transport' | 'Subscription' | 'Utilities' | 'Salary' | 'Other';

export interface Transaction {
    id: string;
    date: string;       // Format: YYYY-MM-DD
    amount: number;
    description: string;
    category: Category;
    type: 'income' | 'expense';
}