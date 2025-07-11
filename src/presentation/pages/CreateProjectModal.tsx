import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Spin, message } from 'antd';
import { fetchProjectManagers, createProject } from '../../infrastructure/api';

interface CreateProjectModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (project: any) => void;
}

const systemOptions = [
  { label: 'Epic', value: 'Epic' },
  { label: 'Cerner', value: 'Cerner' },
  { label: 'athenahealth', value: 'athenahealth' },
];

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onCancel, onCreate }) => {
  const [form] = Form.useForm();
  const [pmOptions, setPmOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchProjectManagers()
        .then(users => {
          setPmOptions(users.map((u: any) => ({ label: u.Name || u.Email, value: u.UserID })));
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const project = await createProject(values);
      message.success('Project created!');
      onCreate(project);
      form.resetFields();
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
      onCancel();
    }
  };

  return (
    <Modal
      title="Create New Workflow Project"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ pm: undefined, system: undefined }}
      >
        <Form.Item
          label="Project Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="e.g., Griffin OBGYN athenahealth Migration" />
        </Form.Item>
        <Form.Item
          label="Assigned PM"
          name="pm"
          rules={[{ required: true, message: 'Please select a PM' }]}
        >
          {loading ? <Spin /> : <Select options={pmOptions} placeholder="Select PM" showSearch optionFilterProp="label" />}
        </Form.Item>
        <Form.Item
          label="Source System"
          name="system"
          rules={[{ required: true, message: 'Please select a system' }]}
        >
          <Select options={systemOptions} placeholder="Select system" />
        </Form.Item>
        <Form.Item style={{ textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" style={{ background: '#11998e', borderColor: '#11998e' }} loading={submitting}>
            Create Project
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal; 