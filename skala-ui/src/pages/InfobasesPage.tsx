import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card, Table, Button, Space, Tag, Switch, Modal, Input, Form,
  message, Typography, Popconfirm, Tooltip,
} from 'antd'
import {
  LockOutlined, UnlockOutlined, ReloadOutlined, UserOutlined, LockFilled,
} from '@ant-design/icons'
import { clusterApi, type InfobaseInfo } from '../api'
import { useQuery } from '../hooks/useQuery'
import { exportToCsv } from '../utils/format'

const { Text } = Typography

export default function InfobasesPage() {
  const { connId, clusterId } = useParams<{ connId: string; clusterId: string }>()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [denyModal, setDenyModal] = useState<{ ib: InfobaseInfo; type: 'sessions' | 'jobs' } | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const { data: infobases, loading, refetch } = useQuery(
    () => clusterApi.getInfobases(Number(connId), clusterId!),
    [connId, clusterId],
    { autoRefresh: 30000 }
  )

  const filtered = (infobases ?? []).filter(ib =>
    ib.name.toLowerCase().includes(searchText.toLowerCase()) ||
    ib.description?.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleSessionsDeny = async (values: { message?: string; permissionCode?: string }) => {
    if (!denyModal) return
    setSaving(true)
    try {
      await clusterApi.setSessionsDenied(
        Number(connId), clusterId!, denyModal.ib.id,
        { denied: !denyModal.ib.sessionsDenied, ...values }
      )
      message.success(denyModal.ib.sessionsDenied ? 'Сеансы разблокированы' : 'Сеансы заблокированы')
      setDenyModal(null)
      form.resetFields()
      refetch()
    } catch {
      message.error('Не удалось выполнить операцию')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'Имя',
      dataIndex: 'name',
      render: (name: string) => <Text strong copyable>{name}</Text>,
      sorter: (a: InfobaseInfo, b: InfobaseInfo) => a.name.localeCompare(b.name),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    { title: 'СУБД', dataIndex: 'dbms', width: 120 },
    { title: 'Сервер БД', dataIndex: 'dbServer' },
    { title: 'Имя БД', dataIndex: 'dbName' },
    {
      title: 'Сеансов',
      dataIndex: 'sessionCount',
      align: 'center' as const,
      width: 90,
      render: (v: number) => <Tag color={v > 0 ? 'blue' : 'default'}>{v}</Tag>,
    },
    {
      title: 'Сеансы',
      width: 90,
      align: 'center' as const,
      render: (_: unknown, r: InfobaseInfo) => (
        <Tooltip title={r.sessionsDenied ? 'Сеансы заблокированы' : 'Сеансы разрешены'}>
          <Tag
            icon={r.sessionsDenied ? <LockFilled /> : <UnlockOutlined />}
            color={r.sessionsDenied ? 'error' : 'success'}
            style={{ cursor: 'pointer' }}
            onClick={() => setDenyModal({ ib: r, type: 'sessions' })}
          >
            {r.sessionsDenied ? 'Блок.' : 'OK'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Задания',
      width: 90,
      align: 'center' as const,
      render: (_: unknown, r: InfobaseInfo) => (
        <Tag color={r.scheduledJobsDenied ? 'warning' : 'success'}>
          {r.scheduledJobsDenied ? 'Откл.' : 'Вкл.'}
        </Tag>
      ),
    },
    {
      title: '',
      width: 90,
      render: (_: unknown, r: InfobaseInfo) => (
        <Button
          size="small"
          icon={<UserOutlined />}
          onClick={() => navigate(`/connections/${connId}/clusters/${clusterId}/infobases/${r.id}/sessions`)}
        >
          Сеансы
        </Button>
      ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate(`/connections/${connId}/clusters/${clusterId}`)}>
          ← Кластер
        </Button>
        <Input.Search
          placeholder="Поиск по имени или описанию..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>

      <Card
        title={`Информационные базы (${filtered.length})`}
        extra={
          <Space>
            <Button
              onClick={() => exportToCsv('infobases', filtered.map(ib => ({
                Имя: ib.name, Описание: ib.description, СУБД: ib.dbms,
                'Сервер БД': ib.dbServer, 'Имя БД': ib.dbName,
                Сеансов: ib.sessionCount,
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
          pagination={{ pageSize: 25, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={denyModal?.ib.sessionsDenied ? 'Разблокировать сеансы' : 'Заблокировать сеансы'}
        open={!!denyModal}
        onCancel={() => { setDenyModal(null); form.resetFields() }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={denyModal?.ib.sessionsDenied ? 'Разблокировать' : 'Заблокировать'}
        okButtonProps={{ danger: !denyModal?.ib.sessionsDenied }}
        cancelText="Отмена"
      >
        {denyModal && !denyModal.ib.sessionsDenied && (
          <Form form={form} onFinish={handleSessionsDeny} layout="vertical">
            <Text>
              База: <Text strong>{denyModal.ib.name}</Text>
            </Text>
            <Form.Item name="message" label="Сообщение пользователям" style={{ marginTop: 12 }}>
              <Input.TextArea rows={2} placeholder="Проводится регламентное обслуживание..." />
            </Form.Item>
            <Form.Item name="permissionCode" label="Код разрешения">
              <Input placeholder="Оставьте пустым если не нужен" />
            </Form.Item>
          </Form>
        )}
        {denyModal?.ib.sessionsDenied && (
          <Form form={form} onFinish={handleSessionsDeny}>
            <Text>Разблокировать сеансы базы <Text strong>{denyModal.ib.name}</Text>?</Text>
          </Form>
        )}
      </Modal>
    </>
  )
}
