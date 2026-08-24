import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import { loginRestaurant } from '../features/auth/authApi';
import { Eye, EyeOff, User, Lock, Power, FileText, Fuel, MapPin, Receipt } from 'lucide-react';

// Add this once to your index.html <head> (or a global stylesheet) instead of
// re-fetching it on every render:
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">

const legend = [
    { n: '01', icon: FileText, label: 'Per-machine hourly billing' },
    { n: '02', icon: Fuel, label: 'Fuel & maintenance logs' },
    { n: '03', icon: MapPin, label: 'Site-wise job tracking' },
    { n: '04', icon: Receipt, label: 'Automated GST invoicing' },
];

const HazardStrip = ({ className = '' }) => (
    <div
        className={`h-[6px] w-full ${className}`}
        style={{
            backgroundImage:
                'repeating-linear-gradient(135deg, #FDB813 0px, #FDB813 10px, #15171A 10px, #15171A 20px)',
        }}
    />
);

const ExcavatorDiagram = () => (
    <svg viewBox="0 0 340 210" className="w-full h-auto">
        <g stroke="#3A3E3F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* dimension baseline */}
            <line x1="20" y1="188" x2="320" y2="188" strokeDasharray="2 4" strokeWidth="1" stroke="#8A8470" />
            {[20, 60, 100, 140, 180, 220, 260, 300, 320].map((x) => (
                <line key={x} x1={x} y1="184" x2={x} y2="192" strokeWidth="1" stroke="#8A8470" />
            ))}

            {/* tracks */}
            <rect x="58" y="142" width="150" height="18" rx="9" fill="#E9E4D6" />
            <circle cx="75" cy="151" r="9" />
            <circle cx="112" cy="151" r="5" />
            <circle cx="150" cy="151" r="5" />
            <circle cx="188" cy="151" r="9" />

            {/* undercarriage frame */}
            <rect x="88" y="120" width="72" height="24" rx="3" fill="#E9E4D6" />

            {/* cab */}
            <rect x="93" y="86" width="52" height="36" rx="4" fill="#E9E4D6" />
            <rect x="99" y="93" width="24" height="20" rx="2" fill="#FDB813" fillOpacity="0.4" />

            {/* engine housing */}
            <rect x="148" y="100" width="42" height="22" rx="3" fill="#E9E4D6" />
            <rect x="183" y="88" width="6" height="14" rx="1" fill="#E9E4D6" />

            {/* boom / stick / bucket */}
            <path d="M150,100 C164,68 184,52 206,48" />
            <path d="M206,48 C222,62 232,72 238,80" />
            <path d="M238,80 L252,98 L232,104 L228,88 Z" fill="#E9E4D6" />

            {/* leader lines to badges */}
            <line x1="118" y1="86" x2="112" y2="66" strokeDasharray="2 3" strokeWidth="1" />
            <line x1="169" y1="100" x2="176" y2="72" strokeDasharray="2 3" strokeWidth="1" />
            <line x1="90" y1="142" x2="72" y2="176" strokeDasharray="2 3" strokeWidth="1" />
            <line x1="240" y1="86" x2="258" y2="60" strokeDasharray="2 3" strokeWidth="1" />
        </g>

        {[
            { x: 112, y: 60, n: '1' },
            { x: 176, y: 66, n: '2' },
            { x: 72, y: 182, n: '3' },
            { x: 258, y: 54, n: '4' },
        ].map((b) => (
            <g key={b.n} transform={`translate(${b.x},${b.y})`}>
                <circle r="9" fill="#15171A" stroke="#FDB813" strokeWidth="1.5" />
                <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="'IBM Plex Mono', monospace"
                    fontSize="9"
                    fontWeight="600"
                    fill="#FDB813"
                >
                    {b.n}
                </text>
            </g>
        ))}
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    // Redirect to /home if already logged in
    if (user) {
        return <Navigate to="/home" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginRestaurant(username, password);
            dispatch(loginSuccess(data));
            toast.success("Login successful");
            navigate("/home", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6" style={{ background: '#0F1013' }}>
            <Toaster position="top-center" />
            <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/5">

                {/* ── LEFT — Service manual / spec sheet ── */}
                <div
                    className="hidden lg:flex lg:w-[400px] flex-shrink-0 flex-col justify-between p-8 relative"
                    style={{ background: '#E9E4D6' }}
                >
                    <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
                        backgroundImage: 'linear-gradient(#3A3E3F11 1px, transparent 1px), linear-gradient(90deg, #3A3E3F11 1px, transparent 1px)',
                        backgroundSize: '18px 18px',
                    }} />

                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#15171A' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FDB813" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 17h1m16 0h1M5 17V9l4-4h6l2 2v10M9 5v4H5" />
                                    <circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" />
                                </svg>
                            </div>
                            <div>
                                <h1 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-xl font-semibold tracking-tight text-[#15171A]">
                                    BILLMASTER <span style={{ color: '#B8792F' }}>3.0</span>
                                </h1>
                                <p style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] tracking-[0.15em] text-[#5B5642] mt-0.5">
                                    SERVICE MANUAL — OPERATIONS
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 border" style={{ borderColor: '#3A3E3F33', background: '#15171A0D' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block" />
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] tracking-wide text-[#5B5642]">FLEET TRACKING — ONLINE</span>
                        </div>
                    </div>

                    <div className="relative my-4">
                        <ExcavatorDiagram />
                        <p style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[9px] tracking-[0.15em] text-[#8A8470] mt-1">
                            FIG. 01 — UNIT OVERVIEW
                        </p>
                    </div>

                    <div className="relative space-y-2.5">
                        {legend.map((item) => (
                            <div key={item.n} className="flex items-center gap-3">
                                <span
                                    style={{ fontFamily: "'IBM Plex Mono', monospace", background: '#15171A' }}
                                    className="w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-semibold text-[#FDB813] flex-shrink-0"
                                >
                                    {item.n}
                                </span>
                                <item.icon size={13} className="text-[#5B5642] flex-shrink-0" />
                                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-[12.5px] text-[#3A3630] leading-tight">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="relative pt-4 mt-2 border-t flex items-center justify-between" style={{ borderColor: '#3A3E3F22' }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[9px] tracking-widest text-[#8A8470]">REF. BM-3.0 / JCB</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[9px] tracking-widest text-[#8A8470]">© 2024 TECHYVERVE</span>
                    </div>
                </div>

                {/* ── RIGHT — Operator console ── */}
                <div className="flex-1 relative flex flex-col" style={{ background: '#15171A' }}>
                    <HazardStrip />
                    <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
                        <div className="max-w-xs w-full mx-auto lg:mx-0">

                            <div className="mb-7">
                                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-white/10 bg-white/[0.04]">
                                    <span className="w-1.5 h-1.5 rounded-full block animate-pulse" style={{ background: '#FDB813' }} />
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] tracking-[0.2em] text-white/40">OPERATOR SIGN-IN</span>
                                </div>
                                <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-[32px] leading-[1.05] font-semibold text-white">
                                    Start your shift.
                                </h2>
                                <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-[32px] leading-[1.05] font-semibold mb-3">
                                    <span style={{ color: '#FDB813' }}>Track every hour.</span>
                                </h2>
                                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-white/35">Sign in to your operations console.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="block text-[10px] tracking-[0.2em] text-white/35 mb-1.5">
                                        OPERATOR ID
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-lg px-3.5 h-12 focus-within:border-[#FDB813]/50 transition-colors" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)' }}>
                                        <User size={16} className="text-white/25 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                            required
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="block text-[10px] tracking-[0.2em] text-white/35 mb-1.5">
                                        ACCESS CODE
                                    </label>
                                    <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-lg px-3.5 h-12 focus-within:border-[#FDB813]/50 transition-colors" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)' }}>
                                        <Lock size={16} className="text-white/25 flex-shrink-0" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-white/25 hover:text-white/55 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB813]/60 rounded"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Ignition switch submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 mt-1 rounded-full relative overflow-hidden group disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB813]/60"
                                    style={{ background: '#0E1013', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)' }}
                                >
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="absolute left-16 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.2em] text-white/30">
                                        {loading ? 'STARTING ENGINE…' : 'IGNITION — TURN TO START'}
                                    </span>
                                    <span
                                        className={`absolute top-1 left-1 w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-500 ease-out ${loading ? 'animate-pulse' : 'group-hover:translate-x-[calc(100%+2px)]'}`}
                                        style={{ background: '#FDB813', boxShadow: '0 2px 8px rgba(253,184,19,0.35)' }}
                                    >
                                        <Power size={18} className="text-[#15171A]" strokeWidth={2.25} />
                                    </span>
                                </button>
                            </form>

                            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[9px] tracking-[0.15em] text-white/25">SYS // AUTH-SECURE</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 block" />
                                    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[9px] tracking-[0.15em] text-white/25">CONNECTED</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <HazardStrip className="opacity-40" />
                </div>

            </div>
        </div>
    );
};

export default Login;
