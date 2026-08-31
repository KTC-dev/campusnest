import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { AgentMobileShell } from "@/components/AgentMobileShell";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";
import { fileToBase64 } from "@/utils/file";
import type { ConversationAttachment, ConversationMessage, ConversationSummary } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

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

function formatNaira(value?: string | null) {
  if (!value) return "";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value));
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
    return conversation.property ? participantName(conversation.property.agent) : "Property chat";
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
    return initials(conversation.property ? participantName(conversation.property.agent) : "Property");
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
  if (conversation.type === "PROPERTY_CHAT") return Boolean(conversation.property?.agent.isVerified);
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
    <form onSubmit={handleSubmit} className="border-t border-border bg-white/90 p-3 backdrop-blur-xl sm:p-4">
      {attachments.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {attachments.map((item) => (
            <div key={item.id} className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${item.status === "error" ? "border-error/30 bg-error/5 text-error" : "border-border bg-cream-50 text-text.primary"}`}>
              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.fileName} className="h-10 w-10 rounded-xl object-cover" loading="lazy" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-[10px] font-bold text-slate-600">PDF</div>
              )}
              <div className="max-w-28">
                <p className="truncate font-semibold">{item.fileName}</p>
                <p className="text-[11px] text-text.secondary">{item.status === "uploading" ? "Uploading..." : item.status === "ready" ? "Ready" : item.error ?? "Failed"}</p>
              </div>
              <button type="button" onClick={() => removeAttachment(item.id)} className="text-xs font-semibold text-text.secondary hover:text-text.primary">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {emojiOpen && (
        <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-border bg-cream-50 p-2 text-lg">
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
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text.secondary transition hover:border-brand-200 active:scale-95"
          aria-label="Attach file"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        <button
          type="button"
          onClick={() => setEmojiOpen((current) => !current)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text.secondary transition hover:border-brand-200 active:scale-95"
          aria-label="Add emoji"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </button>
        <div className="flex-1 rounded-[24px] border border-border bg-cream-50 px-4 py-3 focus-within:border-brand-400 transition-colors">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message"
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-text.primary outline-none placeholder:text-text.secondary/60"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={disabled || sending || busy || (!draft.trim() && readyAttachments.length === 0)}
          loading={sending}
          className="shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </Button>
      </div>
    </form>
  );
}

function MessageBubble({ message, mine }: { message: ConversationMessage; mine: boolean }) {
  if (message.messageType === "SYSTEM") {
    return (
      <div className="flex justify-center py-1">
        <div className="rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-text.secondary">{message.content}</div>
      </div>
    );
  }

  const bubbleClass = mine ? "bg-brand-900 text-white" : "border border-border bg-card text-text.primary";

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-sm ${bubbleClass}`}>
        {message.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>}

        {message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id ?? attachment.url}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className={`block overflow-hidden rounded-2xl ${mine ? "border border-white/15" : "border border-border"}`}
              >
                {attachment.type === "IMAGE" ? (
                  <img src={attachment.url} alt={attachment.fileName ?? "Attachment"} className="max-h-72 w-full object-cover" loading="lazy" />
                ) : (
                  <div className={`flex items-center gap-3 px-4 py-3 ${mine ? "bg-white/10" : "bg-cream-50"}`}>
                    <div className="rounded-full bg-brand-900/10 px-3 py-2 text-xs font-bold text-brand-900">PDF</div>
                    <div>
                      <p className="text-sm font-semibold text-text.primary">{attachment.fileName ?? "Document"}</p>
                      <p className={`text-[11px] ${mine ? "text-brand-100" : "text-text.secondary"}`}>Open document</p>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        <div className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${mine ? "text-brand-100" : "text-text.secondary"}`}>
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
    <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-100">
          {conversation.property.images[0] ? <img src={conversation.property.images[0].url} alt={conversation.property.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-xs text-text.secondary">No image</div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Property chat</p>
          <h2 className="truncate text-lg font-semibold text-text.primary">{conversation.property.title}</h2>
          <p className="truncate text-sm text-text.secondary">{conversation.property.location}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text.secondary">
            <span className="rounded-full bg-cream-50 px-2.5 py-1">{formatNaira(conversation.property.price)}/year</span>
            <span className="rounded-full bg-cream-50 px-2.5 py-1">{conversation.property.university?.name}</span>
            <span className="rounded-full bg-cream-50 px-2.5 py-1">{participantName(conversation.property.agent)}</span>
          </div>
        </div>
        <Link
          to={`/properties/${conversation.property.id}`}
          className="shrink-0 rounded-full bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-950 active:scale-95"
        >
          View
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
    <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-lg font-bold text-white">
          {other.avatarUrl ? <img src={other.avatarUrl} alt={participantName(other as any)} className="h-full w-full object-cover" loading="lazy" /> : initials(`${other.firstName} ${other.lastName}`)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommate chat</p>
          <h2 className="truncate text-lg font-semibold text-text.primary">{other.firstName} {other.lastName}</h2>
          <p className="truncate text-sm text-text.secondary">{other.university?.name ?? "Edurus university"}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text.secondary">
            <span className="rounded-full bg-cream-50 px-2.5 py-1">{conversation.roommateMatch.score}% match</span>
            <span className="rounded-full bg-cream-50 px-2.5 py-1">{sharedProfile?.sleepSchedule?.replace(/_/g, " ").toLowerCase() ?? "Sleep flexible"}</span>
            <span className="rounded-full bg-cream-50 px-2.5 py-1">{sharedProfile?.cleanliness?.replace(/_/g, " ").toLowerCase() ?? "Cleanliness flexible"}</span>
          </div>
        </div>
      </div>

      {sharedProfile && (
        <div className="mt-4 grid gap-2 text-xs text-text.secondary sm:grid-cols-2">
          <span className="rounded-2xl bg-cream-50 px-3 py-2">Budget: {formatNaira(sharedProfile.budgetMin)}–{formatNaira(sharedProfile.budgetMax)}/year</span>
          <span className="rounded-2xl bg-cream-50 px-3 py-2">Gender: {sharedProfile.genderPreference.toLowerCase()}</span>
          <span className="rounded-2xl bg-cream-50 px-3 py-2">Smoking: {sharedProfile.isSmoker ? "Smoker" : "Non-smoker"}</span>
          <span className="rounded-2xl bg-cream-50 px-3 py-2">Noise: {sharedProfile.noiseTolerance.toLowerCase()}</span>
          <span className="rounded-2xl bg-cream-50 px-3 py-2">Shared with: {participantName(me as any)}</span>
          <span className="rounded-2xl bg-cream-50 px-3 py-2">Contact details stay private until both parties agree.</span>
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
    <div className="flex min-h-[68vh] flex-col overflow-hidden rounded-[28px] border border-border bg-white shadow-sm">
      {conversation.type === "PROPERTY_CHAT" ? <PropertyContextCard conversation={conversation} /> : <RoommateContextCard conversation={conversation} currentUserId={currentUserId} />}

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 space-y-4 overflow-y-auto bg-cream-50 px-3 py-4 sm:px-5">
        {hasMore && (
          <div className="flex justify-center">
            <button type="button" onClick={onLoadOlder} disabled={isLoadingOlder} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-text.secondary shadow-sm transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-60">
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

export default function ConversationsPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(id);
  const socketUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").replace(/\/api\/v1\/?$/, "");
  const Shell = user?.role === "AGENT" ? AgentMobileShell : StudentMobileShell;
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
        conversation.property?.agent?.businessName,
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
      <div className="page-enter space-y-5 pb-4">
        <section className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Messages</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-text.primary">Inbox</h1>
            <p className="mt-1 text-xs text-text.secondary">Property chats and roommate conversations</p>
          </div>
          {user?.role === "STUDENT" && (
            <Link to="/properties" className="shrink-0 rounded-full bg-brand-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-950 active:scale-95">
              Browse
            </Link>
          )}
        </section>

        <main className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="mobile-card-compact flex min-h-[68vh] flex-col">
            <div className="border-b border-border p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Inbox</p>
                  <p className="text-xs text-text.secondary">{conversations.length} conversations</p>
                </div>
              </div>

              <label className="block">
                <span className="sr-only">Search conversations</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 placeholder:text-text.secondary/60"
                />
              </label>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-16 w-full animate-pulse rounded-2xl bg-cream-100" />
                  <div className="h-16 w-full animate-pulse rounded-2xl bg-cream-100" />
                  <div className="h-16 w-full animate-pulse rounded-2xl bg-cream-100" />
                </div>
              ) : conversations.length === 0 ? (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    }
                    title="No conversations yet"
                    description="Open a property or start a roommate chat to begin messaging."
                    actionLabel="Browse properties"
                    onAction={() => navigate("/properties")}
                  />
                </Card>
              ) : (
                <>
                  {(["property", "roommate"] as const).map((section) => {
                    const sectionConversations = groupedConversations[section];
                    if (!sectionConversations.length) return null;

                    return (
                      <div key={section} className="space-y-2">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text.secondary">{groupLabel(section === "property" ? "PROPERTY_CHAT" : "ROOMMATE_CHAT")}</h2>
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
                            sender: conversation.primaryStudent?.user ?? conversation.secondaryStudent?.user ?? conversation.roommateMatch?.studentA.user ?? conversation.roommateMatch?.studentB.user ?? conversation.agent?.user,
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
                              className={`w-full rounded-[22px] border p-3 text-left transition-all duration-200 active:scale-[0.98] ${isActive ? "border-brand-400 bg-brand-50" : "border-border bg-card hover:border-brand-200"}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-sm font-bold text-white">
                                  {conversationAvatar(conversation, user?.id)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-text.primary">{conversationTitle(conversation, user?.id)}</p>
                                      <p className="truncate text-xs text-text.secondary">{conversationSubtitle(conversation)}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[11px] text-text.secondary">{formatRelative(conversation.lastMessageAt ?? conversation.updatedAt)}</p>
                                      {unreadCount > 0 && <span className="mt-1 inline-flex rounded-full bg-brand-900 px-2 py-1 text-[10px] font-semibold text-white">{unreadCount}</span>}
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                                    <span className="rounded-full bg-cream-50 px-2.5 py-1 font-semibold text-text.secondary">{conversation.type === "PROPERTY_CHAT" ? "Property" : "Roommate"}</span>
                                    {canShowVerificationBadge(conversation, user?.id) && <VerifiedBadge size={16} />}
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-sm text-text.secondary">{latestMessage?.content || (conversation.type === "ROOMMATE_CHAT" ? "Roommate conversation ready" : "No messages yet")}</p>
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
              <Card variant="outlined" padding="lg">
                <EmptyState
                  icon={
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  }
                  title="Pick a conversation"
                  description="Select a conversation from the list to start messaging."
                />
              </Card>
            )}
          </section>
        </main>
      </div>
    </Shell>
  );
}

function groupLabel(type: ConversationSummary["type"]) {
  return type === "PROPERTY_CHAT" ? "Property Conversations" : "Roommate Conversations";
}
