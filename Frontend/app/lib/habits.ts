import { api } from "./api";

export type HabitScheduleType = 'daily' | 'weekdays' | 'custom';

export interface Habit {
  _id: string;
  title: string;
  description: string;
  tags: string[];

  schedule: {
    type: HabitScheduleType;
    daysOfWeek: number[];
  };

  target: {
    count: number;
    unit: string;
  };

  timezone: string;
  startDate: string;
  endDate?: string;

  reminder: {
    enabled: boolean;
    time?: string;
  };

  color: string;
  isArchived: boolean;
  isPinned: boolean;
  currentStreak: number;
  longestStreak: number;

  createdAt: string;
  updatedAt: string;
}
export interface CreateHabitInput {
  title: string;
  description?: string;
  tags?: string[];

  schedule?: {
    type: HabitScheduleType;
    daysOfWeek?: number[];
  };

  target?: {
    count: number;
    unit?: string;
  };

  timezone?: string;
  startDate?: string;
  endDate?: string;

  reminder?: {
    enabled: boolean;
    time?: string;
  };

  color?: string;
  isPinned?: boolean;
}


export interface TodayHabit {
  habit: Habit;
  date: string;
  value: number;
  target: number;
  completed: boolean;
}

export interface HabitLog {
  _id: string;
  habit: string;
  user: string;
  date: string;
  value: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitProgressResponse {
  habit: Habit;
  log: HabitLog;
  completed: boolean;
}

export interface HabitDayStat {
  date: string;
  scheduled: boolean;
  value: number;
  completed: boolean;
}

export interface HabitStats {
  from: string;
  to: string;
  scheduledDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  days: HabitDayStat[];
}

export interface HabitWeeklySummaryDay {
  date: string;
  scheduled: number;
  completed: number;
}

export interface HabitWeeklySummary {
  from: string;
  to: string;
  scheduledActions: number;
  completedActions: number;
  completionRate: number;
  days: HabitWeeklySummaryDay[];
}


export type UpdateHabitInput =
  Partial<
    Omit<
      CreateHabitInput,
      'schedule' | 'target' | 'reminder' | 'endDate'
    >
  > & {
    endDate?: string | null;
    schedule?: Partial<CreateHabitInput['schedule']>;
    target?: Partial<CreateHabitInput['target']>;
    reminder?: Partial<CreateHabitInput['reminder']>;
  };


  export function getHabits() {
    return api<Habit[]>('/habits');
  }

  export function createHabit(data: CreateHabitInput) {
    return api<Habit>('/habits', {
      method: 'POST',
      body: data,
    });
  }

  export function updateHabit(
    id: string,
    updates: UpdateHabitInput,
  ) {
    return api<Habit>(`/habits/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  }
  export function getTodayHabits() {
    return api<TodayHabit[]>('/habits/today');
  }

  export function setHabitProgress(
    id: string,
    date: string,
    value = 1,
    note?: string,
  ) {
    return api<HabitProgressResponse>(
      `/habits/${id}/logs/${date}`,
      {
        method: 'PUT',
        body: { value, note },
      },
    );
  }

  export function removeHabitProgress(
    id: string,
    date: string,
  ) {
    return api<Habit>(`/habits/${id}/logs/${date}`, {
      method: 'DELETE',
    });
  }


  export function getHabitStats(
    id: string,
    from?: string,
    to?: string,
  ) {
    const params = new URLSearchParams();

    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const query = params.toString();

    return api<HabitStats>(
      `/habits/${id}/stats${query ? `?${query}` : ''}`,
    );
  }


  export function getArchivedHabits() {
    return api<Habit[]>('/habits?archived=true');
  }

  export function archiveHabit(id: string) {
    return api<Habit>(`/habits/${id}/archive`, {
      method: 'PATCH',
    });
  }

  export function restoreHabit(id: string) {
    return api<Habit>(`/habits/${id}/unarchive`, {
      method: 'PATCH',
    });
  }

  export function deleteHabit(id: string) {
    return api<Record<string, never>>(`/habits/${id}`, {
      method: 'DELETE',
    });
  }
  export function getHabitWeeklySummary(
    from: string,
    to: string,
  ) {
    const params = new URLSearchParams({ from, to });

    return api<HabitWeeklySummary>(
      `/habits/weekly-summary?${params.toString()}`,
    );
  }
