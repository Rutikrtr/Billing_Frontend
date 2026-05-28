import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import { loginRestaurant } from '../features/auth/authApi';
import { Eye, EyeOff, ArrowRight, FileText, Fuel, MapPin, Receipt } from 'lucide-react';

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

    const features = [
        { icon: <FileText size={15} />, text: "Per-machine hourly billing & invoicing" },
        { icon: <Fuel size={15} />, text: "Fuel consumption & maintenance logs" },
        { icon: <MapPin size={15} />, text: "Site-wise job tracking & reports" },
        { icon: <Receipt size={15} />, text: "Automated client billing & GST reports" },
    ];


    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Decorative blobs */}
            <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-[#f5a800]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#f5a800]/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-orange-100/40 blur-2xl pointer-events-none" />
            {/* Subtle dot grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #f5a80022 1px, transparent 1px)',
                backgroundSize: '28px 28px'
            }} />
            <Toaster position="top-center" />
            <div className="rounded-3xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row relative z-10 shadow-2xl">

                {/* ── Left Panel — JCB Yellow ── */}
                <div className="lg:w-[420px] flex-shrink-0 bg-[#f5a800] flex flex-col justify-between p-7 relative overflow-hidden">
                    {/* bg circles */}
                    <div className="absolute w-72 h-72 rounded-full bg-black/5 -top-20 -right-20 pointer-events-none" />
                    <div className="absolute w-48 h-48 rounded-full bg-black/5 -bottom-14 -left-10 pointer-events-none" />

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5a800" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 17h1m16 0h1M5 17V9l4-4h6l2 2v10M9 5v4H5"/>
                                    <circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-[#1a1a1a]">BillMaster <span className="text-orange-500 text-lg">2.0</span></h1>
                                <p className="text-xs text-black/45 mt-0.5 tracking-wide">JCB Earthmovers — Operations</p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="mt-5 inline-flex items-center gap-2 bg-black/10 border border-black/10 rounded-full px-3 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" />
                            <span className="text-xs text-black/60">Fleet tracking active</span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-col gap-3 my-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 text-black/60">
                                    {f.icon}
                                </div>
                                <span className="text-sm text-black/65">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer dots */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-black/50 block" />
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20 block" />
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20 block" />
                        </div>
                        <span className="text-xs text-black/30">© 2024 TechyVerve</span>
                    </div>
                </div>

                {/* ── Right Panel — Dark Form ── */}
                <div className="flex-1 bg-[#1a1a1a] flex flex-col justify-center px-10 py-7 relative overflow-hidden">
                    {/* Right side — crosshair decoration */}
                    <div className="absolute right-0 top-0 bottom-0 w-36" style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,0.6) 20%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.6) 20%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', maskComposite: 'intersect', WebkitMaskComposite: 'destination-in' }}>
                        <svg width="144" height="100%" viewBox="0 0 144 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

                            {/* ── Crosshair 1 — tilted ~15° — amber, top ── */}
                            <g transform="translate(55, 105) rotate(15)">
                                <line x1="0" y1="-48" x2="0" y2="48" stroke="#f5a800" strokeOpacity="0.35" strokeWidth="0.75"/>
                                <line x1="-48" y1="0" x2="48" y2="0" stroke="#f5a800" strokeOpacity="0.35" strokeWidth="0.75"/>
                                <rect x="-5" y="-5" width="10" height="10" fill="#1a1a1a"/>
                                <circle cx="0" cy="0" r="3" fill="none" stroke="#f5a800" strokeOpacity="0.7" strokeWidth="1"/>
                                <circle cx="0" cy="0" r="7" fill="none" stroke="#f5a800" strokeOpacity="0.2" strokeWidth="0.75"/>
                                <circle cx="0" cy="0" r="1.2" fill="#f5a800" fillOpacity="0.9"/>
                                <line x1="-9" y1="0" x2="-6" y2="0" stroke="#f5a800" strokeOpacity="0.5" strokeWidth="0.75"/>
                                <line x1="6" y1="0" x2="9" y2="0" stroke="#f5a800" strokeOpacity="0.5" strokeWidth="0.75"/>
                                <line x1="0" y1="-9" x2="0" y2="-6" stroke="#f5a800" strokeOpacity="0.5" strokeWidth="0.75"/>
                                <line x1="0" y1="6" x2="0" y2="9" stroke="#f5a800" strokeOpacity="0.5" strokeWidth="0.75"/>
                            </g>

                            {/* ── Crosshair 2 — tilted ~-20° — white, middle ── */}
                            <g transform="translate(88, 230) rotate(-20)">
                                <line x1="0" y1="-40" x2="0" y2="40" stroke="white" strokeOpacity="0.15" strokeWidth="0.75"/>
                                <line x1="-40" y1="0" x2="40" y2="0" stroke="white" strokeOpacity="0.15" strokeWidth="0.75"/>
                                <rect x="-4" y="-4" width="8" height="8" fill="#1a1a1a"/>
                                <circle cx="0" cy="0" r="2.5" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.75"/>
                                <circle cx="0" cy="0" r="6" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="0.75"/>
                                <circle cx="0" cy="0" r="1" fill="white" fillOpacity="0.35"/>
                                <line x1="-7" y1="0" x2="-5" y2="0" stroke="white" strokeOpacity="0.2" strokeWidth="0.75"/>
                                <line x1="5" y1="0" x2="7" y2="0" stroke="white" strokeOpacity="0.2" strokeWidth="0.75"/>
                                <line x1="0" y1="-7" x2="0" y2="-5" stroke="white" strokeOpacity="0.2" strokeWidth="0.75"/>
                                <line x1="0" y1="5" x2="0" y2="7" stroke="white" strokeOpacity="0.2" strokeWidth="0.75"/>
                            </g>

                            {/* ── Crosshair 3 — tilted ~10° — white faint, bottom ── */}
                            <g transform="translate(40, 345) rotate(10)">
                                <line x1="0" y1="-28" x2="0" y2="28" stroke="white" strokeOpacity="0.07" strokeWidth="0.75"/>
                                <line x1="-28" y1="0" x2="28" y2="0" stroke="white" strokeOpacity="0.07" strokeWidth="0.75"/>
                                <rect x="-3" y="-3" width="6" height="6" fill="#1a1a1a"/>
                                <circle cx="0" cy="0" r="2" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="0.75"/>
                                <circle cx="0" cy="0" r="0.8" fill="white" fillOpacity="0.15"/>
                            </g>

                        </svg>
                    </div>

                    <div className="max-w-xs w-full mx-auto lg:mx-0">

                        {/* Heading */}
                        <div className="mb-5">
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f5a800] block animate-pulse" />
                                <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Operator / Manager</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white leading-tight mb-2">
                                Move earth.
                            </h2>
                            <h2 className="text-3xl font-bold leading-tight mb-3">
                                <span className="text-[#f5a800]">Move business.</span>
                            </h2>
                            <p className="text-sm text-white/30">Sign in to your operations dashboard</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-3">
                            {/* Username */}
                            <div>
                                <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-1.5">
                                    Username
                                </label>
                                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 h-12 focus-within:border-[#f5a800]/50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 flex-shrink-0">
                                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                    </svg>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                        className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-1.5">
                                    Password
                                </label>
                                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 h-12 focus-within:border-[#f5a800]/50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white/25 flex-shrink-0">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-white/25 hover:text-white/50 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#f5a800] hover:bg-[#e09900] rounded-xl flex items-center justify-center gap-2 mt-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                        <span className="text-sm font-medium text-[#1a1a1a]">Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm font-medium text-[#1a1a1a] relative z-10">
                                            Sign in to BillMaster
                                        </span>
                                        <ArrowRight
                                            size={17}
                                            className="text-black/60 relative z-10 transition-all duration-500 ease-in-out group-hover:translate-x-[90px]"
                                        />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Decorative bars */}
                        <div className="mt-6 pt-5 border-t border-white/10">
                            <div className="flex items-end gap-1 h-14">
                                {[30, 50, 40, 70, 45, 85, 55, 65, 40, 75, 50, 90, 60, 45, 80, 35, 65, 55, 70, 42].map((h, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-sm ${[5, 11, 18].includes(i) ? 'bg-[#f5a800]/80' : 'bg-white/10'}`}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;