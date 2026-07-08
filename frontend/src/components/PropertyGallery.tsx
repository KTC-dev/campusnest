import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ImageGalleryViewer, GalleryImage } from "@/components/ImageGalleryViewer";

interface PropertyImage {
    id: string;
    url: string;
    isPrimary: boolean;
}

interface PropertyGalleryProps {
    title: string;
    images: PropertyImage[];
    className?: string;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function PropertyGallery({ title, images, className = "" }: PropertyGalleryProps) {
    const orderedImages = useMemo(() => {
        if (images.length === 0) return [];
        const primaryIndex = images.findIndex((image) => image.isPrimary);
        if (primaryIndex < 0) return images;
        return [images[primaryIndex], ...images.filter((image) => image.id !== images[primaryIndex].id)];
    }, [images]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const swipeRef = useRef({ startX: 0, startY: 0, moved: false });

    useEffect(() => {
        setActiveIndex(0);
    }, [orderedImages.length]);

    if (orderedImages.length === 0) {
        return (
            <div className={`aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-100 ${className}`}>
                <div className="flex h-full items-center justify-center text-slate-400">No image</div>
            </div>
        );
    }

    const current = orderedImages[clamp(activeIndex, 0, orderedImages.length - 1)];
    const viewerImages: GalleryImage[] = orderedImages.map((image, index) => ({
        id: image.id,
        url: image.url,
        alt: `${title} image ${index + 1}`,
        label: `Image ${index + 1}`,
    }));

    function goNext() {
        setActiveIndex((currentIndex) => clamp(currentIndex + 1, 0, orderedImages.length - 1));
    }

    function goPrev() {
        setActiveIndex((currentIndex) => clamp(currentIndex - 1, 0, orderedImages.length - 1));
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.pointerType !== "touch") return;
        swipeRef.current = { startX: event.clientX, startY: event.clientY, moved: false };
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.pointerType !== "touch") return;
        const deltaX = event.clientX - swipeRef.current.startX;
        const deltaY = event.clientY - swipeRef.current.startY;
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) goNext();
            else goPrev();
        }
    }

    return (
        <div className={className}>
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm">
                <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    className="relative block w-full"
                    aria-label={`Open ${title} gallery`}
                >
                    <div
                        className="aspect-[4/3] overflow-hidden bg-slate-100"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        style={{ touchAction: "pan-y" }}
                    >
                        <img src={current.url} alt={title} className="h-full w-full object-cover" loading="eager" />
                    </div>
                    <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {activeIndex + 1}/{orderedImages.length}
                    </div>
                    {current.isPrimary && (
                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-sm">
                            Cover photo
                        </div>
                    )}
                </button>

                {orderedImages.length > 1 && (
                    <div className="space-y-3 border-t border-slate-200 bg-white p-3">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {orderedImages.map((image, index) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${index === activeIndex ? "border-brand-900" : "border-transparent opacity-70 hover:opacity-100"}`}
                                    aria-label={`Show image ${index + 1}`}
                                >
                                    <img src={image.url} alt={`${title} thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                            <button type="button" onClick={goPrev} className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200">
                                Previous
                            </button>
                            <p>{activeIndex + 1} of {orderedImages.length}</p>
                            <button type="button" onClick={goNext} className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ImageGalleryViewer
                images={viewerImages}
                open={viewerOpen}
                initialIndex={activeIndex}
                onClose={() => setViewerOpen(false)}
                title={title}
            />
        </div>
    );
}