import { ChangeEvent, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

interface PropertyImageUploaderProps {
    onChange: (images: string[]) => void;
    onBusyChange?: (busy: boolean) => void;
    maxImages?: number;
    maxSizeMb?: number;
    label?: string;
    helperText?: string;
    className?: string;
    disabled?: boolean;
}

type ItemState = "queued" | "compressing" | "ready" | "error";

interface DraftImage {
    id: string;
    file: File;
    previewUrl: string;
    dataUrl?: string;
    state: ItemState;
    progress: number;
    error?: string;
    isCover: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Could not read image data."));
        reader.readAsDataURL(blob);
    });
}

async function loadFallbackImage(file: File) {
    const objectUrl = URL.createObjectURL(file);
    try {
        return await new Promise<HTMLImageElement>((resolve, reject) => {
            const element = new Image();
            element.onload = () => resolve(element);
            element.onerror = () => reject(new Error("Could not load image for optimization."));
            element.src = objectUrl;
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function compressFile(file: File) {
    if (typeof createImageBitmap === "function") {
        const bitmap = await createImageBitmap(file);
        try {
            const maxDimension = 1600;
            const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
            const width = Math.max(1, Math.round(bitmap.width * scale));
            const height = Math.max(1, Math.round(bitmap.height * scale));

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Could not prepare image compression.");
            context.drawImage(bitmap, 0, 0, width, height);

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Could not optimize image."))), "image/webp", 0.84);
            });

            return fileToDataUrl(blob);
        } finally {
            bitmap.close?.();
        }
    }

    const loaded = await loadFallbackImage(file);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(loaded.naturalWidth, loaded.naturalHeight));
    const width = Math.max(1, Math.round(loaded.naturalWidth * scale));
    const height = Math.max(1, Math.round(loaded.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare image compression.");
    context.drawImage(loaded, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Could not optimize image."))), "image/webp", 0.84);
    });
    return fileToDataUrl(blob);
}

function UploadCloudIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
            <path
                fill="currentColor"
                d="M9 3.75A2.75 2.75 0 0 0 6.25 6.5v.25H5A2.75 2.75 0 0 0 2.25 9.5v7A2.75 2.75 0 0 0 5 19.25h14A2.75 2.75 0 0 0 21.75 16.5v-7A2.75 2.75 0 0 0 19 6.75h-1.25V6.5A2.75 2.75 0 0 0 15 3.75H9Zm0 1.5h6A1.25 1.25 0 0 1 16.25 6.5v1a.75.75 0 0 0 .75.75H19A1.25 1.25 0 0 1 20.25 9.5v7A1.25 1.25 0 0 1 19 17.75H5A1.25 1.25 0 0 1 3.75 16.5v-7A1.25 1.25 0 0 1 5 8.25h2a.75.75 0 0 0 .75-.75v-1A1.25 1.25 0 0 1 9 5.25Zm3 2.75a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
            />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path
                fill="currentColor"
                d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.76 9.76 0 0 0 12 2.25Zm4.72 7.97-5.25 5.5a.75.75 0 0 1-1.07.02l-2.85-2.85a.75.75 0 0 1 1.06-1.06l2.3 2.3 4.72-4.95a.75.75 0 0 1 1.09 1.04Z"
            />
        </svg>
    );
}

