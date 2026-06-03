import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Table, Button, Space, Tag, Input, Typography } from 'antd'
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons'
import { clusterApi, type LockInfo } from '../api'
import { useQuery } from '../hooks/useQuery'
import { formatMs, exportToCsv } from '../utils/format'

const { Text } = Typography

export default function LocksPage() {
  const { connId, clusterId, ibId } = useParams<{
    connId: string; clusterId: string; ibId: string
  }>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: locks, loading, refetch } = useQuery(
    () => clusterApi.getLocks(Number(connId), clusterId!, ibId!),
    [connId, clusterId, ibId],
    { autoRefresh: 15000 }
  )

  const filtered = (locks ?? []).filter(l =>
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.lockSpace.toLowerCase().includes(search.toLowerCase()) ||
    l.lockObject.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      title: 'Пользователь',
      dataIndex: 'userName',
      render: (v: string) => <Text strong>{v || '—'}</Text>,
      sorter: (a: LockInfo, b: LockInfo) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Режим',
      dataIndex: 'lockMode',
      width: 110,
      render: (v: string) => (
        <Tag color={v === 'Exclusive' ? 'red' : 'orange'} icon={<WarningOutlined />}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Пространство блокировки',
      dataIndex: 'lockSpace',
      render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Объект',
      dataIndex: 'lockObject',
      render: (v: string) => (
        <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>{v}</Text>
      ),
    },
    {
      title: 'Удерживается',
      dataIndex: 'lockedSince',
      width: 120,
      align: 'right' as const,
      render: (v: number) => (
        <Text type={v > 60000 ? 'danger' : v > 10000 ? 'warning' : undefined}>
          {formatMs(v)}
        </Text>
      ),
      sorter: (a: LockInfo, b: LockInfo) => a.lockedSince - b.lockedSince,
      defaultSortOrder: 'descend' as const,
    },
  ]

  const exclusiveCount = filtered.filter(l => l.lockMode === 'Exclusive').length

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button onClick={() => navigate(`/connections/${connId}/clusters/${clusterId}/infobases/${ibId}/sessions`)}>
          ← Сеансы
        </Button>
        <Input.Search
          placeholder="Пользователь, объект блокировки..."
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
      </Space>

      <Card
        title={
          <Space>
            <span>Блокировки ({filtered.length})</span>
            {exclusiveCount > 0 && (
              <Tag color="red" icon={<WarningOutlined />}>
                Эксклюзивных: {exclusiveCount}
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              onClick={() => exportToCsv('locks', filtered.map(l => ({
                Пользователь: l.userName,
                Режим: l.lockMode,
                'Пространство': l.lockSpace,
                Объект: l.lockObject,
                'Удерживается мс': l.lockedSince,
              })))}
            >
              CSV
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading} />
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          rowKey={(r, i) => `${r.sessionId}_${i}`}
          loading={loading}
          columns={columns}
          size="small"
          pagination={{ pageSize: 50, showSizeChanger: true }}
          scroll={{ x: 900 }}
          rowClassName={r => r.lockedSince > 60000 ? 'row-warning' : ''}
        />
      </Card>
    </>
  )
}
