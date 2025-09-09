import { SignInButton, SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const { userId } = await auth();

  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              Upload Image
            </Link>
          </li>
          <li>
            <Link
              href="/management/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              Image Management
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/user-profile/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            {userId
              ? (
                  <SignOutButton>
                    <button className="border-none text-gray-700 cursor-pointer hover:text-gray-900" type="button">
                      {t('sign_out')}
                    </button>
                  </SignOutButton>

                )
              : (
                  <SignInButton>
                    <button className="border-none text-gray-700 cursor-pointer hover:text-gray-900" type="button">
                      sign in
                    </button>
                  </SignInButton>
                )}
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      )}
    >
      {props.children}
    </BaseTemplate>
  );
}
