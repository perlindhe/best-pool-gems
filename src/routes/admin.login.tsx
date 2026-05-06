import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin login" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const fn =
        mode === "login"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + "/admin" },
            });
      const { error } = await fn;
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-display text-5xl tracking-wide">Admin {mode === "login" ? "login" : "signup"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Endast inbjudna admins. Första kontot måste promotas via DB.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-4 py-3"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-4 py-3"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50"
          >
            {busy ? "..." : mode === "login" ? "Logga in" : "Skapa konto"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="block w-full text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary"
          >
            {mode === "login" ? "Inget konto? Skapa" : "Har redan konto? Logga in"}
          </button>
        </form>
      </div>
    </div>
  );
}
