import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppNav } from "@/components/AppNav";
import { Upload } from "@/components/Upload";
import { propertyService } from "@/services/property.service";
import { useToastStore } from "@/store/toastStore";
import { fileToBase64 } from "@/utils/file";
import { Gender, RoomType } from "@/types";
import { getFriendlyErrorMessage } from "@/utils/error";

const roomTypes: RoomType[] = ["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL"];
const genders: Gender[] = ["ANY", "MALE", "FEMALE"];

export default function ListingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const { data: amenities = [] } = useQuery({ queryKey: ["amenities"], queryFn: propertyService.listAmenities });
  const { data: existing } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id!),
    enabled: isEditing,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    distanceFromCampusKm: "",
    bedrooms: "1",
    bathrooms: "1",
    roomType: "SELF_CONTAIN" as RoomType,
    genderRestriction: "ANY" as Gender,
  });
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setForm({
      title: existing.title,
      description: existing.description,
      price: String(existing.price),
      location: existing.location,
      distanceFromCampusKm: String(existing.distanceFromCampusKm),
      bedrooms: String(existing.bedrooms),
      bathrooms: String(existing.bathrooms),
      roomType: existing.roomType,
      genderRestriction: existing.genderRestriction,
    });
    setAmenityIds(existing.amenities.map((a) => a.amenity.id));
  }, [existing]);

  function update<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function toggleAmenity(amenityId: string) {
    setAmenityIds((prev) => (prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEditing && images.length === 0) {
      setError("Add at least one photo of the property.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        location: form.location,
        distanceFromCampusKm: Number(form.distanceFromCampusKm),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        roomType: form.roomType,
        genderRestriction: form.genderRestriction,
        amenityIds,
      };

      if (!isEditing && !ownerConfirmed) {
        setError("You must confirm you have the right to publish this listing.");
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        await propertyService.update(id!, payload);
      } else {
        await propertyService.create({ ...payload, images, ownerConfirmation: ownerConfirmed });
      }
      addToast({ type: "success", title: isEditing ? "Listing updated" : "Listing submitted", message: isEditing ? "Your changes are saved and pending review." : "Your listing is now pending review." });
      navigate("/dashboard");
    } catch (err: any) {
      const message = getFriendlyErrorMessage(err);
      setError(message);
      addToast({ type: "error", title: "Save failed", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-900">{isEditing ? "Edit listing" : "New listing"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Changes (other than availability) go back to pending review."
            : "Your listing goes live once an admin approves it."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
          <input
            placeholder="Title (e.g. Self-contain near West Gate)"
            required
            value={form.title}
            onChange={update("title")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            required
            rows={4}
            value={form.description}
            onChange={update("description")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Price per year (₦)"
              required
              value={form.price}
              onChange={update("price")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Location"
              required
              value={form.location}
              onChange={update("location")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="Distance (km)"
              required
              value={form.distanceFromCampusKm}
              onChange={update("distanceFromCampusKm")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Bedrooms"
              required
              value={form.bedrooms}
              onChange={update("bedrooms")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Bathrooms"
              required
              value={form.bathrooms}
              onChange={update("bathrooms")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.roomType} onChange={update("roomType")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {roomTypes.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
            <select
              value={form.genderRestriction}
              onChange={update("genderRestriction")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Amenities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {amenities.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${amenityIds.includes(a.id) ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-300 text-slate-600"
                    }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {!isEditing && (
            <div>
              <p className="text-sm font-medium text-slate-700">Photos</p>
              <Upload
                label="Property images"
                helperText="Upload listing photos"
                accept="image/jpeg,image/png,image/webp"
                maxSizeMb={10}
                multiple
                onChange={(files) => setImages(files)}
                onFileAdded={async (file) => fileToBase64(file)}
              />
              {images.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {images.map((src, i) => (
                    <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          {!isEditing && (
            <div className="mt-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={ownerConfirmed} onChange={(e) => setOwnerConfirmed(e.target.checked)} />
                <span className="text-sm text-slate-700">I confirm that this listing is truthful, accurate, and that I have the legal right to advertise this property.</span>
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Submit for review"}
          </button>
        </form>
      </main>
    </div>
  );
}
