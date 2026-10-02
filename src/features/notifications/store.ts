import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedNotifications, createSeedReminders, createSeedTemplates } from './seed';
import type { AlertTemplate, AppNotification, Reminder } from './types';

interface NotificationStore {
  notifications: AppNotification[];
  templates: AlertTemplate[];
  reminders: Reminder[];
  markRead: (id: string) => void;
  saveTemplate: (template: AlertTemplate) => void;
  saveReminder: (reminder: Reminder) => void;
  restoreSamples: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: createSeedNotifications(),
      templates: createSeedTemplates(),
      reminders: createSeedReminders(),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      saveTemplate: (template) =>
        set((state) => ({
          templates: state.templates.map((item) => (item.id === template.id ? template : item)),
        })),
      saveReminder: (reminder) =>
        set((state) => ({
          reminders: state.reminders.map((item) => (item.id === reminder.id ? reminder : item)),
        })),
      restoreSamples: () =>
        set({
          notifications: createSeedNotifications(),
          templates: createSeedTemplates(),
          reminders: createSeedReminders(),
        }),
    }),
    { name: 'wit-hrms-ui-phase10-notifications' },
  ),
);
