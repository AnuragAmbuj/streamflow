# Streamflow Vibe

Streamflow Vibe is a modern, high-performance web interface for Apache Kafka, designed for professionals who need deep insights and control over their streaming data infrastructure. It features a strict, high-contrast dark theme optimized for developer productivity.

## Features

### 🖥️ Cluster Management
- **Multi-Cluster Support**: Seamlessly switch between Production, Staging, and Development clusters via the sidebar.
- **Real-time Dashboard**: Monitor broker health, network throughput (In/Out), and controller status with live visualizations.

### 📦 Topic Management
- **Comprehensive List**: View topics with metrics like partition count, replication factor, and message rates.
- **Deep Inspection**:
  - **Message Browser**: Filter messages by text content, partition ID, offset range, or specific time windows.
  - **Configuration**: Edit topic properties such as Retention `ms`, Max Message Bytes, and Cleanup Policies.
  - **Security (ACLs)**: Manage Access Control Lists directly from the UI (Principals, Hosts, Operations).

### 🤖 AI-Powered Capabilities
*Powered by Google Gemini*
- **Synthetic Data Generation**: Produce realistic, schema-aware mock data into topics to test consumers without writing scripts.
- **Message Analysis**: instantly analyze complex JSON/Avro payloads to understand business events, detect anomalies, or generate TypeScript interfaces.

### 📜 Schema Registry
- **Schema Management**: View, register, and evolve schemas (Avro, JSON, Protobuf).
- **Versioning**: Inspect schema history and view raw schema definitions for any version.
- **Compatibility**: Monitor compatibility settings (Backward, Forward, Full).

### 🛡️ Enterprise Ready
- **RBAC Simulation**: UI built with role-based access control patterns (Admin/Developer/Viewer).
- **Multi-tenancy**: Visual indicators for tenant contexts.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (Custom "Zinc/Black" professional theme)
- **Visualization**: Recharts
- **Icons**: Lucide React
- **AI Integration**: `@google/genai` SDK

## Setup

This project uses a standard React build system.

1. **Install Dependencies**: `npm install`
2. **Environment**: Ensure `API_KEY` is set for Gemini features.
3. **Run**: `npm start`

## License

MIT