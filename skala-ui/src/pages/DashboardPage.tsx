import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Statistic, Badge, Table, Typography, Spin, Button, Space } from 'antd'
import {
  ApiOutlined, DatabaseOutlined, UserOutlined, ReloadOutlined,
} from '@ant-design/icons'
import { connectionsApi, clusterApi, type Connection, type ClusterInfo } from '../api'
import { statusColor } from '../utils/format'

const { Title, Text } = Typography

interface ClusterSummary {
  connection: Connection
  clusters: ClusterInfo[]
  error?: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [summaries, setSummaries] = useState<ClusterSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data: connections } = await connectionsApi.list()
      const results = await Promise.allSettled(
        connections.map(conn =>
          clusterApi.getClusters(conn.id).then(r => ({ connection: conn, clusters: r.data }))
        )
      )
      setSummaries(results.map((r, i) =>
        r.status === 'fulfilled'
          ? r.value
          : { connection: connections[i], clusters: [], error: String(r.reason) }
      ))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalClusters = summaries.reduce((a, s) => a + s.clusters.length, 0)
  const totalSessions = summaries.reduce((a, s) =>
    a + s.clusters.reduce((b, c) => b + c.sessionCount, 0), 0)
  const totalProcesses = summaries.reduce((a, s) =>
    a + s.clusters.reduce((b, c) => b + c.processCount, 0), 0)
  const errorCount = summaries.filter(s => s.error).length

  return (
    <div>
      <Space style={{ marginBottom: 24 }} align="center">
        <Title level={4} style={{ margin: 0 }}>Дашборд</Title>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading} size="small">
          Обновить
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Подключений"
                value={summaries.length}
                prefix={<ApiOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Кластеров"
                value={totalClusters}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Активных сеансов"
                value={totalSessions}
                prefix={<UserOutlined />}
                valueStyle={{ color: totalSessions > 0 ? '#52c41a' : undefined }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Ошибок подключения"
                value={errorCount}
                valueStyle={{ color: errorCount > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Статус подключений">
          <Table
            dataSource={summaries}
            rowKey={r => r.connection.id}
            pagination={false}
            size="small"
            onRow={r => ({
              style: { cursor: 'pointer' },
              onClick: () => navigate(`/connections`),
            })}
            columns={[
              {
                title: 'Подключение',
                dataIndex: ['connection', 'name'],
                render: (name: string, r) => (
                  <Space>
                    <Badge status={statusColor(r.error ? 'ERROR' : r.connection.status) as 'success' | 'error' | 'warning' | 'default'} />
                    <Text strong>{name}</Text>
                  </Space>
                ),
              },
              { title: 'Хост', dataIndex: ['connection', 'host'] },
              {
                title: 'Кластеров',
                render: (_: unknown, r) => r.clusters.length,
                align: 'center',
              },
              {
                title: 'Сеансов',
                render: (_: unknown, r) =>
                  r.clusters.reduce((a, c) => a + c.sessionCount, 0),
                align: 'center',
              },
              {
                title: 'Рабочих процессов',
                render: (_: unknown, r) =>
                  r.clusters.reduce((a, c) => a + c.processCount, 0),
                align: 'center',
              },
              {
                title: 'Статус',
                render: (_: unknown, r) =>
                  r.error
                    ? <Text type="danger">{r.error}</Text>
                    : <Badge status="success" text="OK" />,
              },
            ]}
          />
        </Card>
      </Spin>
    </div>
  )
}
