import { ProjectsListingPage } from "@/components/projects/projects-listing-page";

export const metadata = {
  title: "Properties in Mangalore, Bangalore & NCR | Housirentz Innovations",
  description:
    "Browse verified rental investment properties across Mangalore, Bangalore, Bengaluru and Greater Noida West. Filter by location, budget, configuration, possession and amenities.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProjectsListingPage
      params={params}
      basePath="/properties"
      eyebrow="Available Properties"
      title="Curated, verified assets ready for investment."
      description="Explore verified rental investment properties and talk to an advisor about your goals."
    />
  );
}
