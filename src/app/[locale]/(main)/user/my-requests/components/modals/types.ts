export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId?: string | null;
  endpoint?: string;
  request?: any; // Pass request object directly to avoid fetching
}

export interface RequestData {
  data: any;
}
