import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-primary-600/20">
            <Rocket className="w-7 h-7 text-white fill-white/20" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">AutoBlog<span className="text-primary-500">Pro</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-12">
          <a href="#features" className="text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors">Features</a>
          <a href="#pricing" className="text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors">Pricing</a>
          <Link to="/login" className="text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors">Sign In</Link>
          <Link to="/signup" className="btn-primary px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider">
            Start Free
          </Link>
        </div>

        <button 
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-900 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 font-bold uppercase tracking-widest">Features</a>
          <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 font-bold uppercase tracking-widest">Pricing</a>
          <Link to="/login" className="text-slate-400 font-bold uppercase tracking-widest">Sign In</Link>
          <Link to="/signup" className="btn-primary w-full py-4 rounded-xl text-center font-black uppercase tracking-wider">
            Start Free
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
