import PropertyListingContent from "./property-listing-content";

interface PropertyListingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PropertyListingPage({ params }: PropertyListingPageProps) {
  const { slug } = await params;

  return <PropertyListingContent slug={slug} />;
}
