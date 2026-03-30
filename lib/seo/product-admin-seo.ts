type ProductAdminSeoInput = {
  name: string;
  siteName?: string | null;
};

type ProductAdminSeoOutput = {
  title: string;
  description: string;
};

const DEFAULT_SITE_NAME = 'Thiên Kim Wine';

const normalizeSiteName = (siteName?: string | null) => {
  const normalized = siteName?.trim();
  return normalized ? normalized : DEFAULT_SITE_NAME;
};

export const buildProductAdminSeo = ({
  name,
  siteName,
}: ProductAdminSeoInput): ProductAdminSeoOutput => {
  const resolvedSiteName = normalizeSiteName(siteName);
  const trimmedName = name.trim();
  const title = `${trimmedName} | Giá tốt chính hãng | ${resolvedSiteName}`;

  return {
    title,
    description: `${trimmedName} Chính hãng tại ${resolvedSiteName} ✅ Giá sỉ từ 1 thùng - Freeship toàn quốc - Giao hàng hỏa tốc 30 - 60 phút HCM | 1-4 ngày Tỉnh`,
  };
};
