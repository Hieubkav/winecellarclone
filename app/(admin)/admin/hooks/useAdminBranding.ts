"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminSettings } from "@/features/admin/settings/api/settings.api";

interface AdminBrandingState {
  siteName: string;
  logoUrl: string | null;
  isLoading: boolean;
}

const DEFAULT_SITE_NAME = "Thiên Kim Wine";

const resolveBackendUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  return fromEnv.replace("/api", "");
};

const normalizeSiteName = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : DEFAULT_SITE_NAME;
};

export function useAdminBranding(): AdminBrandingState {
  const backendUrl = useMemo(resolveBackendUrl, []);
  const [siteName, setSiteName] = useState(DEFAULT_SITE_NAME);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadBranding = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAdminSettings();
        if (cancelled) {
          return;
        }

        const data = res.data;
        setSiteName(normalizeSiteName(data.site_name));
        setLogoUrl(data.logo_image_url ? `${backendUrl}${data.logo_image_url}` : null);
      } catch (error) {
        if (!cancelled) {
          setSiteName(DEFAULT_SITE_NAME);
          setLogoUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBranding();

    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

  return { siteName, logoUrl, isLoading };
}
