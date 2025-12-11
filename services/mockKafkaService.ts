import { Topic, KafkaMessage, ClusterStats, Cluster, AclEntry, TopicConfig, User, SchemaSubject, SchemaVersion } from '../types';

// Mock Clusters
const CLUSTERS: Cluster[] = [
  { id: 'c1', name: 'US-East Production', region: 'us-east-1', status: 'online', version: '3.6.1' },
  { id: 'c2', name: 'EU-West Staging', region: 'eu-west-2', status: 'degraded', version: '3.5.0' },
  { id: 'c3', name: 'Dev Cluster', region: 'local', status: 'online', version: '3.7.0' }
];

// Mock User
export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Admin',
  role: 'Admin',
  tenant: 'Org-Primary',
  avatarInitials: 'AA'
};

// Initial Topics
const INITIAL_TOPICS: Topic[] = [
  { id: 't1', name: 'user-signups', partitions: 6, replicationFactor: 3, cleanupPolicy: 'delete', retentionMs: 604800000, messagesInCount: 12450 },
  { id: 't2', name: 'payment-processed', partitions: 12, replicationFactor: 3, cleanupPolicy: 'delete', retentionMs: 604800000, messagesInCount: 8900 },
  { id: 't3', name: 'inventory-updates', partitions: 4, replicationFactor: 2, cleanupPolicy: 'compact', retentionMs: -1, messagesInCount: 34200 },
  { id: 't4', name: 'clickstream-logs', partitions: 32, replicationFactor: 3, cleanupPolicy: 'delete', retentionMs: 86400000, messagesInCount: 156000 },
  { id: 't5', name: 'email-notifications', partitions: 6, replicationFactor: 3, cleanupPolicy: 'delete', retentionMs: 604800000, messagesInCount: 4500 },
];

let topics = [...INITIAL_TOPICS];
const messagesMap: Record<string, KafkaMessage[]> = {};
const aclMap: Record<string, AclEntry[]> = {};
const configMap: Record<string, TopicConfig> = {};

// --- Schema Registry Mock Data ---
const schemaSubjects: SchemaSubject[] = [
  { subject: 'user-signups-value', compatibility: 'BACKWARD', latestVersion: 2, schemaType: 'AVRO' },
  { subject: 'payment-processed-value', compatibility: 'FULL', latestVersion: 1, schemaType: 'AVRO' },
  { subject: 'inventory-updates-key', compatibility: 'NONE', latestVersion: 1, schemaType: 'JSON' }
];

const schemaVersions: Record<string, SchemaVersion[]> = {
  'user-signups-value': [
    {
      subject: 'user-signups-value',
      version: 1,
      id: 101,
      schema: JSON.stringify({
        type: "record",
        name: "UserSignup",
        namespace: "com.example.users",
        fields: [
          { name: "userId", type: "string" },
          { name: "email", type: "string" },
          { name: "timestamp", type: "long" }
        ]
      }, null, 2)
    },
    {
      subject: 'user-signups-value',
      version: 2,
      id: 102,
      schema: JSON.stringify({
        type: "record",
        name: "UserSignup",
        namespace: "com.example.users",
        fields: [
          { name: "userId", type: "string" },
          { name: "email", type: "string" },
          { name: "timestamp", type: "long" },
          { name: "source", type: ["null", "string"], default: null }
        ]
      }, null, 2)
    }
  ],
  'payment-processed-value': [
    {
      subject: 'payment-processed-value',
      version: 1,
      id: 201,
      schema: JSON.stringify({
        type: "record",
        name: "Payment",
        namespace: "com.example.payments",
        fields: [
          { name: "transactionId", type: "string" },
          { name: "amount", type: "double" },
          { name: "currency", type: "string" }
        ]
      }, null, 2)
    }
  ],
  'inventory-updates-key': [
    {
      subject: 'inventory-updates-key',
      version: 1,
      id: 301,
      schema: JSON.stringify({
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "InventoryKey",
        "type": "object",
        "properties": {
          "productId": { "type": "string" },
          "warehouseId": { "type": "string" }
        },
        "required": ["productId"]
      }, null, 2)
    }
  ]
};


// Generate mock messages
const generateMockMessages = (topicId: string, count: number) => {
  const msgs: KafkaMessage[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    msgs.push({
      offset: i,
      partition: Math.floor(Math.random() * 4),
      timestamp: now - (count - i) * 1000 * 60,
      key: `key-${Math.floor(Math.random() * 1000)}`,
      value: {
        event: 'mock_event',
        id: Math.random().toString(36).substring(7),
        status: Math.random() > 0.5 ? 'success' : 'pending'
      },
      headers: { 'correlation-id': 'abc-123' },
      size: 100 + Math.floor(Math.random() * 200)
    });
  }
  return msgs;
};

