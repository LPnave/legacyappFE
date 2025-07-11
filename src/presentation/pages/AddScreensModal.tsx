import React, { useState } from 'react';
import { Modal, Upload, Button, Typography } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { colors } from '../../styles/colors';

const { Paragraph } = Typography;

interface AddScreensModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (files: File[], blanks: number) => void;
}

const AddScreensModal: React.FC<AddScreensModalProps> = ({ open, onCancel, onSubmit }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [blankCount, setBlankCount] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    onSubmit(fileList.map(f => f.originFileObj), blankCount);
    setUploading(false);
    setFileList([]);
    setBlankCount(0);
    onCancel();
  };

  return (
    <Modal
      title="Add Screens to Workflow"
      open={open}
      onCancel={onCancel}
      onOk={handleUpload}
      okText="Add"
      confirmLoading={uploading}
      okButtonProps={{ style: { background: colors.primaryButton, borderColor: colors.primaryButton } }}
      destroyOnClose
    >
      <Paragraph>Upload healthcare screenshots or create blank placeholder screens for your workflow.</Paragraph>
      <Upload.Dragger
        multiple
        accept="image/png,image/jpeg"
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList }) => setFileList(fileList)}
        style={{ marginBottom: 24 }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ fontSize: 32 }} />
        </p>
        <p className="ant-upload-text">Drop screenshots here or click to browse</p>
        <p className="ant-upload-hint">PNG, JPG up to 10MB each • Supports batch upload</p>
      </Upload.Dragger>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
        <Button icon={<PlusOutlined />} onClick={() => setBlankCount(blankCount + 1)} style={{ marginRight: 8 }}>
          Add Blank Screen
        </Button>
        <span>{blankCount > 0 ? `${blankCount} blank screen(s) to add` : ''}</span>
      </div>
    </Modal>
  );
};

export default AddScreensModal; 