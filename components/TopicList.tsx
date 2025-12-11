import React, { useState } from 'react';
import { Topic } from '../types';
import { Search, Plus, Trash2, MoreHorizontal } from 'lucide-react';

interface TopicListProps {
  topics: Topic[];
  onSelectTopic: (id: string) => void;
  onCreateTopic: () => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, onSelectTopic, onCreateTopic }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Topics</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage and monitor your Kafka topics</p>
        </div>
        <button 
          onClick={onCreateTopic}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Create Topic
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-t flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-700 text-zinc-200 pl-10 pr-4 py-2 rounded text-sm focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="text-zinc-500 text-sm ml-auto hidden sm:block">
          Showing {filteredTopics.length} of {topics.length} topics
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border-x border-b border-zinc-800 rounded-b overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-300 uppercase font-medium border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Topic Name</th>
                <th className="px-6 py-4 text-center">Partitions</th>
                <th className="px-6 py-4 text-center">Replication</th>
                <th className="px-6 py-4 text-center">Cleanup Policy</th>
                <th className="px-6 py-4 text-right">Messages</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredTopics.map((topic) => (
                <tr 
                  key={topic.id} 
                  className="hover:bg-zinc-800 transition-colors cursor-pointer group"
                  onClick={() => onSelectTopic(topic.id)}
                >
                  <td className="px-6 py-4 font-medium text-blue-500 group-hover:text-blue-400">
                    {topic.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs text-zinc-300">{topic.partitions}</span>
                  </td>
                  <td className="px-6 py-4 text-center">{topic.replicationFactor}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded border text-xs ${
                        // Use Neutral colors instead of Amber/Rose unless it's an error
                        topic.cleanupPolicy === 'delete' 
                        ? 'border-zinc-700 bg-zinc-800 text-zinc-300' 
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}>
                      {topic.cleanupPolicy}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-300">
                    {topic.messagesInCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No topics found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopicList;