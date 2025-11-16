"use client";

import {
  TourDetailsModal,
  RentDetailsModal,
  ServiceDetailsModal,
  DisclaimerDetailsModal,
  ExtendInvoiceDetailsModal,
  EndContractDetailsModal,
  RentalCollectionDetailsModal,
} from "./modals";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  endpoint: string;
  requestType: string;
}

export default function RequestDetailsModal({
  isOpen,
  onClose,
  requestId,
  endpoint,
  requestType,
}: RequestDetailsModalProps) {
  const modalProps = {
    isOpen,
    onClose,
    requestId,
    endpoint,
  };

  switch (requestType) {
    case "tours":
      return <TourDetailsModal {...modalProps} />;

    case "rent":
      return <RentDetailsModal {...modalProps} />;

    case "service":
      return <ServiceDetailsModal {...modalProps} />;

    case "disclaimers":
      return <DisclaimerDetailsModal {...modalProps} />;

    case "extend-invoices":
      return <ExtendInvoiceDetailsModal {...modalProps} />;

    case "end-contracts":
      return <EndContractDetailsModal {...modalProps} />;

    case "rental-collection":
      return <RentalCollectionDetailsModal {...modalProps} />;

    default:
      return null;
  }
}
