"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import Typography from "@/components/shared/typography";
import { getCategories } from "@/lib/services/api/categories";

export default function CategoriesPage() {
  const t = useTranslations("General.Categories");
  const router = useRouter();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const handleCategoryClick = (categoryKey: string) => {
    // Navigate to property search with category query param
    router.push(`/property-search?category=${categoryKey}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <Typography variant="h2" as="h2" className="font-bold mb-2">
          {t("title")}
        </Typography>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-12 w-12 text-main-400" />
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category.key)}
              className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-main-400 dark:hover:border-main-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="relative w-20 h-20 mb-3">
                <Image
                  src={category.image}
                  alt={t(category.key)}
                  fill
                  className="object-contain"
                />
              </div>
              <Typography
                variant="body-sm"
                as="span"
                className="text-center text-gray-700 dark:text-gray-300 group-hover:text-main-400 dark:group-hover:text-main-400 font-medium"
              >
                {t(category.key)}
              </Typography>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Typography
            variant="body-lg-medium"
            as="p"
            className="text-gray-500 dark:text-gray-400"
          >
            {t("no-data")}
          </Typography>
        </div>
      )}
    </div>
  );
}
