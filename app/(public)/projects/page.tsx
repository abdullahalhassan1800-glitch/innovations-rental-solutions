import { ProjectsListingPage } from "@/components/projects/projects-listing-page";

export const metadata = {
  title: "Projects in Noida, Greater Noida & Noida Extension",
  description:
    "Browse sample residential and commercial projects across Delhi NCR. Filter by location, budget, configuration, status, possession, amenities and developer.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProjectsListingPage
      params={params}
      basePath="/projects"
      eyebrow="The full collection"
      title="Every address, in one place."
      description="A database-led view of the Innovations demonstration portfolio. Filter by the things that actually change your decision — location, budget, configuration, possession and amenities."
    />
  );
}

