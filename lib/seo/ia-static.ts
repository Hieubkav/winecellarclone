export const formatSlugTitle = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const STATIC_HUB_LABELS: Record<string, string> = {
  "thuong-hieu": "Thương hiệu",
  "bo-suu-tap": "Bộ sưu tập",
  "qua-tang": "Quà tặng",
  "dich-vu": "Dịch vụ",
  "cua-hang": "Cửa hàng",
  "ho-tro": "Hỗ trợ",
  "gioi-thieu": "Giới thiệu",
};

export const buildStaticChildCopy = (hubSlug: string, childSlug: string) => {
  const hubLabel = STATIC_HUB_LABELS[hubSlug] ?? formatSlugTitle(hubSlug);
  const childTitle = formatSlugTitle(childSlug);

  return {
    title: `${childTitle} | ${hubLabel} | Thiên Kim Wine`,
    heading: childTitle,
    eyebrow: hubLabel,
    description: `Trang ${childTitle.toLowerCase()} thuộc nhóm ${hubLabel.toLowerCase()} của Thiên Kim Wine. Nội dung chi tiết sẽ được đội ngũ cập nhật theo dữ liệu vận hành và nhu cầu khách hàng thực tế.`,
  };
};
