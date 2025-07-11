import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../../infrastructure/api';
import { colors } from '../../styles/colors';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = await login(values) as any;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 350, boxShadow: '0 2px 8px #f0f1f2' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Login</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}> 
            <Input type="email" placeholder="Email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ background: colors.primaryButton, borderColor: colors.primaryButton }}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage; 