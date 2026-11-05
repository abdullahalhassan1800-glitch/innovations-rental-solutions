import { ProjectsListingPage } from "@/components/projects/projects-listing-page";

export const metadata = {
  title: "Service apartments in Noida & Greater Noida",
  description:
    "Explore demo serviced apartments and furnished managed stays across Noida, Greater Noida, Noida Extension and Delhi NCR. All inventory is sample data.",
  alternates: { canonical: "/service-apartments" },
};

export default async function ServiceApartmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ProjectsListingPage
      params={params}
      basePath="/service-apartments"
      lockedType="RESIDENTIAL"
      lockedCategory="Serviced apartment"
      eyebrow="Service apartments"
      title="Furnished stays, managed end to end."
      description="Serviced apartments across the NCR — furnished, professionally managed and suited to short or extended stays. Sample inventory only, with the operating context laid out plainly."
    />
  );
}
