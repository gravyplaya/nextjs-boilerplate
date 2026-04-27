"use client";

import { useAuth } from "@/features/auth/hooks/auth-context";
import { useLanguage } from "@/features/i18n/hooks/language-context";
import { getTranslations } from "@/features/i18n/config/get-translations";
import { useTranslations } from "@/features/i18n/hooks/use-translations";
import { HeadManager } from "@/components/common/head-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Page = () => {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const messages = getTranslations(locale);
  const { t } = useTranslations(messages);

  return (
    <>
      <HeadManager title={`${t("dashboard.user.title")} | ${t("common.appName")}`} />
      <div className="mx-auto max-w-2xl px-4 py-12 pt-20 md:pt-12">
        <h1 className="mb-8 text-3xl font-bold">{t("dashboard.user.title")}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.user.profile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground block text-sm font-medium">
                  {t("dashboard.user.email")}
                </label>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-medium">
                  {t("dashboard.user.role")}
                </label>
                <p className="text-lg font-semibold capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-medium">
                  {t("dashboard.user.userId")}
                </label>
                <p className="text-muted-foreground text-sm">{user?.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Page;
