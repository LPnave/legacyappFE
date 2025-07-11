import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { register } from '../../infrastructure/api';
import { colors } from '../../styles/colors';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data:any = await register(values);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      message.success('Registration successful!');
      navigate('/dashboard');
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 350, boxShadow: '0 2px 8px #f0f1f2' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Register</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Name" name="name">
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}> 
            <Input type="email" placeholder="Email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select a role' }]}> 
            <Select options={[{ label: 'PM', value: 'PM' }, { label: 'Developer', value: 'Developer' }]} placeholder="Select role" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ background: colors.primaryButton, borderColor: colors.primaryButton }}>
              Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage; 