import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Giới thiệu Thiên Kim Wine",
  description: "Tìm hiểu về Thiên Kim Wine, câu chuyện thương hiệu, lý do lựa chọn và các chứng nhận/giấy phép liên quan.",
  alternates: { canonical: `${SITE_URL}/gioi-thieu` },
};

export default function AboutPage() {
  return (
    <SeoHubPage
      eyebrow="Giới thiệu"
      title="Về Thiên Kim Wine"
      description="Không gian giới thiệu thương hiệu, giá trị tư vấn và cam kết giúp khách hàng yên tâm khi chọn rượu và quà tặng."
      links={[
        { label: "Về Thiên Kim Wine", href: "/gioi-thieu/ve-thien-kim-wine" },
        { label: "Câu chuyện thương hiệu", href: "/gioi-thieu/cau-chuyen-thuong-hieu" },
        { label: "Vì sao chọn chúng tôi", href: "/gioi-thieu/vi-sao-chon-chung-toi" },
        { label: "Chứng nhận / giấy phép", href: "/gioi-thieu/chung-nhan-giay-phep" },
      ]}
    />
  );
}
