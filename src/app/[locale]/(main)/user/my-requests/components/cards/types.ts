export interface RequestCardProps {
  request: any;
  locale: string;
  onCardClick: (id: string) => void;
  getCurrency: (countryCode?: string) => string;
}

export interface OwnerImageProps {
  owner: {
    image?: string;
    name: string;
  };
}
