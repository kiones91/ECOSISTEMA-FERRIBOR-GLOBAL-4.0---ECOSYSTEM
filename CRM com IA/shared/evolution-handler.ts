/**
 * Handler Evolution Go (singleton) — conexão WhatsApp via QR Code.
 * WhatsApp só fica "connected" após /instance/status confirmar sessão ativa.
 */
import type { EvolutionConfig } from "./evolution-go";
import {
  configureWebhook,
  connectInstanceOnServer,
  evoFetch,
  extractJid,
  extractQr,
  fetchInstanceStatus,
  isWhatsAppReady,
  jidToPhone,
  parseInstanceStatusBody,
  pollInstanceQr,
  resolveInstanceQr,
} from "./evolution-go";

export type EvolutionGoConfig = EvolutionConfig;

export type DbInstance = {
  id: string;
  instance_name: string;
  instance_id: string | null;
  instance_token: string | null;
  phone_number: string | null;
  status: string;
  qr_code_base64: string | null;
  metadata?: Record<string, unknown> | null;
};

export type EvolutionDb = {
  getConfig(): Promise<EvolutionGoConfig | null>;
  getInstanceById(id: string): Promise<DbInstance | null>;
  getSingletonInstance(): Promise<DbInstance | null>;
  insertInstance(row: Partial<DbInstance>): Promise<DbInstance>;
  updateInstance(id: string, patch: Partial<DbInstance>): Promise<void>;
};

async function markWhatsAppConnected(db: EvolutionDb, inst: DbInstance, jid: string | null) {
  const phone = jidToPhone(jid);
  await db.updateInstance(inst.id, {
    status: "connected",
    qr_code_base64: null,
    phone_number: phone ?? inst.phone_number,
  });
}

async function markQrPending(db: EvolutionDb, inst: DbInstance, qr: string | null) {
  await db.updateInstance(inst.id, {
    status: "qr_pending",
    qr_code_base64: qr,
  });
}

