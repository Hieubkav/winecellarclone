import { useCallback, useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createArticle,
  fetchAdminArticle,
  updateArticle,
} from "../api/articles.api";
import { uploadArticleImage, uploadArticleImageUrl } from "../api/articles.uploads";

export interface ArticleImageItem {
  url: string;
  path: string;
}

interface UseArticleFormOptions {
  articleId?: number;
}

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

export const useArticleForm = ({ articleId }: UseArticleFormOptions = {}) => {
  const router = useRouter();
  const isEditMode = useMemo(() => Boolean(articleId), [articleId]);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [active, setActive] = useState(true);
  const [showSlugEditor, setShowSlugEditor] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<ArticleImageItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const loadArticle = useCallback(async () => {
    if (!articleId) return;
    setIsLoading(true);
    try {
      const result = await fetchAdminArticle(articleId);
      const article = result.data;

      setTitle(article.title);
      setSlug(article.slug);
      setContent(article.content || "");
      setActive(article.active);

      if (article.images && Array.isArray(article.images) && article.images.length > 0) {
        const mappedImages = article.images
          .map((img: any) => {
            const url = img.url || img.image_url;
            const path = img.path || img.image_path || img.file_path;
            return { url, path } as ArticleImageItem;
          })
          .filter((image) => Boolean(image.url) && Boolean(image.path));

        setGalleryImages(mappedImages);
      }
    } catch (error) {
      console.error("Failed to load article:", error);
      toast.error("Không thể tải bài viết");
      router.push("/admin/articles");
    } finally {
      setIsLoading(false);
    }
  }, [articleId, router]);

  useEffect(() => {
    if (isEditMode) {
      void loadArticle();
    }
  }, [isEditMode, loadArticle]);

  const uploadSingleImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return null;
    }

    return uploadArticleImage(file);
  }, []);

  const handleGalleryUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploadingImage(true);
      try {
        const uploads = Array.from(files).map((file) => uploadSingleImage(file));
        const results = await Promise.all(uploads);
        const nextImages = results.filter((item): item is ArticleImageItem => Boolean(item));
        if (nextImages.length > 0) {
          setGalleryImages((prev) => [...prev, ...nextImages]);
          toast.success(`Đã tải lên ${nextImages.length} ảnh`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Không thể tải ảnh lên");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [uploadSingleImage]
  );

  const handleUrlUpload = useCallback(async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadArticleImageUrl(url);
      if (uploaded) {
        setGalleryImages((prev) => [...prev, uploaded]);
        setImageUrlInput("");
        toast.success("Đã tải ảnh từ URL");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh từ URL");
    } finally {
      setIsUploadingImage(false);
    }
  }, [imageUrlInput]);

  const handleReplaceFromUrl = useCallback(async (index: number, url: string) => {
    if (!url) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadArticleImageUrl(url);
      if (uploaded) {
        setGalleryImages((prev) => prev.map((img, i) => (i === index ? uploaded : img)));
        toast.success("Đã thay thế ảnh");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Không thể tải ảnh từ URL");
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleReplaceFile = useCallback(
    async (index: number, file: File | null) => {
      if (!file) return;
      setIsUploadingImage(true);
      try {
        const uploaded = await uploadSingleImage(file);
        if (uploaded) {
          setGalleryImages((prev) => prev.map((img, i) => (i === index ? uploaded : img)));
          toast.success("Đã thay thế ảnh");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Không thể tải ảnh lên");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [uploadSingleImage]
  );

  const handleDropFiles = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files?.length) {
        handleGalleryUpload(event.dataTransfer.files);
      }
    },
    [handleGalleryUpload]
  );

  const handleReorder = useCallback(
    (targetIndex: number) => {
      if (dragIndex === null || dragIndex === targetIndex) {
        setDragIndex(null);
        return;
      }

      setGalleryImages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
      setDragIndex(null);
    },
    [dragIndex]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (isEditMode && !articleId) return;

    setIsSubmitting(true);
    try {
      const imagePaths = galleryImages.map((image) => image.path).filter((path) => path && path.trim().length > 0);
      const data: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        content: content?.trim() || null,
        active: Boolean(active),
        image_paths: imagePaths,
      };

      if (isEditMode && articleId) {
        const result = await updateArticle(articleId, data);
        if (result.success) {
          toast.success(result.message || "Cập nhật bài viết thành công");
          await loadArticle();
        }
      } else {
        const result = await createArticle(data);
        if (result.success) {
          toast.success(result.message || "Tạo bài viết thành công");
          router.push("/admin/articles");
        }
      }
    } catch (error: any) {
      console.error("Failed to submit article:", error);
      if (error.status === 422 && error.payload?.errors) {
        const errors = error.payload.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(", ")}`)
          .join("\n");
        toast.error(`Lỗi validation:\n${errorMessages}`);
      } else {
        toast.error(isEditMode ? "Không thể cập nhật bài viết. Vui lòng thử lại." : "Không thể tạo bài viết. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      isLoading,
      isSubmitting,
      title,
      slug,
      content,
      active,
      showSlugEditor,
      isUploadingImage,
      galleryImages,
      imageUrlInput,
      dragIndex,
      isEditMode,
    },
    actions: {
      setTitle: handleTitleChange,
      setSlug,
      setContent,
      setActive,
      setShowSlugEditor,
      setGalleryImages,
      setImageUrlInput,
      setDragIndex,
      handleGalleryUpload,
      handleUrlUpload,
      handleReplaceFromUrl,
      handleReplaceFile,
      handleDropFiles,
      handleReorder,
      handleSubmit,
      generateSlug,
    },
  };
};
