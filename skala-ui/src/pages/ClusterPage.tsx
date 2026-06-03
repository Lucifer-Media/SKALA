import { useNavigate, useParams } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Button, Space, Typography, Spin, Tag } from 'antd'
import {
  DatabaseOutlined, UserOutlined, ApiOutlined, ReloadOutlined,
} from '@ant-design/icons'
import { clusterApi, type ClusterInfo } from '../api'
import { useQuery } from '../hooks/useQuery'

const { Title } = Typography

export default function ClusterPage() {
  const { connId } = useParams<{ connId: string }>()
  const navigate = useNavigate()
  const id = Number(connId)

  const { data: clusters, loading, refetch } =
    useQuery(() => clusterApi.getClusters(id), [id])

  const columns = [
    {
      title: 'Имя кластера',
      dataIndex: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    { title: 'Хост', dataIndex: 'host' },
    { title: 'Порт', dataIndex: 'port', width: 80 },
    {
      title: 'Сеансов',
      dataIndex: 'sessionCount',
      align: 'center' as const,
      render: (v: number) => <Tag color={v > 0 ? 'blue' : 'default'}>{v}</Tag>,
    },
    {
      title: 'Процессов',
      dataIndex: 'processCount',
      align: 'center' as const,
    },
    {
      title: 'Балансировка',
      dataIndex: 'loadBalancingMode',
      render: (v: string) => v || '—',
    },
    {
      title: 'Безопасность',
      dataIndex: 'securityLevel',
      align: 'center' as const,
      render: (v: number) => v === 0 ? <Tag>Нет</Tag> : <Tag color="orange">Уровень {v}</Tag>,
    },
    {
      title: '',
      width: 200,
      render: (_: unknown, r: ClusterInfo) => (
        <Space size="small">
          <Button size="small" icon={<DatabaseOutlined />}
            onClick={() => navigate(`/connections/${connId}/clusters/${r.id}/infobases`)}>
            Базы
          </Button>
          <Button size="small" icon={<ApiOutlined />}
            onClick={() => navigate(`/connections/${connId}/clusters/${r.id}/processes`)}>
            Процессы
          </Button>
        </Space>
      ),
    },
  ]

  const totalSessions = clusters?.reduce((a, c) => a + c.sessionCount, 0) ?? 0
  const totalProc     = clusters?.reduce((a, c) => a + c.processCount, 0) ?? 0

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button onClick={() => navigate('/connections')}>← Подключения</Button>
        <Title level={4} style={{ margin: 0 }}>Кластеры</Title>
        <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading} size="small" />
      </Space>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="Кластеров" value={clusters?.length ?? 0} prefix={<DatabaseOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Всего сеансов" value={totalSessions} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Рабочих процессов" value={totalProc} prefix={<ApiOutlined />} />
            </Card>
          </Col>
        </Row>

        <Card title="Кластеры 1С">
          <Table
            dataSource={clusters ?? []}
            rowKey="id"
            columns={columns}
            size="small"
            pagination={false}
          />
        </Card>
      </Spin>
    </div>
  )
}