// Seed initial data
INITIAL_TOPICS.forEach(t => {
  messagesMap[t.id] = generateMockMessages(t.id, 25);
  
  // Default Configs
  configMap[t.id] = {
    retentionMs: t.retentionMs,
    cleanupPolicy: t.cleanupPolicy,
    maxMessageBytes: 1048576,
    minInsyncReplicas: 2
  };

  // Default ACLs
  aclMap[t.id] = [
    { id: 'acl-1', principal: 'User:ServiceAccount-1', host: '*', operation: 'ALL', permissionType: 'ALLOW' },
    { id: 'acl-2', principal: 'User:AnalyticReader', host: '10.0.0.*', operation: 'READ', permissionType: 'ALLOW' }
  ];
});

export const getClusters = (): Cluster[] => CLUSTERS;

export const getClusterStats = (clusterId: string): ClusterStats => {
  // Simulate slightly different stats per cluster
  const multiplier = clusterId === 'c1' ? 1 : 0.5;
  return {
    brokerCount: clusterId === 'c1' ? 6 : 3,
    topicCount: topics.length,
    partitionCount: topics.reduce((acc, t) => acc + t.partitions, 0),
    controllerId: 1,
    version: CLUSTERS.find(c => c.id === clusterId)?.version || '3.0.0',
    bytesInPerSec: (Math.floor(Math.random() * 5000000) + 1000000) * multiplier,
    bytesOutPerSec: (Math.floor(Math.random() * 12000000) + 2000000) * multiplier,
  };
};

export const getTopics = (clusterId: string): Topic[] => {
  // In a real app, topics would be filtered by cluster. For mock, we return the same list.
  return [...topics];
};

export const getTopic = (id: string): Topic | undefined => {
  return topics.find(t => t.id === id);
};

export const getMessages = (topicId: string, limit = 50): KafkaMessage[] => {
  const all = messagesMap[topicId] || [];
  return all.slice(-limit).reverse();
};

export const produceMessage = (topicId: string, key: string | null, value: any): KafkaMessage => {
  if (!messagesMap[topicId]) {
    messagesMap[topicId] = [];
  }
  
  const topic = topics.find(t => t.id === topicId);
  const partitionCount = topic ? topic.partitions : 1;
  const currentOffset = messagesMap[topicId].length;

  const newMessage: KafkaMessage = {
    offset: currentOffset,
    partition: Math.floor(Math.random() * partitionCount),
    timestamp: Date.now(),
    key: key,
    value: value,
    headers: { source: 'ui-producer' },
    size: JSON.stringify(value).length + (key?.length || 0)
  };

  messagesMap[topicId].push(newMessage);
  return newMessage;
};

export const createTopic = (name: string, partitions: number, replicationFactor: number) => {
  const newTopic: Topic = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    partitions,
    replicationFactor,
    cleanupPolicy: 'delete',
    retentionMs: 604800000,
    messagesInCount: 0
  };
  topics.push(newTopic);
  messagesMap[newTopic.id] = [];
  configMap[newTopic.id] = {
    retentionMs: 604800000,
    cleanupPolicy: 'delete',
    maxMessageBytes: 1048576,
    minInsyncReplicas: 1
  };
  aclMap[newTopic.id] = [];
  return newTopic;
};

// ACL Management
export const getTopicACLs = (topicId: string): AclEntry[] => {
  return aclMap[topicId] || [];
};

export const addTopicACL = (topicId: string, acl: Omit<AclEntry, 'id'>) => {
  if (!aclMap[topicId]) aclMap[topicId] = [];
  aclMap[topicId].push({ ...acl, id: Math.random().toString(36).substring(7) });
};

export const removeTopicACL = (topicId: string, aclId: string) => {
  if (!aclMap[topicId]) return;
  aclMap[topicId] = aclMap[topicId].filter(a => a.id !== aclId);
};

// Config Management
export const getTopicConfig = (topicId: string): TopicConfig | undefined => {
  return configMap[topicId];
};

export const updateTopicConfig = (topicId: string, config: Partial<TopicConfig>) => {
  if (!configMap[topicId]) return;
  configMap[topicId] = { ...configMap[topicId], ...config };
};

// Schema Registry Services
export const getSchemaSubjects = (): SchemaSubject[] => {
  return [...schemaSubjects];
};

export const getSchemaVersions = (subject: string): SchemaVersion[] => {
  return schemaVersions[subject] || [];
};

export const createSchema = (subject: string, type: 'AVRO' | 'JSON' | 'PROTOBUF', schemaText: string) => {
  const existingSubject = schemaSubjects.find(s => s.subject === subject);
  
  if (existingSubject) {
    // Evolve schema
    const newVersion = existingSubject.latestVersion + 1;
    existingSubject.latestVersion = newVersion;
    
    if (!schemaVersions[subject]) schemaVersions[subject] = [];
    schemaVersions[subject].push({
      subject,
      version: newVersion,
      id: Math.floor(Math.random() * 10000) + 1000,
      schema: schemaText
    });
  } else {
    // New subject
    schemaSubjects.push({
      subject,
      compatibility: 'BACKWARD',
      latestVersion: 1,
      schemaType: type
    });
    schemaVersions[subject] = [{
      subject,
      version: 1,
      id: Math.floor(Math.random() * 10000) + 1000,
      schema: schemaText
    }];
  }
};
