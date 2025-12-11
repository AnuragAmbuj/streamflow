export interface Cluster {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'offline' | 'degraded';
  version: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Developer' | 'Viewer';
  tenant: string;
  avatarInitials: string;
}

export interface ClusterStats {
  brokerCount: number;
  topicCount: number;
  partitionCount: number;
  controllerId: number;
  version: string;
  bytesInPerSec: number;
  bytesOutPerSec: number;
}

export interface Topic {
  id: string;
  name: string;
  partitions: number;
  replicationFactor: number;
  cleanupPolicy: 'delete' | 'compact';
  retentionMs: number;
  messagesInCount: number; // Simulated metric
}

export interface TopicConfig {
  retentionMs: number;
  cleanupPolicy: 'delete' | 'compact';
  maxMessageBytes: number;
  minInsyncReplicas: number;
}

export interface AclEntry {
  id: string;
  principal: string; // e.g., User:Alice
  host: string;
  operation: 'READ' | 'WRITE' | 'ALL' | 'DESCRIBE';
  permissionType: 'ALLOW' | 'DENY';
}

export interface KafkaMessage {
  offset: number;
  partition: number;
  timestamp: number;
  key: string | null;
  value: any; // JSON object
  headers: Record<string, string>;
  size: number;
}

export interface SchemaSubject {
  subject: string;
  compatibility: 'BACKWARD' | 'FORWARD' | 'FULL' | 'NONE';
  latestVersion: number;
  schemaType: 'AVRO' | 'JSON' | 'PROTOBUF';
}

export interface SchemaVersion {
  subject: string;
  version: number;
  id: number;
  schema: string;
}

export type ViewState = 'dashboard' | 'topics' | 'consumers' | 'schema-registry' | 'settings';

export interface ViewParams {
  topicId?: string;
  subject?: string;
}
