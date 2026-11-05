import { ProjectsListingPage } from "@/components/projects/projects-listing-page";

export const metadata = {
  title: "Resort housing in Noida & Greater Noida",
  description:
    "Explore demo resort-led residences with a managed rental intent across Noida, Greater Noida, Noida Extension and Delhi NCR. All inventory is sample data.",
  alternates: { canonical: "/resort-housing" },
};

export default async function ResortHousingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProjectsListingPage
      params={params}
      basePath="/resort-housing"
      lockedType="RESIDENTIAL"
      lockedCategory="Resort"
      eyebrow="Resort housing"
      title="Resort living, read like an asset."
      description="Resort-led residences across the NCR, presented with the rental intent, managed-services notes and sample pricing you need to judge them properly. Every listing here is demonstration inventory."
    />
  );
}
