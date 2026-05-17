import { create } from "zustand";

export type OnlinePresenses = Record<
  string,
  { availability: "online" | "dnd" | "offline" | "idle" }
>;

export type TypingEvents = Record<string, boolean>;

type userPresenseStore = {
  onlinePresenses: OnlinePresenses;
  typingEvents: TypingEvents;
  setPresence: (
    userId: string,
    availability: "online" | "offline" | "dnd" | "idle",
  ) => void;
  removePresence: (userId: string) => void;
  setIsTyping: (userId: string) => void;
  removeTyping: (userId: string) => void;
};

const userPresenseStore = create<userPresenseStore>((set) => ({
  onlinePresenses: {},
  typingEvents: {},

  setPresence: (userId, availability) =>
    set((state) => ({
      onlinePresenses: {
        ...state.onlinePresenses,
        [userId]: { availability },
      },
    })),

  removePresence: (userId) =>
    set((state) => {
      const newPresenses = { ...state.onlinePresenses };
      delete newPresenses[userId];
      return { onlinePresenses: newPresenses };
    }),

  setIsTyping: (userId) =>
    set((state) => ({
      typingEvents: {
        ...state.typingEvents,
        [userId]: true,
      },
    })),

  removeTyping: (userId) =>
    set((state) => {
      const newTyping = { ...state.typingEvents };
      delete newTyping[userId];
      return { typingEvents: newTyping };
    }),
}));

export default userPresenseStore;





