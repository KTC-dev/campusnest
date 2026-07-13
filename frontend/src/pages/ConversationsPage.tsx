import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";
import { fileToBase64 } from "@/utils/file";
import type { ConversationAttachment, ConversationMessage, ConversationSummary } from "@/types";

const ALLOWED_ATTACHMENT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ATTACHMENT_LIMIT_MB = 10;

interface DraftAttachment {
    id: string;
    fileName: string;
    mimeType: string;
    previewUrl?: string;
    status: "uploading" | "ready" | "error";
    attachment?: ConversationAttachment;
    error?: string;
}

function formatTime(value?: string | null) {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatRelative(value?: string | null) {
    if (!value) return "";
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function formatNaira(price?: string | null) {
    if (!price) return "";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(price));
}

function initials(value?: string | null) {
    if (!value) return "CN";
    const parts = value.split(" ").filter(Boolean);
    return `${parts[0]?.[0] ?? "C"}${parts[1]?.[0] ?? "N"}`.toUpperCase();
}

function participantName(participant?: { user?: { email: string }; businessName?: string | null; firstName?: string | null; lastName?: string | null }) {
    if (!participant) return "Unknown";
    return participant.businessName || `${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim() || participant.user?.email || "Unknown";
}

function conversationTitle(conversation: ConversationSummary, currentUserId?: string) {
    if (conversation.type === "PROPERTY_CHAT") {
        return conversation.property ? participantName(conversation.property.landlord) : "Property chat";
    }

    const other = conversation.roommateMatch
        ? (conversation.primaryStudent?.userId === currentUserId ? conversation.roommateMatch.studentB : conversation.roommateMatch.studentA)
        : null;
    return `${other?.firstName ?? other?.user?.email?.split("@")[0] ?? "Roommate"} ${other?.lastName ?? ""}`.trim();
}

function conversationSubtitle(conversation: ConversationSummary) {
    if (conversation.type === "PROPERTY_CHAT") {
        return conversation.property?.title ?? "Property conversation";
    }

    const match = conversation.roommateMatch;
    return match ? `${match.score}% match` : "Roommate conversation";
}

function conversationAvatar(conversation: ConversationSummary, currentUserId?: string) {
    if (conversation.type === "PROPERTY_CHAT") {
        const cover = conversation.property?.images?.[0]?.url;
        if (cover) {
            return <img src={cover} alt={conversation.property?.title ?? "Property"} className="h-full w-full object-cover" loading="lazy" />;
        }
        return initials(conversation.property ? participantName(conversation.property.landlord) : "Property");
    }

    const other = conversation.roommateMatch
        ? (conversation.primaryStudent?.userId === currentUserId ? conversation.roommateMatch.studentB : conversation.roommateMatch.studentA)
        : null;
    const avatar = other?.user?.email ? initials(other.user.email) : initials(`${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim());
    return other?.avatarUrl ? <img src={other.avatarUrl} alt={participantName(other as any)} className="h-full w-full object-cover" loading="lazy" /> : avatar;
}

function messageStatus(message: ConversationMessage) {
    if (message.readAt) return "Read";
    if (message.deliveredAt) return "Delivered";
    return "Sent";
}

function canShowVerificationBadge(conversation: ConversationSummary, currentUserId?: string) {
    if (conversation.type === "PROPERTY_CHAT") return Boolean(conversation.property?.landlord.isVerified);
    const other = conversation.roommateMatch
        ? (conversation.primaryStudent?.userId === currentUserId ? conversation.roommateMatch.studentB : conversation.roommateMatch.studentA)
        : null;
    return Boolean(other?.user?.isVerified);
}

function ChatComposer({
    onSend,
    disabled,
}: {
    onSend: (payload: { content: string; attachments: ConversationAttachment[] }) => Promise<void>;
    disabled: boolean;
}) {
    const [draft, setDraft] = useState("");
    const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
    const [sending, setSending] = useState(false);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const addToast = useToastStore((state) => state.addToast);

    const readyAttachments = useMemo(() => attachments.filter((item) => item.status === "ready" && item.attachment).map((item) => item.attachment as ConversationAttachment), [attachments]);
    const busy = attachments.some((item) => item.status === "uploading");

    async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (!files.length) return;

        if (attachments.filter((item) => item.status !== "error").length + files.length > 5) {
            addToast({ type: "error", title: "Too many attachments", message: "You can attach up to 5 files per message." });
            return;
        }

        for (const file of files) {
            if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
                addToast({ type: "error", title: "Unsupported file", message: "Only JPG, JPEG, PNG, WEBP, and PDF files are supported." });
                continue;
            }

            if (file.size > ATTACHMENT_LIMIT_MB * 1024 * 1024) {
                addToast({ type: "error", title: "File too large", message: `Attachments must be smaller than ${ATTACHMENT_LIMIT_MB}MB.` });
                continue;
            }

            const id = `${file.name}-${Date.now()}`;
            const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
            setAttachments((current) => [...current, { id, fileName: file.name, mimeType: file.type, previewUrl, status: "uploading" }]);

            try {
                const base64 = await fileToBase64(file);
                const uploaded = await conversationService.uploadMessageFile({ file: base64, fileName: file.name, mimeType: file.type });
                setAttachments((current) =>
                    current.map((item) =>
                        item.id === id
                            ? { ...item, status: "ready", attachment: uploaded, error: undefined }
                            : item
                    )
                );
            } catch (error) {
                setAttachments((current) =>
                    current.map((item) =>
                        item.id === id
                            ? { ...item, status: "error", error: getFriendlyErrorMessage(error) }
                            : item
                    )
                );
            }
        }
    }

    function removeAttachment(id: string) {
        setAttachments((current) => {
            const item = current.find((entry) => entry.id === id);
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return current.filter((entry) => entry.id !== id);
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (disabled || sending || busy) return;

        const content = draft.trim();
        if (!content && readyAttachments.length === 0) return;

        setSending(true);
        try {
            await onSend({ content, attachments: readyAttachments });
            setDraft("");
            setAttachments((current) => {
                current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
                return [];
            });
            setEmojiOpen(false);
        } finally {
            setSending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3 sm:p-4">
            {attachments.length > 0 && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {attachments.map((item) => (
                        <div key={item.id} className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${item.status === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                            {item.previewUrl ? <img src={item.previewUrl} alt={item.fileName} className="h-10 w-10 rounded-xl object-cover" loading="lazy" /> : <span className="rounded-xl bg-slate-200 px-2 py-2">PDF</span>}
                            <div className="max-w-28">
                                <p className="truncate font-semibold">{item.fileName}</p>
                                <p className="text-[11px]">{item.status === "uploading" ? "Uploading..." : item.status === "ready" ? "Ready" : item.error ?? "Failed"}</p>
                            </div>
                            <button type="button" onClick={() => removeAttachment(item.id)} className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {emojiOpen && (
                <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-lg">
                    {["😊", "👍", "🙏", "🔥", "😂", "❤️"].map((emoji) => (
                        <button key={emoji} type="button" onClick={() => setDraft((current) => `${current}${emoji}`)} className="rounded-full px-3 py-2 transition hover:bg-white">
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFiles}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                    aria-label="Attach file"
                >
                    +
                </button>
                <button
                    type="button"
                    onClick={() => setEmojiOpen((current) => !current)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                    aria-label="Add emoji"
                >
                    😊
                </button>
                <div className="flex-1 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-400">
                    <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Write a message"
                        rows={1}
                        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </div>
                <button
                    type="submit"
                    disabled={disabled || sending || busy || (!draft.trim() && readyAttachments.length === 0)}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-brand-900 px-5 text-sm font-semibold text-white transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>
        </form>
    );
}

function MessageBubble({ message, mine }: { message: ConversationMessage; mine: boolean }) {
    if (message.messageType === "SYSTEM") {
        return (
            <div className="flex justify-center py-1">
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">{message.content}</div>
            </div>
        );
    }

    const bubbleClass = mine ? "bg-brand-900 text-white" : "border border-slate-200 bg-white text-slate-800";
    const metaClass = mine ? "text-brand-100" : "text-slate-400";

    return (
        <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-sm ${bubbleClass}`}>
                {message.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>}

                {message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => (
                            <a key={attachment.id ?? attachment.url} href={attachment.url} target="_blank" rel="noreferrer" className={`block overflow-hidden rounded-2xl ${attachment.type === "IMAGE" ? "border border-white/15" : "border border-white/10"}`}>
                                {attachment.type === "IMAGE" ? (
                                    <img src={attachment.url} alt={attachment.fileName ?? "Attachment"} className="max-h-72 w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className={`flex items-center gap-3 px-4 py-3 ${mine ? "bg-white/10" : "bg-slate-50"}`}>
                                        <div className="rounded-full bg-brand-900/10 px-3 py-2 text-xs font-bold text-brand-900">PDF</div>
                                        <div>
                                            <p className="text-sm font-semibold">{attachment.fileName ?? "Document"}</p>
                                            <p className={`text-[11px] ${mine ? "text-brand-100" : "text-slate-500"}`}>Open document</p>
                                        </div>
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                )}

                <div className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${metaClass}`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {mine && <span>{messageStatus(message)}</span>}
                </div>
            </div>
        </div>
    );
}

function PropertyContextCard({ conversation }: { conversation: ConversationSummary }) {
    if (!conversation.property) return null;

    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
              {conversation.property.images[0] ? <img src={conversation.property.images[0].url} alt={conversation.property.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Property chat</p>
              <h2 className="truncate text-lg font-semibold text-slate-950">{conversation.property.title}</h2>
              <p className="truncate text-sm text-slate-500">{conversation.property.location}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-cream-100 px-2.5 py-1">{formatNaira(conversation.property.price)}/year</span>
                  <span className="rounded-full bg-cream-100 px-2.5 py-1">{conversation.property.university?.name}</span>
                  <span className="rounded-full bg-cream-100 px-2.5 py-1">{participantName(conversation.property.landlord)}</span>
              </div>
            </div>
            <Link
              to={`/properties/${conversation.property.id}`}
              className="rounded-full bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-950"
            >
              View Property
            </Link>
        </div>
      </div>
    );
}

function RoommateContextCard({ conversation, currentUserId }: { conversation: ConversationSummary; currentUserId?: string }) {
    if (!conversation.roommateMatch) return null;

    const other = conversation.primaryStudent?.userId === currentUserId ? conversation.roommateMatch.studentB : conversation.roommateMatch.studentA;
    const me = conversation.primaryStudent?.userId === currentUserId ? conversation.roommateMatch.studentA : conversation.roommateMatch.studentB;
    const sharedProfile = other.roommateProfile;

    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-lg font-bold text-white">
                    {other.avatarUrl ? <img src={other.avatarUrl} alt={participantName(other as any)} className="h-full w-full object-cover" loading="lazy" /> : initials(`${other.firstName} ${other.lastName}`)}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommate chat</p>
                    <h2 className="truncate text-lg font-semibold text-slate-950">{other.firstName} {other.lastName}</h2>
                    <p className="truncate text-sm text-slate-500">{other.university?.name ?? "Edurus university"}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-cream-100 px-2.5 py-1">{conversation.roommateMatch.score}% match</span>
                        <span className="rounded-full bg-cream-100 px-2.5 py-1">{sharedProfile?.sleepSchedule?.replace(/_/g, " ").toLowerCase() ?? "sleep flexible"}</span>
                        <span className="rounded-full bg-cream-100 px-2.5 py-1">{sharedProfile?.cleanliness?.replace(/_/g, " ").toLowerCase() ?? "shared preferences"}</span>
                    </div>
                </div>
            </div>

            {sharedProfile && (
                <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Budget: ₦{Number(sharedProfile.budgetMin).toLocaleString()}–₦{Number(sharedProfile.budgetMax).toLocaleString()}/year</span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Gender: {sharedProfile.genderPreference.toLowerCase()}</span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Smoking: {sharedProfile.isSmoker ? "Smoker" : "Non-smoker"}</span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Noise: {sharedProfile.noiseTolerance.toLowerCase()}</span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Shared with: {participantName(me as any)}</span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-2">Contact details stay private until both parties agree.</span>
                </div>
            )}
        </div>
    );
}

function ConversationShell({
    conversation,
    messages,
    isLoadingOlder,
    hasMore,
    onLoadOlder,
    onMarkRead,
    onSend,
    currentUserId,
}: {
    conversation: ConversationSummary;
    messages: ConversationMessage[];
    isLoadingOlder: boolean;
    hasMore?: boolean;
    onLoadOlder: () => void;
    onMarkRead: (messages: ConversationMessage[]) => void;
    onSend: (payload: { content: string; attachments: ConversationAttachment[] }) => Promise<void>;
    currentUserId?: string;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const scrollStateRef = useRef<{ height: number; top: number } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, [conversation.id]);

    useEffect(() => {
        onMarkRead(messages.filter((message) => message.senderId !== currentUserId && !message.readAt));
    }, [messages, onMarkRead, currentUserId]);

    useEffect(() => {
        if (!containerRef.current) return;
        if (!scrollStateRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            return;
        }

        const previous = scrollStateRef.current;
        const delta = containerRef.current.scrollHeight - previous.height;
        containerRef.current.scrollTop = previous.top + delta;
        scrollStateRef.current = null;
    }, [messages]);

    function handleScroll() {
        const node = containerRef.current;
        if (!node || !hasMore || isLoadingOlder) return;
        if (node.scrollTop > 64) return;

        scrollStateRef.current = { height: node.scrollHeight, top: node.scrollTop };
        onLoadOlder();
    }

    return (
        <div className="flex min-h-[68vh] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            {conversation.type === "PROPERTY_CHAT" ? <PropertyContextCard conversation={conversation} /> : <RoommateContextCard conversation={conversation} currentUserId={currentUserId} />}

            <div ref={containerRef} onScroll={handleScroll} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-3 py-4 sm:px-5">
                {hasMore && (
                    <div className="flex justify-center">
                        <button type="button" onClick={onLoadOlder} disabled={isLoadingOlder} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                            {isLoadingOlder ? "Loading older messages..." : "Load older messages"}
                        </button>
                    </div>
                )}

                {messages.map((message) => {
                    const mine = message.senderId === currentUserId;
                    return <MessageBubble key={message.id} message={message} mine={mine} />;
                })}
                <div ref={bottomRef} />
            </div>

            <ChatComposer onSend={onSend} disabled={!conversation.id} />
        </div>
    );
}

function groupLabel(type: ConversationSummary["type"]) {
    return type === "PROPERTY_CHAT" ? "Property Conversations" : "Roommate Conversations";
}

export default function ConversationsPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [selectedId, setSelectedId] = useState<string | undefined>(id);
    const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
    const socketUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").replace(/\/api\/v1\/?$/, "");
    const Shell = user?.role === "LANDLORD" ? LandlordMobileShell : StudentMobileShell;
    const [search, setSearch] = useState("");

const { data: conversations = [], isLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: conversationService.list,
        enabled: Boolean(user),
      });

    const selectedConversation = useMemo(() => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null, [conversations, selectedId]);

    const { data: selectedDetails } = useQuery({
        queryKey: ["conversation", selectedConversation?.id],
        queryFn: () => conversationService.get(selectedConversation!.id),
        enabled: Boolean(selectedConversation?.id),
    });

    const messagesQuery = useInfiniteQuery({
        queryKey: ["conversation-messages", selectedConversation?.id],
        queryFn: ({ pageParam }) => conversationService.listMessages(selectedConversation!.id, { cursor: pageParam as string | undefined, limit: 30 }),
        enabled: Boolean(selectedConversation?.id),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined),
    });

    const messagePages = messagesQuery.data?.pages ?? [];
    const messages = useMemo(() => messagePages.slice().reverse().flatMap((page) => page.items), [messagePages]);

    useEffect(() => {
        if (!token || !user) return;

        const client = io(socketUrl, {
            auth: { token: `Bearer ${token}` },
            transports: ["websocket"],
        });

        client.on("connect", () => setSocket(client));
        client.on("conversation:message", (message: any) => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversation", message.conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversation-messages", message.conversationId] });
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
    }, [token, user, queryClient, socketUrl, selectedConversation?.id]);

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

    useEffect(() => {
        if (selectedConversation?.id) {
            queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversation.id] });
            queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversation.id] });
        }
    }, [selectedConversation?.id, queryClient]);

    const groupedConversations = useMemo(() => {
        const filtered = conversations.filter((conversation) => {
            if (!search.trim()) return true;
            const haystack = [
                conversation.property?.title,
                conversation.property?.location,
                conversation.property?.landlord?.businessName,
                conversation.primaryStudent?.user?.email,
                conversation.secondaryStudent?.user?.email,
                conversation.lastMessageContent,
            ].filter(Boolean).join(" ").toLowerCase();
            return haystack.includes(search.trim().toLowerCase());
        });

        const sorted = [...filtered].sort((a, b) => new Date(b.lastMessageAt ?? b.updatedAt).getTime() - new Date(a.lastMessageAt ?? a.updatedAt).getTime());
        return {
            property: sorted.filter((conversation) => conversation.type === "PROPERTY_CHAT"),
            roommate: sorted.filter((conversation) => conversation.type === "ROOMMATE_CHAT"),
        };
    }, [conversations, search]);

    async function handleSend(payload: { content: string; attachments: ConversationAttachment[] }) {
        if (!selectedConversation || (!payload.content.trim() && payload.attachments.length === 0)) return;

        try {
            if (socket?.connected) {
                socket.emit("send_message", {
                    conversationId: selectedConversation.id,
                    content: payload.content.trim(),
                    attachments: payload.attachments,
                });
            } else {
                await conversationService.sendMessage(selectedConversation.id, {
                    content: payload.content.trim(),
                    attachments: payload.attachments,
                });
                await queryClient.invalidateQueries({ queryKey: ["conversations"] });
                await queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversation.id] });
            }
        } catch (error) {
            addToast({ type: "error", title: "Message failed", message: getFriendlyErrorMessage(error) });
        }
    }

    async function markRead(messagesToRead: ConversationMessage[]) {
        if (!messagesToRead.length) return;
        await Promise.all(messagesToRead.map((message) => conversationService.markAsRead(message.id).catch(() => undefined)));
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }

    return (
        <Shell>
            <div className="page-transition space-y-4 pb-4">
                <section className="mobile-card-compact p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Messages</p>
                            <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">Inbox</h1>
                            <p className="mt-2 text-sm text-slate-500">Property chats and roommate conversations in one place.</p>
                        </div>
                        {user?.role === "STUDENT" && (
                            <Link to="/properties" className="inline-flex w-fit items-center rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-950">
                                Browse properties
                            </Link>
                        )}
                    </div>
                </section>

                <main className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <aside className="mobile-card-compact flex min-h-[68vh] flex-col p-4 sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Inbox</p>
                                <p className="text-xs text-slate-500">{conversations.length} conversations</p>
                            </div>
                        </div>

                        <label className="mb-4 block">
                            <span className="sr-only">Search conversations</span>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search conversations"
                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400"
                            />
                        </label>

                        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                            {isLoading ? (
                                <p className="text-sm text-slate-500">Loading conversations…</p>
                            ) : conversations.length === 0 ? (
                                <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No conversations yet. Open a property or start a roommate chat to begin.</p>
                            ) : (
                                <>
                                    {(["property", "roommate"] as const).map((section) => {
                                        const sectionConversations = groupedConversations[section];
                                        if (!sectionConversations.length) return null;

                                        return (
                                            <div key={section} className="space-y-2">
                                                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{groupLabel(section === "property" ? "PROPERTY_CHAT" : "ROOMMATE_CHAT")}</h2>
                                                {sectionConversations.map((conversation) => {
                                                    const latestMessage = conversation.messages?.[0] ?? (conversation.lastMessageContent ? {
                                                        id: conversation.lastMessageId ?? conversation.id,
                                                        conversationId: conversation.id,
                                                        senderId: conversation.lastMessageSenderId ?? "",
                                                        content: conversation.lastMessageContent,
                                                        messageType: conversation.lastMessageType ?? "TEXT",
                                                        isRead: true,
                                                        deliveredAt: conversation.lastMessageAt,
                                                        createdAt: conversation.lastMessageAt ?? conversation.updatedAt,
                                                        attachments: [],
                                                        sender: conversation.primaryStudent?.user ?? conversation.secondaryStudent?.user ?? conversation.roommateMatch?.studentA.user ?? conversation.roommateMatch?.studentB.user ?? conversation.landlord?.user,
                                                    } as ConversationMessage : null);
                                                    const isActive = selectedConversation?.id === conversation.id;
                                                    const unreadCount = conversation.unreadCount ?? 0;

                                                    return (
                                                        <button
                                                            key={conversation.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedId(conversation.id);
                                                                navigate(`/conversations/${conversation.id}`);
                                                            }}
                                                            className={`w-full rounded-[22px] border p-3 text-left transition ${isActive ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-sm font-bold text-white">
                                                                    {conversationAvatar(conversation, user?.id)}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="min-w-0">
                                                                            <p className="truncate font-semibold text-slate-900">{conversationTitle(conversation, user?.id)}</p>
                                                                            <p className="truncate text-xs text-slate-500">{conversationSubtitle(conversation)}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[11px] text-slate-400">{formatRelative(conversation.lastMessageAt ?? conversation.updatedAt)}</p>
                                                                            {unreadCount > 0 && <span className="mt-1 inline-flex rounded-full bg-brand-900 px-2 py-1 text-[10px] font-semibold text-white">{unreadCount}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                                                                        <span className="rounded-full bg-cream-100 px-2.5 py-1 font-semibold text-slate-700">{conversation.type === "PROPERTY_CHAT" ? "Property" : "Roommate"}</span>
                                                                        {canShowVerificationBadge(conversation, user?.id) && <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">Verified</span>}
                                                                    </div>
                                                                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{latestMessage?.content || (conversation.type === "ROOMMATE_CHAT" ? "Roommate conversation ready" : "No messages yet")}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </aside>

                    <section className="min-w-0">
                        {selectedDetails && selectedConversation ? (
                            <ConversationShell
                                conversation={selectedDetails}
                                messages={messages}
                                isLoadingOlder={messagesQuery.isFetchingNextPage}
                                hasMore={messagesQuery.hasNextPage}
                                onLoadOlder={() => void messagesQuery.fetchNextPage()}
                                onMarkRead={(items) => void markRead(items)}
                                onSend={handleSend}
                                currentUserId={user?.id}
                            />
                        ) : (
                            <div className="mobile-card-compact flex min-h-[68vh] items-center justify-center p-6 text-sm text-slate-500">
                                Pick a conversation to continue.
                            </div>
                        )}
                    </section>
                </main>
                {typingConversationId && <p className="px-1 text-xs text-slate-400">Typing indicator active</p>}
            </div>
        </Shell>
    );
}
