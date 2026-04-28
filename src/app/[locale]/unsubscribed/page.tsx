import Link from 'next/link';
import { CheckCircle } from 'lucide-react'; // Optional: install lucide-react for icons
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export default function UnsubscribeSuccessPage() {
    const locale = useLocale();
    const t = useTranslations("General.Unsubscribe");
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {t("title")}
        </h1>

        <p className="text-gray-600 mb-8">
          {t("description")}
        </p>

        <div className="space-y-4">
          <Link
            href={getLocalizedPath("/", locale)}
            className="block w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            {t("go-home")}
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-10">
          {t("mistake")}{' '}
          <Button className="px-2 text-sm">
            {t("resub")}
          </Button>
        </p>
      </div>
    </div>
  );
}