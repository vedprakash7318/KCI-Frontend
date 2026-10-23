import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Dark green — primary brand color (Pharmacy-style)
const GREEN = '#1a4731';
const GREEN_BTN = '#1e5c3a';
const GREEN_HOVER = '#163d2a';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorModal, setErrorModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, 'admin');
      if (user.role !== 'admin') {
        toast.error('Access denied. Admins only.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
    } catch {
      setErrorModal(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: '#eef2ff' }}>

      {/* ── Dark green top section (upper ~38% of viewport) ── */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '42vh',
          minHeight: '220px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #2563eb 100%)',
          borderBottomLeftRadius: '40px',
          borderBottomRightRadius: '40px',
        }}
      >
        {/* Subtle texture dots */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            borderBottomLeftRadius: '40px',
            borderBottomRightRadius: '40px',
          }}
        />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-10 px-4 pb-10">

        {/* Institute name above card (in green zone) */}
        <div className="text-center mb-6">
          <p className="text-green-300/70 text-xs font-semibold tracking-[0.25em] uppercase">
            Keerti Computer Institute
          </p>
        </div>

        {/* ── Login Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full"
          style={{ maxWidth: '390px' }}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
            }}
          >
            {/* ── Card top: Logo + branding ── */}
            <div className="flex flex-col items-center pt-8 pb-6 px-8">

              {/* Logo circle */}
              <div className="relative mb-4">
                <div
                  className="w-[78px] h-[78px] rounded-full overflow-hidden border-4 border-white"
                  style={{ boxShadow: '0 4px 20px rgba(26,71,49,0.25)' }}
                >
                  <img src="/logo.png" alt="KCI Logo" className="w-full h-full object-cover" />
                </div>
                <span
                  className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-white"
                  style={{ background: '#22c55e' }}
                />
              </div>

              {/* Institute name */}
              <div className="text-center mb-1">
                <div className="font-black text-xl tracking-widest leading-none" style={{ color: GREEN }}>
                  KEERTI
                </div>
                <div className="text-[10px] font-bold tracking-[0.22em] mt-0.5" style={{ color: '#4a7c5e' }}>
                  COMPUTER INSTITUTE
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-slate-100 my-4" />

              {/* Portal title */}
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4" style={{ color: GREEN }} />
                <h1 className="text-base font-black text-slate-800">Admin Portal</h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium text-center">
                Restricted access — authorized personnel only
              </p>
            </div>

            {/* ── Form section ── */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-0.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value.trim() }))}
                      placeholder="admin@kci.org.in"
                      className="w-full h-12 pl-10 pr-4 text-sm font-medium text-slate-800 rounded-xl outline-none transition-all placeholder:text-slate-300"
                      style={{
                        background: '#f0f5f2',
                        border: '1.5px solid #e2ece7',
                      }}
                      onFocus={e => { e.target.style.border = `1.5px solid ${GREEN}`; e.target.style.boxShadow = `0 0 0 3px rgba(26,71,49,0.08)`; }}
                      onBlur={e => { e.target.style.border = '1.5px solid #e2ece7'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-0.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full h-12 pl-10 pr-11 text-sm font-medium text-slate-800 rounded-xl outline-none transition-all placeholder:text-slate-300"
                      style={{
                        background: '#f0f5f2',
                        border: '1.5px solid #e2ece7',
                      }}
                      onFocus={e => { e.target.style.border = `1.5px solid ${GREEN}`; e.target.style.boxShadow = `0 0 0 3px rgba(26,71,49,0.08)`; }}
                      onBlur={e => { e.target.style.border = '1.5px solid #e2ece7'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: GREEN }}
                    />
                    <span className="text-xs font-medium text-slate-500">Keep Admin Session Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.error('Contact your system administrator for password reset.')}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: GREEN }}
                    onMouseEnter={e => e.target.style.color = GREEN_HOVER}
                    onMouseLeave={e => e.target.style.color = GREEN}
                  >
                    Forgot?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-1"
                  style={{ background: GREEN_BTN }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = GREEN_HOVER; }}
                  onMouseLeave={e => { e.currentTarget.style.background = GREEN_BTN; }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Enter Admin Portal <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Security footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: GREEN }} />
                <span className="text-[10px] font-semibold text-slate-400 text-center">
                  Authorized KCI Staff Portal • Secure Access
                </span>
              </div>
            </div>
          </div>

          {/* Footer below card */}
          <p className="text-center text-[11px] text-slate-400 font-medium mt-5">
            © {new Date().getFullYear()} Keerti Computer Institute. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {errorModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Invalid credentials or unauthorized access</span>
            <button onClick={() => setErrorModal(false)} className="ml-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
