import { useState, useEffect } from 'react';
import { 
  Zap, PenTool,
  LayoutDashboard, Settings, Loader2, Calendar,
  CreditCard, BarChart3, Globe, Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Modular Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import PostEditor from './components/PostEditor';
import Analytics from './components/Analytics';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

// --- Auth Utilities ---
const getAuthToken = () => localStorage.getItem('token');
const setAuthToken = (token: string) => localStorage.setItem('token', token);
const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// --- Auth Pages ---
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      setAuthToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) { alert('Login failed'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-500/20">
            <PenTool className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8">Login to manage your AI blog engine</p>
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-primary-500 transition-colors" />
          <input type="password" placeholder="Password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-primary-500 transition-colors" />
        </div>
        <button className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 mt-4">Sign In</button>
        <p className="text-center text-slate-500 mt-6">Don't have an account? <Link to="/signup" className="text-primary-400 font-semibold">Sign Up</Link></p>
      </form>
    </div>
  );
};

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, { email, password, name });
      setAuthToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) { alert('Signup failed'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSignup} className="bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-500/20">
            <Rocket className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white text-center">Start Your Journey</h2>
        <p className="text-slate-500 text-center mb-8">Create your AutoBlog Pro account</p>
        <div className="space-y-4">
          <input placeholder="Full Name" required value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-primary-500 transition-colors" />
          <input placeholder="Email Address" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-primary-500 transition-colors" />
          <input type="password" placeholder="Password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-primary-500 transition-colors" />
        </div>
        <button className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 mt-4">Create Account</button>
        <p className="text-center text-slate-500 mt-6">Already have an account? <Link to="/login" className="text-primary-400 font-semibold">Log In</Link></p>
      </form>
    </div>
  );
};

