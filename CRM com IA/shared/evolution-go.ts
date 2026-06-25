/**
 * Evolution Go — núcleo portado de refencias/product-prodigy-pal (Buffallos CRM).
 * Não usar rotas da Evolution API v2.
 */

export interface EvolutionConfig {
  url: string;
  globalApiKey: string;
}

export type EvoResult = {
  ok: boolean;
  status: number;
  body: unknown;
  message?: string;
  isJson?: boolean;
};

export async function evoFetch(
  config: EvolutionConfig,
  path: string,
  init: RequestInit = {},
  instanceToken?: string,
): Promise<EvoResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: instanceToken || config.globalApiKey,
    ...((init.headers as Record<string, string>) ?? {}),
  };
  let res: Response;
  try {
    res = await fetch(`${config.url}${path}`, { ...init, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, body: null, message: `Falha ao conectar em ${config.url}: ${msg}` };
  }
  const text = await res.text();
  let body: unknown = text;
  let isJson = false;
  try {
    body = text ? JSON.parse(text) : null;
    isJson = true;
  } catch {
    body = text;
  }
  let message: string | undefined;
  if (!res.ok) {
    if (!isJson && typeof body === "string") {
      message = `Servidor respondeu ${res.status}: ${body.slice(0, 200)}`;
    } else if (isJson && body && typeof body === "object" && "message" in body) {
      message = String((body as { message: unknown }).message);
    } else if (isJson && body && typeof body === "object" && "error" in body) {
      message = String((body as { error: unknown }).error);
    }
  }
  return { ok: res.ok, status: res.status, body, message, isJson };
}

export function normalizeQrString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (raw.length <= 20) return null;
  const pipeIndex = raw.indexOf("|");
  if (pipeIndex >= 0) {
    const afterPipe = raw.slice(pipeIndex + 1).trim();
    if (afterPipe.length > 20) return afterPipe;
    const beforePipe = raw.slice(0, pipeIndex).trim();
    if (beforePipe.length > 20) return beforePipe;
  }
  return raw;
}

export function extractQr(obj: unknown): string | null {
  if (!obj) return null;
  const normalized = normalizeQrString(obj);
  if (normalized) return normalized;
  if (typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const candidates = [
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).Code : null,
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).Qrcode : null,
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).QRCode : null,
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).qrcode : null,
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).qr : null,
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).base64 : null,
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>).code : null,
    o.Code,
    o.Qrcode,
    o.QRCode,
    o.qrcode,
    o.qr,
    o.base64,
    o.code,
    o.QRCode,
    o.qr_code,
  ];
  for (const c of candidates) {
    const found = extractQr(c);
    if (found) return found;
  }
  return null;
}

export function extractJid(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const raw =
    (o?.data as Record<string, unknown> | undefined)?.jid ??
    (o?.data as Record<string, unknown> | undefined)?.JID ??
    (o?.data as Record<string, unknown> | undefined)?.owner ??
    (o?.data as Record<string, unknown> | undefined)?.Owner ??
    o.jid ??
    o.JID ??
    o.owner ??
    o.Owner ??
    null;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 5 ? trimmed : null;
}

export function jidToPhone(jid: string | null | undefined): string | null {
  if (!jid) return null;
  const phone = String(jid).split("@")[0].split(":")[0].replace(/\D/g, "");
  return phone || null;
}

export async function resolveInstanceQr(
  config: EvolutionConfig,
  uuid: string,
  instanceToken: string,
  instanceName?: string | null,
): Promise<string | null> {
  const qrPaths = [
    "/instance/qr",
    instanceName ? `/instance/qr?instanceName=${encodeURIComponent(instanceName)}` : null,
  ].filter(Boolean) as string[];

  for (const path of qrPaths) {
    const qrRes = await evoFetch(
      config,
      path,
      { method: "GET", headers: { instanceId: uuid } },
      instanceToken,
    );
    const found = extractQr(qrRes.body);
    if (found) return found;
  }
  return null;
}

export async function pollInstanceQr(
  config: EvolutionConfig,
  uuid: string,
  instanceToken: string,
  instanceName?: string | null,
  attempts = 12,
  delayMs = 1500,
): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, delayMs));
    try {
      const found = await resolveInstanceQr(config, uuid, instanceToken, instanceName);
      if (found) return found;
    } catch {
      /* retry */
    }
  }
  return null;
}

export async function fetchInstanceStatus(
  config: EvolutionConfig,
  uuid: string,
  instanceToken: string,
) {
  return evoFetch(
    config,
    "/instance/status",
    { method: "GET", headers: { instanceId: uuid } },
    instanceToken,
  );
}

export function isWhatsAppReady(parsed: { connected: boolean; loggedIn: boolean }): boolean {
  return parsed.connected === true && parsed.loggedIn === true;
}

