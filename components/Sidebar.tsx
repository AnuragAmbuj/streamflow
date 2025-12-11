import React, { useState } from 'react';
import { ViewState, Cluster, User } from '../types';
import { LayoutDashboard, List, Settings, FileJson, Users, ChevronDown, Check, LogOut, Shield } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  clusters: Cluster[];
  selectedCluster: Cluster;
  onSelectCluster: (cluster: Cluster) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  clusters, 
  selectedCluster, 
  onSelectCluster,
  user
}) => {
  const [isClusterMenuOpen, setIsClusterMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'topics', label: 'Topics', icon: List },
    { id: 'consumers', label: 'Consumers', icon: Users },
    { id: 'schema-registry', label: 'Schema Registry', icon: FileJson },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full">
      {/* Cluster Switcher Header */}
      <div className="p-4 border-b border-zinc-800">
        <div 
          className="flex items-center justify-between p-2 rounded hover:bg-zinc-900 cursor-pointer transition-colors border border-transparent hover:border-zinc-800"
          onClick={() => setIsClusterMenuOpen(!isClusterMenuOpen)}
        >
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-white text-lg ${
                 selectedCluster.status === 'degraded' ? 'bg-orange-600' : 'bg-blue-700'
             }`}>
                {selectedCluster.name.charAt(0)}
             </div>
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate w-32">{selectedCluster.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">{selectedCluster.region}</span>
             </div>
          </div>
          <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isClusterMenuOpen ? 'rotate-180' : ''}`}/>
        </div>

        {/* Dropdown */}
        {isClusterMenuOpen && (
            <div className="absolute left-4 top-20 w-56 bg-zinc-900 border border-zinc-800 shadow-xl rounded z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 mb-2 mt-1">Select Cluster</div>
                    {clusters.map(cluster => (
                        <button
                            key={cluster.id}
                            onClick={() => {
                                onSelectCluster(cluster);
                                setIsClusterMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-2 py-2 text-sm text-zinc-300 hover:bg-black hover:text-white rounded transition-colors group"
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    cluster.status === 'online' ? 'bg-emerald-500' : 
                                    cluster.status === 'degraded' ? 'bg-orange-500' : 'bg-red-500'
                                }`}></div>
                                {cluster.name}
                            </div>
                            {selectedCluster.id === cluster.id && <Check size={14} className="text-blue-500"/>}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as ViewState)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
              currentView === item.id 
                ? 'bg-blue-700 text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User / RBAC Profile */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
            {user.avatarInitials}
          </div>
          <div className="flex-1 overflow-hidden">
             <div className="text-xs font-bold text-zinc-200 truncate">{user.name}</div>
             <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Shield size={10} />
                {user.role}
             </div>
          </div>
          <button className="text-zinc-500 hover:text-white transition-colors" title="Log out">
             <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
