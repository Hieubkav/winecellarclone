# Hướng dẫn Deploy Frontend lên Vercel

## Vấn đề
Frontend đã deploy lên https://winecellarclone.vercel.app/ nhưng không load được data từ backend vì:
- Thiếu environment variables trên Vercel
- Frontend không biết URL của backend API

## Giải pháp

### Bước 1: Set Environment Variables trên Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project **winecellarclone**
3. Vào **Settings** → **Environment Variables**
4. Thêm các biến sau:

```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://winecellarclone.vercel.app

# API Backend URL
NEXT_PUBLIC_API_BASE_URL=https://thienkimwine.vitrasau.info.vn/api

# Media Hosts
NEXT_PUBLIC_MEDIA_HOSTS=https://thienkimwine.vitrasau.info.vn
```

**Quan trọng:** 
- Environment: Chọn **Production**, **Preview**, và **Development**
- Sau khi thêm xong, click **Save**

### Bước 2: Redeploy

Có 2 cách:

**Cách 1: Tự động (Khuyến nghị)**
```bash
# Commit và push code
git add .env.production
git commit -m "Add production environment config

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
git push origin main
```

**Cách 2: Manual Redeploy**
1. Vào Vercel Dashboard
2. Chọn project
3. Tab **Deployments**
4. Click **...** ở deployment mới nhất
5. Chọn **Redeploy**
6. Check "Use existing Build Cache" → **Bỏ check** (để rebuild với env mới)
7. Click **Redeploy**

### Bước 3: Verify

Sau khi deploy xong:
1. Truy cập https://winecellarclone.vercel.app/
2. Mở DevTools (F12) → Console
3. Kiểm tra không có lỗi fetch
4. Verify các section hiển thị đúng:
   - Hero Carousel
   - Dual Banner
   - Category Grid
   - Favourite Products
   - Brand Showcase
   - Collection Showcase ✅
   - Editorial Spotlight ✅

5. Truy cập https://winecellarclone.vercel.app/filter
6. Verify products list load được ✅

## Lưu ý

### File .env.production
- Đã tạo file `.env.production` với config đúng
- File này sẽ được Next.js tự động load khi `NODE_ENV=production`
- Tuy nhiên, Vercel **không tự động đọc file này** nên cần set trên dashboard

### CORS
- Backend đã config CORS cho phép domain Vercel: `https://winecellarclone.vercel.app`
- Nếu đổi domain, cần update `FRONTEND_URLS` trong backend `.env`

### Cache
- Next.js có ISR (Incremental Static Regeneration) với revalidate 300 giây (5 phút)
- Nếu data không update, chờ 5 phút hoặc clear cache

## Troubleshooting

### Lỗi: Failed to fetch
**Nguyên nhân:** Environment variables chưa được set đúng

**Giải pháp:**
1. Verify trên Vercel Dashboard → Settings → Environment Variables
2. Đảm bảo có đủ 3 biến: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_MEDIA_HOSTS`
3. Redeploy (không dùng cache)

### Lỗi: CORS
**Nguyên nhân:** Backend không cho phép domain frontend

**Giải pháp:**
1. Check backend `.env` có `FRONTEND_URLS=https://winecellarclone.vercel.app`
2. Nếu chưa có, thêm vào
3. Restart backend

### Lỗi: Images không load
**Nguyên nhân:** `NEXT_PUBLIC_MEDIA_HOSTS` chưa được set hoặc Next.js config chưa đúng

**Giải pháp:**
1. Verify `NEXT_PUBLIC_MEDIA_HOSTS=https://thienkimwine.vitrasau.info.vn`
2. Check `next.config.ts` đã parse `NEXT_PUBLIC_MEDIA_HOSTS` đúng chưa

## API Endpoints

Backend đang chạy tại: `https://thienkimwine.vitrasau.info.vn`

Test endpoints:
```bash
# Home page data
curl https://thienkimwine.vitrasau.info.vn/api/v1/home

# Products list
curl https://thienkimwine.vitrasau.info.vn/api/v1/san-pham?page=1

# Product filters
curl https://thienkimwine.vitrasau.info.vn/api/v1/san-pham/filters/options
```

Tất cả endpoints đều trả về JSON với structure:
```json
{
  "data": [...],
  "meta": {...}
}
```
