export interface DashboardBook {
  id: number;
  title: string;
  author: string;
  progress: number;
  category: string;
}

export interface DashboardExpense {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
}
