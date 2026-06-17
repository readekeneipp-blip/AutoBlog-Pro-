import { Rocket, Globe, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-primary-600/20">
                <Rocket className="w-6 h-6 text-white fill-white/20" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">AutoBlog<span className="text-primary-500">Pro</span></span>
            </Link>
            <p className="text-slate-500 max-w-sm text-lg leading-relaxed mb-8">
              The world's most advanced AI content engine for niche site owners. Build authority, scale traffic, and save time.
            </p>
            <div className="flex gap-4">
              {[TwitterPlaceholder, GithubPlaceholder, LinkedinPlaceholder].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-400 hover:border-primary-500/50 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-slate-500 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">API</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="text-slate-500 hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-sm font-medium">
            © {new Date().getFullYear()} AutoBlog Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
            <Globe className="w-4 h-4" />
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const TwitterPlaceholder = Globe;
const GithubPlaceholder = Zap;
const LinkedinPlaceholder = Shield;

export default Footer;
