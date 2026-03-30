type ProductAdminSeoInput = {
  name: string;
  volumeMl?: number | null;
  siteName?: string | null;
  originOrCountry?: string | null;
  isWholesaleEnabled?: boolean;
  isNationwideShippingEnabled?: boolean;
  isHcmFastDeliveryEnabled?: boolean;
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

const formatVolume = (volumeMl?: number | null) => {
  if (!volumeMl || Number.isNaN(volumeMl)) {
    return '';
  }
  return `${volumeMl}ml`;
};

export const buildProductAdminSeo = ({
  name,
  volumeMl,
  siteName,
  originOrCountry,
  isWholesaleEnabled,
  isNationwideShippingEnabled,
  isHcmFastDeliveryEnabled,
}: ProductAdminSeoInput): ProductAdminSeoOutput => {
  const resolvedSiteName = normalizeSiteName(siteName);
  const trimmedName = name.trim();
  const resolvedOrigin = originOrCountry?.trim();
  const baseName = resolvedOrigin ? `${trimmedName} ${resolvedOrigin}` : trimmedName;
  const volumePart = formatVolume(volumeMl);
  const volumeSuffix = volumePart ? ` - ${volumePart}` : '';
  const title = `${baseName} | Giá tốt chính hãng | ${resolvedSiteName}`;

  const descriptionParts = [`${baseName}${volumeSuffix} Chính hãng tại ${resolvedSiteName}`];

  if (isWholesaleEnabled) {
    descriptionParts.push('✅ Giá sỉ từ 1 thùng');
  }

  if (isNationwideShippingEnabled) {
    descriptionParts.push('- Freeship toàn quốc');
  }

  if (isHcmFastDeliveryEnabled) {
    descriptionParts.push('- Giao hàng hỏa tốc 30 - 60 phút HCM | 1-4 ngày Tỉnh');
  }

  return {
    title,
    description: descriptionParts.join(' '),
  };
};
