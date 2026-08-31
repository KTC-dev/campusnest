import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AgentMobileShell } from "@/components/AgentMobileShell";
import { PropertyImageUploader } from "@/components/PropertyImageUploader";
import { LocationPicker } from "@/components/LocationPicker";
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
    estimatedMoveInCost: "",
    agentFee: "",
    legalFee: "",
    cautionFee: "",
    serviceCharge: "",
    electricityNote: "",
    waterNote: "",
    internetNote: "",
    securityNote: "",
    rulesNotes: "",
    furnished: false,
    hasGenerator: false,
    hasInverter: false,
    hasSolar: false,
    hasBorehole: false,
    hasSecurity: false,
    hasGate: false,
    hasWifi: false,
    allowsCooking: true,
    allowsVisitors: true,
    allowsGenerator: true,
    allowsAppliances: true,
    hasCurfew: false,
    propertyCondition: "",
    latitude: "",
    longitude: "",
    formattedAddress: "",
    placeId: "",
    locationVisibility: "public",
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
      estimatedMoveInCost: existing.estimatedMoveInCost ?? "",
      agentFee: existing.agentFee ?? "",
      legalFee: existing.legalFee ?? "",
      cautionFee: existing.cautionFee ?? "",
      serviceCharge: existing.serviceCharge ?? "",
      electricityNote: existing.electricityNote ?? "",
      waterNote: existing.waterNote ?? "",
      internetNote: existing.internetNote ?? "",
      securityNote: existing.securityNote ?? "",
      rulesNotes: existing.rulesNotes ?? "",
      furnished: existing.furnished ?? false,
      hasGenerator: existing.hasGenerator ?? false,
      hasInverter: existing.hasInverter ?? false,
      hasSolar: existing.hasSolar ?? false,
      hasBorehole: existing.hasBorehole ?? false,
      hasSecurity: existing.hasSecurity ?? false,
      hasGate: existing.hasGate ?? false,
      hasWifi: existing.hasWifi ?? false,
      allowsCooking: existing.allowsCooking ?? true,
      allowsVisitors: existing.allowsVisitors ?? true,
      allowsGenerator: existing.allowsGenerator ?? true,
      allowsAppliances: existing.allowsAppliances ?? true,
      hasCurfew: existing.hasCurfew ?? false,
      propertyCondition: existing.propertyCondition ?? "",
      latitude: existing.latitude ?? "",
      longitude: existing.longitude ?? "",
      formattedAddress: existing.formattedAddress ?? "",
      placeId: existing.placeId ?? "",
      locationVisibility: existing.locationVisibility ?? "public",
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
        estimatedMoveInCost: Number(form.estimatedMoveInCost) || undefined,
        agentFee: Number(form.agentFee) || undefined,
        legalFee: Number(form.legalFee) || undefined,
        cautionFee: Number(form.cautionFee) || undefined,
        serviceCharge: Number(form.serviceCharge) || undefined,
        electricityNote: form.electricityNote || undefined,
        waterNote: form.waterNote || undefined,
        internetNote: form.internetNote || undefined,
        securityNote: form.securityNote || undefined,
        rulesNotes: form.rulesNotes || undefined,
        furnished: form.furnished,
        hasGenerator: form.hasGenerator,
        hasInverter: form.hasInverter,
        hasSolar: form.hasSolar,
        hasBorehole: form.hasBorehole,
        hasSecurity: form.hasSecurity,
        hasGate: form.hasGate,
        hasWifi: form.hasWifi,
        allowsCooking: form.allowsCooking,
        allowsVisitors: form.allowsVisitors,
        allowsGenerator: form.allowsGenerator,
        allowsAppliances: form.allowsAppliances,
        hasCurfew: form.hasCurfew,
        propertyCondition: form.propertyCondition || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        formattedAddress: form.formattedAddress || undefined,
        placeId: form.placeId || undefined,
        locationVisibility: form.locationVisibility || undefined,
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
    <AgentMobileShell>
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
              <Input label="Price per year (?)" type="number" value={form.price} onChange={update("price")} required />
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

            <Card variant="outlined" padding="md">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Property location</p>
              <LocationPicker
                latitude={form.latitude ? Number(form.latitude) : undefined}
                longitude={form.longitude ? Number(form.longitude) : undefined}
                formattedAddress={form.formattedAddress}
                placeId={form.placeId}
                onChange={(data) => setForm((f) => ({ ...f, latitude: String(data.latitude), longitude: String(data.longitude), formattedAddress: data.formattedAddress, placeId: data.placeId ?? "" }))}
              />
            </Card>

            <Card variant="outlined" padding="md">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Cost breakdown (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Agent fee (?)" type="number" value={form.agentFee} onChange={update("agentFee")} placeholder="e.g. 20000" />
                <Input label="Legal/agreement fee (?)" type="number" value={form.legalFee} onChange={update("legalFee")} placeholder="e.g. 10000" />
                <Input label="Caution fee (?)" type="number" value={form.cautionFee} onChange={update("cautionFee")} placeholder="e.g. 50000" />
                <Input label="Service charge (?)" type="number" value={form.serviceCharge} onChange={update("serviceCharge")} placeholder="e.g. 5000" />
                <Input label="Est. move-in cost (?)" type="number" value={form.estimatedMoveInCost} onChange={update("estimatedMoveInCost")} placeholder="Total first payment" className="col-span-2" />
              </div>
            </Card>

            <Card variant="outlined" padding="md">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Utilities & infrastructure</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasBorehole} onChange={(e) => setForm((f) => ({ ...f, hasBorehole: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Borehole</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasGenerator} onChange={(e) => setForm((f) => ({ ...f, hasGenerator: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Generator</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasInverter} onChange={(e) => setForm((f) => ({ ...f, hasInverter: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Inverter</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasSolar} onChange={(e) => setForm((f) => ({ ...f, hasSolar: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Solar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasWifi} onChange={(e) => setForm((f) => ({ ...f, hasWifi: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Wi-Fi</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Input label="Electricity note" value={form.electricityNote} onChange={update("electricityNote")} placeholder="e.g. 8-10 hours daily, prepaid meter" />
                  <Input label="Water note" value={form.waterNote} onChange={update("waterNote")} placeholder="e.g. Borehole + tank, daily supply" />
                  <Input label="Internet/network note" value={form.internetNote} onChange={update("internetNote")} placeholder="e.g. MTN fiber, shared Wi-Fi" />
                </div>
              </div>
            </Card>

            <Card variant="outlined" padding="md">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Safety & rules</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasSecurity} onChange={(e) => setForm((f) => ({ ...f, hasSecurity: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Security personnel</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasGate} onChange={(e) => setForm((f) => ({ ...f, hasGate: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Gated compound</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.furnished} onChange={(e) => setForm((f) => ({ ...f, furnished: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Furnished</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.hasCurfew} onChange={(e) => setForm((f) => ({ ...f, hasCurfew: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Curfew</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.allowsCooking} onChange={(e) => setForm((f) => ({ ...f, allowsCooking: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Allows cooking</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.allowsVisitors} onChange={(e) => setForm((f) => ({ ...f, allowsVisitors: e.target.checked }))} className="accent-brand-900" />
                    <span className="text-sm text-text.primary">Allows visitors</span>
                  </label>
                </div>
                <Input label="Security / compound notes" value={form.securityNote} onChange={update("securityNote")} placeholder="e.g. 24/7 security, CCTV, well-lit" />
                <Input label="Rules & restrictions" value={form.rulesNotes} onChange={update("rulesNotes")} placeholder="e.g. No parties after 10pm, keep noise down" />
                <Input label="Property condition" value={form.propertyCondition} onChange={update("propertyCondition")} placeholder="e.g. Newly renovated, good condition, needs minor repairs" />
              </div>
            </Card>

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
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Submit for review"}
            </Button>
          </form>
        </Card>
      </div>
    </AgentMobileShell>
  );
}