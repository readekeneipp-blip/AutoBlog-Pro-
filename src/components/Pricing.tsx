import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    price: '49',
    desc: 'Perfect for small niche sites.',
    features: ['10 articles / month', '1 site connection', 'SEO Optimization', 'WordPress Export', 'Standard Support'],
    buttonText: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Growth',
    price: '149',
    desc: 'Ideal for growing portfolios.',
    features: ['50 articles / month', '5 site connections', 'Advanced Scheduling', 'Priority AI Models', 'Premium Support'],
    buttonText: 'Get Started',
    popular: true
  },
  {
    name: 'Scale',
    price: '299',
    desc: 'For agencies and power users.',
    features: ['Unlimited articles', 'Unlimited sites', 'White-labeling', 'API Access', 'SEO Strategy Analysis'],
    buttonText: 'Contact Sales',
    popular: false
  }
];

interface PricingProps {
  onUpgrade?: (plan: string) => void;
  currentPlan?: string;
}

const Pricing = ({ onUpgrade, currentPlan }: PricingProps) => {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Flexible Plans
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Simple, Transparent <span className="text-primary-500">Pricing.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium">
            Choose the plan that fits your growth stage. Scale up as you grow.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-[3rem] border transition-all duration-500 relative flex flex-col ${
                p.popular 
                  ? 'bg-slate-900 border-primary-500 shadow-2xl shadow-primary-500/10 lg:-mt-4 lg:pb-14' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-600/30">
                  <Star className="w-4 h-4 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-10">
                <h3 className={`text-xl font-black mb-2 uppercase tracking-[0.2em] ${p.popular ? 'text-primary-400' : 'text-slate-500'}`}>
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black text-white">${p.price}</span>
                  <span className="text-slate-500 font-bold">/mo</span>
                </div>
                <p className="text-slate-400 text-lg font-medium">{p.desc}</p>
              </div>

              <div className="space-y-5 mb-12 flex-1">
                {p.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-4 group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      p.popular ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onUpgrade?.(p.name.toLowerCase())}
                disabled={currentPlan === p.name.toLowerCase()}
                className={`w-full py-6 rounded-[1.5rem] font-black text-xl transition-all ${
                  currentPlan === p.name.toLowerCase()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                    : p.popular 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {currentPlan === p.name.toLowerCase() ? 'Active Plan' : p.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center glass p-8 rounded-[2rem] max-w-3xl mx-auto">
          <p className="text-slate-400 font-medium">
            Need a custom solution for enterprise needs? <a href="#" className="text-primary-400 font-bold hover:underline">Talk to our experts &rarr;</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
