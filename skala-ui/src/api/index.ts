import client from './client'

export const authApi = {
  login: (username: string, password: string) =>
    client.post<{ token: string; refreshToken: string }>('/auth/login', { username, password }),
}

export const connectionsApi = {
  list: () => client.get<Connection[]>('/connections'),
  create: (data: CreateConnectionDto) => client.post<Connection>('/connections', data),
  delete: (id: number) => client.delete(`/connections/${id}`),
}

export const clusterApi = {
  getClusters: (connId: number) =>
    client.get<ClusterInfo[]>(`/connections/${connId}/clusters`),

  getInfobases: (connId: number, clusterId: string) =>
    client.get<InfobaseInfo[]>(`/connections/${connId}/clusters/${clusterId}/infobases`),

  getSessions: (connId: number, clusterId: string, ibId: string) =>
    client.get<SessionInfo[]>(`/connections/${connId}/clusters/${clusterId}/infobases/${ibId}/sessions`),

  terminateSession: (connId: number, clusterId: string, sessionId: string) =>
    client.delete(`/connections/${connId}/clusters/${clusterId}/sessions/${sessionId}`),

  getProcesses: (connId: number, clusterId: string) =>
    client.get<WorkingProcessInfo[]>(`/connections/${connId}/clusters/${clusterId}/processes`),

  getLocks: (connId: number, clusterId: string, ibId: string) =>
    client.get<LockInfo[]>(`/connections/${connId}/clusters/${clusterId}/infobases/${ibId}/locks`),

  setSessionsDenied: (connId: number, clusterId: string, ibId: string, data: SessionsDenyDto) =>
    client.post(`/connections/${connId}/clusters/${clusterId}/infobases/${ibId}/sessions-lock`, data),

  getLicenses: (connId: number, clusterId: string) =>
    client.get<LicenseInfo[]>(`/connections/${connId}/clusters/${clusterId}/licenses`),
}

// DTO types
export interface Connection {
  id: number
  name: string
  host: string
  port: number
  clusterUser?: string
  description?: string
  status: 'UNKNOWN' | 'CONNECTED' | 'ERROR' | 'TIMEOUT'
  lastCheckedAt?: string
  lastError?: string
}

export interface CreateConnectionDto {
  name: string
  host: string
  port: number
  clusterUser?: string
  description?: string
}

export interface ClusterInfo {
  id: string
  name: string
  host: string
  port: number
  sessionCount: number
  processCount: number
  loadBalancingMode: string
  maxMemorySize: number
  securityLevel: number
}

export interface InfobaseInfo {
  id: string
  name: string
  description: string
  dbms: string
  dbServer: string
  dbName: string
  sessionsDenied: boolean
  scheduledJobsDenied: boolean
  sessionCount: number
  locale: string
}

export interface SessionInfo {
  id: string
  sessionNumber: number
  userName: string
  userHost: string
  appId: string
  startedAt: string
  lastActiveAt: string
  memoryTotal: number
  memoryUsed: number
  cpuTimeCurrent: number
  cpuTimeTotal: number
  durationCurrent: number
  durationAll: number
  callCount: number
  currentAction: string
  blocksCount: number
}

export interface WorkingProcessInfo {
  id: string
  host: string
  port: number
  pid: number
  isEnable: boolean
  runningSessionCount: number
  callCount: number
  avgCallTime: number
  memorySize: number
}

export interface LockInfo {
  sessionId: string
  userName: string
  lockSpace: string
  lockObject: string
  lockMode: string
  lockedSince: number
}

export interface LicenseInfo {
  series: string
  maxUsers: number
  licenseType: string
  shortPresentation: string
}

export interface SessionsDenyDto {
  denied: boolean
  message?: string
  permissionCode?: string
}
