export type EvolutionSettings = {
  apiUrl: string;
  apiKey: string;
};

type SettingsRow = { key: string; value: string | null };

export async function loadEvolutionSettings(
  supabase: {
    from: (table: string) => {
      select: (cols: string) => Promise<{ data: SettingsRow[] | null }>;
    };
  },
): Promise<EvolutionSettings> {
  const { data } = await supabase.from("integration_settings").select("key, value");
  const map = new Map((data ?? []).map((r) => [r.key, r.value ?? ""]));
  return {
    apiUrl: (map.get("evolution_api_url") || Deno.env.get("EVOLUTION_API_URL") || "").replace(/\/$/, ""),
    apiKey: map.get("evolution_api_key") || Deno.env.get("EVOLUTION_API_KEY") || "",
  };
}

/** Evolution Go (não Evolution API v2). */
export async function evolutionRequest(
  settings: EvolutionSettings,
  path: string,
  init: RequestInit = {},
  instanceToken?: string,
): Promise<unknown> {
  const url = `${settings.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("apikey", instanceToken || settings.apiKey);

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erro de rede";
    throw new Error(`Falha ao conectar em ${settings.apiUrl}: ${msg}`);
  }

  const raw = await res.text();
  let data: unknown = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    /* texto puro */
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : typeof data === "string"
            ? data.slice(0, 200)
            : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function normalizeQr(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (raw.length <= 20) return null;
  const pipe = raw.indexOf("|");
  if (pipe >= 0) {
    const after = raw.slice(pipe + 1).trim();
    if (after.length > 20) return after;
  }
  if (raw.startsWith("data:image")) return raw;
  if (/^[A-Za-z0-9+/=]{40,}$/.test(raw)) return `data:image/png;base64,${raw}`;
  return raw;
}

export function extractQr(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  for (const key of ["Code", "Qrcode", "QRCode", "qrcode", "qr", "base64", "code", "qr_code"]) {
    const found = normalizeQr(o[key]);
    if (found) return found;
  }
  if (o.data && typeof o.data === "object") return extractQr(o.data);
  if (o.qrcode && typeof o.qrcode === "object") {
    const q = o.qrcode as Record<string, unknown>;
    return normalizeQr(q.base64) ?? normalizeQr(q.code);
  }
  return null;
}

export function extractConnectionState(data: unknown): string {
  if (!data || typeof data !== "object") return "close";
  const o = data as Record<string, unknown>;
  const inner = (o.data && typeof o.data === "object" ? o.data : o) as Record<string, unknown>;
  const statusStr = String(inner.Status ?? inner.status ?? inner.connectionStatus ?? "").toLowerCase();
  if (
    inner.Connected === true ||
    inner.connected === true ||
    inner.LoggedIn === true ||
    inner.loggedIn === true ||
    statusStr === "open" ||
    statusStr === "connected"
  ) {
    return "open";
  }
  return statusStr || "close";
}

export function isConnectedState(state: string): boolean {
  return state === "open" || state === "connected";
}

export async function setEvolutionWebhook(
  settings: EvolutionSettings,
  instanceId: string,
  instanceToken: string,
  webhookUrl: string,
): Promise<void> {
  await evolutionRequest(
    settings,
    "/instance/connect",
    {
      method: "POST",
      headers: { instanceId },
      body: JSON.stringify({ webhookUrl, subscribe: ["ALL"], immediate: true }),
    },
    instanceToken,
  );
}
