import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { deleteImage } from '@/app/actions/deleteActions';
import { db } from '@/libs/DB';
import { imagesSchema } from '@/models/Schema';

type IImageManagementPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IImageManagementPageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'ImageUpload',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function ImageManagementPage(props: IImageManagementPageProps) {
  const { locale } = await props.params;
  const user = await currentUser();

  setRequestLocale(locale);

  if (!user) {
    redirect(`/${locale}/sign-in`);
    // return (
    //   <div className="my-6">
    //     <p>Please log in to upload images.</p>
    //   </div>
    // );
  }

  // Fetch user's uploaded images
  const userImages = await db.query.imagesSchema.findMany({
    where: eq(imagesSchema.userId, user.id),
    orderBy: (images, { desc }) => [desc(images.createdAt)],
  });

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">Your Uploaded Images</h2>
      {userImages.length === 0
        ? (
            <p className="text-gray-500">No images uploaded yet.</p>
          )
        : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userImages.map(image => (
                <div key={image.id} className="border relative rounded-lg overflow-hidden aspect-square group">
                  <Image
                    src={image.url}
                    alt="Uploaded"
                    fill
                    className="object-cover"
                  />
                  {/* Overlay with buttons */}
                  <div className="absolute inset-0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      {/* View button */}
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </a>
                      {/* Delete button */}
                      <form action={deleteImage} className="inline">
                        <input type="hidden" name="imageId" value={image.id} />
                        <input type="hidden" name="imagePath" value={image.path} />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs truncate">
                      {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
