import React, {useEffect, useState} from 'react';
import {ArrowLeft, ArrowRight, Check, Eye, EyeOff, ShieldCheck} from 'lucide-react';
import {useDialog} from '../../components/common/useDialog';
import {useNavigationStore} from '../../store/useNavigationStore';
import {useAuthStore} from '../../store/useAuthStore';
import './entry.css';

/** Dedicated auth screen retaining the existing navigation and demo-service contracts. */
export const AuthModal: React.FC = () => {
  const {isAuthModalOpen, openAuthModal, authModalMode, setTab, openDisclaimer} = useNavigationStore();
  const {authenticate, verifyOtp, isLoading} = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const close = () => {if (!isLoading && !success) openAuthModal(false);};
  const dialog = useDialog(isAuthModalOpen, close);
  const signup = authModalMode === 'signup';

  useEffect(() => {
    setStep(authModalMode === 'otp' ? 'otp' : 'credentials');
    setError(''); setSuccess(false); setPassword(''); setShowPassword(false);
  }, [isAuthModalOpen, authModalMode]);
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {setTab('home'); openAuthModal(false); openDisclaimer(true);}, 500);
    return () => clearTimeout(timer);
  }, [success, setTab, openAuthModal, openDisclaimer]);

  if (!isAuthModalOpen) return null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading || success) return;
    setError('');
    try {
      if (step === 'otp') await verifyOtp(email.trim(), otp);
      else await authenticate(email.trim(), password, signup ? 'signup' : 'login');
      setPassword(''); setSuccess(true);
    } catch (reason) {setError(reason instanceof Error ? reason.message : 'The demo could not open. Please try again.');}
  };

  return <div className="auth-screen" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <button className="auth-back text-button" onClick={close} disabled={isLoading || success}><ArrowLeft size={17}/> Back to MAITRI</button>
    <div className="auth-editorial" aria-hidden="true">
      <span className="eyebrow">A LITTLE ROOM TO BEGIN AGAIN</span><h2>Come as<br/>you <em>are.</em></h2>
      <p>A quiet corner for your thoughts.<br/>A little movement. A gentler rhythm.</p>
      <img src="/assets/companion-avatar.webp" alt="" className="auth-mascot"/><span className="auth-editorial-note">Your pace. Your space.</span>
    </div>
    <section className="auth-form-card">
      <span className="eyebrow">YOUR PERSONAL SANCTUARY</span><h1 id="auth-title">{step === 'otp' ? 'A small step inside.' : signup ? 'Make room for you.' : 'Welcome back.'}</h1>
      <p>{step === 'otp' ? 'Use any six digits to explore the local demo.' : signup ? 'Create a profile for this browser and explore at your own pace.' : 'Open your local workspace and pick up where you left off.'}</p>
      <div className="auth-demo-note"><ShieldCheck size={18}/><span><strong>Frontend demo</strong> — use a made-up password. It is checked for length, then discarded. No secure account is created and no email is sent.</span></div>
      <form onSubmit={submit} className="auth-form">
        <label htmlFor="auth-email">Email address</label><input id="auth-email" aria-label="Email address" className="input-field" type="email" required autoComplete="email" placeholder="you@example.com" value={email} disabled={isLoading || success} onChange={e => setEmail(e.target.value)}/>
        {step === 'credentials' ? <>
          <label htmlFor="auth-password">Demo password <span>At least 8 characters</span></label>
          <div className="auth-password-field"><input id="auth-password" className="input-field" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} value={password} disabled={isLoading || success} onChange={e => setPassword(e.target.value)} aria-describedby="auth-password-note"/><button type="button" className="btn btn-icon" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          <small id="auth-password-note">Any made-up password of 8+ characters works in this demo. Never use a real password here.</small>
        </> : <><label htmlFor="auth-code">Six-digit demo code</label><input id="auth-code" className="input-field mono" aria-label="Six-digit demo code" inputMode="numeric" pattern="[0-9]{6}" required minLength={6} maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} disabled={isLoading || success}/><small>Example: 123456. This does not verify your email.</small></>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={isLoading || success} type="submit">{success ? <><Check size={18}/> Your demo is ready</> : isLoading ? 'Opening your sanctuary…' : <>{step === 'otp' ? 'Verify & Enter Sanctuary' : signup ? 'Create demo profile' : 'Log In to demo'}<ArrowRight size={17}/></>}</button>
        <span className="sr-only" role="status">{success ? 'Your demo session is ready.' : isLoading ? 'Opening demo session.' : ''}</span>
      </form>
      <div className="auth-alternatives">
        {step === 'credentials' ? <button className="text-button" disabled={isLoading || success} onClick={() => {if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {setError('Enter an email address first.');return;} setError('');setPassword('');setStep('otp');}}>Continue with demo code</button> : <button className="text-button" onClick={() => {setStep('credentials');setError('');}} disabled={isLoading || success}>Use a demo password instead</button>}
        <p>{signup ? 'Already have a local profile?' : 'Your first visit?'} <button className="text-button" onClick={() => openAuthModal(true, signup ? 'login' : 'signup')} disabled={isLoading || success}>{signup ? 'Log In' : 'Sign Up'}</button></p>
      </div>
    </section>
  </div>;
};
