"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { fetchHomeComponents, fetchHomeComponentsWithMeta, fetchSpeedDialComponent, fetchSpeedDialComponentWithMeta, type HomeComponentAuditEntry } from "@/lib/api/home";
import { fetchMenus, fetchMenusWithMeta } from "@/lib/api/menus";
import { fetchSettings, fetchSettingsWithMeta, type SettingsAuditMeta } from "@/lib/api/settings";
import { fetchSocialLinks, fetchSocialLinksWithMeta } from "@/lib/api/socialLinks";

type AuditStep = {
  label: string;
  durationMs: number;
  status: "ok" | "error";
  note?: string;
};

type EndpointTiming = {
  serverMs: number | null;
  roundtripGapMs: number | null;
  cacheHit?: boolean | null;
};

type HomeAuditSummary = {
  settingsMs: number | null;
  settingsAuditRequestMs: number | null;
  settingsAudit: SettingsAuditMeta | null;
  settingsTiming: EndpointTiming;
  menusMs: number | null;
  menusTiming: EndpointTiming;
  speedDialMs: number | null;
  speedDialTiming: EndpointTiming;
  socialLinksMs: number | null;
  socialLinksTiming: EndpointTiming;
  homeComponentsMs: number | null;
  homeComponentsTiming: EndpointTiming;
  homeComponentsAuditRequestMs: number | null;
  homeComponentsAuditServerMs: number | null;
  homeComponentsAuditRoundtripGapMs: number | null;
  layoutParallelMs: number | null;
  fullParallelMs: number | null;
  fullSequentialMs: number | null;
  componentCount: number;
  componentTypes: string[];
  speedDialItemCount: number;
  menuCount: number;
  socialLinkCount: number;
  homeComponentsAuditTotalMs: number | null;
  slowestHomeComponent: HomeComponentAuditEntry | null;
  homeComponentBreakdown: HomeComponentAuditEntry[];
};

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const formatMs = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return `${Math.round(value)}ms`;
};

const formatDateTime = (value: Date) => value.toISOString().replace("T", " ").slice(0, 19);

const buildEndpointTiming = (clientMs: number | null, serverMs: number | null, cacheHit?: boolean | null): EndpointTiming => ({
  serverMs,
  roundtripGapMs:
    clientMs === null || serverMs === null
      ? null
      : Math.max(0, Number((clientMs - serverMs).toFixed(2))),
  cacheHit: cacheHit ?? null,
});

