import { ProjectsListingPage } from "@/components/projects/projects-listing-page";

export const metadata = {
  title: "Commercial property in Noida & Greater Noida",
  description:
    "Explore demo offices, retail spaces and SCO addresses across Noida, Greater Noida, Noida Extension and Delhi NCR.",
  alternates: { canonical: "/commercial" },
};

export default async function CommercialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProjectsListingPage
      params={params}
      basePath="/commercial"
      lockedType="COMMERCIAL"
      eyebrow="Commercial"
      title="A footprint that pays attention."
      description="Offices, high-street retail and SCO addresses across the NCR. Sample inventory, presented with the context that matters for a commercial decision."
    />
  );
}
