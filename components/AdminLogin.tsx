"use client";

import { FormEvent, useEffect, useState } from "react";
import { appHref, getSupabaseClient } from "../lib/supabase";

type LoginView = "login" | "forgot" | "sent" | "recovery";

const RESET_REQUEST_COOLDOWN_SECONDS = 60;

type PasswordResetError = {
  code?: string;
  message: string;
  status?: number;
};

function passwordResetErrorMessage(error: PasswordResetError) {
  const rateLimited = error.status === 429
    || error.code === "over_email_send_rate_limit"
    || /rate limit|too many requests/i.test(error.message);

  if (rateLimited) {
    return "Too many reset links were requested, so email delivery is temporarily paused. Use the newest reset email already in your inbox, or wait before trying once more.";
  }

  return error.message || "We could not send a reset link. Please wait and try again.";
}

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<LoginView>("login");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResetCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resetCooldown]);

  useEffect(() => {
    // Capture the recovery intent before Supabase consumes the URL hash.
    // Without this, a valid recovery link can be mistaken for a normal login
    // session and send the admin straight to the dashboard.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const recoveryFromUrl = hash.get("type") === "recovery";
    const authError = hash.get("error_description");
    let recoveryStarted = recoveryFromUrl;

    queueMicrotask(() => {
      if (recoveryFromUrl) {
        setView("recovery");
        setLoading(false);
      } else if (authError) {
        setError(decodeURIComponent(authError.replace(/\+/g, " ")));
        setLoading(false);
      }
    });

    const client = getSupabaseClient();
    if (!client) return queueMicrotask(() => { setError("Admin service is not configured."); setLoading(false); });
    const { data: listener } = client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryStarted = true;
        setView("recovery");
        setError("");
        setLoading(false);
      }
    });
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setLoading(false);
      if (recoveryStarted) {
        setView("recovery");
        return setLoading(false);
      }
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

  function openForgotPassword() {
    setError("");
    setNotice("");
    setView("forgot");
  }

  function backToLogin() {
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
    setView("login");
  }

  async function sendPasswordLink(event: FormEvent) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client || !email) return setError("Enter the authorized admin email first.");
    if (resetCooldown > 0) {
      return setError("Please use the newest reset email already sent, or wait before requesting another link.");
    }
    setLoading(true); setError(""); setNotice("");
    const { error: resetError } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${appHref("/admin/login/")}` });
    setResetCooldown(RESET_REQUEST_COOLDOWN_SECONDS);
    if (resetError) setError(passwordResetErrorMessage(resetError));
    else {
      setNotice("If this is the authorized admin email, a secure reset link has been sent. Please check the inbox and spam folder.");
      setView("sent");
    }
    setLoading(false);
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    if (password.length < 10) return setError("Use at least 10 characters for the new password.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true); setError("");
    const { data, error: updateError } = await client.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    if (!data.user) { setError("The reset link is invalid or expired. Request a new link."); setLoading(false); return; }
    const { data: admin } = await client.from("admins").select("active").eq("user_id", data.user.id).maybeSingle();
    if (!admin?.active) {
      await client.auth.signOut();
      setError("This account does not have active resort-admin access.");
      setLoading(false);
      return;
    }
    window.history.replaceState(null, "", appHref("/admin/login/"));
    window.location.replace(appHref("/admin/"));
  }

  return <main className="admin-login-page">
    <section className="admin-login-brand" style={{ backgroundImage: `linear-gradient(90deg,#102a1edb,#102a1e7a),url("${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/resort/estate-aerial.webp")` }}><a href={appHref("/")}><span>DS</span> Agro Tourism & Resort</a><div><p>Secure workspace</p><h1>Thoughtful hospitality,<br /><em>carefully managed.</em></h1><small>Bookings, inventory and guest inquiries in one protected space.</small></div></section>
    <section className="admin-login-panel">
      {view === "recovery" && <form onSubmit={savePassword}><p className="eyebrow">Password recovery</p><h2>Create a new password.</h2><p>Your recovery link is verified. Choose a strong password for the authorized resort-admin account.</p><label><span>New password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={10} required /></label><label><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={10} required /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="button button-dark" disabled={loading}>{loading ? "Saving…" : "Save new password"}<b>→</b></button><button type="button" className="admin-reset-link" onClick={openForgotPassword}>Request a new reset link</button></form>}
      {view === "forgot" && <form onSubmit={sendPasswordLink}><p className="eyebrow">Account recovery</p><h2>Forgot password?</h2><p>Enter the authorized admin email. We will send a secure, one-time link for choosing a new password.</p><label><span>Admin email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required autoFocus /></label><p className="admin-reset-help">Request one link, then use the newest email. Repeated requests can temporarily pause email delivery.</p>{error && <p className="admin-error" role="alert">{error}</p>}<button className="button button-dark" disabled={loading || resetCooldown > 0}>{loading ? "Sending…" : resetCooldown > 0 ? `Try again in ${resetCooldown}s` : "Send reset link"}<b>→</b></button><button type="button" className="admin-reset-link" onClick={backToLogin}>← Back to sign in</button></form>}
      {view === "sent" && <div className="admin-login-message"><p className="eyebrow">Check your email</p><h2>Reset link sent.</h2><p className="admin-notice" role="status">{notice}</p><p>Open the latest email and select <strong>Reset password</strong>. The link will return here and show the new-password form.</p><button type="button" className="button button-dark" onClick={backToLogin}>Back to sign in <b>→</b></button></div>}
      {view === "login" && <form onSubmit={login}><p className="eyebrow">Resort administration</p><h2>Welcome back.</h2><p>Sign in with the authorized DS Agro resort-admin account.</p><label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}<button className="button button-dark" disabled={loading}>{loading ? "Checking…" : "Sign in"}<b>→</b></button><button type="button" className="admin-reset-link" onClick={openForgotPassword} disabled={loading}>Forgot password?</button><a href={appHref("/")}>← Back to website</a></form>}
    </section>
  </main>;
}
