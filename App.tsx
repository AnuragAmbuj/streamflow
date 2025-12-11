import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopicList from './components/TopicList';
import TopicDetail from './components/TopicDetail';
import SchemaRegistry from './components/SchemaRegistry';
import * as KafkaService from './services/mockKafkaService';
import { ViewState, ViewParams, ClusterStats, Topic, Cluster } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [viewParams, setViewParams] = useState<ViewParams>({});
  
  // App State
  const [clusters, setClusters] = useState<Cluster[]>(KafkaService.getClusters());
  const [selectedCluster, setSelectedCluster] = useState<Cluster>(clusters[0]);
  const [clusterStats, setClusterStats] = useState<ClusterStats>(KafkaService.getClusterStats(clusters[0].id));
  const [topics, setTopics] = useState<Topic[]>([]);

  // Simulate stats updates based on selected cluster
  useEffect(() => {
    // Initial fetch for the selected cluster
    setClusterStats(KafkaService.getClusterStats(selectedCluster.id));
    setTopics(KafkaService.getTopics(selectedCluster.id));

    const interval = setInterval(() => {
      setClusterStats(KafkaService.getClusterStats(selectedCluster.id));
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedCluster]);

  const handleNavigate = (view: ViewState, params: ViewParams = {}) => {
    setCurrentView(view);
    setViewParams(params);
    if (view === 'topics') {
        setTopics(KafkaService.getTopics(selectedCluster.id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stats={clusterStats} />;
      case 'topics':
        if (viewParams.topicId) {
            const topic = KafkaService.getTopic(viewParams.topicId);
            if (!topic) return <div>Topic not found</div>;
            return <TopicDetail topic={topic} onBack={() => handleNavigate('topics')} />;
        }
        return (
            <TopicList 
                topics={topics} 
                onSelectTopic={(id) => handleNavigate('topics', { topicId: id })}
                onCreateTopic={() => {
                   const name = prompt("Enter topic name (demo only):");
                   if(name) {
                       KafkaService.createTopic(name, 3, 1);
                       setTopics(KafkaService.getTopics(selectedCluster.id));
                   }
                }}
            />
        );
      case 'schema-registry':
        return <SchemaRegistry onNavigate={(view, params) => console.log('nav', view, params)} />;
      case 'consumers':
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
            <div className="text-4xl mb-4 opacity-20 text-zinc-600">🚧</div>
            <h3 className="text-lg font-medium text-zinc-300">Work in Progress</h3>
            <p className="text-sm">This feature is under construction.</p>
          </div>
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-zinc-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={(v) => handleNavigate(v)}
        clusters={clusters}
        selectedCluster={selectedCluster}
        onSelectCluster={setSelectedCluster}
        user={KafkaService.MOCK_USER}
      />
      
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-zinc-800 bg-black sticky top-0 z-10 flex items-center px-8 justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="hover:text-zinc-300 cursor-pointer" onClick={() => handleNavigate('dashboard')}>Cluster</span>
                <span>/</span>
                <span className="text-zinc-200 capitalize">{currentView}</span>
                {viewParams.topicId && (
                    <>
                    <span>/</span>
                    <span className="text-blue-500">{viewParams.topicId}</span>
                    </>
                )}
            </div>
            <div className="flex items-center gap-4">
                 <div className="text-xs text-zinc-600 font-mono">
                    v1.2.0
                </div>
            </div>
        </header>

        <div className="p-8 min-h-[calc(100vh-64px)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
