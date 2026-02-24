import { ChatSidebar } from '@/components/ChatSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { code } from '@streamdown/code';
import { Bot, MessageSquarePlus, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Streamdown } from 'streamdown';

function ChatArea() {
    const { messages, isSending, isLoadingMessages, activeConversationId, sendMessage, createConversation } =
        useChat();
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userInitials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isSending) return;
        setInput('');
        await sendMessage(trimmed);
    };

    //     No conversation selected                                              
    if (!activeConversationId) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
                <div className="rounded-2xl bg-muted/60 p-6">
                    <Bot size={44} className="text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">ViralLens Support AI</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                        Ask anything about ViralLens or reported issues. Start a new chat to begin.
                    </p>
                </div>
                <Button onClick={createConversation} className="gap-2 rounded-xl" size="lg">
                    <MessageSquarePlus size={18} />
                    New Chat
                </Button>
            </div>
        );
    }

    //     Loading messages                                                      
    if (isLoadingMessages) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="flex gap-1 text-muted-foreground">
                    <span className="animate-bounce [animation-delay:0ms]">●</span>
                    <span className="animate-bounce [animation-delay:150ms]">●</span>
                    <span className="animate-bounce [animation-delay:300ms]">●</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Messages */}
            <main
                id="chat-main"
                className="flex-1 overflow-y-auto px-4 py-8 md:px-0"
                style={{ height: 'calc(100dvh - 128px)' }}
            >
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

            {/* Input */}
            <div id="chat-input" className="border-t border-border bg-muted/10 px-4 py-5 md:px-0">
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
                                    if (input.trim() && !isSending) handleSend(e);
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
        </>
    );
}

export default function Chat() {
    const { isSending, activeConversationId, conversations } = useChat();

    // Find the active conversation title for the header
    const activeConv = conversations.find(c => c._id === activeConversationId);

    return (
        <SidebarProvider>
            <ChatSidebar />
            <SidebarInset>
                {/* Header */}
                <header
                    id="chat-header"
                    className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sticky top-0 z-10"
                >
                    <SidebarTrigger className="text-muted-foreground" />
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Bot size={15} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-semibold leading-none text-foreground truncate">
                                {activeConv?.title ?? 'ViralLens Support'}
                            </h1>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">Powered by AI</p>
                        </div>
                    </div>
                    {isSending && (
                        <Badge variant="secondary" className="text-xs animate-pulse shrink-0">
                            Generating…
                        </Badge>
                    )}
                </header>

                {/* Chat body */}
                <div className="flex flex-1 flex-col h-[calc(100dvh-55px)]">
                    <ChatArea />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

// Wrap with ChatProvider at the page level
export function ChatPage() {
    return (
        <ChatProvider>
            <Chat />
        </ChatProvider>
    );
}
