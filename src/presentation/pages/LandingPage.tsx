import React from 'react';
import { Button, Card, Row, Col, Typography } from 'antd';
import { colors } from '../../styles/colors';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const features = [
  {
    title: '70% Time Reduction',
    description: 'From 2+ hours to 30 minutes per project',
    icon: <span role="img" aria-label="clock" style={{ fontSize: 32, color: colors.primary }}>🕒</span>,
  },
  {
    title: 'AI-Powered Analysis',
    description: 'Automatic UI element detection and workflow suggestions',
    icon: <span role="img" aria-label="ai" style={{ fontSize: 32, color: colors.accent }}>⚡</span>,
  },
  {
    title: 'Professional PDFs',
    description: 'Generate comprehensive requirements documents',
    icon: <span role="img" aria-label="pdf" style={{ fontSize: 32, color: colors.primary }}>📄</span>,
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: colors.background, minHeight: '100vh', padding: '48px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Title level={1} style={{ fontSize: 48, marginBottom: 16 }}>ScreenFlow Capture</Title>
        <Paragraph style={{ fontSize: 20, color: colors.text, marginBottom: 32 }}>
          AI-powered screenshot analysis that transforms manual healthcare workflow documentation from 2+ hours to 30 minutes. Built specifically for Legacy Data Access project managers working with EMR migrations.
        </Paragraph>
        <Button type="primary" size="large" style={{ marginBottom: 48, background: colors.primaryButton, borderColor: colors.primaryButton }} onClick={() => navigate('/dashboard')}>
          Start New Project
        </Button>
        <Row gutter={32} justify="center">
          {features.map((f, i) => (
            <Col xs={24} md={8} key={i} style={{ marginBottom: 24 }}>
              <Card bordered={false} style={{ background: colors.card, minHeight: 180, boxShadow: '0 2px 8px #f0f1f2' }}>
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <Title level={4}>{f.title}</Title>
                <Paragraph>{f.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      {/* Image 2 Section: Visual Workflow Builder */}
      <div style={{ maxWidth: 900, margin: '64px auto 0 auto', textAlign: 'center', background: 'transparent' }}>
        <Title level={2} style={{ fontSize: 36, marginBottom: 24 }}>
          Built for Healthcare Project Managers
        </Title>
        <Title level={4} style={{ fontWeight: 400, color: colors.text, marginBottom: 24 }}>
          Visual Workflow Builder
        </Title>
        <Paragraph style={{ fontSize: 18, color: colors.text, marginBottom: 32 }}>
          Drag and drop screenshots to create visual workflows. AI automatically suggests connections between screens based on healthcare EMR patterns like athenahealth, Epic, and Cerner.
        </Paragraph>
        <div style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
          <ul style={{ fontSize: 16, color: colors.text, listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: 12 }}>
              <span style={{ color: colors.accent, marginRight: 8 }}>→</span> Batch screenshot upload
            </li>
            <li style={{ marginBottom: 12 }}>
              <span style={{ color: colors.accent, marginRight: 8 }}>→</span> AI-powered UI element detection
            </li>
            <li style={{ marginBottom: 12 }}>
              <span style={{ color: colors.accent, marginRight: 8 }}>→</span> Healthcare pattern recognition
            </li>
            <li style={{ marginBottom: 12 }}>
              <span style={{ color: colors.accent, marginRight: 8 }}>→</span> Professional PDF export
            </li>
          </ul>
        </div>
      </div>
      {/* Call-to-action Section: Ready to Transform */}
      <div style={{ maxWidth: 1100, margin: '80px auto 0 auto', textAlign: 'center', background: 'transparent' }}>
        <Title level={2} style={{ fontSize: 40, fontWeight: 700, marginBottom: 16, color: '#2d3748' }}>
          Ready to Transform Your Workflow Documentation?
        </Title>
        <Paragraph style={{ fontSize: 22, color: '#6b7280', marginBottom: 40 }}>
          Join MaryNeal and other Legacy Data Access PMs who are saving hours on every project.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ fontWeight: 600, fontSize: 18, padding: '0 36px', height: 48, background: colors.primaryButton, borderColor: colors.primaryButton }}
          onClick={() => navigate('/register')}
        >
          Get Started Now &nbsp;→
        </Button>
      </div>
    </div>
  );
};

export default LandingPage; 