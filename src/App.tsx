import React from 'react';
import { Layout, Button, Menu } from 'antd';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { LoginOutlined, UserAddOutlined, LogoutOutlined } from '@ant-design/icons';
import { LandingPage, DashboardPage, LoginPage, RegisterPage, WorkflowBuilderPage } from './presentation/pages';
import { colors } from './styles/colors';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem('token'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', boxShadow: '0 2px 8px #f0f1f2' }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#1890ff', marginRight: 32 }}>
          LDA <span style={{ color: '#222' }}>LEGACY DATA ACCESS</span>
        </div>
        <Menu mode="horizontal" selectable={false} style={{ flex: 1, borderBottom: 'none' }}>
          <Menu.Item key="home" onClick={() => navigate('/')}>Home</Menu.Item>
          <Menu.Item key="dashboard" onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
        </Menu>
        {!hasToken ? (
          <>
            <Button icon={<LoginOutlined />} style={{ marginRight: 8 }} onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button icon={<UserAddOutlined />} type="primary" onClick={() => navigate('/register')}
              style={{ background: colors.primaryButton, borderColor: colors.primaryButton }}>
              Register
            </Button>
          </>
        ) : (
          <Button icon={<LogoutOutlined />} type="primary" danger onClick={handleLogout}>
            Logout
          </Button>
        )}
      </Header>
      <Content style={{ background: '#f5f7fa', minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/project/:id" element={<WorkflowBuilderPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;
