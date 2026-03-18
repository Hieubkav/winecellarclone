"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { fetchHomeComponents, fetchHomeComponentsWithMeta, fetchSpeedDialComponent, type HomeComponentAuditEntry } from "@/lib/api/home";
import { fetchMenus } from "@/lib/api/menus";
import { fetchSettings } from "@/lib/api/settings";
import { fetchSocialLinks } from "@/lib/api/socialLinks";

type AuditStep = {
  label: string;
  durationMs: number;
  status: "ok" | "error";
  note?: string;
};

type HomeAuditSummary = {
  settingsMs: number | null;
  menusMs: number | null;
  speedDialMs: number | null;
  socialLinksMs: number | null;
  homeComponentsMs: number | null;
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
      ["home components", data.homeComponentsMs],
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
      lines.push("- Home components API đáng audit nếu homepage còn cảm giác chậm.");
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
      `- Home components API: ${formatMs(data.homeComponentsMs)}`,
      "",
      "2. Homepage Data Summary",
      `- Home components: ${data.componentCount}`,
      `- Component types: ${data.componentTypes.join(", ") || "-"}`,
      `- Menus: ${data.menuCount}`,
      `- Social links: ${data.socialLinkCount}`,
      `- Speed dial items: ${data.speedDialItemCount}`,
      "",
      "3. Home Components Audit",
      `- Home components transform total: ${formatMs(data.homeComponentsAuditTotalMs)}`,
      data.slowestHomeComponent
        ? `- Slowest component: ${data.slowestHomeComponent.type}#${data.slowestHomeComponent.component_id} (${formatMs(data.slowestHomeComponent.duration_ms)})`
        : "- Slowest component: -",
      ...data.homeComponentBreakdown.map((item) => `- ${item.type}#${item.component_id}: ${formatMs(item.duration_ms)}${item.transformed ? " ok" : " skipped"}`),
      "",
      "4. Parallel vs Sequential",
      `- Layout parallel (settings + menus + speed dial + social links): ${formatMs(data.layoutParallelMs)}`,
      `- Full parallel (layout + home components): ${formatMs(data.fullParallelMs)}`,
      `- Full sequential: ${formatMs(data.fullSequentialMs)}`,
      data.fullParallelMs !== null && data.fullSequentialMs !== null
        ? `- Delta: ${formatMs(data.fullSequentialMs - data.fullParallelMs)}`
        : "- Delta: -",
      "",
      "5. Initial Conclusion",
      ...buildConclusion(data),
      "",
      "6. Raw Events",
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
      const settingsResult = await runStep("fetch settings", () => fetchSettings());
      pushStep(settingsResult.step);

      const menusResult = await runStep("fetch menus", () => fetchMenus());
      pushStep(menusResult.step);

      const speedDialResult = await runStep("fetch speed dial", () => fetchSpeedDialComponent());
      pushStep(speedDialResult.step);

      const socialLinksResult = await runStep("fetch social links", () => fetchSocialLinks());
      pushStep(socialLinksResult.step);

      const homeComponentsResult = await runStep("fetch home components", async () => {
        const response = await fetchHomeComponentsWithMeta({ audit: true });

        return {
          components: response.data,
          audit: response.meta.audit,
        };
      });
      pushStep(homeComponentsResult.step);

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

      const homeComponents = homeComponentsResult.value.components;
      const homeComponentsAudit = homeComponentsResult.value.audit;
      const speedDial = speedDialResult.value;

      const finalSummary: HomeAuditSummary = {
        settingsMs: settingsResult.step.durationMs,
        menusMs: menusResult.step.durationMs,
        speedDialMs: speedDialResult.step.durationMs,
        socialLinksMs: socialLinksResult.step.durationMs,
        homeComponentsMs: homeComponentsResult.step.durationMs,
        layoutParallelMs: layoutParallelResult.step.durationMs,
        fullParallelMs: fullParallelResult.step.durationMs,
        fullSequentialMs: fullSequentialResult.step.durationMs,
        componentCount: homeComponents.length,
        componentTypes: [...new Set(homeComponents.map((item) => item.type))],
        speedDialItemCount: Array.isArray((speedDial?.config as { items?: unknown[] } | undefined)?.items)
          ? ((speedDial?.config as { items?: unknown[] }).items?.length ?? 0)
          : 0,
        menuCount: menusResult.value.length,
        socialLinkCount: socialLinksResult.value.length,
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
          <p>Menus API: {formatMs(summary?.menusMs)}</p>
          <p>Speed dial API: {formatMs(summary?.speedDialMs)}</p>
          <p>Social links API: {formatMs(summary?.socialLinksMs)}</p>
          <p>Home components API: {formatMs(summary?.homeComponentsMs)}</p>
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
