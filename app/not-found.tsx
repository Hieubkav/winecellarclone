import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 - Trang không tìm thấy | Thiên Kim Wine",
  description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Quay lại trang chủ để tiếp tục mua sắm rượu vang chính hãng.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-6xl font-bold text-[#9B2C3B]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Trang không tìm thấy
        </h2>
        <p className="mb-8 text-gray-600">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-[#9B2C3B] px-6 py-3 text-white transition-colors hover:bg-[#7a2330]"
          >
            Về trang chủ
          </Link>
          <Link
            href="/filter"
            className="rounded-lg border border-[#9B2C3B] px-6 py-3 text-[#9B2C3B] transition-colors hover:bg-[#9B2C3B] hover:text-white"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </main>
  );
}
