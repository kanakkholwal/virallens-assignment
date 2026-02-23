import api from '@/api/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { code } from '@streamdown/code';
import axios from 'axios';
import { Bot, LogOut, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';

interface Message {
    _id: string;
    role: 'user' | 'assistant';
    message: string;
    createdAt: string;
    isStreaming?: boolean;
}


export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { user, logout } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchHistory = async () => {
            try {
                const res = await api.get('/chat/history', {
                    signal: controller.signal,
                });
                setMessages(res.data);
            } catch (e: any) {
                if (axios.isCancel(e) || e?.code === 'ERR_CANCELED') return;
                console.error('Failed to fetch chat history:', e);
                toast.error(e.response?.data?.message || 'Failed to fetch chat history');
            }
        };

        fetchHistory();


        return () => controller.abort();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const userMessage = input;
        setInput('');
        setIsSending(true);

        const tempUserMsg: Message = {
            _id: `user-${Date.now()}`,
            role: 'user',
            message: userMessage,
            createdAt: new Date().toISOString(),
        };

        const tempAssistantId = `assistant-${Date.now()}`;
        const emptyAssistant: Message = {
            _id: tempAssistantId,
            role: 'assistant',
            message: '',
            createdAt: new Date().toISOString(),
            isStreaming: true,
        };

        setMessages(prev => [...prev, tempUserMsg, emptyAssistant]);

        try {
            const res = await api.post('/chat/send', { message: userMessage }, {
                adapter: 'fetch',
                responseType: 'stream',
            });

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
                                    m._id === tempAssistantId ? { ...m, isStreaming: false } : m,
                                ),
                            );
                            setIsSending(false);
                        }
                        if (payload.error) {
                            // Remove the empty assistant bubble
                            setMessages(prev => prev.filter(m => m._id !== tempAssistantId));
                            setIsSending(false);
                            if (payload.code === 'RATE_LIMIT') {
                                toast.warning('Daily AI limit reached', {
                                    description: payload.message,
                                    duration: Infinity,
                                    closeButton: true,
                                });
                            } else {
                                toast.error('AI service error', {
                                    description: payload.message || 'Something went wrong. Please try again.',
                                });
                            }
                        }
                    } catch {
                        // ignore malformed SSE lines
                        // or some logging or tracking system
                    }
                }
            }
        } catch {
            setMessages(prev => prev.filter(m => m._id !== tempAssistantId));
            setIsSending(false);
        }
    };

    const userInitials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

    return (
        <div className="flex h-screen flex-col bg-background">

            <header id='chat-header' className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold leading-none text-foreground">ViralLens Support</h1>
                        <p className="mt-0.5 text-xs text-muted-foreground">Powered by AI</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isSending && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                            Generating…
                        </Badge>
                    )}
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground">
                        <LogOut size={15} />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </header>

            <main id='chat-main' className="flex-1 overflow-y-auto px-4 py-8 md:px-0" style={{ height: 'calc(100dvh - 73px)' }}>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    {messages.length === 0 && !isSending && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 rounded-full bg-muted p-5">
                                <Bot size={36} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">How can I help you today?</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Ask anything about ViralLens or reported issues.
                            </p>
                        </div>
                    )}

                    {messages.map(msg => (
                        <div
                            key={msg._id}
                            className={cn(
                                'flex w-full gap-3',
                                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <Avatar className="h-8 w-8 shrink-0 border border-border shadow-sm">
                                <AvatarFallback
                                    className={cn(
                                        'text-xs font-semibold',
                                        msg.role === 'user'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {msg.role === 'user' ? userInitials : 'AI'}
                                </AvatarFallback>
                            </Avatar>

                            {msg.role === 'user' ? (
                                <div className="max-w-[78%] rounded-2xl rounded-tr-none bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                                    {msg.message}
                                </div>
                            ) : (
                                <div className="max-w-[78%] min-w-0 rounded-2xl rounded-tl-none border border-border bg-card px-4 py-3 shadow-sm">
                                    {msg.message ? (
                                        <Streamdown
                                            plugins={{ code }}
                                            isAnimating={!!msg.isStreaming}
                                            className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                                        >
                                            {msg.message}
                                        </Streamdown>
                                    ) : (
                                        <span className="flex gap-1 items-center text-muted-foreground text-xs">
                                            <span className="animate-bounce [animation-delay:0ms]">●</span>
                                            <span className="animate-bounce [animation-delay:150ms]">●</span>
                                            <span className="animate-bounce [animation-delay:300ms]">●</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>
            </main>


            <div id='chat-input' className="border-t border-border bg-muted/10 px-4 py-5 md:px-0">
                <div className="mx-auto w-full max-w-3xl">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <Textarea
                            className="flex-1 rounded-xl py-5 text-sm h-auto whitespace-pre-wrap"
                            placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={isSending}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (input.trim() && !isSending) {
                                        handleSend(e);
                                    }
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isSending || !input.trim()}
                            className="shrink-0 rounded-xl"
                        >
                            <Send size={18} />
                        </Button>
                    </form>
                    <p className="mt-2.5 text-center text-[10px] text-muted-foreground">
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};