export default function HomeAuditPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<HomeAuditSummary | null>(null);
  const [reportText, setReportText] = useState("");
  const [steps, setSteps] = useState<AuditStep[]>([]);

  const runStep = useCallback(async <T,>(label: string, action: () => Promise<T>) => {
    const startedAt = now();
    try {
      const value = await action();
      return {
        value,
        step: {
          label,
          durationMs: now() - startedAt,
          status: "ok" as const,
        },
      };
    } catch (error) {
      throw {
        step: {
          label,
          durationMs: now() - startedAt,
          status: "error" as const,
          note: String(error),
        },
      };
    }
  }, []);

  const buildConclusion = useCallback((data: HomeAuditSummary) => {
    const lines: string[] = [];

    const apiPairs = [
      ["settings", data.settingsMs],
      ["menus", data.menusMs],
      ["speed dial", data.speedDialMs],
      ["social links", data.socialLinksMs],
      ["home components (cached)", data.homeComponentsMs],
    ] as const;

    const slowest = apiPairs.reduce<(typeof apiPairs)[number] | null>((carry, current) => {
      if (current[1] === null) return carry;
      if (!carry || (carry[1] ?? -1) < current[1]) return current;
      return carry;
    }, null);

    if (slowest && slowest[1] !== null) {
      lines.push(`- API chậm nhất trong lần đo này: ${slowest[0]} (${formatMs(slowest[1])}).`);
    }

    if (data.fullParallelMs !== null && data.fullSequentialMs !== null) {
      const delta = data.fullSequentialMs - data.fullParallelMs;
      if (delta > 150) {
        lines.push("- Layout/page homepage hưởng lợi rõ khi fetch song song.");
      } else {
        lines.push("- Chênh lệch parallel/sequential nhỏ, bottleneck nằm ở API chậm nhất.");
      }
    }

    if (data.homeComponentsMs !== null && data.homeComponentsMs > 1000) {
      lines.push("- Home components cached baseline vẫn đáng theo dõi nếu homepage còn cảm giác chậm.");
    }

    if (data.homeComponentsAuditTotalMs !== null && data.homeComponentsAuditTotalMs < 100) {
      lines.push("- Transformer home components hiện rất nhẹ; độ trễ chủ yếu không nằm ở bước transform.");
    }

    if (lines.length === 0) {
      lines.push("- Chưa đủ dữ liệu để kết luận.");
    }

    return lines;
  }, []);

  const buildReport = useCallback((data: HomeAuditSummary, stepLogs: AuditStep[]) => {
    const lines = [
      "HOME AUDIT REPORT",
      `Time: ${formatDateTime(new Date())}`,
      "Route: /admin/dev/home-audit",
      "",
      "1. Baseline APIs",
      `- Settings API: ${formatMs(data.settingsMs)}`,
      `- Menus API: ${formatMs(data.menusMs)}`,
      `- Speed dial API: ${formatMs(data.speedDialMs)}`,
      `- Social links API: ${formatMs(data.socialLinksMs)}`,
      `- Home components API (cached baseline): ${formatMs(data.homeComponentsMs)}`,
      `- Home components API (audit uncached): ${formatMs(data.homeComponentsAuditRequestMs)}`,
      "",
      "2. Settings Audit",
      `- Settings API (audit uncached): ${formatMs(data.settingsAuditRequestMs)}`,
      `- Cache driver: ${data.settingsAudit?.cache_driver ?? "-"}`,
      `- Cache hit: ${data.settingsAudit ? (data.settingsAudit.cache_hit ? "yes" : "no") : "-"}`,
      `- Cache read: ${formatMs(data.settingsAudit?.cache_read_ms ?? null)}`,
      `- DB query: ${formatMs(data.settingsAudit?.query_ms ?? null)}`,
      `- Serialize: ${formatMs(data.settingsAudit?.serialize_ms ?? null)}`,
      `- Server time: ${formatMs(data.settingsTiming.serverMs)}`,
      `- Roundtrip gap: ${formatMs(data.settingsTiming.roundtripGapMs)}`,
      "",
      "3. Server vs Roundtrip Snapshot",
      `- Menus: client ${formatMs(data.menusMs)} / server ${formatMs(data.menusTiming.serverMs)} / gap ${formatMs(data.menusTiming.roundtripGapMs)} / cache ${data.menusTiming.cacheHit === null || data.menusTiming.cacheHit === undefined ? "-" : data.menusTiming.cacheHit ? "hit" : "miss"}`,
      `- Speed dial: client ${formatMs(data.speedDialMs)} / server ${formatMs(data.speedDialTiming.serverMs)} / gap ${formatMs(data.speedDialTiming.roundtripGapMs)} / cache ${data.speedDialTiming.cacheHit === null || data.speedDialTiming.cacheHit === undefined ? "-" : data.speedDialTiming.cacheHit ? "hit" : "miss"}`,
      `- Social links: client ${formatMs(data.socialLinksMs)} / server ${formatMs(data.socialLinksTiming.serverMs)} / gap ${formatMs(data.socialLinksTiming.roundtripGapMs)} / cache ${data.socialLinksTiming.cacheHit === null || data.socialLinksTiming.cacheHit === undefined ? "-" : data.socialLinksTiming.cacheHit ? "hit" : "miss"}`,
      `- Home components cached: client ${formatMs(data.homeComponentsMs)} / server ${formatMs(data.homeComponentsTiming.serverMs)} / gap ${formatMs(data.homeComponentsTiming.roundtripGapMs)} / cache ${data.homeComponentsTiming.cacheHit === null || data.homeComponentsTiming.cacheHit === undefined ? "-" : data.homeComponentsTiming.cacheHit ? "hit" : "miss"}`,
      `- Home components audit: client ${formatMs(data.homeComponentsAuditRequestMs)} / server ${formatMs(data.homeComponentsAuditServerMs)} / gap ${formatMs(data.homeComponentsAuditRoundtripGapMs)}`,
      "",
      "4. Homepage Data Summary",
      `- Home components: ${data.componentCount}`,
      `- Component types: ${data.componentTypes.join(", ") || "-"}`,
      `- Menus: ${data.menuCount}`,
      `- Social links: ${data.socialLinkCount}`,
      `- Speed dial items: ${data.speedDialItemCount}`,
      "",
      "5. Home Components Audit",
      `- Home components transform total: ${formatMs(data.homeComponentsAuditTotalMs)}`,
      data.slowestHomeComponent
        ? `- Slowest component: ${data.slowestHomeComponent.type}#${data.slowestHomeComponent.component_id} (${formatMs(data.slowestHomeComponent.duration_ms)})`
        : "- Slowest component: -",
      ...data.homeComponentBreakdown.map((item) => `- ${item.type}#${item.component_id}: ${formatMs(item.duration_ms)}${item.transformed ? " ok" : " skipped"}`),
      "",
      "6. Parallel vs Sequential",
      `- Layout parallel (settings + menus + speed dial + social links): ${formatMs(data.layoutParallelMs)}`,
      `- Full parallel (layout + home components): ${formatMs(data.fullParallelMs)}`,
      `- Full sequential: ${formatMs(data.fullSequentialMs)}`,
      data.fullParallelMs !== null && data.fullSequentialMs !== null
        ? `- Delta: ${formatMs(data.fullSequentialMs - data.fullParallelMs)}`
        : "- Delta: -",
      "",
      "7. Initial Conclusion",
      ...buildConclusion(data),
      "",
      "8. Raw Events",
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

    const localSteps: AuditStep[] = [];
    const pushStep = (step: AuditStep) => {
      localSteps.push(step);
      setSteps([...localSteps]);
    };

    try {
      const settingsBaselineResult = await runStep("fetch settings", () => fetchSettings());
      pushStep(settingsBaselineResult.step);

      const settingsAuditResult = await runStep("fetch settings (audit uncached)", async () => {
        const response = await fetchSettingsWithMeta({ audit: true });

        return response.meta?.audit ?? null;
      });
      pushStep(settingsAuditResult.step);

      const menusResult = await runStep("fetch menus", async () => {
        const response = await fetchMenusWithMeta({ audit: true });

        return {
          items: response.data,
          audit: response.meta.audit,
        };
      });
      pushStep(menusResult.step);

      const speedDialResult = await runStep("fetch speed dial", async () => {
        const response = await fetchSpeedDialComponentWithMeta({ audit: true });

        return {
          component: response.data,
          audit: response.meta.audit,
        };
      });
      pushStep(speedDialResult.step);

      const socialLinksResult = await runStep("fetch social links", async () => {
        const response = await fetchSocialLinksWithMeta({ audit: true });

        return {
          items: response.data.map((item) => ({
            ...item,
            icon_url: item.icon_url,
          })),
          audit: response.meta.audit,
        };
      });
      pushStep(socialLinksResult.step);

      const homeComponentsBaselineResult = await runStep("fetch home components (cached baseline)", async () => {
        const response = await fetchHomeComponentsWithMeta({ auditCached: true });

        return {
          components: response.data,
          audit: response.meta.audit,
        };
      });
      pushStep(homeComponentsBaselineResult.step);

      const homeComponentsAuditResult = await runStep("fetch home components (audit uncached)", async () => {
        const response = await fetchHomeComponentsWithMeta({ audit: true });

        return {
          components: response.data,
          audit: response.meta.audit,
        };
      });
      pushStep(homeComponentsAuditResult.step);

      const layoutParallelResult = await runStep("layout parallel fetch", async () => {
        await Promise.all([
          fetchSettings(),
          fetchMenus(),
          fetchSpeedDialComponent(),
          fetchSocialLinks(),
        ]);
      });
      pushStep(layoutParallelResult.step);

      const fullParallelResult = await runStep("full parallel fetch", async () => {
        await Promise.all([
          fetchSettings(),
          fetchMenus(),
          fetchSpeedDialComponent(),
          fetchSocialLinks(),
          fetchHomeComponents(),
        ]);
      });
      pushStep(fullParallelResult.step);

      const fullSequentialResult = await runStep("full sequential fetch", async () => {
        await fetchSettings();
        await fetchMenus();
        await fetchSpeedDialComponent();
        await fetchSocialLinks();
        await fetchHomeComponents();
      });
      pushStep(fullSequentialResult.step);

      const homeComponents = homeComponentsBaselineResult.value.components;
      const homeComponentsBaselineAudit = homeComponentsBaselineResult.value.audit;
      const homeComponentsAudit = homeComponentsAuditResult.value.audit;
      const speedDial = speedDialResult.value.component;
      const speedDialAudit = speedDialResult.value.audit;
      const menusAudit = menusResult.value.audit;
      const socialLinksAudit = socialLinksResult.value.audit;

      const finalSummary: HomeAuditSummary = {
        settingsMs: settingsBaselineResult.step.durationMs,
        settingsAuditRequestMs: settingsAuditResult.step.durationMs,
        settingsAudit: settingsAuditResult.value,
        settingsTiming: buildEndpointTiming(
          settingsBaselineResult.step.durationMs,
          settingsAuditResult.value?.server_ms ?? null,
          settingsAuditResult.value?.cache_hit ?? null,
        ),
        menusMs: menusResult.step.durationMs,
        menusTiming: buildEndpointTiming(
          menusResult.step.durationMs,
          menusAudit?.server_ms ?? null,
          menusAudit?.cache_hit ?? null,
        ),
        speedDialMs: speedDialResult.step.durationMs,
        speedDialTiming: buildEndpointTiming(
          speedDialResult.step.durationMs,
          speedDialAudit?.server_ms ?? null,
          speedDialAudit?.cache_hit ?? null,
        ),
        socialLinksMs: socialLinksResult.step.durationMs,
        socialLinksTiming: buildEndpointTiming(
          socialLinksResult.step.durationMs,
          socialLinksAudit?.server_ms ?? null,
          socialLinksAudit?.cache_hit ?? null,
        ),
        homeComponentsMs: homeComponentsBaselineResult.step.durationMs,
        homeComponentsTiming: buildEndpointTiming(
          homeComponentsBaselineResult.step.durationMs,
          homeComponentsBaselineAudit?.server_ms ?? null,
          homeComponentsBaselineAudit?.cache_hit ?? null,
        ),
        homeComponentsAuditRequestMs: homeComponentsAuditResult.step.durationMs,
        homeComponentsAuditServerMs: homeComponentsAudit?.server_ms ?? null,
        homeComponentsAuditRoundtripGapMs:
          homeComponentsAuditResult.step.durationMs === null || homeComponentsAudit?.server_ms == null
            ? null
            : Math.max(0, Number((homeComponentsAuditResult.step.durationMs - homeComponentsAudit.server_ms).toFixed(2))),
        layoutParallelMs: layoutParallelResult.step.durationMs,
        fullParallelMs: fullParallelResult.step.durationMs,
        fullSequentialMs: fullSequentialResult.step.durationMs,
        componentCount: homeComponents.length,
        componentTypes: [...new Set(homeComponents.map((item) => item.type))],
        speedDialItemCount: Array.isArray((speedDial?.config as { items?: unknown[] } | undefined)?.items)
          ? ((speedDial?.config as { items?: unknown[] }).items?.length ?? 0)
          : 0,
        menuCount: menusResult.value.items.length,
        socialLinkCount: socialLinksResult.value.items.length,
        homeComponentsAuditTotalMs: homeComponentsAudit?.total_ms ?? null,
        slowestHomeComponent: homeComponentsAudit?.slowest_component ?? null,
        homeComponentBreakdown: homeComponentsAudit?.components ?? [],
      };

      setSummary(finalSummary);
      setReportText(buildReport(finalSummary, localSteps));
      setStatus("done");
    } catch (error) {
      const failedStep = (error as { step?: AuditStep })?.step;
      if (failedStep) {
        pushStep(failedStep);
        setErrorMessage(`${failedStep.label}: ${failedStep.note ?? "Unknown error"}`);
      } else {
        setErrorMessage(String(error));
      }
      setStatus("error");
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
    if (status === "running") return "Đang chạy home audit...";
    if (status === "done") return "Đã xong.";
    if (status === "error") return "Có lỗi khi chạy home audit.";
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
          <h1 className="text-2xl font-bold text-slate-900">Home Audit Report</h1>
          <p className="text-sm text-slate-500">Tự chạy audit dữ liệu trang chủ và tạo báo cáo copy được.</p>
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
          <p>Settings API: {formatMs(summary?.settingsMs)}</p>
          <p>Settings API (audit uncached): {formatMs(summary?.settingsAuditRequestMs)}</p>
          <p>Settings cache: {summary?.settingsAudit ? `${summary.settingsAudit.cache_driver} / ${summary.settingsAudit.cache_hit ? "hit" : "miss"}` : "-"}</p>
          <p>Settings server/gap: {summary ? `${formatMs(summary.settingsTiming.serverMs)} / ${formatMs(summary.settingsTiming.roundtripGapMs)}` : "-"}</p>
          <p>Menus API: {formatMs(summary?.menusMs)}</p>
          <p>Speed dial API: {formatMs(summary?.speedDialMs)}</p>
          <p>Social links API: {formatMs(summary?.socialLinksMs)}</p>
          <p>Home components API (cached baseline): {formatMs(summary?.homeComponentsMs)}</p>
          <p>Home components API (audit uncached): {formatMs(summary?.homeComponentsAuditRequestMs)}</p>
          <p>Home components transform total: {formatMs(summary?.homeComponentsAuditTotalMs)}</p>
          <p>Slowest component: {summary?.slowestHomeComponent ? `${summary.slowestHomeComponent.type}#${summary.slowestHomeComponent.component_id} (${formatMs(summary.slowestHomeComponent.duration_ms)})` : "-"}</p>
          <p>Full parallel: {formatMs(summary?.fullParallelMs)}</p>
          <p>Full sequential: {formatMs(summary?.fullSequentialMs)}</p>
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