// --- Dashboard ---
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [schedules, setSchedules] = useState([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchSchedules = async () => {
    try {
      const token = getAuthToken();
      const res = await axios.get(`${API_BASE}/schedules`, { headers: { Authorization: `Bearer ${token}` } });
      setSchedules(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      const token = getAuthToken();
      axios.post(`${API_BASE}/stripe/webhook-mock`, { plan }, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          const updatedUser = { ...user, subscription: plan };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          navigate('/dashboard', { replace: true });
        });
    }
    fetchSchedules();
  }, [searchParams, navigate]);

  useEffect(() => {
    if (user.cms) {
      if (user.cms.wordpress) setCmsConfig(user.cms.wordpress);
      if (user.cms.ghost) setGhostConfig(user.cms.ghost);
      if (user.cms.webflow) setWebflowConfig(user.cms.webflow);
    }
  }, [user]);

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await axios.post(`${API_BASE}/generate`, { topic, niche, keywords: keywords.split(',') }, { headers: { Authorization: `Bearer ${token}` } });
      setContent(res.data.content);
    } catch (err) { alert('Failed'); }
    finally { setLoading(false); }
  };

  const handleSchedule = async () => {
    if (!scheduleTime) return alert('Select a time');
    try {
      const token = getAuthToken();
      await axios.post(`${API_BASE}/schedule`, { title: topic, content, scheduledTime: scheduleTime, type: selectedCms }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Post Scheduled!');
      fetchSchedules();
      setActiveTab('schedules');
    } catch (e) { alert('Failed to schedule'); }
  };

  const handleUpgrade = async (plan: string) => {
    const token = getAuthToken();
    const res = await axios.post(`${API_BASE}/stripe/create-checkout`, { plan }, { headers: { Authorization: `Bearer ${token}` } });
    window.location.href = res.data.url;
  };

  const [selectedCms, setSelectedCms] = useState('wordpress');
  const [cmsConfig, setCmsConfig] = useState({ url: '', username: '', password: '' });
  const [ghostConfig, setGhostConfig] = useState({ url: '', adminKey: '' });
  const [webflowConfig, setWebflowConfig] = useState({ accessToken: '', collectionId: '', contentField: 'post-body' });

  const saveCMS = async (type: string, config: any) => {
    try {
      const token = getAuthToken();
      await axios.post(`${API_BASE}/user/cms`, { type, config }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`${type.toUpperCase()} Settings Saved`);
    } catch (err) { alert('Failed to save settings'); }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-primary-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-24 px-10 flex justify-between items-center bg-slate-950/50 backdrop-blur-xl border-b border-slate-900 sticky top-0 z-30 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
              {activeTab === 'dashboard' ? <Zap className="text-primary-500 fill-primary-500/20" /> : 
               activeTab === 'schedules' ? <Calendar className="text-primary-500" /> :
               activeTab === 'analytics' ? <BarChart3 className="text-primary-500" /> :
               activeTab === 'billing' ? <CreditCard className="text-primary-500" /> :
               <Settings className="text-primary-500" />}
              {activeTab}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Plan:</span>
              <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase border border-primary-500/20">{user.subscription}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-white font-bold text-sm tracking-tight">{user.name}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.email}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-primary-500/20 border border-white/10 text-xl">
              {user.name?.[0]}
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <LayoutDashboard className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="grid lg:grid-cols-5 gap-10 h-full max-w-[1600px] mx-auto">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary-600/10 transition-colors duration-700" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Configuration</h3>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-3 px-1">Target Topic</label>
                      <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. The Future of AI" className="w-full p-4 rounded-2xl bg-slate-800/50 text-white outline-none border border-slate-700 focus:border-primary-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600 font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-3 px-1">Niche</label>
                        <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. Technology" className="w-full p-4 rounded-2xl bg-slate-800/50 text-white outline-none border border-slate-700 focus:border-primary-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600 font-medium" />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-3 px-1">Target CMS</label>
                        <select value={selectedCms} onChange={e=>setSelectedCms(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-800/50 text-white outline-none border border-slate-700 focus:border-primary-500/50 focus:bg-slate-800 transition-all appearance-none cursor-pointer font-medium uppercase text-xs tracking-widest">
                          <option value="wordpress">WordPress</option>
                          <option value="ghost">Ghost</option>
                          <option value="webflow">Webflow</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-3 px-1">Focus Keywords</label>
                      <input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="comma separated..." className="w-full p-4 rounded-2xl bg-slate-800/50 text-white outline-none border border-slate-700 focus:border-primary-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600 font-medium" />
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 group/btn text-sm"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Zap className="w-5 h-5 group-hover/btn:scale-125 transition-transform fill-white/20"/>} 
                    {loading ? 'AI Engine Running...' : 'Generate Authority Post'}
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-600 to-primary-700 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden shadow-primary-900/20 group">
                   <div className="relative z-10">
                     <h4 className="text-xl font-black mb-3 uppercase tracking-widest">Expert Tip</h4>
                     <p className="text-primary-100 text-lg leading-relaxed font-medium">
                       "Detailed keywords help the AI narrow down the specific search intent, leading to <span className="text-white font-bold underline decoration-primary-300">higher ranking potential.</span>"
                     </p>
                   </div>
                   <Zap className="absolute bottom-[-40px] right-[-40px] w-48 h-48 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                </div>
              </div>
              
              <div className="lg:col-span-3 h-full min-h-[700px] flex flex-col">
                <PostEditor 
                  content={content}
                  setContent={setContent}
                  topic={topic}
                  keywords={keywords}
                  scheduleTime={scheduleTime}
                  setScheduleTime={setScheduleTime}
                  handleSchedule={handleSchedule}
                />
              </div>
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="max-w-6xl space-y-10 mx-auto">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">Publishing Queue</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-tighter">Manage your automated content distribution pipeline</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-2 rounded-full text-primary-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  {schedules.length} Active Items
                </div>
              </div>
              <div className="grid gap-6">
                {schedules.map((s: any) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={s.id} 
                    className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-all hover:bg-slate-900/80 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex items-center gap-8 relative z-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-3 ${s.status==='published'?'bg-green-500/10 text-green-500':'bg-yellow-500/10 text-yellow-500'}`}>
                        <Globe className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl tracking-tight group-hover:text-primary-400 transition-colors">{s.title}</h3>
                        <div className="flex items-center gap-6 mt-2">
                          <p className="text-slate-500 text-xs flex items-center gap-2 font-black uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5 text-primary-500" />
                            {new Date(s.scheduledTime).toLocaleString()}
                          </p>
                          <div className="w-1 h-1 rounded-full bg-slate-800" />
                          <p className="text-slate-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-indigo-500" />
                            {s.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border relative z-10 transition-all ${
                      s.status==='published'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                        : s.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    }`}>
                      {s.status}
                    </div>
                  </motion.div>
                ))}
                {schedules.length === 0 && (
                  <div className="py-32 text-center bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 shadow-xl">
                      <Calendar className="w-10 h-10 text-slate-700" />
                    </div>
                    <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Queue Empty</p>
                    <p className="text-slate-600 mt-2 mb-8 font-medium">Your automated publishing pipeline is currently inactive.</p>
                    <button onClick={()=>setActiveTab('dashboard')} className="btn-primary px-10 py-4 rounded-2xl text-sm uppercase tracking-widest">Generate Your First Post</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Analytics schedules={schedules} />
          )}

          {activeTab === 'billing' && (
            <Pricing onUpgrade={handleUpgrade} currentPlan={user.subscription} />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl text-white space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary-600/10">
                      <Zap className="w-5 h-5 text-primary-400" />
                    </div>
                    <h2 className="text-xl font-bold">WordPress</h2>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Site URL</label><input placeholder="https://myblog.com" value={cmsConfig.url} onChange={e=>setCmsConfig({...cmsConfig, url: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-primary-500/50 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Username</label><input value={cmsConfig.username} onChange={e=>setCmsConfig({...cmsConfig, username: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-primary-500/50 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">App Password</label><input type="password" value={cmsConfig.password} onChange={e=>setCmsConfig({...cmsConfig, password: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-primary-500/50 transition-all" /></div>
                  </div>
                  <button onClick={()=>saveCMS('wordpress', cmsConfig)} className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20">Save Configuration</button>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-600/10">
                      <Globe className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold">Ghost CMS</h2>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Site URL</label><input placeholder="https://myghost.com" value={ghostConfig.url} onChange={e=>setGhostConfig({...ghostConfig, url: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-indigo-500/50 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Admin API Key</label><input placeholder="id:secret" value={ghostConfig.adminKey} onChange={e=>setGhostConfig({...ghostConfig, adminKey: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-indigo-500/50 transition-all" /></div>
                  </div>
                  <button onClick={()=>saveCMS('ghost', ghostConfig)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">Save Configuration</button>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl space-y-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-600/10">
                      <LayoutDashboard className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold">Webflow Data API</h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">API Access Token</label><input type="password" value={webflowConfig.accessToken} onChange={e=>setWebflowConfig({...webflowConfig, accessToken: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-blue-500/50 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Collection ID</label><input value={webflowConfig.collectionId} onChange={e=>setWebflowConfig({...webflowConfig, collectionId: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-blue-500/50 transition-all" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Content Field</label><input placeholder="post-body" value={webflowConfig.contentField} onChange={e=>setWebflowConfig({...webflowConfig, contentField: e.target.value})} className="w-full p-4 rounded-xl border bg-slate-800/50 border-slate-700 text-white outline-none focus:border-blue-500/50 transition-all" /></div>
                  </div>
                  <button onClick={()=>saveCMS('webflow', webflowConfig)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">Save Webflow Configuration</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- App ---
const Landing = () => (
  <div className="bg-slate-950 min-h-screen">
    <Navbar />
    <Hero />
    <Features />
    <Pricing />
    <Footer />
  </div>
);

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
export default App;
