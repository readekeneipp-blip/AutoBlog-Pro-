import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Rocket, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-40 overflow-hidden grid-pattern">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 mesh-gradient">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-primary-400 text-sm font-bold mb-8 shadow-xl shadow-primary-500/5">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
            <span className="uppercase tracking-wider">Now with GPT-4 & Gemini Pro</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Build Authority While <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-indigo-500">
              You Sleep.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            The <span className="text-white">Set-and-Forget</span> AI engine that researches, writes, and auto-publishes SEO-optimized articles to your sites.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/signup" 
              className="btn-primary w-full sm:w-auto px-10 py-6 rounded-2xl text-xl inline-flex items-center justify-center gap-3 group"
            >
              Start Your Free Trial <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="btn-secondary w-full sm:w-auto px-10 py-6 rounded-2xl text-xl inline-flex items-center justify-center gap-2"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
             {[
               { icon: Shield, label: 'SEO Protected' },
               { icon: Zap, label: 'Instant Gen' },
               { icon: Rocket, label: 'Auto Pilot' },
               { icon: CheckCircle, label: '100% Reliable' }
             ].map((item, i) => (
               <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-center gap-2 font-bold text-lg hover:opacity-100 transition-opacity cursor-default"
               >
                 <item.icon className="w-5 h-5 text-primary-500" />
                 <span className="uppercase tracking-widest text-sm">{item.label}</span>
               </motion.div>
             ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
