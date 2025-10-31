import RentApplication from "./rent-application";

interface RentPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default function RentPage({ params }: RentPageProps) {
  return <RentApplication propertyId={params.id} />;
}
