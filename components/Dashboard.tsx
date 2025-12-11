import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClusterStats } from '../types';
import { Server, Database, Activity, HardDrive } from 'lucide-react';

interface DashboardProps {
  stats: ClusterStats;
}

// Generate some fake historical data for the chart
const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      in: Math.floor(Math.random() * 50) + 20,
      out: Math.floor(Math.random() * 80) + 40,
    });
  }
  return data;
};

const StatCard = ({ title, value, subtext, icon: Icon }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded p-5 flex items-start justify-between">
    <div>
      <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-xs mt-2 text-blue-400">{subtext}</p>
    </div>
    <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
      <Icon className="w-6 h-6 text-zinc-300" />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const chartData = React.useMemo(() => generateChartData(), [stats]); // Refresh chart when stats update

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Brokers" 
          value={stats.brokerCount} 
          subtext="All systems operational" 
          icon={Server} 
        />
        <StatCard 
          title="Total Topics" 
          value={stats.topicCount} 
          subtext={`${stats.partitionCount} Partitions`} 
          icon={Database} 
        />
        <StatCard 
          title="Throughput (In)" 
          value={formatBytes(stats.bytesInPerSec) + '/s'} 
          subtext="Within expected range" 
          icon={Activity} 
        />
        <StatCard 
          title="Throughput (Out)" 
          value={formatBytes(stats.bytesOutPerSec) + '/s'} 
          subtext="Healthy consumption" 
          icon={HardDrive} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Network Traffic (MB/s)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Area type="monotone" dataKey="in" stroke="#2563eb" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} name="Bytes In" />
                <Area type="monotone" dataKey="out" stroke="#e4e4e7" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} name="Bytes Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-6 flex flex-col justify-between">
           <div>
            <h3 className="text-lg font-semibold text-white mb-4">Cluster Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800 rounded">
                <span className="text-zinc-400 text-sm">Controller Status</span>
                <span className="text-blue-400 text-sm font-medium bg-blue-900/20 px-2 py-1 rounded">Active (ID: {stats.controllerId})</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800 rounded">
                <span className="text-zinc-400 text-sm">Kafka Version</span>
                <span className="text-white text-sm font-mono">{stats.version}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800 rounded">
                <span className="text-zinc-400 text-sm">Under Replicated</span>
                <span className="text-white text-sm font-mono">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black border border-zinc-800 rounded">
                <span className="text-zinc-400 text-sm">Offline Partitions</span>
                <span className="text-white text-sm font-mono">0</span>
              </div>
            </div>
           </div>
           <div className="mt-4 pt-4 border-t border-zinc-800">
             <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-2">
               <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
             </div>
             <p className="text-xs text-zinc-500 text-right">Disk Usage: 45%</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;