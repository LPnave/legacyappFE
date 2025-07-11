import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Typography, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, FileTextOutlined, UserOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';
import { colors } from '../../styles/colors';
import CreateProjectModal from './CreateProjectModal';
import { fetchProjects, fetchUserById } from '../../infrastructure/api';
import { useNavigate } from 'react-router-dom';

const { Title} = Typography;

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [pmNames, setPmNames] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProjects()
      .then(async (data) => {
        setProjects(data);
        // Fetch PM names for all unique CreatedBy IDs
        const ids = Array.from(new Set(data.map((p: any) => p.CreatedBy)));
        const names: { [userId: string]: string } = {};
        await Promise.all(ids.map(async (id) => {
          const userId = id as string;
          try {
            const user = await fetchUserById(userId);
            names[userId] = user.Name || userId;
          } catch {
            names[userId] = userId;
          }
        }));
        setPmNames(names);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = (project: any) => {
    setProjects([
      ...projects,
      project,
    ]);
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ background: colors.background, minHeight: '100vh', padding: '32px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>ScreenFlow Capture</Title>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)}
            style={{ background: colors.primaryButton, borderColor: colors.primaryButton }}>
            New Project
          </Button>
        </div>
        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={6}><Card><div style={{ fontSize: 18 }}>Total Projects<br /><b>{projects.length}</b></div></Card></Col>
          <Col span={6}><Card><div style={{ fontSize: 18 }}>Working<br /><b>{projects.filter(p => p.Status === 'Working').length}</b></div></Card></Col>
          <Col span={6}><Card><div style={{ fontSize: 18 }}>Client Review<br /><b>0</b></div></Card></Col>
          <Col span={6}><Card><div style={{ fontSize: 18 }}>Developer Ready<br /><b>{projects.filter(p => p.Status === 'Developer Ready').length}</b></div></Card></Col>
        </Row>
        <Row gutter={24}>
          {projects.map(project => (
            <Col span={8} key={project.ProjectID} style={{ marginBottom: 24 }}>
              <Card
                style={{ minHeight: 260, borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2' }}
                bodyStyle={{ padding: 24 }}
              >
                {/* Custom Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 20, color: colors.text }}>{project.Title}</div>
                  <Button
                    icon={<DeleteOutlined />}
                    type="text"
                    danger
                    size="small"
                    style={{ fontSize: 18 }}
                    // onClick={() => setProjects(projects.filter(p => p.ProjectID !== project.ProjectID))}
                  />
                </div>
                {/* Status Tag */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    background: '#d1fadf',
                    color: '#219653',
                    borderRadius: 16,
                    padding: '2px 16px',
                    fontWeight: 500,
                    fontSize: 15,
                  }}>
                    {project.Status}
                  </span>
                </div>
                {/* Info Rows */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AppstoreOutlined style={{ color: '#faad14' }} />
                    <span style={{ fontWeight: 500 }}>{project.System || ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ color: '#64748b' }} />
                    <span>{new Date(project.CreatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserOutlined style={{ color: '#64748b' }} />
                    <span>{project.CreatedByName || pmNames[project.CreatedBy] || project.CreatedBy || <Spin size="small" />}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileTextOutlined style={{ color: '#64748b' }} />
                    <span>0 screens</span>
                  </div>
                </div>
                <Button
                  type="primary"
                  block
                  style={{
                    background: colors.primaryButton,
                    borderColor: colors.primaryButton,
                    fontWeight: 600,
                    fontSize: 18,
                    height: 48,
                    borderRadius: 8,
                  }}
                  onClick={() => navigate(`/project/${project.ProjectID}`)}
                >
                  Open Workflow
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <CreateProjectModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
};

export default DashboardPage; 