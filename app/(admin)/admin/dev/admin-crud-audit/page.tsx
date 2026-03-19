"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { fetchAdminProducts, fetchAdminProductFilters, fetchAdminProduct } from "@/features/admin/products/api/products.api";
import { fetchAdminArticles, fetchAdminArticle } from "@/features/admin/articles/api/articles.api";
import { fetchProductFilters } from "@/lib/api/products";
import { fetchAdminSettingsLite } from "@/features/admin/settings/api/settings.api";
import { apiFetch } from "@/lib/api/client";

type AuditStatus = "idle" | "running" | "done" | "error";

type AuditStep = {
  label: string;
  durationMs: number;
  status: "ok" | "error";
  note?: string;
};

type ProductsListAudit = {
  productsMs: number | null;
  filtersMs: number | null;
  parallelMs: number | null;
  sequentialMs: number | null;
  searchRequestMs: number | null;
  searchPerceivedMs: number | null;
  paginationMs: number[];
  perPage: number;
  total: number;
  lastPage: number;
  categoriesCount: number;
  typesCount: number;
  itemsCount: number;
  hasImages: boolean;
  visibleColumns: number;
  typeWaterfallMs: number | null;
  productsAudit: BackendAudit | null;
  filtersAudit: BackendAudit | null;
  searchAudit: BackendAudit | null;
  sampleProductId: number | null;
  searchParams: Record<string, string | number>;
};

type ProductCreateAudit = {
  parallelMs: number | null;
  filtersMs: number | null;
  settingsMs: number | null;
  typeWaterfallMs: number | null;
  filtersAudit: BackendAudit | null;
  settingsAudit: BackendAudit | null;
  typesCount: number;
  categoriesCount: number;
  attributeGroups: number;
  attributeOptions: number;
  editorStrategy: "eager" | "lazy";
  hasImageTools: boolean;
  hasSeoBlock: boolean;
  hasAttributeFilters: boolean;
};

type ProductEditAudit = {
  parallelMs: number | null;
  productMs: number | null;
  filtersMs: number | null;
  settingsMs: number | null;
  dependentFiltersMs: number | null;
  totalReadyMs: number | null;
  productAudit: BackendAudit | null;
  filtersAudit: BackendAudit | null;
  settingsAudit: BackendAudit | null;
  imagesCount: number;
  editorStrategy: "eager" | "lazy";
  hasStickyBar: boolean;
  hasPreviewModal: boolean;
  typeId: number | null;
  productId: number | null;
  attributeGroups: number;
  attributeOptions: number;
};

type ArticlesListAudit = {
  listMs: number | null;
  searchRequestMs: number | null;
  searchPerceivedMs: number | null;
  paginationMs: number[];
  perPage: number;
  total: number;
  lastPage: number;
  itemsCount: number;
  hasImages: boolean;
  hasExcerpt: boolean;
  visibleColumns: number;
  listAudit: BackendAudit | null;
  searchAudit: BackendAudit | null;
  sampleArticleId: number | null;
  searchParams: Record<string, string | number>;
};

type ArticleCreateAudit = {
  baselineMs: number | null;
  editorStrategy: "eager" | "lazy";
  hasImageTools: boolean;
  hasSeoBlock: boolean;
  hasAiButton: boolean;
};

type ArticleEditAudit = {
  fetchMs: number | null;
  editorStrategy: "eager" | "lazy";
  imagesCount: number;
  hasSeoBlock: boolean;
  reloadAfterSave: boolean;
  fetchAudit: BackendAudit | null;
  articleId: number | null;
};

type CrudAuditSummary = {
  productsList: ProductsListAudit;
  productCreate: ProductCreateAudit;
  productEdit: ProductEditAudit;
  articlesList: ArticlesListAudit;
  articleCreate: ArticleCreateAudit;
  articleEdit: ArticleEditAudit;
};

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const formatMs = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return `${Math.round(value)}ms`;
};

type BackendAudit = {
  auth_ms?: number;
  query_ms?: number;
  transform_ms?: number;
  controller_ms?: number;
};

const formatAudit = (durationMs: number | null, audit?: BackendAudit | null) => {
  if (!audit) return "-";
  const roundtripGap =
    durationMs !== null && audit.controller_ms !== undefined
      ? Math.max(0, Math.round(durationMs - audit.controller_ms))
      : null;
  return [
    `auth ${formatMs(audit.auth_ms)}`,
    `query ${formatMs(audit.query_ms)}`,
    `transform ${formatMs(audit.transform_ms)}`,
    `controller ${formatMs(audit.controller_ms)}`,
    `gap ${formatMs(roundtripGap)}`,
  ].join(" | ");
};

const formatDateTime = (value: Date) => value.toISOString().replace("T", " ").slice(0, 19);

