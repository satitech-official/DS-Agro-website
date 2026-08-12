"use client";

import { FormEvent, useEffect, useState } from "react";
import { appHref, getSupabaseClient } from "../lib/supabase";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return queueMicrotask(() => { setError("Admin service is not configured."); setLoading(false); });
    const { data: listener } = client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { setRecovery(true); setLoading(false); }
    });
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setLoading(false);
      if (window.location.hash.includes("type=recovery")) { setRecovery(true); return setLoading(false); }
      const { data: admin } = await client.from("admins").select("active").eq("user_id", data.user.id).maybeSingle();
      if (admin?.active) window.location.replace(appHref("/admin/"));
      else setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return setError("Admin service is not configured.");
    setLoading(true);
    setError("");
    const { data, error: loginError } = await client.auth.signInWithPassword({ email, password });
    if (loginError || !data.user) {
      setError(loginError?.message || "Login failed.");
      setLoading(false);
      return;
    }
    const { data: admin, error: accessError } = await client.from("admins").select("display_name, role, active").eq("user_id", data.user.id).maybeSingle();
    if (accessError || !admin?.active) {
      await client.auth.signOut();
      setError("This account does not have active resort-admin access.");
      setLoading(false);
      return;
    }
    window.location.replace(appHref("/admin/"));
  }

  async function sendPasswordLink() {
    const client = getSupabaseClient();
    if (!client || !email) return setError("Enter the authorized admin email first.");
    setLoading(true); setError(""); setNotice("");
    const { error: resetError } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${appHref("/admin/login/")}` });
    if (resetError) setError(resetError.message);
    else setNotice("Password setup link sent. Please check the email inbox and spam folder.");
    setLoading(false);
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    if (password.length < 10) return setError("Use at least 10 characters for the new password.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    const { error: updateError } = await client.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    window.location.replace(appHref("/admin/"));
  }

  return <main className="admin-login-page">
    <section className="admin-login-brand" style={{ backgroundImage: `linear-gradient(90deg,#102a1edb,#102a1e7a),url("${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/resort/estate-aerial.webp")` }}><a href={appHref("/")}><span>DS</span> Agro Tourism & Resort</a><div><p>Secure workspace</p><h1>Thoughtful hospitality,<br /><em>carefully managed.</em></h1><small>Bookings, inventory and guest inquiries in one protected space.</small></div></section>
    <section className="admin-login-panel">{recovery ? <form onSubmit={savePassword}><p className="eyebrow">Secure account setup</p><h2>Choose a password.</h2><p>Create a strong password for the authorized resort-admin account.</p><label><span>New password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={10} required /></label><label><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={10} required /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="button button-dark" disabled={loading}>{loading ? "Saving…" : "Save password"}<b>→</b></button></form> : <form onSubmit={login}><p className="eyebrow">Resort administration</p><h2>Welcome back.</h2><p>Sign in with the admin account created in DS Agro&apos;s secure Supabase project.</p><label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}<button className="button button-dark" disabled={loading}>{loading ? "Checking…" : "Sign in"}<b>→</b></button><button type="button" className="admin-reset-link" onClick={sendPasswordLink} disabled={loading}>Set or reset password by email</button><a href={appHref("/")}>← Back to website</a></form>}</section>
  </main>;
}
