import { Zap, Search, Edit3, Globe, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Search,
    title: 'Deep Research',
    desc: 'Our AI analyzes current trends and top-ranking content to find the best angles for your niche.'
  },
  {
    icon: Edit3,
    title: 'SEO Optimized',
    desc: 'Articles are written with natural keyword integration, proper headings, and meta tags.'
  },
  {
    icon: Globe,
    title: 'Multi-CMS Support',
    desc: 'Connect WordPress, Ghost, and Webflow to publish content with a single click.'
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    desc: 'Maintain a consistent posting frequency without ever lifting a finger.'
  },
  {
    icon: BarChart3,
    title: 'Performance Tracking',
    desc: 'Monitor how your AI-generated posts perform in search engines in real-time.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Generate a full 2,000-word SEO-optimized article in less than 30 seconds.'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Platform Features
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Everything you need to <span className="text-primary-500">Scale.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium">
            Powerful tools designed for niche site owners and SEO agencies who value their time and rankings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-10 rounded-[2.5rem] hover:border-primary-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-2xl rounded-full group-hover:bg-primary-500/10 transition-colors" />
              
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <f.icon className="w-8 h-8 text-primary-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-medium group-hover:text-slate-400 transition-colors">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
