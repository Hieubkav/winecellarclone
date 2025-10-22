import Image from "next/image";
import Link from "next/link";

import { customerServices } from "@/data/winecellar";

export default function CustomerServices() {
  return (
    <section className="bg-[#990d23] py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[2fr,1fr] lg:items-center">
        <Link
          href="https://winecellar.vn/qua-tang-doanh-nghiep/"
          className="group overflow-hidden rounded-3xl shadow-2xl transition"
        >
          <div className="relative aspect-[2500/1167] w-full">
            <Image
              src="https://winecellar.vn/wp-content/uploads/2025/07/250723-Banner-trang-Qua-tang-TBXG-VI.jpg"
              alt="Quà tặng doanh nghiệp"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="space-y-6 rounded-3xl bg-white/10 p-8 backdrop-blur">
          <h2 className="text-2xl font-semibold uppercase tracking-wide">Dịch vụ khách hàng</h2>
          <p className="text-sm text-white/80">
            Chúng tôi đồng hành cùng doanh nghiệp và tín đồ sành rượu với dịch vụ tư vấn quà tặng, đào tạo và hệ sinh thái
            sản phẩm nhập khẩu chính hãng.
          </p>
          <ul className="space-y-4">
            {customerServices.map((service) => (
              <li key={service.href}>
                <Link
                  href={service.href}
                  className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white hover:text-[#990d23]"
                >
                  <Image src={service.icon} alt="" width={26} height={26} className="h-6 w-6" />
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
