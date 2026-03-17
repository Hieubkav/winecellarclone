"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { fetchProductFilters, fetchProductList, type ProductFiltersPayload, type ProductListResponse } from "@/lib/api/products";

type LogItem = {
  id: string;
  label: string;
  durationMs: number;
  status: "ok" | "error";
  note?: string;
  startedAt: number;
};

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const formatMs = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return `${Math.round(value)} ms`;
};

export default function FilterAuditPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filtersPayload, setFiltersPayload] = useState<ProductFiltersPayload | null>(null);
  const [productsPayload, setProductsPayload] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [filtersMs, setFiltersMs] = useState<number | null>(null);
  const [productsMs, setProductsMs] = useState<number | null>(null);
  const [parallelMs, setParallelMs] = useState<number | null>(null);
  const [sequentialMs, setSequentialMs] = useState<number | null>(null);
  const [typeWaterfallMs, setTypeWaterfallMs] = useState<number | null>(null);

  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"double" | "single">("double");
  const [searchMetrics, setSearchMetrics] = useState<{
    inputAt: number | null;
    debounceAt: number | null;
    requestStartAt: number | null;
    requestEndAt: number | null;
  }>({
    inputAt: null,
    debounceAt: null,
    requestStartAt: null,
    requestEndAt: null,
  });

  const searchTimer = useRef<number | null>(null);
  const searchTimer2 = useRef<number | null>(null);

  const [loadPage, setLoadPage] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadMoreMs, setLoadMoreMs] = useState<number | null>(null);

  const logEvent = useCallback((item: Omit<LogItem, "id">) => {
    setLogs((prev) => [
      {
        ...item,
        id: `${item.label}-${item.startedAt}`,
      },
      ...prev,
    ].slice(0, 50));
  }, []);

  const runFiltersFetch = useCallback(async () => {
    const startedAt = now();
    setLoading(true);
    try {
      const data = await fetchProductFilters();
      const duration = now() - startedAt;
      setFiltersPayload(data);
      setFiltersMs(duration);
      logEvent({ label: "fetch filters default", durationMs: duration, status: "ok", startedAt });
    } catch (error) {
      const duration = now() - startedAt;
      logEvent({ label: "fetch filters default", durationMs: duration, status: "error", note: String(error), startedAt });
    } finally {
      setLoading(false);
    }
  }, [logEvent]);

  const runProductsFetch = useCallback(async () => {
    const startedAt = now();
    setLoading(true);
    try {
      const data = await fetchProductList({ page: 1, per_page: 24, sort: "name" });
      const duration = now() - startedAt;
      setProductsPayload(data);
      setProductsMs(duration);
      logEvent({ label: "fetch products default", durationMs: duration, status: "ok", startedAt });
    } catch (error) {
      const duration = now() - startedAt;
      logEvent({ label: "fetch products default", durationMs: duration, status: "error", note: String(error), startedAt });
    } finally {
      setLoading(false);
    }
  }, [logEvent]);

  const runParallel = useCallback(async () => {
    const startedAt = now();
    setLoading(true);
    try {
      const [filters, products] = await Promise.all([
        fetchProductFilters(),
        fetchProductList({ page: 1, per_page: 24, sort: "name" }),
      ]);
      const duration = now() - startedAt;
      setFiltersPayload(filters);
      setProductsPayload(products);
      setParallelMs(duration);
      logEvent({ label: "parallel filters+products", durationMs: duration, status: "ok", startedAt });
    } catch (error) {
      const duration = now() - startedAt;
      logEvent({ label: "parallel filters+products", durationMs: duration, status: "error", note: String(error), startedAt });
    } finally {
      setLoading(false);
    }
  }, [logEvent]);

  const runSequential = useCallback(async () => {
    const startedAt = now();
    setLoading(true);
    try {
      const filters = await fetchProductFilters();
      const products = await fetchProductList({ page: 1, per_page: 24, sort: "name" });
      const duration = now() - startedAt;
      setFiltersPayload(filters);
      setProductsPayload(products);
      setSequentialMs(duration);
      logEvent({ label: "sequential filters->products", durationMs: duration, status: "ok", startedAt });
    } catch (error) {
      const duration = now() - startedAt;
      logEvent({ label: "sequential filters->products", durationMs: duration, status: "error", note: String(error), startedAt });
    } finally {
      setLoading(false);
    }
  }, [logEvent]);

  const runTypeWaterfall = useCallback(async () => {
    if (!selectedTypeId) {
      return;
    }
    const startedAt = now();
    setLoading(true);
    try {
      await fetchProductFilters(selectedTypeId);
      await fetchProductList({ page: 1, per_page: 24, sort: "name", "type[]": [selectedTypeId] });
      const duration = now() - startedAt;
      setTypeWaterfallMs(duration);
      logEvent({ label: `type waterfall type=${selectedTypeId}`, durationMs: duration, status: "ok", startedAt });
    } catch (error) {
      const duration = now() - startedAt;
      logEvent({ label: `type waterfall type=${selectedTypeId}`, durationMs: duration, status: "error", note: String(error), startedAt });
    } finally {
      setLoading(false);
    }
  }, [logEvent, selectedTypeId]);

  const runSearchRequest = useCallback(async (term: string, inputAt: number, debounceAt: number) => {
    const requestStartAt = now();
    setSearchMetrics((prev) => ({
      ...prev,
      inputAt,
      debounceAt,
      requestStartAt,
    }));
    try {
      await fetchProductList({ page: 1, per_page: 24, sort: "name", q: term });
      const requestEndAt = now();
      setSearchMetrics((prev) => ({
        ...prev,
        requestEndAt,
      }));
      logEvent({
        label: `search ${term || "(empty)"}`,
        durationMs: requestEndAt - requestStartAt,
        status: "ok",
        note: `mode=${searchMode}`,
        startedAt: requestStartAt,
      });
    } catch (error) {
      const requestEndAt = now();
      setSearchMetrics((prev) => ({
        ...prev,
        requestEndAt,
      }));
      logEvent({
        label: `search ${term || "(empty)"}`,
        durationMs: requestEndAt - requestStartAt,
        status: "error",
        note: String(error),
        startedAt: requestStartAt,
      });
    }
  }, [logEvent, searchMode]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    const inputAt = now();

    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
    if (searchTimer2.current) {
      window.clearTimeout(searchTimer2.current);
    }

    if (searchMode === "double") {
      searchTimer.current = window.setTimeout(() => {
        const debounceAt = now();
        searchTimer2.current = window.setTimeout(() => {
          void runSearchRequest(value, inputAt, debounceAt);
        }, 400);
      }, 300);
    } else {
      searchTimer.current = window.setTimeout(() => {
        const debounceAt = now();
        void runSearchRequest(value, inputAt, debounceAt);
      }, 300);
    }
  }, [runSearchRequest, searchMode]);

  const loadPageData = useCallback(async (page: number) => {
    const startedAt = now();
    setLoading(true);
    try {
      const response = await fetchProductList({ page, per_page: 24, sort: "name" });
      const duration = now() - startedAt;
      setLoadMoreMs(duration);
      setLoadPage(page);
      setLoadedCount((prev) => prev + response.data.length);
      logEvent({ label: `load page ${page}`, durationMs: duration, status: "ok", startedAt });
    } catch (error) {
      const duration = now() - startedAt;
      logEvent({ label: `load page ${page}`, durationMs: duration, status: "error", note: String(error), startedAt });
    } finally {
      setLoading(false);
    }
  }, [logEvent]);

  useEffect(() => {
    if (!filtersPayload && !loading) {
      void runFiltersFetch();
    }
  }, [filtersPayload, loading, runFiltersFetch]);

  useEffect(() => {
    if (filtersPayload?.types?.length && !selectedTypeId) {
      setSelectedTypeId(filtersPayload.types[0]?.id ?? null);
    }
  }, [filtersPayload, selectedTypeId]);

  const summary = useMemo(() => {
    return {
      filterGroups: filtersPayload?.attribute_filters?.length ?? 0,
      categories: filtersPayload?.categories?.length ?? 0,
      types: filtersPayload?.types?.length ?? 0,
      products: productsPayload?.data?.length ?? 0,
      total: productsPayload?.meta?.total ?? 0,
    };
  }, [filtersPayload, productsPayload]);

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
          <h1 className="text-2xl font-bold text-slate-900">Filter Audit</h1>
          <p className="text-sm text-slate-500">Đo API, search latency và load more của /filter.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={runParallel} disabled={loading}>Parallel</Button>
          <Button onClick={runSequential} disabled={loading} variant="outline">Sequential</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters API</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMs(filtersMs)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Products API</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMs(productsMs)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Parallel total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMs(parallelMs)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sequential total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMs(sequentialMs)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Type waterfall</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMs(typeWaterfallMs)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Load more</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMs(loadMoreMs)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Baseline fetch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={runFiltersFetch} disabled={loading}>Fetch filters</Button>
          <Button onClick={runProductsFetch} disabled={loading} variant="outline">Fetch products</Button>
          <div className="text-xs text-slate-500">
            Filters: {summary.filterGroups} groups / {summary.categories} categories / {summary.types} types
            <br />
            Products: {summary.products} items / total {summary.total}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Type waterfall test</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <select
            className="h-9 rounded border border-slate-200 bg-white px-2 text-sm"
            value={selectedTypeId ?? ""}
            onChange={(event) => setSelectedTypeId(event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">Chọn type</option>
            {filtersPayload?.types?.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <Button onClick={runTypeWaterfall} disabled={!selectedTypeId || loading}>Run waterfall</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Search latency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="h-9 w-full max-w-sm rounded border border-slate-200 px-3 text-sm"
              placeholder="Gõ từ khóa..."
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
            <select
              className="h-9 rounded border border-slate-200 bg-white px-2 text-sm"
              value={searchMode}
              onChange={(event) => setSearchMode(event.target.value as "double" | "single")}
            >
              <option value="double">Double debounce</option>
              <option value="single">Single debounce</option>
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Input: {formatMs(searchMetrics.inputAt ? searchMetrics.debounceAt! - searchMetrics.inputAt : null)}
            | Debounce: {formatMs(searchMetrics.debounceAt && searchMetrics.requestStartAt ? searchMetrics.requestStartAt - searchMetrics.debounceAt : null)}
            | API: {formatMs(searchMetrics.requestStartAt && searchMetrics.requestEndAt ? searchMetrics.requestEndAt - searchMetrics.requestStartAt : null)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Load more test</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button onClick={() => { setLoadedCount(0); void loadPageData(1); }} disabled={loading}>Load page 1</Button>
          <Button onClick={() => void loadPageData(loadPage + 1)} disabled={loading || loadPage === 0} variant="outline">
            Load next page
          </Button>
          <Button
            onClick={async () => {
              for (let i = 1; i <= 5; i += 1) {
                await loadPageData(i);
              }
            }}
            disabled={loading}
            variant="ghost"
          >
            Load 5 pages
          </Button>
          <div className="text-xs text-slate-500">Loaded items: {loadedCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event logs (latest 50)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {logs.length === 0 && <p className="text-slate-500">Chưa có log.</p>}
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center gap-2 rounded border border-slate-100 px-2 py-1">
              <span className="font-medium text-slate-700">{log.label}</span>
              <span className={log.status === "ok" ? "text-emerald-600" : "text-red-600"}>{log.status}</span>
              <span className="text-slate-500">{formatMs(log.durationMs)}</span>
              {log.note && <span className="text-slate-400">{log.note}</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
