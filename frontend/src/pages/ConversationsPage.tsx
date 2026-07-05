import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppNav } from "@/components/AppNav";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";
import { io, Socket } from "socket.io-client";

function formatTime(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ConversationsPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [selectedId, setSelectedId] = useState<string | undefined>(id);
    const [draft, setDraft] = useState("");
    const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const socketUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").replace(/\/api\/v1\/?$/, "");

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: conversationService.list,
    });

    const selectedConversation = useMemo(() => {
        return conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null;
    }, [conversations, selectedId]);

    useEffect(() => {
        if (!token || !user) return;

        const client = io(socketUrl, {
            auth: { token: `Bearer ${token}` },
            transports: ["websocket"],
        });

        client.on("connect", () => setSocket(client));
        client.on("conversation:message", (message: any) => {
            queryClient.setQueriesData({ queryKey: ["conversations"] }, (current: any) => {
                if (!current) return current;
                return current.map((conversation: any) =>
                    conversation.id === message.conversationId
                        ? { ...conversation, messages: [message, ...(conversation.messages ?? []).filter((item: any) => item.id !== message.id)] }
                        : conversation
                );
            });
        });

        client.on("conversation:typing", ({ conversationId }: { conversationId: string }) => {
            if (conversationId === selectedConversation?.id) {
                setTypingConversationId(conversationId);
            }
        });
        client.on("conversation:stop_typing", ({ conversationId }: { conversationId: string }) => {
            if (conversationId === selectedConversation?.id) {
                setTypingConversationId(null);
            }
        });

        setSocket(client);

        return () => {
            client.disconnect();
        };
    }, [token, user, queryClient, selectedConversation?.id]);

    useEffect(() => {
        if (!selectedConversation?.id) return;
        socket?.emit("join_conversation", { conversationId: selectedConversation.id });
    }, [selectedConversation?.id, socket]);

    useEffect(() => {
        if (id && !conversations.some((conversation) => conversation.id === id)) {
            navigate("/conversations", { replace: true });
        }
    }, [conversations, id, navigate]);

    useEffect(() => {
        setSelectedId(id);
    }, [id]);

    useEffect(() => {
        if (selectedId && !conversations.some((conversation) => conversation.id === selectedId)) {
            setSelectedId(conversations[0]?.id);
        }
    }, [conversations, selectedId]);

    async function handleSendMessage(event: React.FormEvent) {
        event.preventDefault();
        if (!selectedConversation || !draft.trim() || isSending) return;

        const content = draft.trim();
        setDraft("");
        setIsSending(true);

        try {
            if (socket?.connected) {
                socket.emit("send_message", { conversationId: selectedConversation.id, content });
            } else {
                await conversationService.sendMessage(selectedConversation.id, { content });
                await queryClient.invalidateQueries({ queryKey: ["conversations"] });
            }
            addToast({ type: "success", title: "Message sent", message: "Your message is on the way." });
        } catch (error) {
            addToast({ type: "error", title: "Message failed", message: getFriendlyErrorMessage(error) });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AppNav />
            <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:px-12 lg:flex-row">
                <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:w-96">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Messages</p>
                            <h1 className="text-xl font-bold text-brand-900">Your conversations</h1>
                        </div>
                        {user?.role === "STUDENT" && (
                            <Link to="/properties" className="text-sm font-medium text-brand-600">Browse</Link>
                        )}
                    </div>
                    <div className="space-y-2">
                        {isLoading ? (
                            <p className="text-sm text-slate-500">Loading conversations…</p>
                        ) : conversations.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                No conversations yet. Open a property and start a chat from the listing page.
                            </p>
                        ) : (
                            conversations.map((conversation: any) => {
                                const latestMessage = conversation.messages?.[0];
                                const participant = user?.role === "STUDENT" ? conversation.landlord : conversation.student;
                                return (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(conversation.id);
                                            navigate(`/conversations/${conversation.id}`);
                                        }}
                                        className={`w-full rounded-2xl border p-3 text-left transition ${selectedConversation?.id === conversation.id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-slate-900">{participant?.businessName || `${participant?.firstName ?? ""} ${participant?.lastName ?? ""}`.trim()}</p>
                                                <p className="text-xs text-slate-500">{conversation.property?.title}</p>
                                            </div>
                                            <span className="text-xs text-slate-400">{formatTime(latestMessage?.createdAt)}</span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{latestMessage?.content || "No messages yet"}</p>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                <section className="flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {selectedConversation ? (
                        <>
                            <div className="border-b border-slate-200 p-4">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Property chat</p>
                                <h2 className="mt-1 text-lg font-bold text-brand-900">{selectedConversation.property?.title}</h2>
                                <p className="text-sm text-slate-500">{selectedConversation.property?.location}</p>
                            </div>
                            <div className="flex h-[480px] flex-col">
                                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                    {(selectedConversation.messages ?? []).map((message: any) => {
                                        const mine = message.sender?.id === user?.id;
                                        return (
                                            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-800"}`}>
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                    <p className={`mt-1 text-[11px] ${mine ? "text-brand-100" : "text-slate-400"}`}>{formatTime(message.createdAt)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {typingConversationId && <p className="text-sm text-slate-400">Typing…</p>}
                                </div>
                                <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4">
                                    <div className="flex gap-2">
                                        <input
                                            value={draft}
                                            onChange={(event) => {
                                                setDraft(event.target.value);
                                                socket?.emit("typing", { conversationId: selectedConversation.id });
                                            }}
                                            onBlur={() => socket?.emit("stop_typing", { conversationId: selectedConversation.id })}
                                            placeholder="Type your message"
                                            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none"
                                        />
                                        <button type="submit" disabled={isSending} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">{isSending ? "Sending..." : "Send"}</button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
                            Pick a conversation to start chatting.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
