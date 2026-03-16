import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { fetchAdminSettings, updateSettings } from "../api/settings.api";

const VALID_TABS = ["info", "map", "watermark", "seo"] as const;

type TabValue = (typeof VALID_TABS)[number];

const getValidTab = (value: string | null): TabValue =>
  VALID_TABS.includes(value as TabValue) ? (value as TabValue) : "info";

const resolveBackendUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  return fromEnv.replace("/api", "");
};

const parseKeywordValues = (input: string | string[] | null): string[] => {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === "string" && input.trim()) {
    return input
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
};

export const useSettingsForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backendUrl = useMemo(resolveBackendUrl, []);

  const [activeTab, setActiveTab] = useState<TabValue>(() => getValidTab(searchParams?.get("tab")));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [hotline, setHotline] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [googleMapEmbed, setGoogleMapEmbed] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const [logoImageId, setLogoImageId] = useState<number | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [faviconImageId, setFaviconImageId] = useState<number | null>(null);
  const [faviconImageUrl, setFaviconImageUrl] = useState<string | null>(null);
  const [ogImageId, setOgImageId] = useState<number | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);

  const [watermarkType, setWatermarkType] = useState("image");
  const [watermarkImageId, setWatermarkImageId] = useState<number | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null);
  const [watermarkPosition, setWatermarkPosition] = useState("none");
  const [watermarkSize, setWatermarkSize] = useState("128x128");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkTextSize, setWatermarkTextSize] = useState("medium");
  const [watermarkTextPosition, setWatermarkTextPosition] = useState("center");
  const [watermarkTextOpacity, setWatermarkTextOpacity] = useState(50);
  const [watermarkTextRepeat, setWatermarkTextRepeat] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminSettings();
      const data = res.data;

      setSiteName(data.site_name || "");
      setHotline(data.hotline || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
      setHours(data.hours || "");
      setGoogleMapEmbed(data.google_map_embed || "");
      setMetaTitle(data.meta_default_title || "");
      setMetaDescription(data.meta_default_description || "");

      setLogoImageId(data.logo_image_id || null);
      setLogoImageUrl(data.logo_image_url ? `${backendUrl}${data.logo_image_url}` : null);
      setFaviconImageId(data.favicon_image_id || null);
      setFaviconImageUrl(data.favicon_image_url ? `${backendUrl}${data.favicon_image_url}` : null);
      setOgImageId(data.og_image_id || null);
      setOgImageUrl(data.og_image_url ? `${backendUrl}${data.og_image_url}` : null);

      setMetaKeywords(parseKeywordValues(data.meta_default_keywords));

      const resolvedWatermarkType = String(data.product_watermark_type || "image")
        .trim()
        .toLowerCase();
      setWatermarkType(resolvedWatermarkType === "text" ? "text" : "image");
      setWatermarkImageId(data.product_watermark_image_id || null);
      setWatermarkImageUrl(
        data.product_watermark_image_url ? `${backendUrl}${data.product_watermark_image_url}` : null
      );
      setWatermarkPosition(data.product_watermark_position || "none");
      setWatermarkSize(data.product_watermark_size || "128x128");
      setWatermarkText(data.product_watermark_text || "");
      setWatermarkTextSize(data.product_watermark_text_size || "medium");
      setWatermarkTextPosition(data.product_watermark_text_position || "center");
      setWatermarkTextOpacity(data.product_watermark_text_opacity || 50);
      setWatermarkTextRepeat(Boolean(data.product_watermark_text_repeat));
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Không thể tải cấu hình");
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const nextTab = getValidTab(searchParams?.get("tab"));
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, searchParams]);

  const handleTabChange = (value: string) => {
    const nextTab = getValidTab(value);
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", nextTab);
    const currentTab = getValidTab(searchParams?.get("tab"));
    if (currentTab !== nextTab || searchParams?.toString() !== params.toString()) {
      router.replace(`/admin/settings?${params.toString()}`, { scroll: false });
    }
  };

  const handleKeywordAdd = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const trimmed = keywordInput.trim();
      if (trimmed && !metaKeywords.includes(trimmed)) {
        setMetaKeywords([...metaKeywords, trimmed]);
        setKeywordInput("");
      }
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setMetaKeywords(metaKeywords.filter((item) => item !== keyword));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const successMessages: Record<TabValue, string> = {
      info: "Cập nhật thông tin website thành công",
      map: "Cập nhật Google Maps thành công",
      watermark: "Cập nhật watermark sản phẩm thành công",
      seo: "Cập nhật SEO thành công",
    };

    const errorMessages: Record<TabValue, string> = {
      info: "Không thể cập nhật thông tin website",
      map: "Không thể cập nhật Google Maps",
      watermark: "Không thể cập nhật watermark sản phẩm",
      seo: "Không thể cập nhật SEO",
    };

    const resolveMessage = (message: string | undefined, fallback: string) => {
      if (!message) return fallback;
      const normalized = message.trim();
      if (!normalized) return fallback;
      const genericMessages = new Set(["Cập nhật thành công", "Thành công", "Cập nhật cấu hình thành công"]);
      return genericMessages.has(normalized) ? fallback : normalized;
    };

    try {
      const data: Record<string, unknown> = {
        site_name: siteName || null,
        hotline: hotline || null,
        email: email || null,
        address: address || null,
        hours: hours || null,
        google_map_embed: googleMapEmbed || null,
        meta_default_title: metaTitle || null,
        meta_default_description: metaDescription || null,
        meta_default_keywords: metaKeywords.length > 0 ? metaKeywords.join(", ") : null,
        logo_image_id: logoImageId,
        favicon_image_id: faviconImageId,
        og_image_id: ogImageId,
        product_watermark_type: watermarkType,
        product_watermark_image_id: watermarkImageId,
        product_watermark_position: watermarkPosition,
        product_watermark_size: watermarkSize,
        product_watermark_text: watermarkText || null,
        product_watermark_text_size: watermarkTextSize,
        product_watermark_text_position: watermarkTextPosition,
        product_watermark_text_opacity: watermarkTextOpacity,
        product_watermark_text_repeat: watermarkTextRepeat,
      };

      const result = await updateSettings(data);
      if (result.success) {
        const successMessage = resolveMessage(result.message, successMessages[activeTab]);
        toast.success(successMessage);
        await loadSettings();
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(errorMessages[activeTab]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      activeTab,
      isLoading,
      isSubmitting,
      siteName,
      hotline,
      email,
      address,
      hours,
      googleMapEmbed,
      metaTitle,
      metaDescription,
      metaKeywords,
      keywordInput,
      logoImageId,
      logoImageUrl,
      faviconImageId,
      faviconImageUrl,
      ogImageId,
      ogImageUrl,
      watermarkType,
      watermarkImageId,
      watermarkImageUrl,
      watermarkPosition,
      watermarkSize,
      watermarkText,
      watermarkTextSize,
      watermarkTextPosition,
      watermarkTextOpacity,
      watermarkTextRepeat,
    },
    actions: {
      setSiteName,
      setHotline,
      setEmail,
      setAddress,
      setHours,
      setGoogleMapEmbed,
      setMetaTitle,
      setMetaDescription,
      setMetaKeywords,
      setKeywordInput,
      setLogoImageId,
      setLogoImageUrl,
      setFaviconImageId,
      setFaviconImageUrl,
      setOgImageId,
      setOgImageUrl,
      setWatermarkType,
      setWatermarkImageId,
      setWatermarkImageUrl,
      setWatermarkPosition,
      setWatermarkSize,
      setWatermarkText,
      setWatermarkTextSize,
      setWatermarkTextPosition,
      setWatermarkTextOpacity,
      setWatermarkTextRepeat,
      handleTabChange,
      handleKeywordAdd,
      handleKeywordRemove,
      handleSubmit,
    },
  };
};
