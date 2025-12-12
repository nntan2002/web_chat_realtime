"use client";

import { useSession } from "next-auth/react";
import React, { useState, useRef, useEffect } from 'react';

// --- Types ---
type User = {
    id: string;
    name: string;
    avatarColor: string;
    status: 'online' | 'offline' | 'busy';
    lastMessage: string;
    lastActive: string;
};

type Message = {
    id: string;
    senderId: string; // 'me' or user.id
    content: string;
    timestamp: Date;
    status: 'sent' | 'read';
};

// --- Mock Data ---
const CURRENT_USER_ID = 'me';

const MOCK_CONTACTS: User[] = [
    { id: 'u1', name: 'Nguyễn Thu Hà', avatarColor: 'bg-pink-500', status: 'online', lastMessage: 'Tối nay đi ăn không cậu?', lastActive: 'Vừa xong' },
    { id: 'u2', name: 'Trần Minh Tuấn', avatarColor: 'bg-blue-500', status: 'offline', lastMessage: 'Đã gửi file design nha', lastActive: '15 phút trước' },
    { id: 'u3', name: 'Nhóm Marketing', avatarColor: 'bg-purple-600', status: 'online', lastMessage: 'Mọi người check mail nhé', lastActive: 'Vừa xong' },
    { id: 'u4', name: 'Phạm Văn B', avatarColor: 'bg-yellow-500', status: 'busy', lastMessage: 'Đang họp, gọi lại sau', lastActive: '1 giờ trước' },
    { id: 'u5', name: 'Support IT', avatarColor: 'bg-gray-500', status: 'online', lastMessage: 'Máy chủ đã khởi động lại', lastActive: '2 phút trước' },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
    'u1': [
        { id: 'm1', senderId: 'u1', content: 'Hê lô, lâu không gặp!', timestamp: new Date(Date.now() - 3600000), status: 'read' },
        { id: 'm2', senderId: 'me', content: 'Chào Hà, dạo này khỏe không?', timestamp: new Date(Date.now() - 3500000), status: 'read' },
        { id: 'm3', senderId: 'u1', content: 'Tớ vẫn ổn. Tối nay rảnh không đi cafe đi?', timestamp: new Date(Date.now() - 100000), status: 'read' },
    ],
    'u2': [
        { id: 'm1', senderId: 'me', content: 'Tuấn ơi, gửi lại cho mình cái logo nhé.', timestamp: new Date(Date.now() - 86400000), status: 'read' },
        { id: 'm2', senderId: 'u2', content: 'Ok chờ tí mình gửi qua mail.', timestamp: new Date(Date.now() - 86000000), status: 'read' },
    ]
};

// --- Icons ---
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);

const MoreVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);

const AttachmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);

const SmileyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
);

const CheckDoubleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

// --- Components ---

const Avatar = ({ name, color, size = 'md', status }: { name: string, color: string, size?: 'sm' | 'md' | 'lg', status?: string }) => {
    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-10 h-10 text-base' : 'w-10 h-10 text-sm'; // Default md to 10
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="relative">
            <div className={`${sizeClass} rounded-full ${color} flex items-center justify-center text-white font-semibold shadow-sm`}>
                {initials}
            </div>
            {status && (
                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
            )}
        </div>
    );
};

