import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Message {
  sender: 'user' | 'ai';
  content: string;
}

interface ChatState {
  messages: Message[];
  inputValue: string;
  isOpen: boolean;
  addMessage: (message: Message) => void;
  setInputValue: (value: string) => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [{ sender: 'ai', content: 'Hi there! What are you looking for today?' }],
      inputValue: '',
      isOpen: false,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setInputValue: (value) => set({ inputValue: value }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'chat-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
