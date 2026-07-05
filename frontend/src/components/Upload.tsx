import { ChangeEvent, DragEvent, useId, useMemo, useRef, useState } from "react";
import { fileToBase64 } from "@/utils/file";

export type UploadState = "idle" | "uploading" | "success" | "failed" | "cancelled" | "validation-error";

interface UploadFileItem {
    id: string;
    file: File;
    state: UploadState;
    progress: number;
    previewUrl?: string;
    error?: string;
}

interface UploadProps {
    value?: string | string[];
    onChange?: (files: string[]) => void;
    onFileAdded?: (file: File) => Promise<string>;
    multiple?: boolean;
    accept?: string;
    maxSizeMb?: number;
    label?: string;
    helperText?: string;
    uploadMode?: "base64" | "remote";
    disabled?: boolean;
    className?: string;
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type === "application/pdf") return "📄";
    return "📎";
}

export function Upload({
    value,
    onChange,
    onFileAdded,
    multiple = false,
    accept = "image/*,.pdf",
    maxSizeMb = 10,
    label = "Upload files",
    helperText = "Drag & drop or browse",
    uploadMode = "base64",
    disabled = false,
    className = "",
}: UploadProps) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [items, setItems] = useState<UploadFileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const currentValues = useMemo(() => {
        if (Array.isArray(value)) return value;
        return value ? [value] : [];
    }, [value]);

    function validateFile(file: File) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            return "Only JPG, PNG, WEBP, and PDF files are supported.";
        }

        const maxBytes = maxSizeMb * 1024 * 1024;
        if (file.size > maxBytes) {
            return `File exceeds the ${maxSizeMb}MB limit.`;
        }

        return null;
    }

    async function processFile(file: File) {
        const validationError = validateFile(file);
        if (validationError) {
            setItems((prev) => [...prev, {
                id: `${file.name}-${Date.now()}`,
                file,
                state: "validation-error",
                progress: 0,
                error: validationError,
            }]);
            return;
        }

        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        const item: UploadFileItem = {
            id: `${file.name}-${Date.now()}`,
            file,
            state: "uploading",
            progress: 0,
            previewUrl,
        };

        setItems((prev) => [...prev, item]);

        try {
            if (onFileAdded) {
                const uploadedUrl = await onFileAdded(file);
                setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, state: "success", progress: 100, previewUrl: entry.previewUrl } : entry)));
                const nextValues = [...currentValues, uploadedUrl];
                onChange?.(multiple ? nextValues : [uploadedUrl]);
            } else if (uploadMode === "base64") {
                const base64 = await fileToBase64(file);
                setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, state: "success", progress: 100 } : entry)));
                onChange?.(multiple ? [...currentValues, base64] : [base64]);
            } else {
                setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, state: "success", progress: 100 } : entry)));
            }
        } catch (error: any) {
            setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, state: "failed", progress: Math.max(entry.progress, 25), error: error?.message ?? "Upload failed." } : entry)));
        }
    }

    function handleSelection(files: FileList | null) {
        if (!files?.length) return;
        const filesList = Array.from(files);
        filesList.forEach(processFile);
        if (inputRef.current) inputRef.current.value = "";
    }

    function dropHandler(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
        handleSelection(event.dataTransfer.files);
    }

    function cancelItem(id: string) {
        setItems((prev) => prev.map((entry) => (entry.id === id ? { ...entry, state: "cancelled", progress: 0 } : entry)));
    }

    function removeItem(id: string) {
        setItems((prev) => prev.filter((entry) => entry.id !== id));
    }

    return (
        <div className={className}>
            <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={dropHandler}
                onClick={() => !disabled && inputRef.current?.click()}
                className={`rounded-2xl border border-dashed p-4 transition ${isDragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50"} ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
            >
                <input
                    id={inputId}
                    ref={inputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => handleSelection(event.target.files)}
                    className="hidden"
                    disabled={disabled}
                />
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">{helperText}</p>
                    <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, PDF · up to {maxSizeMb}MB</p>
                </div>
            </div>

            <div className="mt-3 space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                                {item.previewUrl ? <img src={item.previewUrl} alt="Preview" className="h-full w-full rounded-xl object-cover" /> : getFileIcon(item.file)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-slate-800">{item.file.name}</p>
                                    <span className="text-xs text-slate-500">{formatSize(item.file.size)}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{item.state === "uploading" ? "Uploading…" : item.state === "success" ? "Upload complete" : item.state === "failed" ? item.error : item.state === "validation-error" ? item.error : item.state === "cancelled" ? "Cancelled" : "Ready"}</p>
                                {(item.state === "uploading" || item.state === "success" || item.state === "failed") && (
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div className={`h-full rounded-full transition-all ${item.state === "success" ? "bg-emerald-500" : item.state === "failed" ? "bg-red-500" : "bg-brand-500"}`} style={{ width: `${item.progress}%` }} />
                                    </div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {item.state === "uploading" && (
                                        <button type="button" onClick={() => cancelItem(item.id)} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                                            Cancel
                                        </button>
                                    )}
                                    {item.state === "failed" && (
                                        <button type="button" onClick={() => processFile(item.file)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                                            Retry
                                        </button>
                                    )}
                                    {(item.state === "success" || item.state === "failed" || item.state === "cancelled" || item.state === "validation-error") && (
                                        <button type="button" onClick={() => removeItem(item.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
