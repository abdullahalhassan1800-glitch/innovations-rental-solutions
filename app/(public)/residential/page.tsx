import { ProjectsListingPage } from "@/components/projects/projects-listing-page";

export const metadata = {
  title: "Residential projects in Noida & Greater Noida",
  description:
    "Explore demo apartments, villas, penthouses and studio residences across Noida, Greater Noida, Noida Extension and Delhi NCR.",
  alternates: { canonical: "/residential" },
};

export default async function ResidentialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProjectsListingPage
      params={params}
      basePath="/residential"
      lockedType="RESIDENTIAL"
      eyebrow="Residential"
      title="A home with room to become."
      description="Apartments, villas, penthouses and studios across the NCR. Every listing is sample data, structured so you can compare price, configuration and possession honestly."
    />
  );
}
