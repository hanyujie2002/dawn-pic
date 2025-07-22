import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
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
  const user = await currentUser();
  setRequestLocale(locale);

  if (!user) {
    return (
      <div className="my-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Please log in to upload images.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Upload Image</h1>
        <ImageUploadForm />
      </div>
    </div>
  );
}
