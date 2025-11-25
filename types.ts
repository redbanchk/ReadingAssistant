export enum BookStatus {
  UNREAD = 'unread',
  READING = 'reading',
  FINISHED = 'finished',
}

export enum ReminderFrequency {
  WEEKLY = 'weekly',
  THREE_DAYS = 'three_days',
  NONE = 'none', // For UI handling when toggled off specific book
}

export enum ReminderTime {
  PM7 = '19:00',
  PM8 = '20:00',
  PM9 = '21:00',
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  // author removed
  isbn?: string;
  cover_url?: string;
  status: BookStatus;
  
  // Progress tracking
  total_pages?: number;
  current_page?: number;

  rating?: number; // 1-5
  review?: string;
  reminder_frequency?: ReminderFrequency;
  reminder_time?: ReminderTime;
  reminder_enabled: boolean;
  created_at: string;
}

export type ViewState = 'login' | 'list' | 'add' | 'edit' | 'settings';

export interface UserSettings {
  enable_all_reminders: boolean;
}

// Helper for filter state
export interface FilterState {
  status: 'all' | BookStatus;
  rating: 'all' | number;
}