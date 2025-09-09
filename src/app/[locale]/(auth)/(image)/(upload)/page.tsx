import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ImageUploadForm } from './ImageUploadForm'; // Import the client component

type IImageUploadPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IImageUploadPageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'ImageUpload',
  });
  return {
    title: t('meta_title'),
  };
}

export default async function ImageUploadPage(props: IImageUploadPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="my-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Upload Image</h1>
        <ImageUploadForm locale={locale} />
      </div>
    </div>
  );
}
