"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { fetchProductFilters, fetchProductList } from "@/lib/api/products";

type AuditStep = {
  label: string;
  durationMs: number;
  status: "ok" | "error";
  note?: string;
};

type AuditSummary = {
  filtersMs: number | null;
  productsMs: number | null;
  parallelMs: number | null;
  sequentialMs: number | null;
  typeWaterfallMs: number | null;
  loadMoreAvgMs: number | null;
  filterGroups: number;
  categories: number;
  types: number;
  products: number;
  total: number;
  typeId?: number | null;
  typeName?: string | null;
  searchSimulatedMs: number | null;
  searchRequestMs: number | null;
};

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const formatMs = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return `${Math.round(value)}ms`;
};

const formatDateTime = (value: Date) => {
  return value.toISOString().replace("T", " ").slice(0, 19);
};

export default function FilterAuditPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [steps, setSteps] = useState<AuditStep[]>([]);
  const [reportText, setReportText] = useState<string>("");
  const reportRef = useRef<HTMLTextAreaElement | null>(null);

  const runStep = useCallback(async (label: string, action: () => Promise<void>) => {
    const startedAt = now();
    try {
      await action();
      const durationMs = now() - startedAt;
      return { durationMs, status: "ok" as const, label };
    } catch (error) {
      const durationMs = now() - startedAt;
      const note = String(error);
      throw new Error(`${label}: ${note}`);
    }
  }, []);

  const buildConclusion = useCallback((data: AuditSummary) => {
    const lines: string[] = [];
    if (data.parallelMs !== null && data.sequentialMs !== null) {
      const delta = data.sequentialMs - data.parallelMs;
      if (delta > 100) {
        lines.push("- Waterfall: sequential chậm hơn parallel đáng kể.");
      } else {
        lines.push("- Waterfall: chênh lệch sequential/parallel nhỏ.");
      }
    }

    if (data.searchSimulatedMs !== null && data.searchRequestMs !== null) {
      if (data.searchSimulatedMs - data.searchRequestMs > 300) {
        lines.push("- Search: phần debounce chiếm đa số latency.");
      } else {
        lines.push("- Search: latency chủ yếu ở request.");
      }
    }

    if (data.typeWaterfallMs !== null && data.parallelMs !== null && data.typeWaterfallMs > data.parallelMs) {
      lines.push("- Type change: có dấu hiệu waterfall khi đổi type.");
    }

    if (data.filtersMs !== null && data.productsMs !== null) {
      const faster = data.filtersMs < data.productsMs ? "filters" : "products";
      lines.push(`- Backend: ${faster} API nhanh hơn trong lần đo này.`);
    }

    if (lines.length === 0) {
      lines.push("- Chưa đủ dữ liệu để kết luận.");
    }

    return lines;
  }, []);

  const buildReport = useCallback((data: AuditSummary, stepLogs: AuditStep[]) => {
    const timeText = formatDateTime(new Date());
    const lines: string[] = [
      "FILTER AUDIT REPORT",
      `Time: ${timeText}`,
      "Route: /admin/dev/filter-audit",
      "",
      "1. Baseline",
      `- Filters API: ${formatMs(data.filtersMs)}`,
      `- Products API: ${formatMs(data.productsMs)}`,
      `- Filter groups: ${data.filterGroups}`,
      `- Categories: ${data.categories}`,
      `- Types: ${data.types}`,
      `- First page items: ${data.products} / total ${data.total}`,
      "",
      "2. Parallel vs Sequential",
      `- Parallel: ${formatMs(data.parallelMs)}`,
      `- Sequential: ${formatMs(data.sequentialMs)}`,
      data.parallelMs !== null && data.sequentialMs !== null
        ? `- Delta: ${formatMs(data.sequentialMs - data.parallelMs)}`
        : "- Delta: -",
      "",
      "3. Type Waterfall",
      `- Type tested: ${data.typeId ?? "-"} ${data.typeName ? `(${data.typeName})` : ""}`,
      `- Total waterfall: ${formatMs(data.typeWaterfallMs)}`,
      "",
      "4. Search Latency Simulation",
      `- Simulated debounce: ${formatMs(data.searchSimulatedMs)}`,
      `- Search request: ${formatMs(data.searchRequestMs)}`,
      data.searchSimulatedMs !== null && data.searchRequestMs !== null
        ? `- Total perceived: ${formatMs(data.searchSimulatedMs)}`
        : "- Total perceived: -",
      "",
      "5. Load More",
      `- Average: ${formatMs(data.loadMoreAvgMs)}`,
      `- Total rendered items in audit: ${data.products + 48}`,
      "",
      "6. Initial Conclusion",
      ...buildConclusion(data),
      "",
      "7. Raw Events",
      ...stepLogs.map((step) => `- ${step.label}: ${formatMs(step.durationMs)} ${step.status}${step.note ? ` (${step.note})` : ""}`),
    ];

    return lines.join("\n");
  }, [buildConclusion]);

  const runAudit = useCallback(async () => {
    setStatus("running");
    setErrorMessage(null);
    setSteps([]);
    setReportText("");

    const localSteps: AuditStep[] = [];
    const pushStep = (step: AuditStep) => {
      localSteps.push(step);
      setSteps([...localSteps]);
    };

    try {
      let filtersPayload = null;
      let productsPayload = null;
      let parallelMs: number | null = null;
      let sequentialMs: number | null = null;
      let typeWaterfallMs: number | null = null;

      const filtersResult = await runStep("fetch filters default", async () => {
        filtersPayload = await fetchProductFilters();
      });
      pushStep({ label: "fetch filters default", durationMs: filtersResult.durationMs, status: "ok" });

      const productsResult = await runStep("fetch products default", async () => {
        productsPayload = await fetchProductList({ page: 1, per_page: 24, sort: "name" });
      });
      pushStep({ label: "fetch products default", durationMs: productsResult.durationMs, status: "ok" });

      const parallelResult = await runStep("parallel filters+products", async () => {
        await Promise.all([
          fetchProductFilters(),
          fetchProductList({ page: 1, per_page: 24, sort: "name" }),
        ]);
      });
      parallelMs = parallelResult.durationMs;
      pushStep({ label: "parallel filters+products", durationMs: parallelResult.durationMs, status: "ok" });

      const sequentialResult = await runStep("sequential filters->products", async () => {
        await fetchProductFilters();
        await fetchProductList({ page: 1, per_page: 24, sort: "name" });
      });
      sequentialMs = sequentialResult.durationMs;
      pushStep({ label: "sequential filters->products", durationMs: sequentialResult.durationMs, status: "ok" });

      const firstType = filtersPayload?.types?.[0] ?? null;
      if (firstType) {
        const typeResult = await runStep(`type waterfall type=${firstType.id}`, async () => {
          await fetchProductFilters(firstType.id);
          await fetchProductList({ page: 1, per_page: 24, sort: "name", "type[]": [firstType.id] });
        });
        typeWaterfallMs = typeResult.durationMs;
        pushStep({ label: `type waterfall type=${firstType.id}`, durationMs: typeResult.durationMs, status: "ok" });
      }

      const debounceDelay = 700;
      const searchRequest = await runStep("search simulation", async () => {
        await fetchProductList({ page: 1, per_page: 24, sort: "name", q: "vang" });
      });
      const searchSimulatedMs = debounceDelay + searchRequest.durationMs;
      pushStep({ label: "search simulation", durationMs: searchRequest.durationMs, status: "ok" });

      const loadTimes: number[] = [];
      for (let page = 1; page <= 3; page += 1) {
        const loadResult = await runStep(`load page ${page}`, async () => {
          await fetchProductList({ page, per_page: 24, sort: "name" });
        });
        loadTimes.push(loadResult.durationMs);
        pushStep({ label: `load page ${page}`, durationMs: loadResult.durationMs, status: "ok" });
      }

      const loadMoreAvgMs = loadTimes.length > 0
        ? loadTimes.reduce((acc, val) => acc + val, 0) / loadTimes.length
        : null;

      const finalSummary: AuditSummary = {
        filtersMs: filtersResult.durationMs,
        productsMs: productsResult.durationMs,
        parallelMs,
        sequentialMs,
        typeWaterfallMs,
        loadMoreAvgMs,
        filterGroups: filtersPayload?.attribute_filters?.length ?? 0,
        categories: filtersPayload?.categories?.length ?? 0,
        types: filtersPayload?.types?.length ?? 0,
        products: productsPayload?.data?.length ?? 0,
        total: productsPayload?.meta?.total ?? 0,
        typeId: firstType?.id ?? null,
        typeName: firstType?.name ?? null,
        searchSimulatedMs,
        searchRequestMs: searchRequest.durationMs,
      };

      setSummary(finalSummary);
      setStatus("done");
      setReportText(buildReport(finalSummary, localSteps));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setErrorMessage(message);
      pushStep({
        label: "audit failed",
        durationMs: 0,
        status: "error",
        note: message,
      });
    }
  }, [buildReport, runStep]);

  useEffect(() => {
    if (status === "idle") {
      void runAudit();
    }
  }, [runAudit, status]);

  const handleCopy = useCallback(async () => {
    if (!reportText) {
      return;
    }
    await navigator.clipboard.writeText(reportText);
  }, [reportText]);

  const statusText = useMemo(() => {
    if (status === "running") {
      return "Đang chạy audit...";
    }
    if (status === "done") {
      return "Đã xong.";
    }
    if (status === "error") {
      return "Có lỗi khi chạy audit.";
    }
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
          <h1 className="text-2xl font-bold text-slate-900">Filter Audit Report</h1>
          <p className="text-sm text-slate-500">Tự chạy audit hiệu năng /filter và tạo báo cáo copy được.</p>
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
          <p>Filters API: {formatMs(summary?.filtersMs)}</p>
          <p>Products API: {formatMs(summary?.productsMs)}</p>
          <p>Parallel total: {formatMs(summary?.parallelMs)}</p>
          <p>Sequential total: {formatMs(summary?.sequentialMs)}</p>
          <p>Type waterfall: {formatMs(summary?.typeWaterfallMs)}</p>
          <p>Load more avg: {formatMs(summary?.loadMoreAvgMs)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            ref={reportRef}
            value={reportText}
            readOnly
            className="min-h-[360px] w-full rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
          />
        </CardContent>
      </Card>
    </div>
  );
}