export function PropertyImageUploader({
    onChange,
    onBusyChange,
    maxImages = 5,
    maxSizeMb = 10,
    label = "Property images",
    helperText = "Upload up to 5 photos, choose a cover image, and reorder them before saving.",
    className = "",
    disabled = false,
}: PropertyImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const replaceInputRef = useRef<HTMLInputElement | null>(null);
    const replaceTargetId = useRef<string | null>(null);
    const dragId = useRef<string | null>(null);
    const pointerActive = useRef<{ id: number; x: number; y: number } | null>(null);
    const [items, setItems] = useState<DraftImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const busy = useMemo(() => items.some((item) => item.state === "queued" || item.state === "compressing"), [items]);

    useEffect(() => {
        onBusyChange?.(busy);
    }, [busy, onBusyChange]);

    useEffect(() => {
        const readyImages = items.filter((item) => item.state === "ready" && item.dataUrl).map((item) => item.dataUrl as string);
        onChange(readyImages);
    }, [items, onChange]);

    useEffect(() => {
        return () => {
            items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, []);

    function validateFile(file: File) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return "Only JPG, JPEG, PNG, and WEBP images are supported.";
        }

        const maxBytes = maxSizeMb * 1024 * 1024;
        if (file.size > maxBytes) {
            return `Each image must be smaller than ${maxSizeMb}MB.`;
        }

        return null;
    }

    function emitError(message: string) {
        setError(message);
        window.setTimeout(() => setError((current) => (current === message ? null : current)), 4500);
    }

    function moveItem(sourceId: string, targetId: string) {
        setItems((current) => {
            const sourceIndex = current.findIndex((item) => item.id === sourceId);
            const targetIndex = current.findIndex((item) => item.id === targetId);
            if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return current;
            const next = [...current];
            const [moving] = next.splice(sourceIndex, 1);
            next.splice(targetIndex, 0, moving);
            return next.map((item, index) => ({ ...item, isCover: index === 0 }));
        });
    }

    async function processFile(file: File, targetId?: string | null) {
        const validationError = validateFile(file);
        if (validationError) {
            emitError(validationError);
            setItems((current) => {
                if (targetId) {
                    return current.map((item) =>
                        item.id === targetId
                            ? { ...item, state: "error", error: validationError, progress: 0 }
                            : item
                    );
                }

                const nextItem: DraftImage = {
                    id: `${file.name}-${Date.now()}`,
                    file,
                    previewUrl: URL.createObjectURL(file),
                    state: "error",
                    progress: 0,
                    error: validationError,
                    isCover: current.length === 0,
                };

                return [...current, nextItem];
            });
            return;
        }

        const compressedPreviewUrl = URL.createObjectURL(file);
        const nextId = targetId ?? `${file.name}-${Date.now()}`;

        setItems((current) => {
            if (targetId) {
                return current.map((item) =>
                    item.id === targetId
                        ? { ...item, file, previewUrl: compressedPreviewUrl, state: "queued", progress: 5, error: undefined }
                        : item
                );
            }

            if (current.filter((item) => item.state !== "error").length >= maxImages) {
                emitError(`You can upload up to ${maxImages} images.`);
                URL.revokeObjectURL(compressedPreviewUrl);
                return current;
            }

            const nextItem: DraftImage = {
                id: nextId,
                file,
                previewUrl: compressedPreviewUrl,
                state: "queued",
                progress: 5,
                isCover: current.filter((item) => item.state !== "error").length === 0,
            };

            return [...current, nextItem];
        });

        window.setTimeout(() => {
            setItems((current) => current.map((item) => (item.id === nextId ? { ...item, state: "compressing", progress: 25 } : item)));
        }, 0);

        try {
            const dataUrl = await compressFile(file);
            setItems((current) =>
                current.map((item) =>
                    item.id === nextId
                        ? { ...item, state: "ready", progress: 100, dataUrl, error: undefined }
                        : item
                )
            );
        } catch (processingError: any) {
            const message = processingError?.message ?? "Could not optimize this image.";
            setItems((current) =>
                current.map((item) =>
                    item.id === nextId
                        ? { ...item, state: "error", progress: 0, error: message }
                        : item
                )
            );
            emitError(message);
        }
    }

    function handleFiles(files: FileList | null) {
        if (!files?.length) return;

        const selectedFiles = Array.from(files);
        const remainingSlots = maxImages - items.filter((item) => item.state !== "error").length;
        if (remainingSlots <= 0) {
            emitError(`You can upload up to ${maxImages} images.`);
            return;
        }

        selectedFiles.slice(0, replaceTargetId.current ? 1 : remainingSlots).forEach((file) => {
            void processFile(file, replaceTargetId.current);
        });

        if (selectedFiles.length > remainingSlots) {
            emitError(`Only ${remainingSlots} more image${remainingSlots === 1 ? " is" : "s are"} allowed.`);
        }

        replaceTargetId.current = null;
        if (inputRef.current) inputRef.current.value = "";
        if (replaceInputRef.current) replaceInputRef.current.value = "";
    }

    function removeItem(id: string) {
        setItems((current) => {
            const next = current.filter((item) => item.id !== id);
            return next.map((item, index) => ({ ...item, isCover: index === 0 }));
        });
    }

    function setCover(id: string) {
        setItems((current) => {
            const index = current.findIndex((item) => item.id === id);
            if (index < 0) return current;
            const next = [...current];
            const [selected] = next.splice(index, 1);
            next.unshift(selected);
            return next.map((item, itemIndex) => ({ ...item, isCover: itemIndex === 0 }));
        });
    }

    function beginReplace(id: string) {
        replaceTargetId.current = id;
        replaceInputRef.current?.click();
    }

    function beginAdd() {
        replaceTargetId.current = null;
        inputRef.current?.click();
    }

    function handleAddChange(event: ChangeEvent<HTMLInputElement>) {
        handleFiles(event.target.files);
    }

    function handleReplaceChange(event: ChangeEvent<HTMLInputElement>) {
        handleFiles(event.target.files);
    }

    function handleDragStart(id: string) {
        dragId.current = id;
    }

    function handleDrop(targetId: string) {
        if (!dragId.current) return;
        moveItem(dragId.current, targetId);
        dragId.current = null;
    }

    function handlePointerDown(id: string, event: ReactPointerEvent<HTMLDivElement>) {
        pointerActive.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        dragId.current = id;
        event.currentTarget.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        if (!pointerActive.current || pointerActive.current.id !== event.pointerId || !dragId.current) return;
        const deltaX = event.clientX - pointerActive.current.x;
        const deltaY = event.clientY - pointerActive.current.y;
        if (Math.hypot(deltaX, deltaY) < 12) return;

        const targetElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
        const targetId = targetElement?.closest("[data-image-id]")?.getAttribute("data-image-id");
        if (targetId && targetId !== dragId.current) {
            moveItem(dragId.current, targetId);
            dragId.current = targetId;
            pointerActive.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        }
    }

    function handlePointerUp() {
        pointerActive.current = null;
        dragId.current = null;
    }

    return (
        <div className={className}>
            <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                    <label className="block text-sm font-semibold text-slate-700">{label}</label>
                    <p className="mt-1 text-xs text-slate-500">{helperText}</p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {items.filter((item) => item.state !== "error").length}/{maxImages}
                </p>
            </div>

            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    handleFiles(event.dataTransfer.files);
                }}
                onClick={beginAdd}
                className={`group rounded-[24px] border-2 border-dashed p-4 transition ${isDragging ? "border-brand-900 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-brand-900/30 hover:bg-brand-50/40"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        beginAdd();
                    }
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAddChange}
                    className="hidden"
                    disabled={disabled}
                />
                <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleReplaceChange}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition ${isDragging ? "bg-brand-900 text-white" : "bg-brand-900/10 text-brand-900 group-hover:bg-brand-900/15"}`}>
                        <UploadCloudIcon />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Tap, paste, drag, or browse to add images</p>
                    <p className="mt-1 text-xs text-slate-500">JPG, JPEG, PNG, WEBP · up to {maxSizeMb}MB each · max {maxImages}</p>
                </div>
            </div>

            {error && <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        data-image-id={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(item.id)}
                        onPointerDown={(event) => handlePointerDown(item.id, event)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className={`overflow-hidden rounded-[24px] border bg-white shadow-sm transition ${item.isCover ? "border-brand-900/40 ring-2 ring-brand-900/10" : "border-slate-200"}`}
                    >
                        <div className="relative aspect-[4/3] bg-slate-100">
                            <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" loading="lazy" />
                            <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-white">
                                {index + 1}/{maxImages}
                            </div>
                            {item.isCover && <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-900">Cover photo</div>}
                            {item.state !== "ready" && (
                                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/90 px-3 py-2 text-xs text-slate-700 backdrop-blur-sm">
                                    <p className="font-semibold">{item.state === "error" ? "Needs attention" : item.state === "compressing" ? "Optimizing image" : "Preparing image"}</p>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div className={`h-full rounded-full ${item.state === "error" ? "bg-rose-500" : "bg-brand-900"}`} style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{item.file.name}</p>
                                    <p className="mt-1 text-xs text-slate-500">{formatSize(item.file.size)}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                                    {index + 1}
                                </span>
                            </div>

                            {item.error && <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{item.error}</p>}

                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => setCover(item.id)} className="rounded-full bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition active:scale-95">
                                    Set as cover
                                </button>
                                <button type="button" onClick={() => beginReplace(item.id)} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition active:scale-95">
                                    Replace
                                </button>
                                <button type="button" onClick={() => removeItem(item.id)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition active:scale-95">
                                    Delete
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-500">Drag the card or swipe it on touch devices to reorder.</p>
                        </div>
                    </div>
                ))}
            </div>

            {items.some((item) => item.state === "ready") && (
                <div className="mt-4 rounded-[18px] bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <CheckCircleIcon />
                        </span>
                        <div>
                            <p className="font-semibold text-emerald-900">Photos ready</p>
                            <p className="text-xs text-emerald-700">The first image becomes the cover photo and the order is preserved on save.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}