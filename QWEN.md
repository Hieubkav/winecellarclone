Trả lời bằng tiếng Việt.

Đừng để một file vượt quá 400 dòng; ưu tiên tái sử dụng component hoặc tách file theo design pattern hiện đại.

Thiết kế UI/UX theo phong cách tối giản để end user không phải suy nghĩ. Nếu có thể giảm nữa số chữ thì phải giảm , xong giảm 1 nữa số chữ còn lại trên giao diện.

Website Thiên Kim Wine giữ nền trắng chủ đạo nhưng mọi điểm nhấn phải theo đúng palette:

- #1C1C1C (Noir Base) cho text chính, icon và block đậm.
- #ECAA4D (Amber Accent) cho CTA, hover, focus ring.
- #9B2C3B (Wine Highlight) cho background nổi bật, badge và các section hero như CarouselBanner.

Font chữ: Montserrat Bold dùng cho tên thương hiệu, tiêu đề; Montserrat Regular dùng cho nội dung phụ.

Ưu tiên làm UI bằng shadcn ui và dùng icon là lucide react

## Chuẩn typography Montserrat

- **Chữ tiêu đề (Heading/Hero)**

  - Mobile ≤768px: Montserrat Bold 32px, line-height 120%, chữ hoa nhẹ với letter-spacing -0.5px.
  - Desktop >768px: Montserrat Bold 48px, line-height 120%, letter-spacing -1px.
  - Dùng cho H1, hero banner, tên thương hiệu lớn.
- **Chữ thường mô tả (Body)**

  - Mobile: Montserrat Medium 16px, line-height 165%.
  - Desktop: Montserrat Medium 18px, line-height 170%.
  - Dùng cho copy chính, mô tả sản phẩm, nội dung bài viết.
- **Chữ phụ / meta (Subtext, badge, label)**

  - Mobile: Montserrat Light 13px, line-height 150%, chữ hoa với letter-spacing 2.8px.
  - Desktop: Montserrat Light 14px, line-height 150%, letter-spacing 3.2px.
  - Dùng cho nhãn phụ, badge, thông tin bổ sung, caption.
  - 
- Không chạy bun run build hoặc bun dev gì nha . Chạy xong nhiệm vụ nhớ bunx tsc --project apps/web/tsconfig.json --noEmit để check xem có lỗi thì sửa đến khi hết
