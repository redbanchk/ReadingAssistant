export enum BookStatus {
  UNREAD = 'unread',
  READING = 'reading',
  FINISHED = 'finished',
}

// Legacy enums retained for compatibility (not used in new UI)
export enum ReminderFrequency {
  WEEKLY = 'weekly',
  THREE_DAYS = 'three_days',
  NONE = 'none',
}

export type ReminderMode = 'daily' | 'every_x_days' | 'weekly';

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
  // Reminder scheduling (new)
  reminder_mode?: ReminderMode; // 'daily' | 'every_x_days' | 'weekly'
  reminder_interval_days?: number; // when mode==='every_x_days'
  reminder_days_of_week?: number[]; // 1-7 (Mon=1 ... Sun=7) when mode==='weekly'
  reminder_hour?: number; // 0-23
  reminder_minute?: number; // 0-59
  // Legacy fields for compatibility
  reminder_frequency?: ReminderFrequency;
  reminder_time?: string;
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
