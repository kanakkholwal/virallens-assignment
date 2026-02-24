import api from '@/api/client';
import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export interface Conversation {
    _id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    role: 'user' | 'assistant';
    message: string;
    createdAt: string;
    isStreaming?: boolean;
}

interface ChatContextType {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    isSending: boolean;
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;

    setActiveConversationId: (id: string | null) => void;
    createConversation: () => Promise<Conversation | null>;
    deleteConversation: (id: string) => Promise<void>;
    renameConversation: (id: string, title: string) => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
    refreshConversations: () => Promise<Conversation[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, _setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Track whether the initial URL sync has been performed after conversations load
    const didInitialSync = useRef(false);

    //   URL ↔ State sync  : The single source of truth setter. Always keep the URL ?c= param
    const setActiveConversationId = useCallback(
        (id: string | null) => {
            _setActiveConversationId(id);
            setSearchParams(
                prev => {
                    const next = new URLSearchParams(prev);
                    if (id) {
                        next.set('c', id);
                    } else {
                        next.delete('c');
                    }
                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    //  Load conversations on mount                                           
    const refreshConversations = useCallback(async () => {
        try {
            const res = await api.get('/chat/conversations');
            const fetched: Conversation[] = res.data;
            setConversations(fetched);
            return fetched;
        } catch (e: any) {
            if (axios.isCancel(e) || e?.code === 'ERR_CANCELED') return [];
            console.error('Failed to load conversations:', e);
            return [];
        } finally {
            setIsLoadingConversations(false);
        }
    }, []);

    // On initial mount: load conversations, then validate the ?c= URL param.
    useEffect(() => {
        if (didInitialSync.current) return;
        didInitialSync.current = true;

        const run = async () => {
            const fetched = await refreshConversations();
            const paramId = searchParams.get('c');

            if (!paramId) return;
            const exists = (fetched as Conversation[]).some(c => c._id === paramId);
            if (exists) {
                _setActiveConversationId(paramId);
            } else {
                setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.delete('c');
                    return next;
                }, { replace: true });
                toast.warning('Conversation not found', {
                    description: 'The shared link may be expired or belong to another account.',
                });
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run once on mount

    // After initial sync, keep state in sync if the user manually edits the URL

    useEffect(() => {
        if (!didInitialSync.current || isLoadingConversations) return;

        const paramId = searchParams.get('c');

        if (paramId === activeConversationId) return;

        if (!paramId) {
            _setActiveConversationId(null);
            return;
        }

        const exists = conversations.some(c => c._id === paramId);
        if (exists) {
            _setActiveConversationId(paramId);
        } else {
            // Invalid id in URL → strip it
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.delete('c');
                return next;
            }, { replace: true });
            toast.warning('Conversation not found');
        }
    }, [searchParams]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (!activeConversationId) {
            setMessages([]);
            return;
        }
        const controller = new AbortController();
        setIsLoadingMessages(true);

        api.get(`/chat/conversations/${activeConversationId}/history`, {
            signal: controller.signal,
        })
            .then(res => setMessages(res.data))
            .catch(e => {
                if (axios.isCancel(e) || e?.code === 'ERR_CANCELED') return;
                toast.error('Failed to load messages');
            })
            .finally(() => setIsLoadingMessages(false));

        return () => controller.abort();
    }, [activeConversationId]);

    // Conversation CRUD                                                     
    const createConversation = useCallback(async (): Promise<Conversation | null> => {
        try {
            const res = await api.post('/chat/conversations');
            const newConv: Conversation = res.data;
            setConversations(prev => [newConv, ...prev]);
            setActiveConversationId(newConv._id); // also updates URL
            setMessages([]);
            return newConv;
        } catch {
            toast.error('Failed to create conversation');
            return null;
        }
    }, [setActiveConversationId]);

    const deleteConversation = useCallback(
        async (id: string) => {
            try {
                await api.delete(`/chat/conversations/${id}`);
                setConversations(prev => prev.filter(c => c._id !== id));
                if (activeConversationId === id) {
                    setActiveConversationId(null); // clears URL too
                    setMessages([]);
                }
            } catch {
                toast.error('Failed to delete conversation');
            }
        },
        [activeConversationId, setActiveConversationId],
    );

    const renameConversation = useCallback(async (id: string, title: string) => {
        try {
            const res = await api.patch(`/chat/conversations/${id}`, { title });
            setConversations(prev =>
                prev.map(c => (c._id === id ? { ...c, title: res.data.title } : c)),
            );
        } catch {
            toast.error('Failed to rename conversation');
        }
    }, []);

    //  Messaging                                                             
    const sendMessage = useCallback(
        async (userMessage: string) => {
            if (!activeConversationId || isSending) return;

            setIsSending(true);

            const tempUserId = `user-${Date.now()}`;
            const tempAssistantId = `assistant-${Date.now()}`;

            setMessages(prev => [
                ...prev,
                {
                    _id: tempUserId,
                    role: 'user',
                    message: userMessage,
                    createdAt: new Date().toISOString(),
                },
                {
                    _id: tempAssistantId,
                    role: 'assistant',
                    message: '',
                    createdAt: new Date().toISOString(),
                    isStreaming: true,
                },
            ]);

            try {
                const res = await api.post(
                    `/chat/conversations/${activeConversationId}/send`,
                    { message: userMessage },
                    { adapter: 'fetch', responseType: 'stream' },
                );

                const reader = (res.data as ReadableStream<Uint8Array>).getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';

                    for (const line of lines) {
                        if (!line.startsWith('data:')) continue;
                        const raw = line.slice(5).trim();
                        if (!raw) continue;
                        try {
                            const payload = JSON.parse(raw);

                            if (payload.chunk !== undefined) {
                                setMessages(prev =>
                                    prev.map(m =>
                                        m._id === tempAssistantId
                                            ? { ...m, message: m.message + payload.chunk }
                                            : m,
                                    ),
                                );
                            }
                            if (payload.done) {
                                setMessages(prev =>
                                    prev.map(m =>
                                        m._id === tempAssistantId
                                            ? { ...m, isStreaming: false }
                                            : m,
                                    ),
                                );
                                setIsSending(false);
                                // Refresh list to update title + sort order
                                refreshConversations();
                            }
                            if (payload.error) {
                                setMessages(prev =>
                                    prev.filter(m => m._id !== tempAssistantId),
                                );
                                setIsSending(false);
                                if (payload.code === 'RATE_LIMIT') {
                                    toast.warning('Daily AI limit reached', {
                                        description: payload.message,
                                        duration: Infinity,
                                        closeButton: true,
                                    });
                                } else {
                                    toast.error('AI service error', {
                                        description:
                                            payload.message || 'Something went wrong.',
                                    });
                                }
                            }
                        } catch {
                            // ignore malformed SSE lines
                        }
                    }
                }
            } catch {
                setMessages(prev => prev.filter(m => m._id !== tempAssistantId));
                setIsSending(false);
            }
        },
        [activeConversationId, isSending, refreshConversations],
    );

    return (
        <ChatContext.Provider
            value={{
                conversations,
                activeConversationId,
                messages,
                isSending,
                isLoadingConversations,
                isLoadingMessages,
                setActiveConversationId,
                createConversation,
                deleteConversation,
                renameConversation,
                sendMessage,
                refreshConversations,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within a ChatProvider');
    return ctx;
};
