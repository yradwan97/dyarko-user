export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  endpoint: string;
}

export interface RequestData {
  data: any;
}
