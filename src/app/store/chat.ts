import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  type?: 'text' | 'search';
  searchParams?: Record<string, any>;
  language?: string;
}

interface ChatState {
  conversations: Record<string, Message[]>; // Keyed by user email or 'anonymous'
  inputValue: string;
  isOpen: boolean;
  addMessage: (message: Message, userKey?: string) => void;
  clearMessages: (userKey?: string) => void;
  setInputValue: (value: string) => void;
  toggleChat: () => void;
}

const DEFAULT_WELCOME: Message = { sender: 'ai', content: 'Hi there! What are you looking for today?' };

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {
        anonymous: [DEFAULT_WELCOME],
      },
      inputValue: '',
      isOpen: false,
      addMessage: (message, userKey) => {
        const key = userKey || 'anonymous';
        const currentMsgs = get().conversations[key] || [DEFAULT_WELCOME];
        set((state) => ({
          conversations: {
            ...state.conversations,
            [key]: [...currentMsgs, message],
          },
        }));
      },
      clearMessages: (userKey) => {
        const key = userKey || 'anonymous';
        set((state) => ({
          conversations: {
            ...state.conversations,
            [key]: [DEFAULT_WELCOME],
          },
        }));
      },
      setInputValue: (value) => set({ inputValue: value }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'chat-storage-v2', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);
