import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Auth() {
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
          setInfo("Cadastro criado. Confirme seu e-mail para entrar.");
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-10 relative overflow-hidden antialiased">
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
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mt-3">Portal do Cliente</p>

        <h2 className="mb-6 text-xl font-bold tracking-tight text-white">
          {isLogin ? "Entrar no Portal" : "Criar sua Conta"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Field label="Nome completo" required value={nome} onChange={setNome} placeholder="Seu nome completo" />
              <Field label="WhatsApp" required value={whatsapp} onChange={setWhatsapp} placeholder="(00) 00000-0000" type="tel" />
              <Field label="Empresa" required value={empresa} onChange={setEmpresa} placeholder="Nome da empresa" />
              <Field label="Cargo" required value={cargo} onChange={setCargo} placeholder="Seu cargo" />
            </>
          )}

          <Field label="E-mail" required value={email} onChange={setEmail} placeholder="voce@empresa.com" type="email" />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 pr-12 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
                placeholder="Mínimo 6 caracteres"
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
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          {isLogin ? "Não tem uma conta?" : "Já possui conta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-red-500 hover:text-red-400 hover:underline transition-colors"
          >
            {isLogin ? "Cadastre-se agora" : "Entrar"}
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
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400">{label}</label>
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

function traduzErro(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (msg.includes("at least 6")) return "A senha precisa ter ao menos 6 caracteres.";
  return msg;
}
