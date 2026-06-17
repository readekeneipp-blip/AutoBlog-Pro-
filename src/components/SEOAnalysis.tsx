import { BarChart3, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SEOAnalysisProps {
  score: number;
  readability: string;
  suggestions: string[];
}

const SEOAnalysis = ({ score, readability, suggestions }: SEOAnalysisProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          SEO Analysis
        </h3>
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase font-black tracking-wider">Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase border border-green-500/20">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <motion.div 
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-3xl font-black mb-1 ${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`}
            >
                {score}
            </motion.div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">SEO Score</div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-white mb-1 uppercase">
                {readability}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Readability</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Suggestions
            <div className="h-px flex-1 bg-slate-800"></div>
        </h4>
        <div className="space-y-3">
            {suggestions.map((s, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 group hover:border-primary-500/30 transition-colors"
                >
                    <div className="mt-0.5 shrink-0">
                        {s.toLowerCase().includes('good') || s.toLowerCase().includes('great') ? 
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                        }
                    </div>
                    <p className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{s}</p>
                </motion.div>
            ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-slate-500 italic text-xs">
          <Info className="w-4 h-4 shrink-0" />
          Score updates in real-time as you edit.
      </div>
    </motion.div>
  );
};

export default SEOAnalysis;
