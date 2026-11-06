"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Building2,
  Check,
  FileImage,
  ImagePlus,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { BHK_OPTIONS, PROJECT_CATEGORIES, PROJECT_STATUSES, PROPERTY_TYPES } from "@/lib/constants";
import { cn, slugify } from "@/lib/utils";

export type ProjectFormOption = { id: string; name: string; city?: string };

export type ProjectFormImage = {
  id?: string;
  url: string;
  alt?: string | null;
  isCover?: boolean;
};

export type ProjectFormPlan = {
  id?: string;
  name: string;
  bhk?: string | null;
  areaSqft?: number | null;
  price?: number | null;
  imageUrl?: string | null;
};

export type ProjectFormValues = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  developerId: string;
  locationId: string;
  address: string;
  propertyType: string;
  category: string;
  startingPrice: number;
  maxPrice: number | null;
  bhkConfigs: string[];
  status: string;
  possessionDate: string | null;
  reraNumber: string | null;
  reraVerified: boolean;
  description: string;
  highlights: string[];
  amenityNotes: string | null;
  amenityIds: string[];
  mapEmbedUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
  nearbyPlaces: { name: string; distance: string }[];
  brochureUrl: string | null;
  heroImage: string | null;
  images: ProjectFormImage[];
  floorPlans: ProjectFormPlan[];
  featured: boolean;
  published: boolean;
  isDemo: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

type ImageRow = { key: string; id?: string; url: string; alt: string; isCover: boolean };
type PlanRow = {
  key: string;
  id?: string;
  name: string;
  bhk: string;
  areaSqft: string;
  price: string;
  imageUrl: string;
};
type NearbyRow = { key: string; name: string; distance: string };