export function Main() {
    const { data: session, status } = useSession();

    const [activeContactId, setActiveContactId] = useState<string>(MOCK_CONTACTS[0]?.id ?? '');
    const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeContact = MOCK_CONTACTS.find(c => c.id === activeContactId) || MOCK_CONTACTS[0];
    const currentMessages = messagesMap[activeContactId] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, activeContactId]);

    // Adjust textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputValue]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: CURRENT_USER_ID,
            content: inputValue,
            timestamp: new Date(),
            status: 'sent',
        };

        setMessagesMap(prev => ({
            ...prev,
            [activeContactId]: [...(prev[activeContactId] || []), newMessage]
        }));
        setInputValue('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        // Simulate "Human" reply
        setTimeout(() => {
            const replies = [
                "Ok cậu ơi",
                "Thế à?",
                "Chờ mình chút nhé",
                "Tuyệt vời!",
                "Hmm, để suy nghĩ đã...",
                "Haha buồn cười quá 😂",
                "Đang bận xíu, lát rep nha"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            const replyMessage: Message = {
                id: (Date.now() + 1).toString(),
                senderId: activeContactId,
                content: randomReply ?? "",
                timestamp: new Date(),
                status: 'sent',
            };

            setMessagesMap(prev => ({
                ...prev,
                [activeContactId]: [...(prev[activeContactId] || []), replyMessage]
            }));
        }, 1500 + Math.random() * 2000); // Random delay 1.5s - 3.5s
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredContacts = MOCK_CONTACTS.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!session) {
        return (
            <div className="container mx-auto">
                Bạn chưa đăng nhập. Vui lòng đăng nhập để sử dụng tính năng này.
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh-125.39px)] w-full bg-white font-sans overflow-hidden">

            {/* --- Sidebar (Contacts) --- */}
            <aside className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">

                {/* Header Sidebar */}
                <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-slate-800">Đoạn chat</h1>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                                <MoreVerticalIcon />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm trên Messenger..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 text-slate-900 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto hover:overflow-y-overlay scrollbar-thin">
                    <div className="px-2 py-2 space-y-1">
                        {filteredContacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContactId(contact.id)}
                                className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors text-left ${activeContactId === contact.id
                                    ? 'bg-blue-50'
                                    : 'hover:bg-slate-100'
                                    }`}
                            >
                                <Avatar name={contact.name} color={contact.avatarColor} status={contact.status} />
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold truncate ${activeContactId === contact.id ? 'text-blue-900' : 'text-slate-900'
                                        }`}>
                                        {contact.name}
                                    </div>
                                    <div className={`text-xs truncate flex items-center gap-1 ${activeContactId === contact.id ? 'text-blue-700' : 'text-slate-500'
                                        }`}>
                                        <span className="truncate">{contact.lastMessage}</span>
                                        <span className="mx-1">·</span>
                                        <span className="flex-shrink-0">1p</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* My Profile (Bottom) */}
                <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-3">
                    <Avatar name="Tôi" color="bg-indigo-600" size="sm" />
                    <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800">Tôi</div>
                        <div className="text-xs text-green-600 font-medium">Đang hoạt động</div>
                    </div>
                </div>
            </aside>

            {/* --- Main Chat Area --- */}
            <main className="flex-1 flex flex-col relative bg-white">

                {/* Chat Header */}
                <header className="h-16 px-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <Avatar name={activeContact!.name} color={activeContact!.avatarColor} status={activeContact!.status} />
                        <div>
                            <div className="font-bold text-slate-900 leading-tight">{activeContact!.name}</div>
                            <div className="text-xs text-slate-500 font-medium">
                                {activeContact!.status === 'online' ? 'Đang hoạt động' : `Hoạt động ${activeContact!.lastActive}`}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                        <button className="p-2.5 hover:bg-blue-50 rounded-full transition-colors">
                            <PhoneIcon />
                        </button>
                        <button className="p-2.5 hover:bg-blue-50 rounded-full transition-colors">
                            <VideoIcon />
                        </button>
                        <button className="p-2.5 hover:bg-blue-50 rounded-full transition-colors ml-1">
                            <MoreVerticalIcon />
                        </button>
                    </div>
                </header>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto w-full bg-white scrollbar-thin p-4">
                    {/* Welcome Placeholder if empty */}
                    {currentMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                            <Avatar name={activeContact!.name} color={activeContact!.avatarColor} size="lg" />
                            <p className="mt-4">Bắt đầu cuộc trò chuyện với {activeContact!.name}</p>
                        </div>
                    )}

                    <div className="flex flex-col space-y-1 pb-2">
                        {currentMessages.map((msg, index) => {
                            const isMe = msg.senderId === CURRENT_USER_ID;
                            const isLast = index === currentMessages.length - 1;
                            const showAvatar = !isMe && (isLast || currentMessages[index + 1]?.senderId === CURRENT_USER_ID);

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[70%] md:max-w-[60%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Tiny Avatar for partner messages */}
                                        {!isMe && (
                                            <div className="w-7 flex-shrink-0 flex items-end pb-1">
                                                {showAvatar ? (
                                                    <Avatar name={activeContact!.name} color={activeContact!.avatarColor} size="sm" />
                                                ) : <div className="w-7" />}
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed break-words ${isMe
                                            ? 'bg-blue-600 text-white rounded-tr-md'
                                            : 'bg-slate-100 text-slate-900 rounded-tl-md'
                                            }`}>
                                            {msg.content}
                                            {/* Read Receipt */}
                                            {isMe && isLast && (
                                                <div className="absolute bottom-1 right-2 opacity-70">
                                                    {/* Tiny dot or icon could go here */}
                                                </div>
                                            )}
                                        </div>

                                        {/* Timestamp tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 self-center px-2">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white">
                    <div className="max-w-4xl mx-auto flex items-end gap-2">
                        <div className="flex gap-1 text-blue-500 mb-2">
                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <AttachmentIcon />
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-3 py-1 ring-1 ring-transparent focus-within:ring-blue-500/20 transition-all">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 max-h-32 min-h-[36px] bg-transparent border-none outline-none focus:ring-0 focus:outline-none resize-none py-2 text-slate-900 placeholder:text-slate-500 text-sm leading-5"
                                rows={1}
                            />
                            <button className="p-1.5 text-slate-400 hover:text-yellow-500 transition-colors">
                                <SmileyIcon />
                            </button>
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className={`p-2.5 rounded-full transition-all mb-0.5 ${inputValue.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105'
                                : 'bg-slate-100 text-slate-400 cursor-default'
                                }`}
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}