export * from "./property";

export interface Notification {
  _id: string;
  is_read: boolean;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  message?: string;
  createdAt: string;
}
