import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card, Table, Button, Space, Tag, Popconfirm, Input, Typography,
  message, Tooltip, Badge, Modal, Select,
} from 'antd'
import {
  ReloadOutlined, CloseCircleOutlined, WarningOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { clusterApi, type SessionInfo } from '../api'
import { useQuery } from '../hooks/useQuery'
import { formatBytes, formatMs, exportToCsv } from '../utils/format'

const { Text } = Typography

const APP_LABELS: Record<string, string> = {
  '1CV8':       'Толстый клиент',
  '1CV8C':      'Тонкий клиент',
  'WebClient':  'Веб-клиент',
  'Designer':   'Конфигуратор',
  'BackgroundJob': 'Фоновое задание',
}

export default function SessionsPage() {
  const { connId, clusterId, ibId } = useParams<{
    connId: string; clusterId: string; ibId: string
  }>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [terminateAllModal, setTerminateAllModal] = useState(false)
  const [terminatingId, setTerminatingId] = useState<string | null>(null)

  const { data: sessions, loading, refetch } = useQuery(
    () => clusterApi.getSessions(Number(connId), clusterId!, ibId!),
    [connId, clusterId, ibId],
    { autoRefresh: 30000 }
  )

  const filtered = (sessions ?? []).filter(s =>
    s.userName.toLowerCase().includes(search.toLowerCase()) ||
    s.userHost.toLowerCase().includes(search.toLowerCase()) ||
    s.appId.toLowerCase().includes(search.toLowerCase()) ||
    s.currentAction?.toLowerCase().includes(search.toLowerCase())
  )

  const terminateSession = async (sessionId: string) => {
    setTerminatingId(sessionId)
    try {
      await clusterApi.terminateSession(Number(connId), clusterId!, sessionId)
      message.success('Сеанс завершён')
      refetch()
    } catch {
      message.error('Не удалось завершить сеанс')
    } finally {
      setTerminatingId(null)
    }
  }

  const columns = [
    {
      title: '№',
      dataIndex: 'sessionNumber',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Пользователь',
      dataIndex: 'userName',
      render: (name: string) => <Text strong>{name || <Text type="secondary">—</Text>}</Text>,
      sorter: (a: SessionInfo, b: SessionInfo) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Компьютер',
      dataIndex: 'userHost',
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: 'Приложение',
      dataIndex: 'appId',
      width: 140,
      render: (appId: string) => (
        <Tag>{APP_LABELS[appId] ?? appId}</Tag>
      ),
    },
    {
      title: 'Начало',
      dataIndex: 'startedAt',
      width: 140,
      render: (v: string) => dayjs(v).format('DD.MM HH:mm:ss'),
      sorter: (a: SessionInfo, b: SessionInfo) =>
        dayjs(a.startedAt).valueOf() - dayjs(b.startedAt).valueOf(),
    },
    {
      title: 'Последняя активность',
      dataIndex: 'lastActiveAt',
      width: 155,
      render: (v: string) => {
        const diff = dayjs().diff(dayjs(v), 'minute')
        return (
          <Tooltip title={dayjs(v).format('DD.MM.YYYY HH:mm:ss')}>
            <Text type={diff > 60 ? 'warning' : undefined}>
              {diff < 1 ? 'сейчас' : `${diff} мин. назад`}
            </Text>
          </Tooltip>
        )
      },
    },
    {
      title: 'Память',
      dataIndex: 'memoryUsed',
      width: 100,
      align: 'right' as const,
      render: (v: number) => formatBytes(v),
      sorter: (a: SessionInfo, b: SessionInfo) => a.memoryUsed - b.memoryUsed,
    },
    {
      title: 'Вызовов',
      dataIndex: 'callCount',
      width: 80,
      align: 'center' as const,
      sorter: (a: SessionInfo, b: SessionInfo) => a.callCount - b.callCount,
    },
    {
      title: 'Длит. тек.',
      dataIndex: 'durationCurrent',
      width: 100,
      align: 'right' as const,
      render: (v: number) => v > 0
        ? <Text type={v > 30000 ? 'danger' : v > 5000 ? 'warning' : undefined}>{formatMs(v)}</Text>
        : <Text type="secondary">—</Text>,
      sorter: (a: SessionInfo, b: SessionInfo) => a.durationCurrent - b.durationCurrent,
    },
    {
      title: 'Блокировок',
      dataIndex: 'blocksCount',
      width: 90,
      align: 'center' as const,
      render: (v: number) => v > 0
        ? <Badge count={v} color="orange" />
        : <Text type="secondary">0</Text>,
      sorter: (a: SessionInfo, b: SessionInfo) => a.blocksCount - b.blocksCount,
    },
    {
      title: 'Действие',
      dataIndex: 'currentAction',
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v || '—'}</Text>,
    },
    {
      title: '',
      width: 70,
      render: (_: unknown, r: SessionInfo) => (
        <Popconfirm
          title="Завершить сеанс?"
          description={`Пользователь ${r.userName} будет отключён.`}
          onConfirm={() => terminateSession(r.id)}
          okText="Завершить"
          cancelText="Отмена"
          okButtonProps={{ danger: true }}
          icon={<WarningOutlined style={{ color: '#ff4d4f' }} />}
        >
          <Button
            type="link"
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            loading={terminatingId === r.id}
          />
        </Popconfirm>
      ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button onClick={() => navigate(`/connections/${connId}/clusters/${clusterId}/infobases`)}>
          ← Базы
        </Button>
        <Input.Search
          placeholder="Пользователь, компьютер, приложение..."
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
      </Space>

      <Card
        title={`Сеансы (${filtered.length})`}
        extra={
          <Space>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setTerminateAllModal(true)}
              disabled={!filtered.length}
            >
              Завершить все...
            </Button>
            <Button
              onClick={() => exportToCsv('sessions', filtered.map(s => ({
                '№': s.sessionNumber,
                Пользователь: s.userName,
                Компьютер: s.userHost,
                Приложение: APP_LABELS[s.appId] ?? s.appId,
                Начало: dayjs(s.startedAt).format('DD.MM.YYYY HH:mm:ss'),
                Память: formatBytes(s.memoryUsed),
                Вызовов: s.callCount,
                Блокировок: s.blocksCount,
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
          rowKey="id"
          loading={loading}
          columns={columns}
          size="small"
          pagination={{ pageSize: 50, showSizeChanger: true, showTotal: t => `Всего: ${t}` }}
          scroll={{ x: 1400 }}
          rowClassName={r => r.durationCurrent > 60000 ? 'row-warning' : ''}
        />
      </Card>

      <TerminateAllModal
        open={terminateAllModal}
        sessions={filtered}
        onClose={() => setTerminateAllModal(false)}
        onConfirm={async (ids) => {
          await Promise.allSettled(ids.map(id => terminateSession(id)))
          setTerminateAllModal(false)
          refetch()
        }}
      />
    </>
  )
}

function TerminateAllModal({
  open, sessions, onClose, onConfirm
}: {
  open: boolean
  sessions: SessionInfo[]
  onClose: () => void
  onConfirm: (ids: string[]) => Promise<void>
}) {
  const [mode, setMode] = useState<'all' | 'user' | 'inactive' | 'slow'>('all')
  const [param, setParam] = useState('60')
  const [selectedUser, setSelectedUser] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const users = [...new Set(sessions.map(s => s.userName).filter(Boolean))]

  const getTargetSessions = (): SessionInfo[] => {
    switch (mode) {
      case 'user':
        return sessions.filter(s => s.userName === selectedUser)
      case 'inactive':
        return sessions.filter(s =>
          dayjs().diff(dayjs(s.lastActiveAt), 'minute') >= Number(param))
      case 'slow':
        return sessions.filter(s => s.durationCurrent >= Number(param) * 1000)
      default:
        return sessions
    }
  }

  const targets = getTargetSessions()

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(targets.map(s => s.id))
    setLoading(false)
  }

  return (
    <Modal
      title={<><WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />Завершить сеансы</>}
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      confirmLoading={loading}
      okText={`Завершить (${targets.length})`}
      okButtonProps={{ danger: true, disabled: targets.length === 0 }}
      cancelText="Отмена"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Select value={mode} onChange={setMode} style={{ width: '100%' }}>
          <Select.Option value="all">Все сеансы ({sessions.length})</Select.Option>
          <Select.Option value="user">Сеансы пользователя</Select.Option>
          <Select.Option value="inactive">Неактивные старше N минут</Select.Option>
          <Select.Option value="slow">С запросом дольше N секунд</Select.Option>
        </Select>

        {mode === 'user' && (
          <Select
            style={{ width: '100%' }}
            placeholder="Выберите пользователя"
            options={users.map(u => ({ value: u, label: u }))}
            value={selectedUser}
            onChange={setSelectedUser}
            showSearch
          />
        )}
        {(mode === 'inactive' || mode === 'slow') && (
          <Input
            addonBefore={mode === 'inactive' ? 'Минут:' : 'Секунд:'}
            type="number"
            value={param}
            onChange={e => setParam(e.target.value)}
            min={1}
          />
        )}

        <Text type="warning">
          <WarningOutlined /> Будет завершено сеансов: <Text strong>{targets.length}</Text>.
          Несохранённые данные пользователей могут быть утеряны.
        </Text>
      </Space>
    </Modal>
  )
}
