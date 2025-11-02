import RentApplication from "./rent-application";

interface RentPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function RentPage({ params }: RentPageProps) {
  const { id } = await params;
  return <RentApplication propertyId={id} />;
}
