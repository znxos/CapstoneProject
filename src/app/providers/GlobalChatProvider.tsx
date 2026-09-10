"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { getChatEvents } from "../actions/chat-engine";

declare global {
  interface Window {
    pusherInstance?: Pusher;
  }
}

interface GlobalChatContextType {
  events: any[];
  messagesByEvent: Record<string, any[]>;
  setMessagesByEvent: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  unreadCounts: Record<string, number>;
  setUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  totalUnreadCount: number;
  isLoadingEvents: boolean;
  currentUserId: string | null;
  setCurrentUserId: React.Dispatch<React.SetStateAction<string | null>>;
  activeEventIdRef: React.MutableRefObject<string | null>;
}

const GlobalChatContext = createContext<GlobalChatContextType | undefined>(undefined);

export const useGlobalChat = () => {
  const context = useContext(GlobalChatContext);
  if (!context) {
    throw new Error("useGlobalChat must be used within a GlobalChatProvider");
  }
  return context;
};

export const GlobalChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [messagesByEvent, setMessagesByEvent] = useState<Record<string, any[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  // Load unread counts from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("quad_unread_counts");
      if (stored) {
        setUnreadCounts(JSON.parse(stored));
      }
    } catch (e) {}
    setIsLoadedFromStorage(true);
  }, []);

  // Save unread counts to local storage whenever they change
  useEffect(() => {
    if (isLoadedFromStorage) {
      localStorage.setItem("quad_unread_counts", JSON.stringify(unreadCounts));
    }
  }, [unreadCounts, isLoadedFromStorage]);
  
  const pusherRef = useRef<Pusher | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const activeEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Load chat events globally
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getChatEvents();
        if (res.events && res.events.length > 0) {
          setEvents(res.events);
        }
      } catch (e) {
        // Not authenticated or error
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Initialize Pusher singleton safely attached to the window object
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.pusherInstance) {
        Pusher.logToConsole = false;
        window.pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          forceTLS: true,
          authEndpoint: '/api/pusher/auth',
        });
      }
      pusherRef.current = window.pusherInstance;
    }
  }, []);

  // Global Pusher Subscriptions for all loaded events
  useEffect(() => {
    if (!events || events.length === 0 || !pusherRef.current) return;

    const channels = events.map(evt => {
      const channel = pusherRef.current!.subscribe(`private-encrypted-${evt.id}`);
      
      channel.bind("incoming-message", (data: any) => {
        if (data.senderId === currentUserIdRef.current) return;
        
        setMessagesByEvent((prev) => {
          const existing = prev[evt.id] || [];
          if (existing.some(m => m.id === data.id)) return prev;
          return { ...prev, [evt.id]: [...existing, { ...data, isMe: false }] };
        });

        // Increment unread count if we are not actively viewing this event
        if (activeEventIdRef.current !== evt.id) {
          setUnreadCounts((prev) => ({ ...prev, [evt.id]: (prev[evt.id] || 0) + 1 }));
        }
      });

      channel.bind("message-flagged", (data: { messageId: string, text: string }) => {
        setMessagesByEvent((prev) => {
          if (!prev[evt.id]) return prev;
          return {
            ...prev,
            [evt.id]: prev[evt.id].map(m => m.id === data.messageId ? { ...m, text: data.text } : m)
          };
        });
      });

      return channel;
    });

    return () => {
      channels.forEach((channel, i) => {
        channel.unbind_all();
        pusherRef.current?.unsubscribe(`private-encrypted-${events[i].id}`);
      });
    };
  }, [events]);

  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);

  return (
    <GlobalChatContext.Provider
      value={{
        events,
        messagesByEvent,
        setMessagesByEvent,
        unreadCounts,
        setUnreadCounts,
        totalUnreadCount,
        isLoadingEvents,
        currentUserId,
        setCurrentUserId,
        activeEventIdRef
      }}
    >
      {children}
    </GlobalChatContext.Provider>
  );
};
