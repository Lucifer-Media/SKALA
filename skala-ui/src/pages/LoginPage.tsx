import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi } from '../api'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

export default function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore(s => s.setTokens)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login(values.username, values.password)
      setTokens(res.data.token, res.data.refreshToken, values.username)
      navigate('/', { replace: true })
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Ошибка входа'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    }}>
      <Card style={{ width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>СКАЛА</Title>
            <Text type="secondary">Система Контроля и Администрирования Ландшафта 1С</Text>
          </div>

          {error && <Alert type="error" message={error} showIcon />}

          <Form onFinish={onFinish} size="large" layout="vertical">
            <Form.Item name="username" rules={[{ required: true, message: 'Введите логин' }]}>
              <Input prefix={<UserOutlined />} placeholder="Логин" autoFocus />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  )
}
