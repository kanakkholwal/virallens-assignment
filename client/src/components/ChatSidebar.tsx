import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { type Conversation, useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import {
    Bot,
    Check,
    LogOut,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

function ConversationItem({ conv }: { conv: Conversation }) {
    const { activeConversationId, setActiveConversationId, deleteConversation, renameConversation } =
        useChat();
    const isActive = activeConversationId === conv._id;

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(conv.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const commitRename = async () => {
        if (editTitle.trim() && editTitle.trim() !== conv.title) {
            await renameConversation(conv._id, editTitle.trim());
        } else {
            setEditTitle(conv.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitRename();
        if (e.key === 'Escape') {
            setEditTitle(conv.title);
            setIsEditing(false);
        }
    };

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                onClick={() => !isEditing && setActiveConversationId(conv._id)}
                className="group/item h-auto py-2 pr-8"
                tooltip={conv.title}
            >
                <MessageSquare size={14} className="shrink-0 text-muted-foreground" />
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-foreground"
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className="flex-1 min-w-0 truncate text-sm">{conv.title}</span>
                )}

                {isEditing && (
                    <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={commitRename}
                            className="p-0.5 rounded hover:bg-primary/20 text-primary"
                        >
                            <Check size={12} />
                        </button>
                        <button
                            onClick={() => { setEditTitle(conv.title); setIsEditing(false); }}
                            className="p-0.5 rounded hover:bg-destructive/20 text-destructive"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}
            </SidebarMenuButton>

            {!isEditing && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover className="right-1">
                            <MoreHorizontal size={14} />
                            <span className="sr-only">More</span>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-40">
                        <DropdownMenuItem
                            onClick={() => setIsEditing(true)}
                            className="gap-2 cursor-pointer"
                        >
                            <Pencil size={13} />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => deleteConversation(conv._id)}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                            <Trash2 size={13} />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </SidebarMenuItem>
    );
}

// Group conversations by date
function groupByDate(convs: Conversation[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const groups: { label: string; items: Conversation[] }[] = [
        { label: 'Today', items: [] },
        { label: 'Yesterday', items: [] },
        { label: 'Last 7 Days', items: [] },
        { label: 'Last 30 Days', items: [] },
        { label: 'Older', items: [] },
    ];

    for (const conv of convs) {
        const d = new Date(conv.updatedAt);
        d.setHours(0, 0, 0, 0);

        if (d >= today) {
            groups[0].items.push(conv);
        } else if (d >= yesterday) {
            groups[1].items.push(conv);
        } else if (d >= weekAgo) {
            groups[2].items.push(conv);
        } else if (d >= monthAgo) {
            groups[3].items.push(conv);
        } else {
            groups[4].items.push(conv);
        }
    }

    return groups.filter(g => g.items.length > 0);
}

export function ChatSidebar() {
    const { conversations, isLoadingConversations, createConversation } = useChat();
    const { user, logout } = useAuth();

    const userInitials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';
    const groups = groupByDate(conversations);

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarRail />
            <SidebarHeader className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Bot size={15} />
                    </div>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-semibold leading-none text-sidebar-foreground truncate">
                            ViralLens AI
                        </p>
                        <p className="mt-0.5 text-[10px] text-sidebar-foreground/50 truncate">Support Chat</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarSeparator className='group-data-[state=collapsed]:hidden' />

            <div className="px-3 py-2 group-data-[collapsible=icon]:px-2">
                <Button
                    onClick={createConversation}
                    size="sm"
                    className="w-full gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-lg"
                    variant="default"
                >
                    <Plus size={15} className="shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
                </Button>
            </div>

            <SidebarContent className="px-1">
                {isLoadingConversations ? (
                    <div className="flex flex-col gap-1.5 px-2 py-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'h-8 rounded-md bg-sidebar-accent/50 animate-pulse',
                                    i % 2 === 0 ? 'w-full' : 'w-4/5',
                                )}
                            />
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center group-data-[collapsible=icon]:hidden">
                        <MessageSquare size={24} className="text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">No conversations yet</p>
                        <p className="text-[10px] text-muted-foreground/60">
                            Click "New Chat" to get started
                        </p>
                    </div>
                ) : (
                    groups.map(group => (
                        <SidebarGroup key={group.label} className="py-1">
                            <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2 group-data-[collapsible=icon]:hidden">
                                {group.label}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map(conv => (
                                        <ConversationItem key={conv._id} conv={conv} />
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
                )}
            </SidebarContent>

            <SidebarSeparator className='group-data-[state=collapsed]:hidden' />
            <SidebarFooter className="px-3 py-2">
                <div className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden"
                        title="Logout"
                    >
                        <LogOut size={14} />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
