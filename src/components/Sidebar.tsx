import { Rocket, LayoutDashboard, Calendar, CreditCard, Settings, LogOut, BarChart3, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

const Sidebar = ({ activeTab, setActiveTab, handleLogout, isOpen, setIsOpen }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Generator', icon: LayoutDashboard },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'CMS Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-900 flex flex-col p-6 transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20">
            <Rocket className="w-6 h-6 text-white fill-white/10" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase">AutoBlog<span className="text-primary-500">Pro</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen?.(false);
              }}
              className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-bold text-sm uppercase tracking-wider ${
                activeTab === item.id 
                  ? 'bg-primary-600/10 text-primary-400 border border-primary-600/20 shadow-lg shadow-primary-600/5' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                {item.label}
              </div>
              {activeTab === item.id && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-600/5 blur-xl group-hover:bg-primary-600/10 transition-colors" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm font-bold text-white uppercase tracking-tighter">AI Systems Live</p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-4 py-4 text-slate-500 hover:text-red-400 transition-all font-bold text-sm uppercase tracking-widest border-t border-slate-900 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
