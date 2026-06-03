import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Table, Button, Space, Badge, Popconfirm, Modal, Form,
  Input, InputNumber, Typography, message, Tooltip,
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, ReloadOutlined, RightCircleOutlined,
} from '@ant-design/icons'
import { connectionsApi, type Connection, type CreateConnectionDto } from '../api'
import { useQuery } from '../hooks/useQuery'
import { statusColor } from '../utils/format'
import dayjs from 'dayjs'

const { Text } = Typography

export default function ConnectionsPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const { data: connections, loading, refetch } =
    useQuery(() => connectionsApi.list(), [])

  const handleCreate = async (values: CreateConnectionDto) => {
    setSaving(true)
    try {
      await connectionsApi.create(values)
      message.success('Подключение добавлено')
      setModalOpen(false)
      form.resetFields()
      refetch()
    } catch {
      message.error('Не удалось создать подключение')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await connectionsApi.delete(id)
      message.success('Подключение удалено')
      refetch()
    } catch {
      message.error('Не удалось удалить')
    }
  }

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      render: (name: string, r: Connection) => (
        <Space>
          <Badge status={statusColor(r.status) as 'success' | 'error' | 'warning' | 'default'} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    { title: 'Хост', dataIndex: 'host' },
    { title: 'Порт RAS', dataIndex: 'port', width: 100 },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      render: (s: string, r: Connection) => (
        <Tooltip title={r.lastError ?? ''}>
          <Badge
            status={statusColor(s) as 'success' | 'error' | 'warning' | 'default'}
            text={s}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Проверено',
      dataIndex: 'lastCheckedAt',
      width: 160,
      render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY HH:mm:ss') : '—',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      render: (v: string) => v ?? '—',
    },
    {
      title: '',
      width: 100,
      render: (_: unknown, r: Connection) => (
        <Space>
          <Tooltip title="Открыть кластеры">
            <Button
              type="link"
              icon={<RightCircleOutlined />}
              onClick={() => navigate(`/connections/${r.id}/clusters`)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить подключение?"
            description="Это действие нельзя отменить."
            onConfirm={() => handleDelete(r.id)}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card
        title="RAS-подключения"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetch} loading={loading}>
              Обновить
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Добавить
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={connections ?? []}
          rowKey="id"
          loading={loading}
          columns={columns}
          size="small"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title="Новое RAS-подключение"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={form} onFinish={handleCreate} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="Производственный кластер" />
          </Form.Item>
          <Form.Item name="host" label="Хост / IP" rules={[{ required: true }]}>
            <Input placeholder="192.168.1.10 или server1c" />
          </Form.Item>
          <Form.Item name="port" label="Порт RAS" initialValue={1545} rules={[{ required: true }]}>
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="clusterUser" label="Пользователь кластера">
            <Input placeholder="Оставьте пустым, если без пароля" />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
