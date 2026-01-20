const sections = [
  {
    title: "Danh mục & bộ lọc",
    points: [
      "Danh mục hỗ trợ cha–con (4 nhóm lớn như Shopee), filter hiển thị đúng thuộc tính của ngành đang xem.",
      "Menu lấy từ dữ liệu danh mục, không cần mega menu; có thể đổi cấu trúc mà không phải sửa code.",
    ],
  },
  {
    title: "Thuộc tính theo ngành",
    points: [
      "Mỗi ngành có bộ thuộc tính riêng (ví dụ Vang: giống nho, dung tích, nồng độ, hương vị…).",
      "NSX gộp vào Thương hiệu; Xuất xứ tùy chọn, có thể ẩn nếu không cần.",
    ],
  },
  {
    title: "Form nhập 1 trang",
    points: [
      "Thông tin chính + Giá & Thông số + Thuộc tính nằm cùng trang, không phải chuyển tab.",
      "Upload ảnh bìa riêng, ảnh phụ riêng; bỏ hoàn toàn badge 18+ theo yêu cầu khách.",
    ],
  },
  {
    title: "Sản phẩm mới",
    points: [
      "Tự gắn nhãn “Mới nhập” nếu ngày nhập ≤ 30 ngày, không cần nhập tay.",
    ],
  },
  {
    title: "Import Excel",
    points: [
      "Có màn map cột từ file Shopee/BigSeller → category/brand/thuộc tính; lưu template dùng lại.",
      "Hàng thiếu thuộc tính vẫn nhập, hệ thống chỉ bỏ qua field trống.",
    ],
  },
  {
    title: "Hiển thị sản phẩm",
    points: [
      "Thẻ sản phẩm gọn: tên, giá, 1–2 thuộc tính chính, nhãn “Mới” (nếu có); tránh rớt layout.",
    ],
  },
];

export default function DemoChotKhach() {
  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto bg-[#111726] border border-[#1f2a44] rounded-2xl p-10 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc] mb-4">
          route: /demo-chot-khach
        </p>
        <h1 className="text-3xl font-semibold text-white mb-2">
          Bản nháp chốt ý với khách
        </h1>
        <p className="text-sm text-[#cbd5e1] mb-8">
          Tóm tắt những thay đổi sẽ thực hiện để khớp yêu cầu: bỏ 18+, giữ form một
          trang, chuẩn hóa danh mục & thuộc tính, hỗ trợ import Excel.
        </p>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-3">
                {section.title}
              </h2>
              <ul className="space-y-2 text-sm text-[#e2e8f0] leading-relaxed">
                {section.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 items-start before:content-['•'] before:text-[#38bdf8] before:mt-[4px]"
                  >
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 text-sm text-[#cbd5e1]">
          <p className="font-semibold text-white mb-2">Kế hoạch demo nhanh:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Chốt 4 danh mục cha và bộ thuộc tính từng ngành (không dùng 18+).</li>
            <li>Làm form nhập 1 trang + upload ảnh bìa/phụ; bật thử import Excel.</li>
            <li>Show filter theo ngành và thẻ sản phẩm gọn để khách duyệt.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
