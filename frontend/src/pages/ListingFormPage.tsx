import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { PropertyImageUploader } from "@/components/PropertyImageUploader";
import { propertyService } from "@/services/property.service";
import { useToastStore } from "@/store/toastStore";
import { Gender, RoomType } from "@/types";
import { getFriendlyErrorMessage } from "@/utils/error";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
    isAvailable: true,
  });
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imagesBusy, setImagesBusy] = useState(false);
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
      isAvailable: existing.isAvailable,
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

    if (!isEditing && imagesBusy) {
      setError("Please wait for the images to finish optimizing before submitting.");
      return;
    }

    if (!isEditing && images.length === 0) {
      setError("Add at least one photo of the property.");
      return;
    }

    if (!isEditing && !ownerConfirmed) {
      setError("Please confirm that you own this property or have the legal right to advertise it.");
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
        isAvailable: form.isAvailable,
      };

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
    <LandlordMobileShell>
      <div className="page-enter space-y-5">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Add property</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-text.primary">{isEditing ? "Edit listing" : "New listing"}</h1>
          <p className="mt-1 text-sm text-text.secondary">
            {isEditing ? "Changes (other than availability) go back to pending review." : "Your listing goes live once an admin approves it."}
          </p>
        </section>

        <Card variant="outlined" padding="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" placeholder="e.g. Self-contain near West Gate" value={form.title} onChange={update("title")} required />
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={update("description")}
                required
                placeholder="Describe the property, nearby landmarks, and what makes it a good fit for students."
                className="w-full rounded-2xl border bg-cream-50 px-4 py-3 text-text-primary placeholder:text-text-secondary/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-border hover:border-primary-500/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price per year (₦)" type="number" value={form.price} onChange={update("price")} required />
              <Input label="Location" value={form.location} onChange={update("location")} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Distance (km)" type="number" step="0.1" value={form.distanceFromCampusKm} onChange={update("distanceFromCampusKm")} required />
              <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={update("bedrooms")} required />
              <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={update("bathrooms")} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Room type</label>
                <select value={form.roomType} onChange={update("roomType")} className="mt-1.5 h-12 w-full rounded-card border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20">
                  {roomTypes.map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, " ").toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Gender</label>
                <select value={form.genderRestriction} onChange={update("genderRestriction")} className="mt-1.5 h-12 w-full rounded-card border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20">
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Amenities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAmenity(a.id)}
                    className={`h-9 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${amenityIds.includes(a.id) ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm" : "border-border bg-card text-text.secondary hover:border-brand-200"}`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-card border border-border bg-cream-50 p-4">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm((current) => ({ ...current, isAvailable: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-border accent-brand-900"
              />
              <span className="text-sm text-text.primary">List this property as available right away</span>
            </label>

            {!isEditing && (
              <div>
                <PropertyImageUploader
                  label="Property images"
                  helperText="Upload up to 5 photos. The first image becomes the cover photo shown to students."
                  maxImages={5}
                  maxSizeMb={8}
                  onChange={(files) => setImages(files)}
                  onBusyChange={setImagesBusy}
                />
              </div>
            )}

            {!isEditing && (
              <Card variant="outlined" padding="md">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={ownerConfirmed}
                    onChange={(e) => {
                      setOwnerConfirmed(e.target.checked);
                      if (e.target.checked && error?.includes("own this property")) {
                        setError(null);
                      }
                    }}
                    required
                    aria-invalid={Boolean(error?.includes("own this property"))}
                    className="mt-1 h-4 w-4 rounded border-border accent-brand-900"
                  />
                  <span className="text-sm text-text.primary">
                    I confirm that I own this property or have the legal right to advertise it.
                  </span>
                </label>
                {!ownerConfirmed && (
                  <p className="mt-2 text-xs font-medium text-warning">
                    You must check this box before submitting the listing.
                  </p>
                )}
              </Card>
            )}

            {error && <p className="text-sm text-error" role="alert">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting || imagesBusy || (!isEditing && !ownerConfirmed)}
              loading={isSubmitting}
            >
              {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Submit for review"}
            </Button>
          </form>
        </Card>
      </div>
    </LandlordMobileShell>
  );
}
