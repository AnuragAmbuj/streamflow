import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Topic, KafkaMessage, TopicConfig, AclEntry } from '../types';
import * as KafkaService from '../services/mockKafkaService';
import * as GeminiService from '../services/geminiService';
import { ArrowLeft, RefreshCw, Play, Search, BrainCircuit, MessageSquare, Download, Filter, X, Hash, Calendar, ChevronDown, ChevronUp, Save, Shield, Trash2, Plus } from 'lucide-react';

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topic, onBack }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'config' | 'consumers'>('messages');
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<KafkaMessage | null>(null);
  
  // Filtering State
  const [filterText, setFilterText] = useState('');
  const [selectedPartition, setSelectedPartition] = useState<number | 'all'>('all');
  const [minOffset, setMinOffset] = useState<string>('');
  const [maxOffset, setMaxOffset] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Config & ACL State
  const [topicConfig, setTopicConfig] = useState<TopicConfig | undefined>(undefined);
  const [acls, setAcls] = useState<AclEntry[]>([]);
  const [isConfigDirty, setIsConfigDirty] = useState(false);
  const [newAcl, setNewAcl] = useState<Partial<AclEntry>>({ permissionType: 'ALLOW', operation: 'READ', principal: 'User:' });

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    // Simulate network delay slightly
    setTimeout(() => {
        setMessages(KafkaService.getMessages(topic.id));
        setTopicConfig(KafkaService.getTopicConfig(topic.id));
        setAcls(KafkaService.getTopicACLs(topic.id));
        setIsLoading(false);
    }, 400);
  }, [topic.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
       if (activeTab === 'messages') {
          setMessages(KafkaService.getMessages(topic.id));
       }
    }, 5000); 
    return () => clearInterval(interval);
  }, [fetchData, activeTab, topic.id]);

  const handleGenerateData = async () => {
    setIsGenerating(true);
    const syntheticData = await GeminiService.generateSyntheticData(topic.name, 1);
    
    if (syntheticData.length > 0 && !syntheticData[0].error) {
      KafkaService.produceMessage(topic.id, null, syntheticData[0]);
      setMessages(KafkaService.getMessages(topic.id));
    }
    setIsGenerating(false);
  };

  const handleAnalyzeMessage = async (msg: KafkaMessage) => {
    setSelectedMessage(msg);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const analysis = await GeminiService.analyzeMessagePayload(msg);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const clearFilters = () => {
    setFilterText('');
    setSelectedPartition('all');
    setMinOffset('');
    setMaxOffset('');
    setStartTime('');
    setEndTime('');
  };

  const handleConfigChange = (key: keyof TopicConfig, value: any) => {
      if (!topicConfig) return;
      setTopicConfig({ ...topicConfig, [key]: value });
      setIsConfigDirty(true);
  };

  const saveConfig = () => {
      if (topicConfig) {
          KafkaService.updateTopicConfig(topic.id, topicConfig);
          setIsConfigDirty(false);
      }
  };

  const addAcl = () => {
      if (newAcl.principal && newAcl.host) {
          KafkaService.addTopicACL(topic.id, newAcl as any);
          setAcls(KafkaService.getTopicACLs(topic.id));
          setNewAcl({ permissionType: 'ALLOW', operation: 'READ', principal: 'User:', host: '' });
      }
  };

  const removeAcl = (aclId: string) => {
      KafkaService.removeTopicACL(topic.id, aclId);
      setAcls(KafkaService.getTopicACLs(topic.id));
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
        const contentString = JSON.stringify({ k: msg.key, v: msg.value, h: msg.headers }).toLowerCase();
        if (filterText && !contentString.includes(filterText.toLowerCase())) return false;
        if (selectedPartition !== 'all' && msg.partition !== selectedPartition) return false;
        if (minOffset && msg.offset < parseInt(minOffset)) return false;
        if (maxOffset && msg.offset > parseInt(maxOffset)) return false;
        if (startTime && msg.timestamp < new Date(startTime).getTime()) return false;
        if (endTime && msg.timestamp > new Date(endTime).getTime()) return false;
        return true;
    });
  }, [messages, filterText, selectedPartition, minOffset, maxOffset, startTime, endTime]);

  const activeFilterCount = [filterText, selectedPartition !== 'all', minOffset, maxOffset, startTime, endTime].filter(Boolean).length;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
        <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {topic.name}
            <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded font-normal">
              {topic.partitions} Partitions
            </span>
          </h2>
          <p className="text-zinc-500 text-xs font-mono mt-1">ID: {topic.id}</p>
        </div>
        <div className="ml-auto flex gap-2">
            <button 
                onClick={handleGenerateData}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-black border border-blue-900 hover:bg-blue-900/20 text-blue-500 px-3 py-1.5 rounded text-sm transition-all"
            >
                {isGenerating ? <RefreshCw className="animate-spin w-4 h-4"/> : <BrainCircuit className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'AI Produce'}
            </button>
            <button 
                onClick={fetchData}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded text-sm transition-colors"
            >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                Refresh
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-800 mb-4">
        {['messages', 'config', 'consumers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-500' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-4">
        {activeTab === 'messages' && (
            <>
                <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
                    <div className="p-3 border-b border-zinc-800 bg-zinc-950 flex flex-col gap-3">
                        <div className="flex justify-between items-center gap-3">
                            <div className="text-xs text-zinc-400 font-mono whitespace-nowrap">
                                Showing {filteredMessages.length} of {messages.length} buffered
                            </div>
                            
                            <div className="flex-1 flex gap-2 justify-end">
                                <div className="relative max-w-md w-full">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                    <input 
                                        placeholder="Search key, value, headers..." 
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded pl-8 pr-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-700 transition-all"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                                        showFilters || activeFilterCount > 0
                                        ? 'bg-blue-900/30 border-blue-800 text-blue-400' 
                                        : 'bg-black border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    <Filter size={14} />
                                    Filters
                                    {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-1 rounded-full min-w-[1.2em] text-center">{activeFilterCount}</span>}
                                    {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Partition</label>
                                    <select 
                                        value={selectedPartition}
                                        onChange={(e) => setSelectedPartition(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                        className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="all">All Partitions</option>
                                        {Array.from({ length: topic.partitions }).map((_, i) => (
                                            <option key={i} value={i}>Partition {i}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Offset Range</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Min" value={minOffset} onChange={(e) => setMinOffset(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-600" />
                                        <input type="number" placeholder="Max" value={maxOffset} onChange={(e) => setMaxOffset(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-600" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Start Time</label>
                                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-600 [color-scheme:dark]" />
                                </div>
                                
                                <div className="flex items-end gap-2">
                                     <div className="flex-1">
                                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">End Time</label>
                                        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-600 [color-scheme:dark]" />
                                    </div>
                                    <button onClick={clearFilters} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-1.5 rounded mb-[1px]" title="Clear Filters"><X size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-0">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-zinc-950 text-zinc-500 sticky top-0 z-10 border-b border-zinc-800">
                                <tr>
                                    <th className="px-4 py-2 w-20">Offset</th>
                                    <th className="px-4 py-2 w-16">Part</th>
                                    <th className="px-4 py-2 w-48">Timestamp</th>
                                    <th className="px-4 py-2">Value Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredMessages.length > 0 ? filteredMessages.map((msg) => (
                                    <tr 
                                        key={`${msg.partition}-${msg.offset}`} 
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`cursor-pointer hover:bg-zinc-800 transition-colors ${selectedMessage === msg ? 'bg-blue-900/20' : ''}`}
                                    >
                                        <td className="px-4 py-2 text-blue-400">{msg.offset}</td>
                                        <td className="px-4 py-2 text-zinc-500">{msg.partition}</td>
                                        <td className="px-4 py-2 text-zinc-500">{new Date(msg.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-zinc-300 truncate max-w-xs opacity-80">{JSON.stringify(msg.value)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-500">{messages.length === 0 ? "No messages found" : "No messages match filters"}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="w-1/3 bg-zinc-900 border border-zinc-800 rounded flex flex-col">
                    <div className="p-3 border-b border-zinc-800 font-medium text-sm text-zinc-200 flex justify-between items-center">
                        <span>Message Inspector</span>
                        {selectedMessage && <button onClick={() => handleAnalyzeMessage(selectedMessage)} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"><BrainCircuit size={14} /> Analyze</button>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedMessage ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-4 bg-black p-2 rounded border border-zinc-800">
                                    <div>Part: <span className="text-zinc-200">{selectedMessage.partition}</span></div>
                                    <div>Offset: <span className="text-zinc-200">{selectedMessage.offset}</span></div>
                                    <div>Key: <span className="text-zinc-200">{selectedMessage.key || 'null'}</span></div>
                                    <div>Size: <span className="text-zinc-200">{selectedMessage.size} B</span></div>
                                </div>
                                {isAnalyzing && <div className="p-3 bg-blue-900/10 border border-blue-800 rounded text-xs text-blue-300 animate-pulse">Analysing...</div>}
                                {aiAnalysis && !isAnalyzing && <div className="p-3 bg-blue-900/10 border border-blue-800 rounded"><div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-bold uppercase tracking-wider"><BrainCircuit size={12}/> AI Analysis</div><p className="text-xs text-blue-100 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p></div>}
                                <div><div className="text-xs text-zinc-500 mb-1 font-bold">VALUE (JSON)</div><pre className="text-xs text-zinc-300 font-mono bg-black p-3 rounded overflow-x-auto border border-zinc-800">{JSON.stringify(selectedMessage.value, null, 2)}</pre></div>
                                <div><div className="text-xs text-zinc-500 mb-1 font-bold">HEADERS</div><pre className="text-xs text-zinc-400 font-mono bg-black p-3 rounded overflow-x-auto border border-zinc-800">{JSON.stringify(selectedMessage.headers, null, 2)}</pre></div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600"><MessageSquare size={32} className="mb-2 opacity-50"/><p className="text-sm">Select a message to inspect</p></div>
                        )}
                    </div>
                </div>
            </>
        )}
        
        {activeTab === 'config' && topicConfig && (
            <div className="w-full flex gap-6">
                {/* Topic Configuration Form */}
                <div className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Properties</h3>
                        <button 
                            onClick={saveConfig}
                            disabled={!isConfigDirty}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                isConfigDirty 
                                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Retention (ms)</label>
                            <input 
                                type="number" 
                                value={topicConfig.retentionMs}
                                onChange={(e) => handleConfigChange('retentionMs', parseInt(e.target.value))}
                                className="w-full bg-black border border-zinc-800 text-zinc-200 p-2 rounded focus:border-blue-600 focus:outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Max Message Bytes</label>
                            <input 
                                type="number" 
                                value={topicConfig.maxMessageBytes}
                                onChange={(e) => handleConfigChange('maxMessageBytes', parseInt(e.target.value))}
                                className="w-full bg-black border border-zinc-800 text-zinc-200 p-2 rounded focus:border-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Cleanup Policy</label>
                            <select 
                                value={topicConfig.cleanupPolicy}
                                onChange={(e) => handleConfigChange('cleanupPolicy', e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-zinc-200 p-2 rounded focus:border-blue-600 focus:outline-none"
                            >
                                <option value="delete">Delete</option>
                                <option value="compact">Compact</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Min In-Sync Replicas</label>
                            <input 
                                type="number" 
                                value={topicConfig.minInsyncReplicas}
                                onChange={(e) => handleConfigChange('minInsyncReplicas', parseInt(e.target.value))}
                                className="w-full bg-black border border-zinc-800 text-zinc-200 p-2 rounded focus:border-blue-600 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Access Control List */}
                <div className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-blue-500"/> 
                        Access Policies (ACLs)
                    </h3>
                    
                    {/* Add ACL Form */}
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded mb-4 grid grid-cols-12 gap-2">
                         <div className="col-span-4">
                            <input 
                                placeholder="Principal (User:...)" 
                                value={newAcl.principal}
                                onChange={(e) => setNewAcl({...newAcl, principal: e.target.value})}
                                className="w-full bg-black border border-zinc-800 text-xs text-zinc-200 p-2 rounded focus:border-blue-600 outline-none"
                            />
                         </div>
                         <div className="col-span-3">
                             <input 
                                placeholder="Host (*)" 
                                value={newAcl.host}
                                onChange={(e) => setNewAcl({...newAcl, host: e.target.value})}
                                className="w-full bg-black border border-zinc-800 text-xs text-zinc-200 p-2 rounded focus:border-blue-600 outline-none"
                            />
                         </div>
                         <div className="col-span-2">
                            <select 
                                value={newAcl.operation}
                                onChange={(e) => setNewAcl({...newAcl, operation: e.target.value as any})}
                                className="w-full bg-black border border-zinc-800 text-xs text-zinc-200 p-2 rounded focus:border-blue-600 outline-none"
                            >
                                <option value="READ">READ</option>
                                <option value="WRITE">WRITE</option>
                                <option value="ALL">ALL</option>
                            </select>
                         </div>
                         <div className="col-span-2">
                            <select 
                                value={newAcl.permissionType}
                                onChange={(e) => setNewAcl({...newAcl, permissionType: e.target.value as any})}
                                className="w-full bg-black border border-zinc-800 text-xs text-zinc-200 p-2 rounded focus:border-blue-600 outline-none"
                            >
                                <option value="ALLOW">ALLOW</option>
                                <option value="DENY">DENY</option>
                            </select>
                         </div>
                         <button 
                            onClick={addAcl}
                            className="col-span-1 bg-blue-700 hover:bg-blue-600 text-white rounded flex items-center justify-center"
                        >
                            <Plus size={16} />
                         </button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-950 text-zinc-500 uppercase font-medium">
                                <tr>
                                    <th className="px-3 py-2">Principal</th>
                                    <th className="px-3 py-2">Host</th>
                                    <th className="px-3 py-2">Operation</th>
                                    <th className="px-3 py-2">Permission</th>
                                    <th className="px-3 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {acls.map(acl => (
                                    <tr key={acl.id} className="hover:bg-zinc-800">
                                        <td className="px-3 py-2 font-mono text-zinc-300">{acl.principal}</td>
                                        <td className="px-3 py-2 font-mono text-zinc-400">{acl.host}</td>
                                        <td className="px-3 py-2 text-zinc-300">{acl.operation}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                acl.permissionType === 'ALLOW' 
                                                ? 'bg-blue-900/30 text-blue-400' 
                                                : 'bg-red-900/30 text-red-400'
                                            }`}>
                                                {acl.permissionType}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button 
                                                onClick={() => removeAcl(acl.id)}
                                                className="text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {acls.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-zinc-500">
                                            No explicit ACLs defined
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'consumers' && (
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded p-6 text-center text-zinc-500">
                 Consumer Groups View Placeholder
            </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
