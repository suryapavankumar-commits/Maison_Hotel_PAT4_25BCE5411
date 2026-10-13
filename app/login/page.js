'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight, BadgeCheck, Building2, Eye, EyeOff, LockKeyhole, Mail,
  Phone, ShieldCheck, Sparkles, UserRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

const emptySignup = {
  fullName: '', email: '', phone: '', hotelName: '', title: '',
  department: '', password: '', confirmPassword: '', acceptedLocalStorage: false,
};

const departments = [
  'Front Office', 'Reservations', 'Housekeeping', 'Finance & Billing',
  'Food & Beverage', 'Maintenance', 'Management', 'Other',
];

function passwordScore(value) {
  if (!value) return { score: 0, label: 'Use 8 or more characters', tone: '' };
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (score <= 1) return { score, label: 'Could be stronger', tone: 'weak' };
  if (score <= 2) return { score, label: 'Getting there', tone: 'medium' };
  return { score, label: 'Strong password', tone: 'strong' };
}

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('admin@maisonhotel.com');
  const [password, setPassword] = useState('Admin@123');
  const [signup, setSignup] = useState(emptySignup);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const strength = useMemo(() => passwordScore(signup.password), [signup.password]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setShowPassword(false);
    setShowConfirm(false);
  }

  function saveSession(user) {
    localStorage.setItem('hotel-auth', 'true');
    localStorage.setItem('hotel-user', JSON.stringify(user));
    router.replace('/dashboard');
  }

  async function submitSignin(event) {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Enter your work email and password to continue.');
      return;
    }
    setBusy(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: normalizedEmail, password }) });
      saveSession(data.user);
    } catch (err) {
      setError(err.message || 'We could not sign you in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    setError('');
    if (signup.password !== signup.confirmPassword) {
      setError('Your passwords do not match. Please check both fields.');
      return;
    }
    if (!signup.acceptedLocalStorage) {
      setError('Please confirm that this demo stores accounts in this browser only.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        fullName: signup.fullName,
        email: signup.email.trim().toLowerCase(),
        phone: signup.phone,
        hotelName: signup.hotelName,
        title: signup.title,
        department: signup.department,
        password: signup.password,
      };
      const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      saveSession(data.user);
    } catch (err) {
      setError(err.message || 'We could not create the account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function changeSignup(field, value) {
    setSignup(current => ({ ...current, [field]: value }));
    if (error) setError('');
  }

  return (
    <main className="login-shell login-shell-refined">
      <section className="login-image">
        <div className="image-topline">
          <span className="brand brand-light">MAISON<span>•</span></span>
          <span className="eyebrow">THE ART OF HOSPITALITY</span>
        </div>
        <div className="image-copy">
          <span className="eyebrow">MAISON HOTEL GROUP</span>
          <h1>Hospitality,<br /><em>beautifully</em><br />managed.</h1>
          <p>A thoughtful space for the people who make every stay feel exceptional — from the first arrival to the final farewell.</p>
        </div>
        <div className="image-bottomline">
          <div><span className="eyebrow">EST. 1987</span><strong>Considered service. Seamless stays.</strong></div>
          <span className="eyebrow">CHENNAI · INDIA</span>
        </div>
        <div className="image-grain" aria-hidden="true" />
      </section>

      <section className="login-panel login-panel-refined">
        <div className="brand brand-dark">MAISON<span>•</span></div>
        <div className="login-content login-content-refined">
          <span className="eyebrow">STAFF PORTAL</span>
          <h2>{mode === 'signin' ? 'Welcome back.' : 'Make yourself at home.'}</h2>
          <p className="muted login-lede">{mode === 'signin' ? "Sign in to manage today's operations." : 'Create your staff profile to get started.'}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
          </div>

          {mode === 'signin' ? (
            <form className="auth-form" onSubmit={submitSignin}>
              <label>Work email
                <span className="auth-input"><Mail size={17} aria-hidden="true" /><input autoComplete="username" type="email" placeholder="you@yourhotel.com" value={email} onChange={e => setEmail(e.target.value)} required /></span>
              </label>
              <label>Password
                <span className="auth-input"><LockKeyhole size={17} aria-hidden="true" /><input autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required /><button className="input-action" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span>
              </label>
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button disabled={busy} className="primary full auth-submit" type="submit">{busy ? <><span className="spinner"/> Signing in…</> : <>Sign in <ArrowRight size={17}/></>}</button>
              <button type="button" className="demo-fill" onClick={() => { setEmail('admin@maisonhotel.com'); setPassword('Admin@123'); setError(''); }}><Sparkles size={15}/> Fill demo credentials</button>
            </form>
          ) : (
            <form className="auth-form signup-form" onSubmit={submitSignup}>
              <div className="signup-intro"><span className="signup-step"><BadgeCheck size={16}/> STAFF PROFILE</span><span>All fields are required</span></div>
              <label>Full name
                <span className="auth-input"><UserRound size={17} aria-hidden="true"/><input autoComplete="name" type="text" placeholder="e.g. Ananya Rao" value={signup.fullName} onChange={e => changeSignup('fullName', e.target.value)} minLength={2} maxLength={80} required /></span>
              </label>
              <div className="auth-field-grid">
                <label>Work email
                  <span className="auth-input"><Mail size={17} aria-hidden="true"/><input autoComplete="email" type="email" placeholder="name@hotel.com" value={signup.email} onChange={e => changeSignup('email', e.target.value)} maxLength={120} required /></span>
                </label>
                <label>Phone number
                  <span className="auth-input"><Phone size={17} aria-hidden="true"/><input autoComplete="tel" type="tel" inputMode="tel" placeholder="+91 98765 43210" value={signup.phone} onChange={e => changeSignup('phone', e.target.value)} maxLength={22} required /></span>
                </label>
              </div>
              <label>Hotel or property name
                <span className="auth-input"><Building2 size={17} aria-hidden="true"/><input autoComplete="organization" type="text" placeholder="e.g. Maison Chennai" value={signup.hotelName} onChange={e => changeSignup('hotelName', e.target.value)} maxLength={100} required /></span>
              </label>
              <div className="auth-field-grid">
                <label>Job title
                  <input className="auth-select" autoComplete="organization-title" type="text" placeholder="e.g. Front Desk Executive" value={signup.title} onChange={e => changeSignup('title', e.target.value)} maxLength={80} required />
                </label>
                <label>Department
                  <select className="auth-select" value={signup.department} onChange={e => changeSignup('department', e.target.value)} required>
                    <option value="">Select department</option>{departments.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              <label>Create password
                <span className="auth-input"><LockKeyhole size={17} aria-hidden="true"/><input autoComplete="new-password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={signup.password} onChange={e => changeSignup('password', e.target.value)} minLength={8} required /><button className="input-action" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span>
                <span className={`password-strength ${strength.tone}`} aria-live="polite"><i><b style={{ width: `${strength.score * 25}%` }}/></i><small>{strength.label}</small></span>
                <small className="field-hint">Use at least 8 characters, including a letter and a number.</small>
              </label>
              <label>Confirm password
                <span className="auth-input"><LockKeyhole size={17} aria-hidden="true"/><input autoComplete="new-password" type={showConfirm ? 'text' : 'password'} placeholder="Enter your password again" value={signup.confirmPassword} onChange={e => changeSignup('confirmPassword', e.target.value)} minLength={8} required /><button className="input-action" type="button" aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirm(v => !v)}>{showConfirm ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span>
                {signup.confirmPassword && <small className={signup.password === signup.confirmPassword ? 'match-hint' : 'mismatch-hint'}>{signup.password === signup.confirmPassword ? 'Passwords match' : 'Passwords do not match yet'}</small>}
              </label>
              <label className="local-data-consent"><input type="checkbox" checked={signup.acceptedLocalStorage} onChange={e => changeSignup('acceptedLocalStorage', e.target.checked)} required/><span>I understand this is a local demo. My account is saved in this browser only, not in a shared hotel database.</span></label>
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button disabled={busy} className="primary full auth-submit" type="submit">{busy ? <><span className="spinner"/> Creating account…</> : <>Create account <ArrowRight size={17}/></>}</button>
              <div className="signup-security"><ShieldCheck size={16}/><span>Your password is hashed before it is saved locally. This demo is not a substitute for production authentication.</span></div>
            </form>
          )}
        </div>
        <div className="login-foot"><span>© 2026 Maison Hotel Group</span><span>·</span><span>Made for better stays</span></div>
      </section>
    </main>
  );
}
