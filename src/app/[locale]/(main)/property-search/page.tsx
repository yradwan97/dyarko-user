import { Metadata } from "next";
import SearchPageContent from "./components/search-page-content";
import { generatePropertySearchMetadata } from "./metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generatePropertySearchMetadata(locale);
}

export default function PropertySearchPage() {
  return <SearchPageContent />;
}