export async function handleEvolutionAction(
  action: string,
  body: Record<string, unknown>,
  db: EvolutionDb,
  webhookUrl: string,
): Promise<Record<string, unknown>> {
  if (action === "test_connection" || action === "test") {
    let cfg: EvolutionGoConfig | null = null;
    const url = String(body.url ?? body.api_url ?? "").replace(/\/$/, "");
    const globalApiKey = String(body.globalApiKey ?? body.api_key ?? "");
    if (url && globalApiKey && !globalApiKey.startsWith("••")) {
      cfg = { url, globalApiKey };
    } else {
      cfg = await db.getConfig();
    }
    if (!cfg) throw new Error("Configure URL e Global API Key e salve.");
    const res = await evoFetch(cfg, "/instance/all", { method: "GET" });
    if (res.ok) {
      return {
        ok: true,
        message: "Servidor Evolution Go acessível. Isso não significa que o WhatsApp está conectado.",
        server_ok: true,
      };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: "Servidor acessível, mas a Global API Key foi rejeitada." };
    }
    throw new Error(res.message || `Erro ${res.status} ao conectar.`);
  }

  const config = await db.getConfig();
  if (!config) {
    throw new Error("Configure o servidor Evolution Go em Integrações e salve.");
  }

  if (action === "create_instance" || action === "create") {
    const name = String(body.name ?? body.instance_name ?? "ferribor").trim();
    const existing = await db.getSingletonInstance();
    if (existing?.instance_id && existing?.instance_token) {
      return { ok: true, instance: existing, already_exists: true };
    }

    const generatedToken = crypto.randomUUID();
    const createRes = await evoFetch(config, "/instance/create", {
      method: "POST",
      body: JSON.stringify({ name, token: generatedToken }),
    });
    if (!createRes.ok) {
      throw new Error(createRes.message || `Falha ao criar instância (status ${createRes.status})`);
    }

    const created =
      (createRes.body as { data?: Record<string, unknown> })?.data ??
      (createRes.body as Record<string, unknown>) ??
      {};
    const uuid = String(created.id ?? created.instanceId ?? created.uuid ?? "");
    const instanceToken = String(created.token ?? created.apikey ?? generatedToken);
    if (!uuid) throw new Error("Servidor criou a instância mas não retornou UUID.");

    const wh = await configureWebhook(config, uuid, instanceToken, webhookUrl);
    let row: DbInstance;
    const meta = {
      instance_uuid: uuid,
      instance_name: name,
      webhook_error: wh.ok ? null : wh.error,
    };
    if (existing) {
      await db.updateInstance(existing.id, {
        instance_name: name,
        instance_id: uuid,
        instance_token: instanceToken,
        status: "disconnected",
        qr_code_base64: null,
        metadata: { ...(existing.metadata ?? {}), ...meta },
      });
      row = {
        ...existing,
        instance_name: name,
        instance_id: uuid,
        instance_token: instanceToken,
        status: "disconnected",
      };
    } else {
      row = await db.insertInstance({
        instance_name: name,
        instance_id: uuid,
        instance_token: instanceToken,
        status: "disconnected",
        qr_code_base64: null,
        metadata: meta,
      });
    }
    return { ok: true, instance: row };
  }

  if (action === "connect_instance" || action === "connect") {
    const id = String(body.id ?? "");
    let inst = id ? await db.getInstanceById(id) : await db.getSingletonInstance();
    if (!inst) throw new Error("Crie a instância antes de conectar o WhatsApp.");

    const meta = (inst.metadata ?? {}) as Record<string, unknown>;
    const uuid = String(meta.instance_uuid ?? inst.instance_id ?? "");
    const instanceToken = String(inst.instance_token ?? meta.instance_token ?? "");
    const instanceName = String(meta.instance_name ?? inst.instance_name ?? "");

    if (!uuid || !instanceToken) {
      throw new Error("Instância sem UUID ou token. Clique em Criar instância.");
    }

    const statusRes = await fetchInstanceStatus(config, uuid, instanceToken);
    const parsed = parseInstanceStatusBody(statusRes.body);
    if (statusRes.ok && isWhatsAppReady(parsed)) {
      await markWhatsAppConnected(db, inst, parsed.jid);
      return { ok: true, qr_code: null, already_connected: true, whatsapp_ready: true };
    }

    let qrString = await resolveInstanceQr(config, uuid, instanceToken, instanceName);

    if (!qrString) {
      await db.updateInstance(inst.id, { status: "qr_pending", qr_code_base64: null });
      const res = await connectInstanceOnServer(config, uuid, instanceToken, instanceName, webhookUrl);
      if (!res.ok) {
        throw new Error(res.message || `Erro ${res.status} ao solicitar QR no Evolution Go`);
      }
      qrString = extractQr(res.body) ?? (await pollInstanceQr(config, uuid, instanceToken, instanceName));
    }

    if (qrString) {
      await markQrPending(db, inst, qrString);
      return { ok: true, qr_code: qrString, qr: qrString, waiting_scan: true };
    }

    await markQrPending(db, inst, null);
    return {
      ok: true,
      qr_code: null,
      waiting_qr: true,
      message: "Aguardando QR Code do Evolution Go. Mantenha esta janela aberta.",
    };
  }

  if (action === "sync_instance_status" || action === "status") {
    const id = String(body.id ?? "");
    const inst = id ? await db.getInstanceById(id) : await db.getSingletonInstance();
    if (!inst?.instance_id || !inst?.instance_token) {
      return { ok: true, state: "close", connected: false, whatsapp_ready: false };
    }

    const statusRes = await fetchInstanceStatus(config, inst.instance_id, inst.instance_token);
    const parsed = parseInstanceStatusBody(statusRes.body);

    if (statusRes.ok && isWhatsAppReady(parsed)) {
      await markWhatsAppConnected(db, inst, parsed.jid);
      return { ok: true, state: "open", connected: true, whatsapp_ready: true };
    }

    const qr = await resolveInstanceQr(
      config,
      inst.instance_id,
      inst.instance_token,
      inst.instance_name,
    );
    if (qr) {
      await markQrPending(db, inst, qr);
      return { ok: true, state: "qr_pending", connected: false, whatsapp_ready: false, qr_code: qr };
    }

    if (inst.status === "connected") {
      await db.updateInstance(inst.id, { status: "disconnected", qr_code_base64: null });
    } else if (inst.status !== "qr_pending") {
      await db.updateInstance(inst.id, { status: "disconnected" });
    }

    return { ok: true, state: "close", connected: false, whatsapp_ready: false };
  }

  throw new Error(`Ação desconhecida: ${action}`);
}
