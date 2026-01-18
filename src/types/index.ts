export * from "./property";

export interface Notification {
  _id: string;
  isRead: boolean;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  message?: string;
  createdAt: string;
  property: {
    _id: string
    code: string
    title: string
    paciNumber: string[]
  } | null;
}
