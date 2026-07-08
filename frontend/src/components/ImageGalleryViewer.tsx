import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface GalleryImage {
    id: string;
    url: string;
    alt?: string;
    label?: string;
}

interface ImageGalleryViewerProps {
    images: GalleryImage[];
    open: boolean;
    onClose: () => void;
    initialIndex?: number;
    title?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function distance(pointA: { x: number; y: number }, pointB: { x: number; y: number }) {
    return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

export function ImageGalleryViewer({ images, open, onClose, initialIndex = 0, title }: ImageGalleryViewerProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const gestureRef = useRef({
        pointers: new Map<number, { x: number; y: number }>(),
        startDistance: 0,
        startZoom: 1,
        startOffset: { x: 0, y: 0 },
        startPoint: { x: 0, y: 0 },
    });

    const imageCount = images.length;
    const currentImage = useMemo(() => images[clamp(activeIndex, 0, Math.max(imageCount - 1, 0))], [activeIndex, imageCount, images]);

    useEffect(() => {
        if (!open) return;
        setActiveIndex(clamp(initialIndex, 0, Math.max(images.length - 1, 0)));
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setIsPanning(false);
        gestureRef.current = {
            pointers: new Map<number, { x: number; y: number }>(),
            startDistance: 0,
            startZoom: 1,
            startOffset: { x: 0, y: 0 },
            startPoint: { x: 0, y: 0 },
        };
    }, [open, initialIndex, images.length]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
            if (event.key === "ArrowRight") setActiveIndex((current) => clamp(current + 1, 0, Math.max(images.length - 1, 0)));
            if (event.key === "ArrowLeft") setActiveIndex((current) => clamp(current - 1, 0, Math.max(images.length - 1, 0)));
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [images.length, onClose, open]);

    if (!open || imageCount === 0 || !currentImage) return null;

    function goNext() {
        setActiveIndex((current) => clamp(current + 1, 0, imageCount - 1));
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }

    function goPrev() {
        setActiveIndex((current) => clamp(current - 1, 0, imageCount - 1));
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.button !== 0) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        const gesture = gestureRef.current;
        gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        gesture.startPoint = { x: event.clientX, y: event.clientY };
        gesture.startZoom = zoom;
        gesture.startOffset = offset;
        if (gesture.pointers.size === 2) {
            const [pointA, pointB] = Array.from(gesture.pointers.values());
            gesture.startDistance = distance(pointA, pointB);
        }
        setIsPanning(true);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const gesture = gestureRef.current;
        if (!gesture.pointers.has(event.pointerId)) return;

        gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (gesture.pointers.size === 2) {
            const [pointA, pointB] = Array.from(gesture.pointers.values());
            const nextZoom = clamp((distance(pointA, pointB) / Math.max(gesture.startDistance || distance(pointA, pointB), 1)) * gesture.startZoom, MIN_ZOOM, MAX_ZOOM);
            setZoom(nextZoom);
            return;
        }

        if (gesture.pointers.size === 1) {
            const deltaX = event.clientX - gesture.startPoint.x;
            const deltaY = event.clientY - gesture.startPoint.y;

            if (zoom > 1) {
                setOffset({ x: gesture.startOffset.x + deltaX, y: gesture.startOffset.y + deltaY });
            } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                setOffset({ x: deltaX, y: 0 });
            }
        }
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        const gesture = gestureRef.current;
        gesture.pointers.delete(event.pointerId);
        setIsPanning(false);

        if (gesture.pointers.size === 0) {
            if (zoom <= 1 && Math.abs(offset.x) > 60) {
                if (offset.x < 0) {
                    goNext();
                } else {
                    goPrev();
                }
            }
            if (zoom <= 1) {
                setOffset({ x: 0, y: 0 });
            }
        }
    }

    function resetZoom() {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 px-3 py-4 backdrop-blur-md sm:px-6">
            <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">{title ?? "Image viewer"}</p>
                        <p className="truncate text-sm text-white/80">{currentImage.label ?? currentImage.alt ?? `Image ${activeIndex + 1}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                            {activeIndex + 1}/{imageCount}
                        </span>
                        <button type="button" onClick={resetZoom} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15">
                            Reset zoom
                        </button>
                        <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white transition hover:bg-white/15">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden">
                    <div
                        className="absolute inset-0 flex items-center justify-center touch-none select-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{ touchAction: "none" }}
                    >
                        <div
                            className="relative flex h-full w-full items-center justify-center"
                            style={{
                                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                                transition: isPanning ? "none" : "transform 180ms ease-out",
                            }}
                        >
                            <img
                                src={currentImage.url}
                                alt={currentImage.alt ?? currentImage.label ?? `Image ${activeIndex + 1}`}
                                className="max-h-full max-w-full object-contain"
                                draggable={false}
                            />
                        </div>
                    </div>

                    {imageCount > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                            >
                                Next
                            </button>
                        </>
                    )}
                </div>

                {imageCount > 1 && (
                    <div className="border-t border-white/10 bg-white/5 px-3 py-3 sm:px-4">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((image, index) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${index === activeIndex ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}
                                >
                                    <img src={image.url} alt={image.alt ?? image.label ?? `Thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                    <span className="absolute inset-x-0 bottom-0 bg-black/40 px-1 py-0.5 text-[10px] font-semibold text-white">{index + 1}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}