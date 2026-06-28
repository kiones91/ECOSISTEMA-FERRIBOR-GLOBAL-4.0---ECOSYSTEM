import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export default function Auth() {
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [cargo, setCargo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduzErro(error.message));
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, whatsapp, empresa, cargo } },
      });
      if (error) {
        setError(traduzErro(error.message));
      } else if (data.user) {
        // Dispara boas-vindas (e-mail + WhatsApp) — não bloqueia o cadastro
        supabase.functions
          .invoke("welcome-cliente", {
            body: { user_id: data.user.id, nome, email, whatsapp, empresa, cargo },
          })
          .catch(() => {});
        if (!data.session) {
          setInfo(t('auth.confirmEmail'));
        }
      }
    }
    setLoading(false);
  }

  function traduzErro(msg: string): string {
    if (msg.includes("Invalid login credentials")) return t('auth.errorCredentials');
    if (msg.includes("already registered")) return t('auth.errorRegistered');
    if (msg.includes("at least 6")) return t('auth.errorLength');
    return msg;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-10 relative overflow-hidden antialiased">
      <div className="absolute right-4 top-4 z-50">
        <LanguageSwitcher dark={true} />
      </div>
      {/* Background decorative elements */}
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/0 backdrop-blur-lg p-8 shadow-2xl shadow-black/50">
          <div className="logo-3d-wrapper h-20 sm:h-24 md:h-32 mx-auto">
            <img
              src="/assets/imagens/logo-3d.png"
              alt="Ferribor - Artefatos de Borracha"
              draggable="false"
              className="logo-3d-img"
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mt-3">{t('common.portalCliente')}</p>

        <h2 className="mb-6 text-xl font-bold tracking-tight text-white">
          {isLogin ? t('auth.titleLogin') : t('auth.titleRegister')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Field label={t('auth.fieldNome')} required value={nome} onChange={setNome} placeholder={t('auth.fieldNomePlaceholder')} />
              <Field label={t('auth.fieldWhatsapp')} required value={whatsapp} onChange={setWhatsapp} placeholder="(00) 00000-0000" type="tel" />
              <Field label={t('auth.fieldEmpresa')} required value={empresa} onChange={setEmpresa} placeholder={t('auth.fieldEmpresaPlaceholder')} />
              <Field label={t('auth.fieldCargo')} required value={cargo} onChange={setCargo} placeholder={t('auth.fieldCargoPlaceholder')} />
            </>
          )}

          <Field label={t('auth.fieldEmail')} required value={email} onChange={setEmail} placeholder="voce@empresa.com" type="email" />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">{t('auth.fieldSenha')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 pr-12 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
                placeholder={t('auth.fieldSenhaPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
          {info && <p className="text-sm font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-2.5">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-red-950/20"
          >
            {loading ? t('auth.btnWait') : isLogin ? t('auth.btnEnter') : t('auth.btnCreate')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-red-500 hover:text-red-400 hover:underline transition-colors"
          >
            {isLogin ? t('auth.btnRegisterNow') : t('auth.btnEnter')}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
        placeholder={placeholder}
      />
    </div>
  );
}