export function parseInstanceStatusBody(body: unknown): {
  connected: boolean;
  loggedIn: boolean;
  jid: string | null;
  rawError: string | null;
} {
  if (!body) return { connected: false, loggedIn: false, jid: null, rawError: null };
  if (typeof body === "object" && body !== null && "error" in body && typeof (body as { error: unknown }).error === "string") {
    return { connected: false, loggedIn: false, jid: extractJid(body), rawError: (body as { error: string }).error };
  }
  const o = body as Record<string, unknown>;
  const data = (o?.data ?? o ?? {}) as Record<string, unknown>;
  const socketConnected = data.Connected === true || data.connected === true;
  const loggedIn = data.LoggedIn === true || data.loggedIn === true;
  return {
    connected: socketConnected && loggedIn,
    loggedIn,
    jid:
      extractJid(body) ??
      extractJid(data) ??
      (typeof data.owner === "string" ? data.owner : null) ??
      (typeof data.Owner === "string" ? data.Owner : null),
    rawError: null,
  };
}

export async function reconnectInstanceOnServer(
  config: EvolutionConfig,
  uuid: string,
  instanceToken: string,
) {
  const attempts: RequestInit[] = [
    { method: "POST", headers: { instanceId: uuid }, body: JSON.stringify({ immediate: true }) },
    { method: "POST", headers: { instanceId: uuid }, body: JSON.stringify({}) },
  ];
  let last: EvoResult = { ok: false, status: 0, body: null };
  for (const init of attempts) {
    const res = await evoFetch(config, "/instance/reconnect", init, instanceToken);
    last = res;
    if (res.ok) return res;
  }
  return last;
}

export async function pollInstanceConnected(
  config: EvolutionConfig,
  uuid: string,
  instanceToken: string,
  attempts = 12,
  delayMs = 1500,
) {
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, delayMs));
    try {
      const statusRes = await fetchInstanceStatus(config, uuid, instanceToken);
      const parsed = parseInstanceStatusBody(statusRes.body);
      if (statusRes.ok && isWhatsAppReady(parsed)) return parsed;
    } catch {
      /* retry */
    }
  }
  return null;
}

export async function connectInstanceOnServer(
  config: EvolutionConfig,
  uuid: string,
  instanceToken: string,
  instanceName: string | null | undefined,
  webhookUrl: string,
) {
  const payload = { webhookUrl, subscribe: ["ALL"], immediate: true };
  const attempts: RequestInit[] = [
    { method: "POST", headers: { instanceId: uuid }, body: JSON.stringify(payload) },
    { method: "POST", body: JSON.stringify({ ...payload, instanceId: uuid }) },
  ];
  if (instanceName) {
    attempts.push({ method: "POST", body: JSON.stringify({ ...payload, instanceName }) });
  }
  let last: EvoResult = { ok: false, status: 0, body: null };
  for (const init of attempts) {
    const res = await evoFetch(config, "/instance/connect", init, instanceToken);
    last = res;
    if (res.ok) return res;
  }
  return last;
}

export async function configureWebhook(
  config: EvolutionConfig,
  instanceUuid: string,
  instanceToken: string | null | undefined,
  webhookUrl: string,
) {
  if (!instanceToken) {
    return { ok: false, error: "Token da instância ausente." };
  }
  const primary = await evoFetch(
    config,
    "/instance/connect",
    {
      method: "POST",
      headers: { instanceId: instanceUuid },
      body: JSON.stringify({ webhookUrl, subscribe: ["ALL"], immediate: false }),
    },
    instanceToken,
  );
  if (primary.ok) return { ok: true, status: primary.status, response: primary.body };
  const fallback = await evoFetch(
    config,
    "/instance/connect",
    {
      method: "POST",
      body: JSON.stringify({ instanceId: instanceUuid, webhookUrl, subscribe: ["ALL"], immediate: false }),
    },
    instanceToken,
  );
  if (fallback.ok) return { ok: true, status: fallback.status, response: fallback.body };
  return {
    ok: false,
    status: primary.status,
    error: primary.message || fallback.message || `Falha ao configurar webhook (status ${primary.status}).`,
    response: primary.body ?? fallback.body,
  };
}

export function parseInstanceFromList(item: Record<string, unknown>, fallbackName = "") {
  const name = String(item?.name ?? item?.instanceName ?? fallbackName);
  const uuid = String(item?.id ?? item?.instanceId ?? item?.uuid ?? "") || null;
  const token = String(item?.token ?? item?.apikey ?? "") || null;
  const jid = (item?.jid ?? item?.owner ?? null) as string | null;
  const phoneRaw = jid
    ? String(jid).split("@")[0].split(":")[0]
    : String(item?.number ?? item?.phoneNumber ?? "");
  const phone = phoneRaw ? phoneRaw.replace(/\D/g, "") : null;
  const qrcode = extractQr(item?.qrcode ?? item?.qr ?? item);
  const connected =
    item?.connected === true ||
    item?.connectionStatus === "open" ||
    item?.state === "open" ||
    item?.status === "open";
  const status = connected ? "connected" : qrcode && String(qrcode).length > 10 ? "qr_pending" : "disconnected";
  return { name, uuid, token, phone, qrcode, connected, status };
}
