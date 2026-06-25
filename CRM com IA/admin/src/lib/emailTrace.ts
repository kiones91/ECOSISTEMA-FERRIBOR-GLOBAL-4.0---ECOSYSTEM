/**
 * Rastreamento no frontend (CRM) — marcos CRM-01, CRM-02, etc.
 * Ver docs/EMAIL_TRANSACIONAL_ARQUITETURA.md
 */

export interface EmailTraceStep {
  id: string;
  label: string;
  ok: boolean;
  at: string;
  detail?: string;
}

export interface EmailTraceResult {
  flow: string;
  success: boolean;
  steps: EmailTraceStep[];
  failed_at?: string;
}

export class ClientEmailTrace {
  private steps: EmailTraceStep[] = [];

  constructor(private flow: string) {}

  ok(id: string, label: string, detail?: string): void {
    this.steps.push({
      id,
      label,
      ok: true,
      at: new Date().toISOString(),
      detail,
    });
    if (import.meta.env.DEV) {
      console.log(`[email-trace] ✓ ${id} ${label}`, detail ?? "");
    }
  }

  fail(id: string, label: string, error: string): void {
    this.steps.push({
      id,
      label,
      ok: false,
      at: new Date().toISOString(),
      detail: error,
    });
    console.warn(`[email-trace] ✗ ${id} ${label}`, error);
  }

  mergeServer(server?: EmailTraceResult | null): void {
    if (!server?.steps?.length) return;
    this.steps.push(...server.steps);
  }

  toJSON(): EmailTraceResult {
    const failed = this.steps.find((s) => !s.ok);
    return {
      flow: this.flow,
      success: !failed,
      steps: [...this.steps],
      failed_at: failed?.id,
    };
  }
}

export function formatEmailTrace(trace?: EmailTraceResult | null): string {
  if (!trace?.steps?.length) return "";
  return trace.steps
    .map((s) => {
      const icon = s.ok ? "✓" : "✗";
      const detail = s.detail ? ` (${s.detail})` : "";
      return `${icon} ${s.id} ${s.label}${detail}`;
    })
    .join("\n");
}

export function parseTraceFromResponse(data: unknown): EmailTraceResult | null {
  if (!data || typeof data !== "object") return null;
  const t = (data as { trace?: EmailTraceResult }).trace;
  if (!t?.steps?.length) return null;
  return t;
}

/** Extrai corpo JSON quando supabase.functions.invoke retorna non-2xx. */
export async function parseInvokeErrorBody(
  error: unknown,
  data: unknown,
): Promise<unknown> {
  if (data && typeof data === "object") return data;
  if (error && typeof error === "object" && "context" in error) {
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") return await ctx.json();
    } catch {
      /* ignore */
    }
  }
  return data;
}

export function errorMessageFromInvokeBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    if ("error" in body && body.error) return String((body as { error: unknown }).error);
    if ("message" in body && body.message) return String((body as { message: unknown }).message);
  }
  return fallback;
}
