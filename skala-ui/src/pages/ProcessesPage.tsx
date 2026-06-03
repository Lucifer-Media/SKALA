import { useNavigate, useParams } from 'react-router-dom'
import { Card, Table, Button, Space, Tag, Progress, Typography, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { clusterApi, type WorkingProcessInfo } from '../api'
import { useQuery } from '../hooks/useQuery'
import { formatBytes, formatMs, exportToCsv } from '../utils/format'

const { Text } = Typography

export default function ProcessesPage() {
  const { connId, clusterId } = useParams<{ connId: string; clusterId: string }>()
  const navigate = useNavigate()

  const { data: processes, loading, refetch } = useQuery(
    () => clusterApi.getProcesses(Number(connId), clusterId!),
    [connId, clusterId],
    { autoRefresh: 30000 }
  )

  const columns = [
    {
      title: 'Хост',
      dataIndex: 'host',
      render: (h: string) => <Text strong>{h}</Text>,
    },
    { title: 'Порт', dataIndex: 'port', width: 70 },
    { title: 'PID', dataIndex: 'pid', width: 80 },
    {
      title: 'Статус',
      dataIndex: 'isEnable',
      width: 90,
      render: (v: boolean) =>
        <Tag color={v ? 'success' : 'error'}>{v ? 'Активен' : 'Отключён'}</Tag>,
    },
    {
      title: 'Сеансов',
      dataIndex: 'runningSessionCount',
      align: 'center' as const,
      width: 80,
      render: (v: number) => <Tag color={v > 0 ? 'blue' : 'default'}>{v}</Tag>,
      sorter: (a: WorkingProcessInfo, b: WorkingProcessInfo) =>
        a.runningSessionCount - b.runningSessionCount,
    },
    {
      title: 'Вызовов',
      dataIndex: 'callCount',
      align: 'center' as const,
      width: 80,
    },
    {
      title: 'Среднее время вызова',
      dataIndex: 'avgCallTime',
      width: 160,
      render: (v: number) => {
        const color = v > 200 ? '#ff4d4f' : v > 50 ? '#fa8c16' : '#52c41a'
        return (
          <Space>
            <Text style={{ color }}>{formatMs(v)}</Text>
            <Progress
              percent={Math.min(100, (v / 300) * 100)}
              size="small"
              showInfo={false}
              strokeColor={color}
              style={{ width: 60 }}
            />
          </Space>
        )
      },
      sorter: (a: WorkingProcessInfo, b: WorkingProcessInfo) => a.avgCallTime - b.avgCallTime,
    },
    {
      title: 'Память',
      dataIndex: 'memorySize',
      width: 110,
      align: 'right' as const,
      render: (v: number) => formatBytes(v),
      sorter: (a: WorkingProcessInfo, b: WorkingProcessInfo) => a.memorySize - b.memorySize,
    },
    {
      title: 'Версия',
      dataIndex: 'version',
      width: 100,
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate(`/connections/${connId}/clusters/${clusterId}`)}>
          ← Кластер
        </Button>
      </Space>

      <Card
        title={`Рабочие процессы (rphost) — ${processes?.length ?? 0}`}
        extra={
          <Space>
            <Button
              onClick={() => exportToCsv('processes', (processes ?? []).map(p => ({
                Хост: p.host, Порт: p.port, PID: p.pid,
                Статус: p.isEnable ? 'Активен' : 'Отключён',
                Сеансов: p.runningSessionCount, Вызовов: p.callCount,
                'Среднее время': formatMs(p.avgCallTime),
                Память: formatBytes(p.memorySize),
              })))}
            >
              CSV
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading} />
          </Space>
        }
      >
        <Table
          dataSource={processes ?? []}
          rowKey="id"
          loading={loading}
          columns={columns}
          size="small"
          pagination={false}
        />
      </Card>
    </>
  )
}
