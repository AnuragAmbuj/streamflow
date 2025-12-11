import React, { useState, useEffect } from 'react';
import { SchemaSubject, SchemaVersion } from '../types';
import * as KafkaService from '../services/mockKafkaService';
import { Search, Plus, ArrowLeft, FileJson, Copy, Check, Info } from 'lucide-react';

interface SchemaRegistryProps {
  onNavigate: (view: 'list' | 'create', params?: any) => void;
}

const SchemaRegistry: React.FC<SchemaRegistryProps> = () => {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [subjects, setSubjects] = useState<SchemaSubject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [versions, setVersions] = useState<SchemaVersion[]>([]);
  
  // Create Form State
  const [newSchemaSubject, setNewSchemaSubject] = useState('');
  const [newSchemaType, setNewSchemaType] = useState<'AVRO' | 'JSON'>('AVRO');
  const [newSchemaContent, setNewSchemaContent] = useState('');

  useEffect(() => {
    setSubjects(KafkaService.getSchemaSubjects());
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const v = KafkaService.getSchemaVersions(selectedSubject);
      setVersions(v);
      if (v.length > 0 && selectedVersion === null) {
        setSelectedVersion(v[v.length - 1].version); // Default to latest
      }
    }
  }, [selectedSubject]);

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedVersion(null);
    setView('detail');
  };

  const handleCreateSchema = () => {
    if (newSchemaSubject && newSchemaContent) {
      KafkaService.createSchema(newSchemaSubject, newSchemaType, newSchemaContent);
      setSubjects(KafkaService.getSchemaSubjects());
      setView('list');
      setNewSchemaSubject('');
      setNewSchemaContent('');
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSchemaVersion = versions.find(v => v.version === selectedVersion);

  const renderList = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Schema Registry</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage schemas, evolutions, and compatibility</p>
        </div>
        <button 
          onClick={() => setView('create')}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Register Schema
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-t flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-700 text-zinc-200 pl-10 pr-4 py-2 rounded text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border-x border-b border-zinc-800 rounded-b overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-950 text-zinc-300 uppercase font-medium border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Compatibility</th>
              <th className="px-6 py-4 text-center">Latest Version</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredSubjects.map(subject => (
              <tr 
                key={subject.subject} 
                className="hover:bg-zinc-800 transition-colors cursor-pointer group"
                onClick={() => handleSelectSubject(subject.subject)}
              >
                <td className="px-6 py-4 font-medium text-blue-500 group-hover:text-blue-400">
                  {subject.subject}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs text-zinc-300">
                    {subject.schemaType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {subject.compatibility}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-mono">v{subject.latestVersion}</td>
                <td className="px-6 py-4 text-right">
                   <button className="text-blue-500 hover:text-white px-3 py-1 text-xs border border-blue-900 bg-blue-900/10 rounded">
                     View
                   </button>
                </td>
              </tr>
            ))}
             {filteredSubjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No schema subjects found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className="h-full flex flex-col">
       <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
        <button onClick={() => setView('list')} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {selectedSubject}
          </h2>
          <p className="text-zinc-500 text-xs font-mono mt-1">
             Type: {subjects.find(s => s.subject === selectedSubject)?.schemaType} • 
             Compatibility: {subjects.find(s => s.subject === selectedSubject)?.compatibility}
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Version List Sidebar */}
        <div className="w-64 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white">Versions</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                {versions.slice().reverse().map(v => (
                    <button
                        key={v.version}
                        onClick={() => setSelectedVersion(v.version)}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-800 text-sm transition-colors flex justify-between items-center ${
                            selectedVersion === v.version 
                            ? 'bg-blue-900/20 text-blue-400 border-l-2 border-l-blue-500' 
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border-l-2 border-l-transparent'
                        }`}
                    >
                        <span>Version {v.version}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">ID: {v.id}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Schema Content */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-2">
                    <FileJson size={16} className="text-blue-500"/>
                    <span className="text-sm font-mono text-zinc-300">Schema Definition</span>
                </div>
                <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                    <Copy size={12}/> Copy
                </button>
            </div>
            <div className="flex-1 overflow-auto p-0 bg-black">
                <pre className="p-6 text-sm font-mono text-zinc-300 leading-relaxed">
                    {currentSchemaVersion?.schema}
                </pre>
            </div>
        </div>
      </div>
    </div>
  );

  const renderCreate = () => (
     <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('list')} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white">Register New Schema</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Subject Name</label>
                    <input 
                        type="text" 
                        value={newSchemaSubject}
                        onChange={(e) => setNewSchemaSubject(e.target.value)}
                        placeholder="e.g., user-transactions-value"
                        className="w-full bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:border-blue-600 focus:outline-none"
                    />
                    <p className="text-xs text-zinc-600 mt-1">If the subject exists, a new version will be created.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Schema Type</label>
                    <select
                        value={newSchemaType}
                        onChange={(e) => setNewSchemaType(e.target.value as any)}
                        className="w-full bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:border-blue-600 focus:outline-none"
                    >
                        <option value="AVRO">Avro</option>
                        <option value="JSON">JSON Schema</option>
                        <option value="PROTOBUF">Protobuf</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Schema Definition</label>
                <div className="relative">
                    <textarea 
                        value={newSchemaContent}
                        onChange={(e) => setNewSchemaContent(e.target.value)}
                        placeholder={`{\n  "type": "record",\n  "name": "User",\n  "fields": [\n    {"name": "name", "type": "string"}\n  ]\n}`}
                        className="w-full h-64 bg-black border border-zinc-700 text-zinc-200 font-mono text-sm p-4 rounded focus:border-blue-600 focus:outline-none resize-none"
                        spellCheck={false}
                    />
                    <div className="absolute top-2 right-2 text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-mono">
                        {newSchemaType}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-4">
                <button 
                    onClick={() => setView('list')}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleCreateSchema}
                    disabled={!newSchemaSubject || !newSchemaContent}
                    className={`px-6 py-2 bg-blue-700 text-white rounded font-medium transition-colors ${
                        (!newSchemaSubject || !newSchemaContent) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                >
                    Register Schema
                </button>
            </div>
        </div>
     </div>
  );

  return (
    <div className="h-full">
      {view === 'list' && renderList()}
      {view === 'detail' && renderDetail()}
      {view === 'create' && renderCreate()}
    </div>
  );
};

export default SchemaRegistry;