let counter = 0;
function nextKey(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

function str(value: string | null | undefined) {
  return value ?? "";
}

function num(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

export function ProjectForm({
  project,
  developers,
  locations,
  amenities,
}: {
  project?: ProjectFormValues;
  developers: ProjectFormOption[];
  locations: ProjectFormOption[];
  amenities: ProjectFormOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [developerId, setDeveloperId] = useState(project?.developerId ?? developers[0]?.id ?? "");
  const [locationId, setLocationId] = useState(project?.locationId ?? locations[0]?.id ?? "");
  const [propertyType, setPropertyType] = useState(project?.propertyType ?? "RESIDENTIAL");
  const [category, setCategory] = useState(project?.category ?? "Apartment");
  const [status, setStatus] = useState(project?.status ?? "NEW_LAUNCH");
  const [reraVerified, setReraVerified] = useState(project?.reraVerified ?? false);
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? true);
  const [isDemo, setIsDemo] = useState(project?.isDemo ?? true);
  const [bhk, setBhk] = useState<string[]>(project?.bhkConfigs ?? []);
  const [images, setImages] = useState<ImageRow[]>(
    (project?.images ?? []).map((image, index) => ({
      key: nextKey("image"),
      id: image.id,
      url: image.url,
      alt: image.alt ?? "",
      isCover: image.isCover ?? index === 0,
    })),
  );
  const [plans, setPlans] = useState<PlanRow[]>(
    (project?.floorPlans ?? []).map((plan) => ({
      key: nextKey("plan"),
      id: plan.id,
      name: plan.name,
      bhk: plan.bhk ?? "",
      areaSqft: num(plan.areaSqft),
      price: num(plan.price),
      imageUrl: plan.imageUrl ?? "",
    })),
  );
  const [highlights, setHighlights] = useState<string[]>(
    project?.highlights?.length ? project.highlights : [""],
  );
  const [nearby, setNearby] = useState<NearbyRow[]>(
    project?.nearbyPlaces?.length
      ? project.nearbyPlaces.map((place) => ({ key: nextKey("nearby"), ...place }))
      : [{ key: nextKey("nearby"), name: "", distance: "" }],
  );
  const [amenityIds, setAmenityIds] = useState<string[]>(project?.amenityIds ?? []);
  const [amenityFilter, setAmenityFilter] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const filteredAmenities = useMemo(() => {
    const query = amenityFilter.trim().toLowerCase();
    return query ? amenities.filter((item) => item.name.toLowerCase().includes(query)) : amenities;
  }, [amenities, amenityFilter]);

  const coverImage = images.find((image) => image.isCover)?.url || images[0]?.url || "";

  function errorFor(prefix: string) {
    const key = Object.keys(fieldErrors).find((item) => item === prefix || item.startsWith(`${prefix}.`));
    return key ? fieldErrors[key] : "";
  }

  function setCover(key: string) {
    setImages((current) => current.map((image) => ({ ...image, isCover: image.key === key })));
  }

  function updateImage(key: string, patch: Partial<ImageRow>) {
    setImages((current) => current.map((image) => (image.key === key ? { ...image, ...patch } : image)));
  }

  function addImage() {
    setImages((current) => [
      ...current,
      { key: nextKey("image"), url: "", alt: "", isCover: current.length === 0 },
    ]);
  }

  function removeImage(key: string) {
    setImages((current) => {
      const next = current.filter((image) => image.key !== key);
      if (next.length && !next.some((image) => image.isCover)) next[0].isCover = true;
      return next.map((image) => ({ ...image }));
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function uploadImage(file: File, key: string, apply: (url: string) => void) {
    if (!file) return;
    setUploading(key);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      apply(result.url as string);
      toast("Image uploaded", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setUploading(null);
    }
  }

  async function removeUploadedAsset(url: string) {
    const prefix = url.startsWith("/media/") ? "/media/" : url.startsWith("/uploads/") ? "/uploads/" : null;
    if (!prefix) return;
    try {
      await fetch(`/api/admin/upload?key=${encodeURIComponent(url.replace(prefix, ""))}`, {
        method: "DELETE",
      });
    } catch {
      // The image has already been detached from the project; cleanup is best effort.
    }
  }

  function toggleBhk(value: string) {
    setBhk((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function toggleAmenity(id: string) {
    setAmenityIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function updatePlan(key: string, patch: Partial<PlanRow>) {
    setPlans((current) => current.map((plan) => (plan.key === key ? { ...plan, ...patch } : plan)));
  }

  function addPlan() {
    setPlans((current) => [
      ...current,
      { key: nextKey("plan"), name: "", bhk: "", areaSqft: "", price: "", imageUrl: "" },
    ]);
  }

  function removePlan(key: string) {
    setPlans((current) => current.filter((plan) => plan.key !== key));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const cleanImages = images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        id: image.id,
        url: image.url.trim(),
        alt: image.alt.trim() || undefined,
        isCover: image.isCover || index === 0,
      }));

    if (cleanImages.length > 0 && !cleanImages.some((image) => image.isCover)) {
      cleanImages[0].isCover = true;
    }

    const payload = {
      name: String(data.get("name") ?? ""),
      slug: slug.trim() || undefined,
      tagline: String(data.get("tagline") ?? ""),
      developerId,
      locationId,
      address: String(data.get("address") ?? ""),
      propertyType,
      category,
      startingPrice: String(data.get("startingPrice") ?? ""),
      maxPrice: String(data.get("maxPrice") ?? "") || null,
      bhkConfigs: bhk,
      status,
      possessionDate: String(data.get("possessionDate") ?? "") || null,
      reraNumber: reraVerified ? String(data.get("reraNumber") ?? "") : null,
      reraVerified,
      description: String(data.get("description") ?? ""),
      highlights: highlights.map((item) => item.trim()).filter(Boolean),
      amenityNotes: String(data.get("amenityNotes") ?? ""),
      amenityIds,
      mapEmbedUrl: String(data.get("mapEmbedUrl") ?? ""),
      mapLat: String(data.get("mapLat") ?? "") || null,
      mapLng: String(data.get("mapLng") ?? "") || null,
      nearbyPlaces: nearby
        .map((place) => ({ name: place.name.trim(), distance: place.distance.trim() }))
        .filter((place) => place.name && place.distance),
      brochureUrl: String(data.get("brochureUrl") ?? ""),
      heroImage: coverImage || null,
      images: cleanImages,
      floorPlans: plans
        .filter((plan) => plan.name.trim())
        .map((plan) => ({
          id: plan.id,
          name: plan.name.trim(),
          bhk: plan.bhk.trim() || undefined,
          areaSqft: plan.areaSqft ? Number(plan.areaSqft) : undefined,
          price: plan.price ? Number(plan.price) : undefined,
          imageUrl: plan.imageUrl.trim() || undefined,
        })),
      featured,
      published,
      isDemo,
      metaTitle: String(data.get("metaTitle") ?? ""),
      metaDescription: String(data.get("metaDescription") ?? ""),
    };

    try {
      const response = await fetch(
        project ? `/api/admin/projects/${project.id}` : "/api/admin/projects",
        {
          method: project ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        if (Array.isArray(result.issues)) {
          const errors: Record<string, string> = {};
          for (const issue of result.issues) {
            errors[String(issue.path)] = issue.message;
          }
          setFieldErrors(errors);
        }
        throw new Error(result.error || "Could not save this project");
      }
      toast(project ? "Project updated" : "Project created", "success");
      router.push(`/admin/projects/${result.project.id}`);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-[0.74rem] font-medium text-ink-muted transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" /> Back to projects
          </Link>
          <h1 className="mt-3 font-display text-3xl">
            {project ? `Edit ${project.name}` : "New project"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            All fields marked with an asterisk are required. RERA numbers are stored and published only
            when the verification switch is on.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/projects"
            className="inline-flex h-10 items-center rounded-[3px] border border-line bg-surface px-4 text-[0.8rem] font-semibold text-ink transition hover:border-ink/40"
          >
            Cancel
          </Link>
          <Button type="submit" loading={saving} size="md">
            <Save className="size-4" /> {project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </div>

      {formError && (
        <div role="alert" className="mt-5 rounded border border-rust/25 bg-rust/10 px-4 py-3 text-sm text-rust">
          <p className="font-semibold">{formError}</p>
          {Object.keys(fieldErrors).length > 0 && (
            <p className="mt-1 text-[0.74rem]">
              Please review the highlighted fields: {Object.keys(fieldErrors).join(", ")}.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-5">
          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-brass" />
              <h2 className="font-display text-xl">Project basics</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="project-name" className="field-label">Project name *</label>
                <input
                  id="project-name"
                  name="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field"
                  placeholder="e.g. Nova Verde Central"
                />
                {errorFor("name") && <p className="field-error">{errorFor("name")}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="project-slug" className="field-label">URL slug</label>
                <div className="flex gap-2">
                  <input
                    id="project-slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    className="field"
                    placeholder="auto-generated from the name"
                  />
                  <button
                    type="button"
                    onClick={() => setSlug(slugify(name))}
                    className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-[3px] border border-line bg-surface px-3 text-[0.74rem] font-semibold transition hover:border-forest/40 hover:text-forest"
                  >
                    <Sparkles className="size-3.5" /> Generate
                  </button>
                </div>
                <p className="mt-1 text-[0.68rem] text-ink-muted">
                  Lowercase letters, numbers and hyphens. Leave blank to generate from the name.
                </p>
                {errorFor("slug") && <p className="field-error">{errorFor("slug")}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="project-tagline" className="field-label">Tagline</label>
                <input
                  id="project-tagline"
                  name="tagline"
                  defaultValue={str(project?.tagline)}
                  className="field"
                  placeholder="A short positioning line"
                  maxLength={180}
                />
              </div>

              <div>
                <label htmlFor="project-developer" className="field-label">Developer *</label>
                <select
                  id="project-developer"
                  className="field"
                  value={developerId}
                  onChange={(event) => setDeveloperId(event.target.value)}
                  required
                >
                  <option value="" disabled>Select a developer</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>{developer.name}</option>
                  ))}
                </select>
                {errorFor("developerId") && <p className="field-error">{errorFor("developerId")}</p>}
              </div>

              <div>
                <label htmlFor="project-location" className="field-label">Location *</label>
                <select
                  id="project-location"
                  className="field"
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                  required
                >
                  <option value="" disabled>Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}{location.city ? ` — ${location.city}` : ""}
                    </option>
                  ))}
                </select>
                {errorFor("locationId") && <p className="field-error">{errorFor("locationId")}</p>}
              </div>

              <div>
                <label htmlFor="project-type" className="field-label">Property type *</label>
                <select
                  id="project-type"
                  className="field"
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="project-category" className="field-label">Category *</label>
                <select
                  id="project-category"
                  className="field"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {PROJECT_CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="project-address" className="field-label">Address *</label>
                <input
                  id="project-address"
                  name="address"
                  required
                  defaultValue={str(project?.address)}
                  className="field"
                  placeholder="Sector, city, state and PIN code"
                />
                {errorFor("address") && <p className="field-error">{errorFor("address")}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="project-description" className="field-label">Description *</label>
                <textarea
                  id="project-description"
                  name="description"
                  required
                  rows={6}
                  defaultValue={str(project?.description)}
                  className="field resize-y"
                  placeholder="Describe the project, its context and what makes it worth a visit. Minimum 30 characters."
                />
                {errorFor("description") && <p className="field-error">{errorFor("description")}</p>}
              </div>
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-brass" />
              <h2 className="font-display text-xl">Pricing, status &amp; configuration</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="project-starting" className="field-label">Starting price (INR) *</label>
                <input
                  id="project-starting"
                  name="startingPrice"
                  required
                  type="number"
                  min={1}
                  defaultValue={num(project?.startingPrice)}
                  className="field"
                  placeholder="8500000"
                />
                {errorFor("startingPrice") && <p className="field-error">{errorFor("startingPrice")}</p>}
              </div>
              <div>
                <label htmlFor="project-max" className="field-label">Maximum price (INR)</label>
                <input
                  id="project-max"
                  name="maxPrice"
                  type="number"
                  min={1}
                  defaultValue={num(project?.maxPrice)}
                  className="field"
                  placeholder="Optional"
                />
                {errorFor("maxPrice") && <p className="field-error">{errorFor("maxPrice")}</p>}
              </div>

              <div>
                <label htmlFor="project-status" className="field-label">Construction status *</label>
                <select
                  id="project-status"
                  className="field"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {PROJECT_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="project-possession" className="field-label">Possession date</label>
                <input
                  id="project-possession"
                  name="possessionDate"
                  type="date"
                  defaultValue={project?.possessionDate ?? ""}
                  className="field"
                />
                {errorFor("possessionDate") && <p className="field-error">{errorFor("possessionDate")}</p>}
              </div>

              <div className="sm:col-span-2">
                <span className="field-label">Configuration</span>
                <div className="flex flex-wrap gap-2">
                  {BHK_OPTIONS.map((option) => {
                    const checked = bhk.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleBhk(option)}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded border px-3 text-[0.78rem] font-semibold transition",
                          checked
                            ? "border-forest bg-forest-soft text-night"
                            : "border-line bg-surface text-ink-soft hover:border-ink/30",
                        )}
                      >
                        {checked && <Check className="size-3.5" />}
                        {propertyType === "COMMERCIAL" ? option : `${option} BHK`}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[0.68rem] text-ink-muted">
                  Select every configuration available. Commercial projects can use the same options as unit sizes.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded border border-line bg-cream/50 p-4">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={reraVerified}
                  onChange={(event) => setReraVerified(event.target.checked)}
                  className="mt-0.5 size-4 accent-forest"
                />
                <span className="text-[0.78rem] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">RERA number verified</span> — only enable this after
                  checking the number on the relevant state RERA portal. Unverified numbers are discarded.
                </span>
              </label>
              {reraVerified && (
                <div className="mt-3">
                  <label htmlFor="project-rera" className="field-label">RERA registration number</label>
                  <input
                    id="project-rera"
                    name="reraNumber"
                    defaultValue={str(project?.reraNumber)}
                    className="field"
                    maxLength={80}
                    placeholder="e.g. UPRERAPRJ123456"
                  />
                  {errorFor("reraNumber") && <p className="field-error">{errorFor("reraNumber")}</p>}
                </div>
              )}
              {!reraVerified && (
                <p className="mt-2 text-[0.68rem] text-ink-muted">
                  {project?.reraNumber
                    ? "A number is currently stored but will be removed when you save without verification."
                    : "No RERA number will be displayed on the public site."}
                </p>
              )}
            </div>

            <div className="mt-5">
              <span className="field-label">Project highlights</span>
              <div className="space-y-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={highlight}
                      onChange={(event) =>
                        setHighlights((current) =>
                          current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                        )
                      }
                      className="field"
                      placeholder="e.g. 12 acres of landscaped grounds"
                      maxLength={180}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setHighlights((current) =>
                          current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : [""],
                        )
                      }
                      aria-label="Remove highlight"
                      className="inline-flex size-[42px] shrink-0 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-rust/30 hover:text-rust"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setHighlights((current) => [...current, ""])}
                className="mt-2 inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-forest hover:text-brass"
              >
                <Plus className="size-3.5" /> Add highlight
              </button>
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <FileImage className="size-4 text-brass" />
              <h2 className="font-display text-xl">Gallery</h2>
            </div>
            <p className="mt-1 text-[0.76rem] text-ink-muted">
              Upload JPG, PNG, WebP or AVIF images up to 5 MB. The cover image is used as the hero image.
            </p>

            <div className="mt-4 space-y-3">
              {images.map((image, index) => (
                <div key={image.key} className="rounded border border-line bg-cream/40 p-3">
                  <div className="flex gap-3">
                    <div
                      role="img"
                      aria-label={image.alt || `Gallery image ${index + 1}`}
                      className="size-20 shrink-0 rounded border border-line bg-sand bg-cover bg-center"
                      style={image.url ? { backgroundImage: `url("${image.url.replace(/"/g, "%22")}")` } : undefined}
                    >
                      {!image.url && (
                        <span className="flex h-full items-center justify-center text-ink-muted">
                          <ImagePlus className="size-5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <label htmlFor={`image-url-${image.key}`} className="field-label">
                          Image URL {index === 0 && <span className="normal-case tracking-normal">(recommended first)</span>}
                        </label>
                        <input
                          id={`image-url-${image.key}`}
                          value={image.url}
                          onChange={(event) => updateImage(image.key, { url: event.target.value })}
                          className="field"
                          placeholder="/images/example.jpg or https://…"
                        />
                        {fieldErrors[`images.${index}.url`] && (
                          <p className="field-error">{fieldErrors[`images.${index}.url`]}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`image-alt-${image.key}`} className="field-label">Alt text</label>
                        <input
                          id={`image-alt-${image.key}`}
                          value={image.alt}
                          onChange={(event) => updateImage(image.key, { alt: event.target.value })}
                          className="field"
                          placeholder="Describe the image for screen readers"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <label
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-line bg-surface px-2.5 text-[0.72rem] font-semibold transition hover:border-forest/40",
                        uploading !== null && "pointer-events-none opacity-50",
                      )}
                    >
                      {uploading === `image-${image.key}` ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      {uploading === `image-${image.key}` ? "Uploading" : "Upload"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void uploadImage(file, `image-${image.key}`, (url) =>
                              updateImage(image.key, { url }),
                            );
                          }
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCover(image.key)}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[0.72rem] font-semibold transition",
                        image.isCover
                          ? "border-forest bg-forest-soft text-night"
                          : "border-line bg-surface text-ink-soft hover:border-forest/40",
                      )}
                    >
                      <Check className="size-3.5" /> {image.isCover ? "Cover image" : "Set as cover"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      aria-label="Move image up"
                      className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-ink/30 disabled:opacity-40"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label="Move image down"
                      className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-ink/30 disabled:opacity-40"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void removeUploadedAsset(image.url);
                        removeImage(image.key);
                      }}
                      className="ml-auto inline-flex h-8 items-center gap-1.5 rounded border border-line bg-surface px-2.5 text-[0.72rem] font-semibold text-ink-muted transition hover:border-rust/30 hover:text-rust"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <p className="rounded border border-dashed border-line bg-cream/30 px-4 py-6 text-center text-[0.78rem] text-ink-muted">
                  No gallery images yet. Add an image URL or upload a file.
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addImage}
                className="inline-flex h-9 items-center gap-1.5 rounded border border-forest bg-forest px-3.5 text-[0.76rem] font-semibold text-night transition hover:bg-forest-deep"
              >
                <Plus className="size-3.5" /> Add image
              </button>
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded border border-line bg-surface px-3.5 text-[0.76rem] font-semibold transition hover:border-forest/40">
                <Upload className="size-3.5" /> Upload new
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={uploading !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const key = nextKey("image");
                    const row: ImageRow = {
                      key,
                      url: "",
                      alt: "",
                      isCover: images.length === 0,
                    };
                    setImages((current) => [...current, row]);
                    void uploadImage(file, `image-${key}`, (url) =>
                      setImages((current) =>
                        current.map((image) => (image.key === key ? { ...image, url } : image)),
                      ),
                    );
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <label htmlFor="project-brochure" className="field-label">Brochure URL</label>
              <input
                id="project-brochure"
                name="brochureUrl"
                defaultValue={str(project?.brochureUrl)}
                className="field"
                placeholder="Leave blank to use the generated sample PDF"
              />
              <p className="mt-1 text-[0.68rem] text-ink-muted">
                Public download links always fall back to a generated sample brochure when this is blank.
              </p>
              {errorFor("brochureUrl") && <p className="field-error">{errorFor("brochureUrl")}</p>}
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-brass" />
              <h2 className="font-display text-xl">Floor plans</h2>
            </div>
            <p className="mt-1 text-[0.76rem] text-ink-muted">
              Add one row per configuration. Upload a plan image or link to an existing asset.
            </p>

            <div className="mt-4 space-y-3">
              {plans.map((plan, index) => (
                <div key={plan.key} className="rounded border border-line bg-cream/40 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`plan-name-${plan.key}`} className="field-label">Plan name *</label>
                      <input
                        id={`plan-name-${plan.key}`}
                        value={plan.name}
                        onChange={(event) => updatePlan(plan.key, { name: event.target.value })}
                        className="field"
                        placeholder="e.g. 3 BHK + Study"
                      />
                      {fieldErrors[`floorPlans.${index}.name`] && (
                        <p className="field-error">{fieldErrors[`floorPlans.${index}.name`]}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor={`plan-bhk-${plan.key}`} className="field-label">Configuration</label>
                      <input
                        id={`plan-bhk-${plan.key}`}
                        value={plan.bhk}
                        onChange={(event) => updatePlan(plan.key, { bhk: event.target.value })}
                        className="field"
                        placeholder="3 BHK"
                      />
                    </div>
                    <div>
                      <label htmlFor={`plan-area-${plan.key}`} className="field-label">Area (sq ft)</label>
                      <input
                        id={`plan-area-${plan.key}`}
                        type="number"
                        min={1}
                        value={plan.areaSqft}
                        onChange={(event) => updatePlan(plan.key, { areaSqft: event.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor={`plan-price-${plan.key}`} className="field-label">Price (INR)</label>
                      <input
                        id={`plan-price-${plan.key}`}
                        type="number"
                        min={1}
                        value={plan.price}
                        onChange={(event) => updatePlan(plan.key, { price: event.target.value })}
                        className="field"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`plan-url-${plan.key}`} className="field-label">Plan image URL</label>
                      <div className="flex gap-2">
                        <input
                          id={`plan-url-${plan.key}`}
                          value={plan.imageUrl}
                          onChange={(event) => updatePlan(plan.key, { imageUrl: event.target.value })}
                          className="field"
                          placeholder="/floor-plans/plan-3bhk.svg"
                        />
                        <label className="inline-flex h-[42px] shrink-0 cursor-pointer items-center gap-1.5 rounded border border-line bg-surface px-3 text-[0.72rem] font-semibold transition hover:border-forest/40">
                          {uploading === `plan-${plan.key}` ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Upload className="size-3.5" />
                          )}
                          Upload
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="sr-only"
                            disabled={uploading !== null}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                void uploadImage(file, `plan-${plan.key}`, (url) =>
                                  updatePlan(plan.key, { imageUrl: url }),
                                );
                              }
                              event.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        void removeUploadedAsset(plan.imageUrl);
                        removePlan(plan.key);
                      }}
                      className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink-muted transition hover:text-rust"
                    >
                      <Trash2 className="size-3.5" /> Remove plan
                    </button>
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <p className="rounded border border-dashed border-line bg-cream/30 px-4 py-6 text-center text-[0.78rem] text-ink-muted">
                  No floor plans added yet.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={addPlan}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded border border-line bg-surface px-3.5 text-[0.76rem] font-semibold transition hover:border-forest/40"
            >
              <Plus className="size-3.5" /> Add floor plan
            </button>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brass" />
              <h2 className="font-display text-xl">Amenities</h2>
            </div>
            <p className="mt-1 text-[0.76rem] text-ink-muted">
              Select the amenities confirmed for this project. Manage the master list under{" "}
              <Link href="/admin/amenities" className="font-semibold text-forest hover:text-brass">Amenities</Link>.
            </p>

            <input
              type="search"
              value={amenityFilter}
              onChange={(event) => setAmenityFilter(event.target.value)}
              className="field mt-3 max-w-sm"
              placeholder="Filter amenities"
              aria-label="Filter amenities"
            />

            <div className="mt-3 grid max-h-72 gap-1.5 overflow-y-auto rounded border border-line bg-cream/40 p-3 sm:grid-cols-2">
              {filteredAmenities.map((amenity) => {
                const checked = amenityIds.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-[0.78rem] transition",
                      checked ? "bg-forest-soft text-night" : "text-ink-soft hover:bg-surface",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="size-3.5 accent-forest"
                    />
                    {amenity.name}
                  </label>
                );
              })}
              {filteredAmenities.length === 0 && (
                <p className="col-span-full py-4 text-center text-[0.76rem] text-ink-muted">
                  No amenities match that filter.
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="project-amenity-notes" className="field-label">Amenity notes</label>
              <textarea
                id="project-amenity-notes"
                name="amenityNotes"
                rows={3}
                defaultValue={str(project?.amenityNotes)}
                className="field resize-none"
                placeholder="Clarify what is planned, phased or shared."
                maxLength={1000}
              />
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-brass" />
              <h2 className="font-display text-xl">Location &amp; landmarks</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="project-map-embed" className="field-label">Map embed URL</label>
                <input
                  id="project-map-embed"
                  name="mapEmbedUrl"
                  type="url"
                  defaultValue={str(project?.mapEmbedUrl)}
                  className="field"
                  placeholder="https://www.google.com/maps/embed?…"
                />
                {errorFor("mapEmbedUrl") && <p className="field-error">{errorFor("mapEmbedUrl")}</p>}
              </div>
              <div>
                <label htmlFor="project-lat" className="field-label">Latitude</label>
                <input
                  id="project-lat"
                  name="mapLat"
                  type="number"
                  step="any"
                  defaultValue={num(project?.mapLat)}
                  className="field"
                  placeholder="28.5355"
                />
              </div>
              <div>
                <label htmlFor="project-lng" className="field-label">Longitude</label>
                <input
                  id="project-lng"
                  name="mapLng"
                  type="number"
                  step="any"
                  defaultValue={num(project?.mapLng)}
                  className="field"
                  placeholder="77.3910"
                />
              </div>
            </div>

            <div className="mt-5">
              <span className="field-label">Nearby places</span>
              <div className="space-y-2">
                {nearby.map((place, index) => (
                  <div key={place.key} className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <input
                      value={place.name}
                      onChange={(event) =>
                        setNearby((current) =>
                          current.map((item) =>
                            item.key === place.key ? { ...item, name: event.target.value } : item,
                          ),
                        )
                      }
                      className="field sm:flex-1"
                      placeholder="Place name (e.g. Sector 132 metro)"
                      aria-label={`Nearby place ${index + 1} name`}
                    />
                    <input
                      value={place.distance}
                      onChange={(event) =>
                        setNearby((current) =>
                          current.map((item) =>
                            item.key === place.key ? { ...item, distance: event.target.value } : item,
                          ),
                        )
                      }
                      className="field sm:w-40"
                      placeholder="Distance (e.g. 2.4 km)"
                      aria-label={`Nearby place ${index + 1} distance`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNearby((current) =>
                          current.length > 1
                            ? current.filter((item) => item.key !== place.key)
                            : [{ ...current[0], name: "", distance: "" }],
                        )
                      }
                      aria-label="Remove nearby place"
                      className="inline-flex size-[42px] shrink-0 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-rust/30 hover:text-rust"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setNearby((current) => [...current, { key: nextKey("nearby"), name: "", distance: "" }])
                }
                className="mt-2 inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-forest hover:text-brass"
              >
                <Plus className="size-3.5" /> Add landmark
              </button>
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <h2 className="font-display text-xl">Search engine listing</h2>
            <p className="mt-1 text-[0.76rem] text-ink-muted">
              Optional overrides. Leave blank to use the project name, location and starting price.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="project-meta-title" className="field-label">Meta title</label>
                <input
                  id="project-meta-title"
                  name="metaTitle"
                  defaultValue={str(project?.metaTitle)}
                  className="field"
                  maxLength={160}
                />
              </div>
              <div>
                <label htmlFor="project-meta-description" className="field-label">Meta description</label>
                <textarea
                  id="project-meta-description"
                  name="metaDescription"
                  rows={3}
                  defaultValue={str(project?.metaDescription)}
                  className="field resize-none"
                  maxLength={300}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="surface p-4">
            <p className="eyebrow-plain">Publishing</p>
            <div className="mt-3 space-y-3">
              <label className="flex items-start gap-2.5 text-[0.78rem] leading-snug">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  className="mt-0.5 size-4 accent-forest"
                />
                <span>
                  <span className="font-semibold">Published</span>
                  <span className="block text-[0.68rem] text-ink-muted">Visible on the public website.</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-[0.78rem] leading-snug">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                  className="mt-0.5 size-4 accent-forest"
                />
                <span>
                  <span className="font-semibold">Featured</span>
                  <span className="block text-[0.68rem] text-ink-muted">Prioritised in curated sections.</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-[0.78rem] leading-snug">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(event) => setIsDemo(event.target.checked)}
                  className="mt-0.5 size-4 accent-forest"
                />
                <span>
                  <span className="font-semibold">Sample record</span>
                  <span className="block text-[0.68rem] text-ink-muted">Shows the sample badge on the listing.</span>
                </span>
              </label>
            </div>

            <div className="mt-4 border-t border-line pt-3 text-[0.7rem] leading-relaxed text-ink-muted">
              <p className="flex items-center gap-1.5 font-semibold text-ink-soft">
                <MapPin className="size-3.5 text-brass" />
                {locations.find((item) => item.id === locationId)?.name ?? "No location"}
              </p>
              <p className="mt-1">
                {developers.find((item) => item.id === developerId)?.name ?? "No developer"}
              </p>
            </div>

            <Button type="submit" className="mt-4 w-full" loading={saving}>
              <Save className="size-4" /> {project ? "Save changes" : "Create project"}
            </Button>
            <p className="mt-2 text-center text-[0.64rem] text-ink-muted">
              Sample data only. Verify every claim before publishing.
            </p>
          </div>

          <div className="rounded border border-brass/30 bg-brass-pale/50 p-3 text-[0.68rem] leading-relaxed text-ink-soft">
            <p className="font-semibold text-brass-soft">Before publishing</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-3.5">
              <li>Confirm prices and configurations against source documents.</li>
              <li>Add RERA details only after portal verification.</li>
              <li>Use your own imagery; sample photography is illustrative.</li>
              <li>Remove sample data before any real launch.</li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
}

