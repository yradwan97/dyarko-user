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
  requestId?: string | null;
  endpoint?: string;
  requestType: string;
  request?: any;
  // Extend Invoice specific props
  onPayInvoice?: (invoiceId: string, paymentMethod: string) => Promise<void>;
  isPaymentPending?: boolean;
  // Rental Collection specific props
  onApproveReject?: (action: "approve" | "reject", propertyId: string, propertyTitle: string) => void;
  isActionPending?: boolean;
  pendingAction?: "approve" | "reject" | null;
}

export default function RequestDetailsModal({
  isOpen,
  onClose,
  requestId,
  endpoint,
  requestType,
  request,
  onPayInvoice,
  isPaymentPending,
  onApproveReject,
  isActionPending,
  pendingAction,
}: RequestDetailsModalProps) {
  const modalProps = {
    isOpen,
    onClose,
    requestId,
    endpoint,
    request,
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
      return <ExtendInvoiceDetailsModal {...modalProps} onPayInvoice={onPayInvoice} isPaymentPending={isPaymentPending} />;

    case "end-contracts":
      return <EndContractDetailsModal {...modalProps} />;

    case "rental-collection":
      return <RentalCollectionDetailsModal {...modalProps} onApproveReject={onApproveReject} isActionPending={isActionPending} pendingAction={pendingAction} />;

    default:
      return null;
  }
}
