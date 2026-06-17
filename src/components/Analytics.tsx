import { BarChart3, CheckCircle2, XCircle, FileText, Globe, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsProps {
  schedules: any[];
}

const Analytics = ({ schedules }: AnalyticsProps) => {
  const stats = {
    total: schedules.length,
    published: schedules.filter(s => s.status === 'published').length,
    failed: schedules.filter(s => s.status === 'failed').length,
    pending: schedules.filter(s => s.status === 'pending').length,
  };

  const bySite = schedules.reduce((acc: any, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  const successRate = stats.total > 0 
    ? Math.round((stats.published / (stats.published + stats.failed || 1)) * 100) 
    : 0;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Content', value: stats.total, icon: FileText, color: 'text-primary-400', bg: 'bg-primary-400/10' },
          { label: 'Live Posts', value: stats.published, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Failed Sync', value: stats.failed, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="flex flex-col gap-6 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary-400" />
              Platform Distribution
            </h3>
            <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-3 py-1 rounded-full uppercase tracking-tighter">Real-time Data</span>
          </div>
          
          <div className="grid gap-8">
            {Object.entries(bySite).map(([site, count]: [string, any]) => (
              <div key={site} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-white text-lg font-bold capitalize">{site}</span>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Connected Instance</p>
                  </div>
                  <span className="text-primary-400 font-black text-xl">{count} <span className="text-slate-600 text-sm uppercase">Posts</span></span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                  />
                </div>
              </div>
            ))}
            {Object.keys(bySite).length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-medium italic">No platform data available yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Activity
          </h3>
          <div className="space-y-6">
            {schedules.slice(-6).reverse().map((s, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${s.status === 'published' ? 'bg-green-500 shadow-green-500/50' : s.status === 'failed' ? 'bg-red-500 shadow-red-500/50' : 'bg-yellow-500 shadow-yellow-500/50'}`} />
                  <div>
                    <span className="text-slate-300 text-sm font-bold group-hover:text-white transition-colors truncate max-w-[140px] block">{s.title}</span>
                    <span className="text-slate-600 text-[10px] uppercase font-black tracking-widest">{s.type}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-primary-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            ))}
            {schedules.length === 0 && (
              <p className="text-slate-500 text-center py-20 italic">No recent activity.</p>
            )}
          </div>
          {schedules.length > 0 && (
            <button className="w-full mt-10 py-4 border border-slate-800 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">View All Logs</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
