import type { Metadata } from "next";
import SeoHubPage from "@/components/seo/SeoHubPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thienkimwine.vn";

export const metadata: Metadata = {
  title: "Hỗ trợ khách hàng | Thiên Kim Wine",
  description: "Câu hỏi thường gặp, giao hàng, đổi trả, thanh toán, cam kết chính hãng và chính sách của Thiên Kim Wine.",
  alternates: { canonical: `${SITE_URL}/ho-tro` },
};

export default function SupportPage() {
  return (
    <SeoHubPage
      eyebrow="Hỗ trợ"
      title="Hỗ trợ khách hàng"
      description="Trung tâm thông tin giúp khách hàng hiểu rõ chính sách mua hàng, giao nhận, thanh toán và cam kết chính hãng."
      links={[
        { label: "Câu hỏi thường gặp", href: "/ho-tro/faq" },
        { label: "Giao hàng & vận chuyển", href: "/ho-tro/giao-hang-van-chuyen" },
        { label: "Đổi trả & hoàn tiền", href: "/ho-tro/doi-tra-hoan-tien" },
        { label: "Phương thức thanh toán", href: "/ho-tro/thanh-toan" },
        { label: "Cam kết chính hãng", href: "/ho-tro/cam-ket-chinh-hang" },
        { label: "Chính sách bảo mật", href: "/ho-tro/chinh-sach-bao-mat" },
        { label: "Điều khoản & điều kiện", href: "/ho-tro/dieu-khoan-dieu-kien" },
      ]}
    />
  );
}
