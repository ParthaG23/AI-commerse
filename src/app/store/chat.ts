import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  sender: 'user' | 'ai';
  content: string;
  type?: 'text' | 'search';
  searchParams?: Record<string, any>;
  products?: any[];
  language?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  products: any[];
  createdAt: number;
}

interface ChatState {
  threads: Record<string, ChatThread[]>; // Keyed by userKey (email or 'anonymous')
  activeThreadId: Record<string, string | null>; // Keyed by userKey (email or 'anonymous')
  inputValue: string;
  isOpen: boolean; // Mobile chat drawer open state
  sidebarCollapsed: boolean; // Collapsible Left Sidebar state
  
  // Actions
  createThread: (userKey?: string, initialTitle?: string) => string;
  switchThread: (threadId: string, userKey?: string) => void;
  deleteThread: (threadId: string, userKey?: string) => void;
  addMessage: (message: Message, userKey?: string) => void;
  updateActiveThreadProducts: (products: any[], userKey?: string) => void;
  clearMessages: (userKey?: string) => void; // Resets current active thread
  setInputValue: (value: string) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
}

const DEFAULT_WELCOME: Message = { sender: 'ai', content: 'Hi there! What are you looking for today?' };

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: {},
      activeThreadId: {},
      inputValue: '',
      isOpen: false,

      createThread: (userKey, initialTitle) => {
        const key = userKey || 'anonymous';
        const id = 'thread_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const newThread: ChatThread = {
          id,
          title: initialTitle || 'New Shopping Chat',
          messages: [DEFAULT_WELCOME],
          products: [],
          createdAt: Date.now(),
        };

        const currentThreads = get().threads[key] || [];
        set((state) => ({
          threads: {
            ...state.threads,
            [key]: [newThread, ...currentThreads],
          },
          activeThreadId: {
            ...state.activeThreadId,
            [key]: id,
          },
        }));

        return id;
      },

      switchThread: (threadId, userKey) => {
        const key = userKey || 'anonymous';
        set((state) => ({
          activeThreadId: {
            ...state.activeThreadId,
            [key]: threadId,
          },
        }));
      },

      deleteThread: (threadId, userKey) => {
        const key = userKey || 'anonymous';
        const currentThreads = get().threads[key] || [];
        const remaining = currentThreads.filter((t) => t.id !== threadId);
        
        let activeId = get().activeThreadId[key];
        if (activeId === threadId) {
          activeId = remaining.length > 0 ? remaining[0].id : null;
        }

        set((state) => ({
          threads: {
            ...state.threads,
            [key]: remaining,
          },
          activeThreadId: {
            ...state.activeThreadId,
            [key]: activeId,
          },
        }));
      },

      addMessage: (message, userKey) => {
        const key = userKey || 'anonymous';
        let activeId = get().activeThreadId[key];
        let currentThreads = get().threads[key] || [];

        // Auto-create thread if none exists
        if (!activeId || currentThreads.length === 0) {
          activeId = get().createThread(key, message.sender === 'user' ? message.content : undefined);
          currentThreads = get().threads[key] || [];
        }

        const threadIndex = currentThreads.findIndex((t) => t.id === activeId);
        if (threadIndex === -1) return;

        const thread = currentThreads[threadIndex];
        const updatedMessages = [...thread.messages, message];
        
        // Auto-rename thread title based on the first user message
        let newTitle = thread.title;
        if (thread.title === 'New Shopping Chat' && message.sender === 'user') {
          // Capitalize and format query
          const words = message.content.trim().split(/\s+/).slice(0, 4).join(' ');
          newTitle = words.charAt(0).toUpperCase() + words.slice(1);
          if (message.content.trim().split(/\s+/).length > 4) {
            newTitle += '...';
          }
        }

        const updatedThread = {
          ...thread,
          title: newTitle,
          messages: updatedMessages,
        };

        const updatedThreads = [...currentThreads];
        updatedThreads[threadIndex] = updatedThread;

        set((state) => ({
          threads: {
            ...state.threads,
            [key]: updatedThreads,
          },
        }));
      },

      updateActiveThreadProducts: (products, userKey) => {
        const key = userKey || 'anonymous';
        const activeId = get().activeThreadId[key];
        const currentThreads = get().threads[key] || [];

        if (!activeId || currentThreads.length === 0) return;

        const threadIndex = currentThreads.findIndex((t) => t.id === activeId);
        if (threadIndex === -1) return;

        const updatedThreads = [...currentThreads];
        updatedThreads[threadIndex] = {
          ...updatedThreads[threadIndex],
          products,
        };

        set((state) => ({
          threads: {
            ...state.threads,
            [key]: updatedThreads,
          },
        }));
      },

      clearMessages: (userKey) => {
        const key = userKey || 'anonymous';
        const activeId = get().activeThreadId[key];
        const currentThreads = get().threads[key] || [];

        if (!activeId || currentThreads.length === 0) return;

        const threadIndex = currentThreads.findIndex((t) => t.id === activeId);
        if (threadIndex === -1) return;

        const updatedThreads = [...currentThreads];
        updatedThreads[threadIndex] = {
          ...updatedThreads[threadIndex],
          messages: [DEFAULT_WELCOME],
          products: [],
        };

        set((state) => ({
          threads: {
            ...state.threads,
            [key]: updatedThreads,
          },
        }));
      },

      sidebarCollapsed: false,

      setInputValue: (value) => set({ inputValue: value }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'chat-storage-v4', // increment storage name to v4
      storage: createJSONStorage(() => localStorage),
    }
  )
);