const pickMax = (candidates: Array<{ label: string; value: number | null }>) => {
  return candidates.reduce<{ label: string; value: number | null } | null>((carry, current) => {
    if (current.value === null) return carry;
    if (!carry || (carry.value ?? -1) < current.value) return current;
    return carry;
  }, null);
};

const extractAuditMeta = (payload?: { meta?: { audit?: BackendAudit } } | null) => {
  return payload?.meta?.audit ?? null;
};

export default function AdminCrudAuditPage() {
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<CrudAuditSummary | null>(null);
  const [reportText, setReportText] = useState<string>("");
  const [, setSteps] = useState<AuditStep[]>([]);

  const runStep = useCallback(async <T,>(label: string, action: () => Promise<T>) => {
    const startedAt = now();
    try {
      const result = await action();
      return { result, durationMs: now() - startedAt, status: "ok" as const, label };
    } catch (error) {
      const note = String(error);
      throw new Error(`${label}: ${note}`);
    }
  }, []);

  const buildConclusion = useCallback((data: CrudAuditSummary) => {
    const lines: string[] = [];

    const listWaterfall = data.productsList.parallelMs !== null && data.productsList.sequentialMs !== null
      ? data.productsList.sequentialMs - data.productsList.parallelMs
      : null;
    if (listWaterfall !== null) {
      lines.push(listWaterfall > 150
        ? "- Products list: sequential chậm hơn parallel đáng kể, có dấu hiệu waterfall."
        : "- Products list: chênh lệch parallel/sequential nhỏ."
      );
    }

    if (data.productsList.searchPerceivedMs !== null && data.productsList.searchRequestMs !== null) {
      const debounceGap = data.productsList.searchPerceivedMs - data.productsList.searchRequestMs;
      if (data.productsList.searchRequestMs > 1000) {
        lines.push("- Products search: request gốc đã rất chậm, debounce không phải nguyên nhân chính.");
      } else if (debounceGap > 300) {
        lines.push("- Products search: debounce chiếm đa số latency cảm nhận.");
      } else {
        lines.push("- Products search: latency chủ yếu từ request.");
      }
    }

    if (data.articlesList.searchPerceivedMs !== null && data.articlesList.searchRequestMs !== null) {
      const debounceGap = data.articlesList.searchPerceivedMs - data.articlesList.searchRequestMs;
      if (data.articlesList.searchRequestMs > 1000) {
        lines.push("- Articles search: request gốc đã rất chậm, debounce không phải nguyên nhân chính.");
      } else if (debounceGap > 300) {
        lines.push("- Articles search: debounce là phần lớn latency cảm nhận.");
      } else {
        lines.push("- Articles search: latency chủ yếu từ request.");
      }
    }

    if (data.productEdit.dependentFiltersMs !== null && data.productEdit.dependentFiltersMs > 150) {
      lines.push("- Product edit: có request phụ thuộc theo type gây kéo dài thời gian sẵn sàng.");
    }

    if (data.productCreate.editorStrategy === "eager" || data.articleCreate.editorStrategy === "eager") {
      lines.push("- Editor: có màn hình dùng editor eager, có thể tăng thời gian render initial.");
    }

    if (lines.length === 0) {
      lines.push("- Chưa đủ dữ liệu để kết luận.");
    }

    return lines;
  }, []);

  const buildReport = useCallback((data: CrudAuditSummary, stepLogs: AuditStep[]) => {
    const timeText = formatDateTime(new Date());

    const mountCandidates = pickMax([
      { label: "Products list", value: data.productsList.parallelMs ?? data.productsList.productsMs },
      { label: "Product create", value: data.productCreate.parallelMs },
      { label: "Product edit", value: data.productEdit.totalReadyMs ?? data.productEdit.parallelMs },
      { label: "Articles list", value: data.articlesList.listMs },
      { label: "Article edit", value: data.articleEdit.fetchMs },
    ]);

    const waterfallCandidates = pickMax([
      {
        label: "Products list (sequential - parallel)",
        value:
          data.productsList.parallelMs !== null && data.productsList.sequentialMs !== null
            ? data.productsList.sequentialMs - data.productsList.parallelMs
            : null,
      },
      { label: "Products list (type change)", value: data.productsList.typeWaterfallMs },
      { label: "Product edit (type filters)", value: data.productEdit.dependentFiltersMs },
    ]);

    const interactionCandidates = pickMax([
      { label: "Products search perceived", value: data.productsList.searchPerceivedMs },
      { label: "Articles search perceived", value: data.articlesList.searchPerceivedMs },
    ]);

    const lines: string[] = [
      "ADMIN CRUD AUDIT REPORT",
      `Time: ${timeText}`,
      "Route: /admin/dev/admin-crud-audit",
      "",
      "1. Scope",
      "- Products: list/create/edit",
      "- Articles: list/create/edit",
      "",
      "2. Executive Summary",
      `- Slowest mount candidate: ${mountCandidates ? `${mountCandidates.label} (${formatMs(mountCandidates.value)})` : "-"}`,
      `- Highest waterfall penalty: ${waterfallCandidates ? `${waterfallCandidates.label} (${formatMs(waterfallCandidates.value)})` : "-"}`,
      `- Slowest interaction candidate: ${interactionCandidates ? `${interactionCandidates.label} (${formatMs(interactionCandidates.value)})` : "-"}`,
      "",
      "3. Products List",
      "3.1 Observation",
      `- Products API: ${formatMs(data.productsList.productsMs)}`,
      `- Products API backend: ${formatAudit(data.productsList.productsMs, data.productsList.productsAudit)}`,
      `- Filters API: ${formatMs(data.productsList.filtersMs)}`,
      `- Filters API backend: ${formatAudit(data.productsList.filtersMs, data.productsList.filtersAudit)}`,
      `- Parallel total: ${formatMs(data.productsList.parallelMs)}`,
      `- Sequential total: ${formatMs(data.productsList.sequentialMs)}`,
      `- Type change waterfall: ${formatMs(data.productsList.typeWaterfallMs)}`,
      `- Search request: ${formatMs(data.productsList.searchRequestMs)}`,
      `- Search backend: ${formatAudit(data.productsList.searchRequestMs, data.productsList.searchAudit)}`,
      `- Search perceived (debounce 400ms): ${formatMs(data.productsList.searchPerceivedMs)}`,
      `- Pagination pages: ${data.productsList.paginationMs.map(formatMs).join(" / ") || "-"}`,
      "3.2 Raw Snapshot",
      `- per_page: ${data.productsList.perPage}`,
      `- items: ${data.productsList.itemsCount} / total ${data.productsList.total} / last_page ${data.productsList.lastPage}`,
      `- categories_count: ${data.productsList.categoriesCount}`,
      `- types_count: ${data.productsList.typesCount}`,
      `- visible_columns(default): ${data.productsList.visibleColumns}`,
      `- has_image_thumb: ${data.productsList.hasImages ? "yes" : "no"}`,
      `- sample_product_id: ${data.productsList.sampleProductId ?? "-"}`,
      `- search_params: ${JSON.stringify(data.productsList.searchParams)}`,
      "3.3 Inference",
      "- Nếu sequential > parallel đáng kể, nghi waterfall giữa filters/products.",
      "- Nếu search perceived cao hơn request nhiều, nghi debounce UX.",
      "3.4 Decision",
      "- Ưu tiên kiểm tra waterfall + debounce trước khi tối ưu UI list.",
      "",
      "4. Product Create",
      "4.1 Observation",
      `- Filters API: ${formatMs(data.productCreate.filtersMs)}`,
      `- Filters API backend: ${formatAudit(data.productCreate.filtersMs, data.productCreate.filtersAudit)}`,
      `- Settings API: ${formatMs(data.productCreate.settingsMs)}`,
      `- Settings API backend: ${formatAudit(data.productCreate.settingsMs, data.productCreate.settingsAudit)}`,
      `- Parallel total: ${formatMs(data.productCreate.parallelMs)}`,
      `- Type change waterfall: ${formatMs(data.productCreate.typeWaterfallMs)}`,
      "4.2 Raw Snapshot",
      `- types_count: ${data.productCreate.typesCount}`,
      `- categories_count: ${data.productCreate.categoriesCount}`,
      `- attribute_groups: ${data.productCreate.attributeGroups}`,
      `- attribute_options: ${data.productCreate.attributeOptions}`,
      `- editor_strategy: ${data.productCreate.editorStrategy}`,
      `- has_image_tools: ${data.productCreate.hasImageTools ? "yes" : "no"}`,
      `- has_seo_block: ${data.productCreate.hasSeoBlock ? "yes" : "no"}`,
      `- has_attribute_filters: ${data.productCreate.hasAttributeFilters ? "yes" : "no"}`,
      "4.3 Inference",
      "- Nếu create vẫn chậm dù API thấp, nghi render/editor/bundle.",
      "4.4 Decision",
      "- Ưu tiên đo editor + form complexity khi tối ưu.",
      "",
      "5. Product Edit",
      "5.1 Observation",
      `- Product API: ${formatMs(data.productEdit.productMs)}`,
      `- Product API backend: ${formatAudit(data.productEdit.productMs, data.productEdit.productAudit)}`,
      `- Filters API: ${formatMs(data.productEdit.filtersMs)}`,
      `- Filters API backend: ${formatAudit(data.productEdit.filtersMs, data.productEdit.filtersAudit)}`,
      `- Settings API: ${formatMs(data.productEdit.settingsMs)}`,
      `- Settings API backend: ${formatAudit(data.productEdit.settingsMs, data.productEdit.settingsAudit)}`,
      `- Parallel total: ${formatMs(data.productEdit.parallelMs)}`,
      `- Dependent type filters: ${formatMs(data.productEdit.dependentFiltersMs)}`,
      `- Total ready (parallel + dependent): ${formatMs(data.productEdit.totalReadyMs)}`,
      "5.2 Raw Snapshot",
      `- product_id: ${data.productEdit.productId ?? "-"}`,
      `- type_id: ${data.productEdit.typeId ?? "-"}`,
      `- images_count: ${data.productEdit.imagesCount}`,
      `- attribute_groups: ${data.productEdit.attributeGroups}`,
      `- attribute_options: ${data.productEdit.attributeOptions}`,
      `- editor_strategy: ${data.productEdit.editorStrategy}`,
      `- has_sticky_bar: ${data.productEdit.hasStickyBar ? "yes" : "no"}`,
      `- has_preview_modal: ${data.productEdit.hasPreviewModal ? "yes" : "no"}`,
      "5.3 Inference",
      "- Nếu dependent filters cao, nghi waterfall theo type.",
      "5.4 Decision",
      "- Ưu tiên tách request phụ thuộc khỏi load chính nếu cần.",
      "",
      "6. Articles List",
      "6.1 Observation",
      `- Articles API: ${formatMs(data.articlesList.listMs)}`,
      `- Articles API backend: ${formatAudit(data.articlesList.listMs, data.articlesList.listAudit)}`,
      `- Search request: ${formatMs(data.articlesList.searchRequestMs)}`,
      `- Search backend: ${formatAudit(data.articlesList.searchRequestMs, data.articlesList.searchAudit)}`,
      `- Search perceived (debounce 400ms): ${formatMs(data.articlesList.searchPerceivedMs)}`,
      `- Pagination pages: ${data.articlesList.paginationMs.map(formatMs).join(" / ") || "-"}`,
      "6.2 Raw Snapshot",
      `- per_page: ${data.articlesList.perPage}`,
      `- items: ${data.articlesList.itemsCount} / total ${data.articlesList.total} / last_page ${data.articlesList.lastPage}`,
      `- visible_columns(default): ${data.articlesList.visibleColumns}`,
      `- has_image_thumb: ${data.articlesList.hasImages ? "yes" : "no"}`,
      `- has_excerpt_column: ${data.articlesList.hasExcerpt ? "yes" : "no"}`,
      `- sample_article_id: ${data.articlesList.sampleArticleId ?? "-"}`,
      `- search_params: ${JSON.stringify(data.articlesList.searchParams)}`,
      "6.3 Inference",
      "- Nếu list thấp nhưng search perceived cao, nghi debounce UX.",
      "6.4 Decision",
      "- Ưu tiên đánh giá search UX trước khi tối ưu table.",
      "",
      "7. Article Create",
      "7.1 Observation",
      `- Baseline: ${formatMs(data.articleCreate.baselineMs)}`,
      "7.2 Raw Snapshot",
      `- editor_strategy: ${data.articleCreate.editorStrategy}`,
      `- has_image_tools: ${data.articleCreate.hasImageTools ? "yes" : "no"}`,
      `- has_seo_block: ${data.articleCreate.hasSeoBlock ? "yes" : "no"}`,
      `- has_ai_button: ${data.articleCreate.hasAiButton ? "yes" : "no"}`,
      "7.3 Inference",
      "- Create page chậm thường do render/editor hơn là API.",
      "7.4 Decision",
      "- Ưu tiên đánh giá editor bundle nếu create chậm.",
      "",
      "8. Article Edit",
      "8.1 Observation",
      `- Article API: ${formatMs(data.articleEdit.fetchMs)}`,
      `- Article API backend: ${formatAudit(data.articleEdit.fetchMs, data.articleEdit.fetchAudit)}`,
      "8.2 Raw Snapshot",
      `- article_id: ${data.articleEdit.articleId ?? "-"}`,
      `- images_count: ${data.articleEdit.imagesCount}`,
      `- editor_strategy: ${data.articleEdit.editorStrategy}`,
      `- has_seo_block: ${data.articleEdit.hasSeoBlock ? "yes" : "no"}`,
      `- reload_after_save: ${data.articleEdit.reloadAfterSave ? "yes" : "no"}`,
      "8.3 Inference",
      "- Nếu edit chậm, ưu tiên phân tách fetch + render/editor.",
      "8.4 Decision",
      "- Ưu tiên giảm editor blocking nếu cần.",
      "",
      "9. Cross-route Comparison",
      `- Slowest mount: ${mountCandidates ? mountCandidates.label : "-"}`,
      `- Highest waterfall: ${waterfallCandidates ? waterfallCandidates.label : "-"}`,
      `- Slowest interaction: ${interactionCandidates ? interactionCandidates.label : "-"}`,
      "",
      "10. Initial Conclusion",
      ...buildConclusion(data),
      "",
      "11. Root Cause Candidates",
      "- Candidate 1: Backend/API latency (evidence từ Products/Articles list timings).",
      "- Candidate 2: Waterfall request theo type hoặc sequential load.",
      "- Candidate 3: Editor/render complexity (eager editor + nhiều khối form).",
      "- Candidate 4: Image/gallery layout/priority trong form.",
      "- Counter-hypothesis: latency do debounce UX chứ không phải API.",
      "",
      "12. Pass/Fail Checklist",
      "- List pages: parallel/sequential delta giảm rõ, search perceived giảm.",
      "- Create/Edit pages: total ready < baseline cũ, editor không block render.",
      "- Waterfall: request phụ thuộc không làm kéo dài >300ms so với baseline.",
      "",
      "13. Raw Events",
      ...stepLogs.map((step) => `- ${step.label}: ${formatMs(step.durationMs)} ${step.status}${step.note ? ` (${step.note})` : ""}`),
    ];

    return lines.join("\n");
  }, [buildConclusion]);

  const runAudit = useCallback(async () => {
    setStatus("running");
    setErrorMessage(null);
    setSummary(null);
    setReportText("");
    setSteps([]);

    const fetchAdminSettingsLiteAudit = async () =>
      apiFetch<{ data: { id: number; product_shopee_link_enabled: boolean; updated_at?: string }; meta?: { audit?: BackendAudit } }>(
        "v1/admin/settings/lite?audit=1"
      );
    const fetchAdminProductAudit = async (productId: number) =>
      apiFetch<{ data: Awaited<ReturnType<typeof fetchAdminProduct>>["data"]; meta?: { audit?: BackendAudit } }>(
        `v1/admin/products/${productId}?audit=1`
      );
    const fetchAdminArticleAudit = async (articleId: number) =>
      apiFetch<{ data: Awaited<ReturnType<typeof fetchAdminArticle>>["data"]; meta?: { audit?: BackendAudit } }>(
        `v1/admin/articles/${articleId}?audit=1`
      );
    const fetchAdminProductFiltersAudit = async (typeId?: number | null) => {
      const params = new URLSearchParams();
      if (typeId) params.set("type_id", String(typeId));
      params.set("audit", "1");
      return apiFetch<{ data: { categories: Array<{ id: number; name: string; slug: string }>; types: Array<{ id: number; name: string; slug: string }> }; meta?: { audit?: BackendAudit } }>(
        `v1/admin/products/filters?${params.toString()}`
      );
    };

    const localSteps: AuditStep[] = [];
    const pushStep = (step: AuditStep) => {
      localSteps.push(step);
      setSteps([...localSteps]);
    };

    try {
      const perPage = 25;
      const productsSearchParams = { q: "vang", page: 1, per_page: perPage };
      const articlesSearchParams = { q: "vang", page: 1, per_page: perPage, sort_by: "published_at", sort_dir: "desc" };

      const productsListResult = await runStep("products list", async () => {
        return fetchAdminProducts({ page: 1, per_page: perPage, audit: 1 });
      });
      pushStep({ label: productsListResult.label, durationMs: productsListResult.durationMs, status: "ok" });

      const productsFiltersResult = await runStep("products filters", async () => {
        return fetchAdminProductFiltersAudit();
      });
      pushStep({ label: productsFiltersResult.label, durationMs: productsFiltersResult.durationMs, status: "ok" });

      const productsParallelResult = await runStep("products parallel list+filters", async () => {
        await Promise.all([
          fetchAdminProducts({ page: 1, per_page: perPage, audit: 1 }),
          fetchAdminProductFiltersAudit(),
        ]);
      });
      pushStep({ label: productsParallelResult.label, durationMs: productsParallelResult.durationMs, status: "ok" });

      const productsSequentialResult = await runStep("products sequential list->filters", async () => {
        await fetchAdminProducts({ page: 1, per_page: perPage, audit: 1 });
        await fetchAdminProductFiltersAudit();
      });
      pushStep({ label: productsSequentialResult.label, durationMs: productsSequentialResult.durationMs, status: "ok" });

      const typeIdForList = productsFiltersResult.result.data.types?.[0]?.id ?? null;
      let productsTypeWaterfallMs: number | null = null;
      if (typeIdForList) {
        const typeWaterfallResult = await runStep(`products type waterfall type=${typeIdForList}`, async () => {
          await fetchAdminProductFiltersAudit(typeIdForList);
          await fetchAdminProducts({ page: 1, per_page: perPage, type_id: typeIdForList, audit: 1 });
        });
        productsTypeWaterfallMs = typeWaterfallResult.durationMs;
        pushStep({ label: typeWaterfallResult.label, durationMs: typeWaterfallResult.durationMs, status: "ok" });
      }

      const productsSearchResult = await runStep("products search", async () => {
        return fetchAdminProducts({ ...productsSearchParams, audit: 1 });
      });
      pushStep({ label: productsSearchResult.label, durationMs: productsSearchResult.durationMs, status: "ok" });

      const productsPaginationMs: number[] = [];
      for (let page = 1; page <= 3; page += 1) {
        const pageResult = await runStep(`products page ${page}`, async () => {
          await fetchAdminProducts({ page, per_page: perPage, audit: 1 });
        });
        productsPaginationMs.push(pageResult.durationMs);
        pushStep({ label: pageResult.label, durationMs: pageResult.durationMs, status: "ok" });
      }

      const productCreateParallel = await runStep("product create parallel", async () => {
        return Promise.all([
          fetchProductFilters(),
          fetchAdminSettingsLiteAudit().catch(() => null),
        ]);
      });
      pushStep({ label: productCreateParallel.label, durationMs: productCreateParallel.durationMs, status: "ok" });

      const [productCreateFilters, productCreateSettings] = productCreateParallel.result;
      const productCreateFiltersMs = await runStep("product create filters (baseline)", async () => {
        return fetchProductFilters();
      });
      pushStep({ label: productCreateFiltersMs.label, durationMs: productCreateFiltersMs.durationMs, status: "ok" });

      const productCreateSettingsMs = await runStep("product create settings (baseline)", async () => {
        return fetchAdminSettingsLiteAudit().catch(() => null);
      });
      pushStep({ label: productCreateSettingsMs.label, durationMs: productCreateSettingsMs.durationMs, status: "ok" });

      const typeIdForCreate = productCreateFilters.types?.[0]?.id ?? null;
      let productCreateTypeWaterfallMs: number | null = null;
      if (typeIdForCreate) {
        const typeResult = await runStep(`product create type filters type=${typeIdForCreate}`, async () => {
          await fetchProductFilters(typeIdForCreate);
        });
        productCreateTypeWaterfallMs = typeResult.durationMs;
        pushStep({ label: typeResult.label, durationMs: typeResult.durationMs, status: "ok" });
      }

      const productIdForEdit = productsListResult.result.data?.[0]?.id ?? null;
      let productEditParallelMs: number | null = null;
      let productEditDependentMs: number | null = null;
      let productEditTotalReadyMs: number | null = null;
      let productEditDetail: Awaited<ReturnType<typeof fetchAdminProduct>> | null = null;
      let productEditFilters: Awaited<ReturnType<typeof fetchProductFilters>> | null = null;
      let productEditSettingsMs: number | null = null;
      let productEditProductMs: number | null = null;
      let productEditFiltersMs: number | null = null;
      let productEditSettingsAudit: BackendAudit | null = null;

      if (productIdForEdit) {
        const editParallel = await runStep("product edit parallel", async () => {
          const [productRes, filtersRes, settingsRes] = await Promise.all([
            fetchAdminProductAudit(productIdForEdit),
            fetchProductFilters(),
            fetchAdminSettingsLiteAudit().catch(() => null),
          ]);
          return { productRes, filtersRes, settingsRes };
        });
        productEditParallelMs = editParallel.durationMs;
        productEditDetail = editParallel.result.productRes;
        productEditFilters = editParallel.result.filtersRes;
        productEditSettingsAudit = extractAuditMeta(editParallel.result.settingsRes);
        pushStep({ label: editParallel.label, durationMs: editParallel.durationMs, status: "ok" });

        const editProductBaseline = await runStep("product edit product baseline", async () => {
          return fetchAdminProductAudit(productIdForEdit);
        });
        productEditProductMs = editProductBaseline.durationMs;
        pushStep({ label: editProductBaseline.label, durationMs: editProductBaseline.durationMs, status: "ok" });

        const editFiltersBaseline = await runStep("product edit filters baseline", async () => {
          return fetchProductFilters();
        });
        productEditFiltersMs = editFiltersBaseline.durationMs;
        pushStep({ label: editFiltersBaseline.label, durationMs: editFiltersBaseline.durationMs, status: "ok" });

        const editSettingsBaseline = await runStep("product edit settings baseline", async () => {
          return fetchAdminSettingsLiteAudit().catch(() => null);
        });
        productEditSettingsMs = editSettingsBaseline.durationMs;
        productEditSettingsAudit = extractAuditMeta(editSettingsBaseline.result ?? null);
        pushStep({ label: editSettingsBaseline.label, durationMs: editSettingsBaseline.durationMs, status: "ok" });

        const editTypeId = editParallel.result.productRes.data.type_id;
        if (editTypeId) {
          const dependentResult = await runStep(`product edit type filters type=${editTypeId}`, async () => {
            await fetchProductFilters(editTypeId);
          });
          productEditDependentMs = dependentResult.durationMs;
          pushStep({ label: dependentResult.label, durationMs: dependentResult.durationMs, status: "ok" });
        }

        if (productEditParallelMs !== null) {
          productEditTotalReadyMs = productEditParallelMs + (productEditDependentMs ?? 0);
        }
      } else {
        pushStep({ label: "product edit skipped: no product", durationMs: 0, status: "ok", note: "no product id" });
      }

      const articlesListResult = await runStep("articles list", async () => {
        return fetchAdminArticles({ page: 1, per_page: perPage, sort_by: "published_at", sort_dir: "desc", audit: 1 });
      });
      pushStep({ label: articlesListResult.label, durationMs: articlesListResult.durationMs, status: "ok" });

      const articlesSearchResult = await runStep("articles search", async () => {
        return fetchAdminArticles({ ...articlesSearchParams, audit: 1 });
      });
      pushStep({ label: articlesSearchResult.label, durationMs: articlesSearchResult.durationMs, status: "ok" });

      const articlesPaginationMs: number[] = [];
      for (let page = 1; page <= 3; page += 1) {
        const pageResult = await runStep(`articles page ${page}`, async () => {
          await fetchAdminArticles({ page, per_page: perPage, sort_by: "published_at", sort_dir: "desc", audit: 1 });
        });
        articlesPaginationMs.push(pageResult.durationMs);
        pushStep({ label: pageResult.label, durationMs: pageResult.durationMs, status: "ok" });
      }

      const articleIdForEdit = articlesListResult.result.data?.[0]?.id ?? null;
      let articleEditResultMs: number | null = null;
      let articleEditResult: Awaited<ReturnType<typeof fetchAdminArticle>> | null = null;
      if (articleIdForEdit) {
        const articleEditResultStep = await runStep("article edit fetch", async () => {
          return fetchAdminArticleAudit(articleIdForEdit);
        });
        articleEditResultMs = articleEditResultStep.durationMs;
        articleEditResult = articleEditResultStep.result;
        pushStep({ label: articleEditResultStep.label, durationMs: articleEditResultStep.durationMs, status: "ok" });
      } else {
        pushStep({ label: "article edit skipped: no article", durationMs: 0, status: "ok", note: "no article id" });
      }

      const productsListSummary: ProductsListAudit = {
        productsMs: productsListResult.durationMs,
        filtersMs: productsFiltersResult.durationMs,
        parallelMs: productsParallelResult.durationMs,
        sequentialMs: productsSequentialResult.durationMs,
        searchRequestMs: productsSearchResult.durationMs,
        searchPerceivedMs: productsSearchResult.durationMs + 400,
        paginationMs: productsPaginationMs,
        perPage,
        total: productsListResult.result.meta.total,
        lastPage: productsListResult.result.meta.last_page,
        categoriesCount: productsFiltersResult.result.data.categories.length,
        typesCount: productsFiltersResult.result.data.types.length,
        itemsCount: productsListResult.result.data.length,
        hasImages: productsListResult.result.data.some((item) => Boolean(item.cover_image_url)),
        visibleColumns: 8,
        typeWaterfallMs: productsTypeWaterfallMs,
        productsAudit: extractAuditMeta(productsListResult.result),
        filtersAudit: extractAuditMeta(productsFiltersResult.result),
        searchAudit: extractAuditMeta(productsSearchResult.result),
        sampleProductId: productIdForEdit,
        searchParams: productsSearchParams,
      };

      const productCreateSummary: ProductCreateAudit = {
        parallelMs: productCreateParallel.durationMs,
        filtersMs: productCreateFiltersMs.durationMs,
        settingsMs: productCreateSettingsMs.durationMs,
        typeWaterfallMs: productCreateTypeWaterfallMs,
        filtersAudit: null,
        settingsAudit: extractAuditMeta(productCreateSettings),
        typesCount: productCreateFilters.types.length,
        categoriesCount: productCreateFilters.categories.length,
        attributeGroups: productCreateFilters.attribute_filters.length,
        attributeOptions: productCreateFilters.attribute_filters.reduce((acc, group) => acc + (group.options?.length ?? 0), 0),
        editorStrategy: "eager",
        hasImageTools: true,
        hasSeoBlock: true,
        hasAttributeFilters: productCreateFilters.attribute_filters.length > 0,
      };

      const productEditSummary: ProductEditAudit = {
        parallelMs: productEditParallelMs,
        productMs: productEditProductMs,
        filtersMs: productEditFiltersMs,
        settingsMs: productEditSettingsMs,
        dependentFiltersMs: productEditDependentMs,
        totalReadyMs: productEditTotalReadyMs,
        productAudit: extractAuditMeta(productEditDetail),
        filtersAudit: null,
        settingsAudit: productEditSettingsAudit,
        imagesCount: productEditDetail?.data.images?.length ?? 0,
        editorStrategy: "lazy",
        hasStickyBar: true,
        hasPreviewModal: true,
        typeId: productEditDetail?.data.type_id ?? null,
        productId: productIdForEdit,
        attributeGroups: productEditFilters?.attribute_filters.length ?? 0,
        attributeOptions: productEditFilters?.attribute_filters.reduce((acc, group) => acc + (group.options?.length ?? 0), 0) ?? 0,
      };

      const articlesListSummary: ArticlesListAudit = {
        listMs: articlesListResult.durationMs,
        searchRequestMs: articlesSearchResult.durationMs,
        searchPerceivedMs: articlesSearchResult.durationMs + 400,
        paginationMs: articlesPaginationMs,
        perPage,
        total: articlesListResult.result.meta.total,
        lastPage: articlesListResult.result.meta.last_page,
        itemsCount: articlesListResult.result.data.length,
        hasImages: articlesListResult.result.data.some((item) => Boolean(item.cover_image_url)),
        hasExcerpt: true,
        visibleColumns: 4,
        listAudit: extractAuditMeta(articlesListResult.result),
        searchAudit: extractAuditMeta(articlesSearchResult.result),
        sampleArticleId: articleIdForEdit,
        searchParams: articlesSearchParams,
      };

      const articleCreateSummary: ArticleCreateAudit = {
        baselineMs: null,
        editorStrategy: "eager",
        hasImageTools: true,
        hasSeoBlock: true,
        hasAiButton: true,
      };

      const articleEditSummary: ArticleEditAudit = {
        fetchMs: articleEditResultMs,
        editorStrategy: "eager",
        imagesCount: articleEditResult?.data.images?.length ?? 0,
        hasSeoBlock: true,
        reloadAfterSave: true,
        fetchAudit: extractAuditMeta(articleEditResult),
        articleId: articleIdForEdit,
      };

      const finalSummary: CrudAuditSummary = {
        productsList: productsListSummary,
        productCreate: productCreateSummary,
        productEdit: productEditSummary,
        articlesList: articlesListSummary,
        articleCreate: articleCreateSummary,
        articleEdit: articleEditSummary,
      };

      setSummary(finalSummary);
      setReportText(buildReport(finalSummary, localSteps));
      setStatus("done");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setErrorMessage(message);
      pushStep({ label: "audit failed", durationMs: 0, status: "error", note: message });
    }
  }, [buildReport, runStep]);

  useEffect(() => {
    if (status === "idle") {
      void runAudit();
    }
  }, [runAudit, status]);

  const handleCopy = useCallback(async () => {
    if (!reportText) return;
    await navigator.clipboard.writeText(reportText);
  }, [reportText]);

  const statusText = useMemo(() => {
    if (status === "running") return "Đang chạy admin CRUD audit...";
    if (status === "done") return "Đã xong.";
    if (status === "error") return "Có lỗi khi chạy audit.";
    return "Chuẩn bị chạy...";
  }, [status]);

  if (process.env.NODE_ENV === "production") {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Trang audit chỉ dùng cho môi trường dev.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin CRUD Audit Report</h1>
          <p className="text-sm text-slate-500">Tự chạy audit hiệu năng products/articles và tạo báo cáo copy được.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} disabled={!reportText}>Copy report</Button>
          <Button onClick={runAudit} disabled={status === "running"} variant="outline">Chạy lại</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>{statusText}</p>
          {errorMessage && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600">
          <p>Products list: {formatMs(summary?.productsList.parallelMs ?? summary?.productsList.productsMs)}</p>
          <p>Product create: {formatMs(summary?.productCreate.parallelMs)}</p>
          <p>Product edit ready: {formatMs(summary?.productEdit.totalReadyMs ?? summary?.productEdit.parallelMs)}</p>
          <p>Articles list: {formatMs(summary?.articlesList.listMs)}</p>
          <p>Article edit: {formatMs(summary?.articleEdit.fetchMs)}</p>
          <p>Products search perceived: {formatMs(summary?.productsList.searchPerceivedMs)}</p>
          <p>Articles search perceived: {formatMs(summary?.articlesList.searchPerceivedMs)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={reportText}
            readOnly
            className="min-h-[360px] w-full rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
          />
        </CardContent>
      </Card>
    </div>
  );
}
