import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges } from 'reactflow';
import type { Node, Edge, NodeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Tag, Typography, Spin, Input, Modal, Card } from 'antd';
import { useParams } from 'react-router-dom';
import { fetchProjectById, fetchPagesByProject, fetchWorkflowsByProject, updatePagePosition, fetchUserById, fetchCommentsByPage, addComment, updateProject } from '../../infrastructure/api';
import AddScreensModal from './AddScreensModal';
import { message } from 'antd';
import { createPage } from '../../infrastructure/api';
import { createWorkflow, deleteWorkflow } from '../../infrastructure/api';
import { addEdge } from 'reactflow';
import type { Connection as RFConnection, Edge as RFEdgeType } from 'reactflow';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { updatePageTitle } from '../../infrastructure/api';
import { deletePage } from '../../infrastructure/api';
import { Handle, Position } from 'reactflow';
import { uploadFileToSupabase } from '../../infrastructure/uploadToSupabase';
import jsPDF from 'jspdf';

const { Title } = Typography;

// Debounce utility
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Add a context to provide setNodes to PageNode
const PageNodeContext = React.createContext<{ setNodes: React.Dispatch<React.SetStateAction<Node[]>> }>(null!);

// CommentModal component
const CommentModal: React.FC<{ pageId: string; open: boolean; onClose: () => void; userId: string | undefined }> = ({ pageId, open, onClose, userId }) => {
  const [comments, setComments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [input, setInput] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Get current user from localStorage
  let localUserName: string | undefined = undefined;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      localUserName = userObj?.Name || userObj?.name;
    }
  } catch {}

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchCommentsByPage(pageId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [open, pageId]);

  const handleAdd = async () => {
    if (!input.trim()) return;
    setSubmitting(true);
    try {
      const comment = await addComment({ pageId, content: input });
      setComments((prev) => [...prev, comment]);
      setInput('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} footer={null} title="Comments" width={420}
      style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      bodyStyle={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, maxHeight: 'calc(80vh - 120px)' }}>
        {loading ? <Spin /> : comments.length === 0 ? <div>No comments yet.</div> : comments.map((c) => (
          <Card
            key={c.CommentID}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              padding: 5, // Set green section padding to 5px
              marginBottom: 16,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minWidth: 260,
              maxWidth: 360,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, padding: '14px 18px 0 18px' }}>
              <span style={{ fontWeight: 600, color: '#222' }}>{c.UserName || localUserName || 'User'}</span>
              <span style={{ fontSize: 13, color: '#555', fontWeight: 400 }}>{new Date(c.CreatedAt).toLocaleString()}</span>
            </div>
            <div style={{ color: '#333', fontSize: 15, padding: '0 18px 12px 18px' }}>{c.Content}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          placeholder="Add Comment"
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={handleAdd}
          disabled={submitting}
        />
        <Button type="primary" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 17.5L17.5 10L2.5 2.5V8.33333L12.5 10L2.5 11.6667V17.5Z" fill="#11998e"/></svg>} onClick={handleAdd} loading={submitting} style={{ background: '#fff', border: '1px solid #11998e' }} />
      </div>
    </Modal>
  );
};

// Custom PageNode component
const PageNode = ({ id, data, selected }: any) => {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(data.label || 'Untitled');
  const [tempTitle, setTempTitle] = React.useState(title);
  const { setNodes } = React.useContext(PageNodeContext);
  const [commentOpen, setCommentOpen] = React.useState(false);

  const handleEdit = () => {
    setTempTitle(title);
    setEditing(true);
  };
  const handleCancel = () => {
    setEditing(false);
    setTempTitle(title);
  };
  const handleSave = async () => {
    setTitle(tempTitle);
    setEditing(false);
    await updatePageTitle(id, tempTitle);
  };
  const handleDelete = async () => {
    setNodes((nds: any[]) => nds.filter((n) => n.id !== id));
    try {
      await deletePage(id);
      message.success('Page deleted!');
    } catch (e) {
      message.error('Failed to delete page');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: selected ? '0 0 0 2px #11998e' : '0 1px 4px #e5e7eb', padding: 8, minWidth: 220, minHeight: 120, border: '1px solid #eee', position: 'relative' }}>
      {/* Left (target) handle */}
      <Handle type="target" position={Position.Left} style={{ background: '#11998e' }} />
      {/* Node content */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {editing ? (
          <Input
            value={tempTitle}
            onChange={e => setTempTitle(e.target.value)}
            size="small"
            style={{ fontWeight: 600, fontSize: 16, marginRight: 8 }}
            autoFocus
          />
        ) : (
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
        )}
        <div>
          {editing ? (
            <>
              <CheckOutlined style={{ color: '#11998e', marginRight: 8, cursor: 'pointer' }} onClick={handleSave} />
              <CloseOutlined style={{ color: '#f5222d', cursor: 'pointer' }} onClick={handleCancel} />
            </>
          ) : (
            <>
              <EditOutlined style={{ color: '#64748b', marginRight: 8, cursor: 'pointer' }} onClick={handleEdit} />
              <DeleteOutlined style={{ color: '#f5222d', cursor: 'pointer' }} onClick={handleDelete} />
            </>
          )}
        </div>
      </div>
      {data.screenshotPath && (
        <img src={data.screenshotPath} alt={title} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, margin: '8px 0' }} />
      )}
      {/* Removed label display under the image */}
      <div style={{ color: '#64748b', fontSize: 13, cursor: 'pointer', marginTop: 8 }} onClick={() => setCommentOpen(true)}>
        Click to add comments...
      </div>
      <CommentModal pageId={id} open={commentOpen} onClose={() => setCommentOpen(false)} userId={undefined} />
      {/* Right (source) handle */}
      <Handle type="source" position={Position.Right} style={{ background: '#11998e' }} />
    </div>
  );
};

const nodeTypes = { pageNode: PageNode };

const WorkflowBuilderPage: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [pmName, setPmName] = useState<string>('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Debounced position update
  const debouncedUpdatePagePosition = debounce(updatePagePosition, 1000);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchProjectById(id),
      fetchPagesByProject(id),
      fetchWorkflowsByProject(id),
    ]).then(async ([proj, pages, workflows]) => {
      setProject(proj);
      setNodes(
        pages.map((p: any) => ({
          id: String(p.PageID ?? ''),
          data: { label: p.Title || 'Untitled', screenshotPath: p.ScreenshotPath, description: p.Description },
          position: { x: p.PositionX || 0, y: p.PositionY || 0 },
          type: 'pageNode',
        }))
      );
      setEdges(workflows);
      // Fetch PM name
      if (proj?.CreatedBy) {
        try {
          const user = await fetchUserById(proj.CreatedBy);
          setPmName(user.Name || proj.CreatedBy);
        } catch {
          setPmName(proj.CreatedBy);
        }
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddScreens = async (files: File[], blanks: number) => {
    try {
      // For each file, upload to Supabase and create a page with the public URL
      const newPages = [];
      const userId = 'demo-user'; // Replace with real user ID if available
      for (const file of files) {
        const screenshotPath = await uploadFileToSupabase(file, userId);
        const page = await createPage({
          projectId: id ?? '',
          title: file.name,
          screenshotPath,
          order: nodes.length + newPages.length + 1,
        });
        newPages.push({
          id: String(page.PageID ?? ''),
          data: { label: page.Title || 'Untitled', screenshotPath: page.ScreenshotPath },
          position: { x: 100 + 60 * (nodes.length + newPages.length), y: 100 },
          type: 'pageNode',
        });
      }
      // For each blank, create a blank page
      for (let i = 0; i < blanks; i++) {
        const page = await createPage({
          projectId: id ?? '',
          title: `Blank Screen ${nodes.length + newPages.length + 1}`,
          screenshotPath: '',
          order: nodes.length + newPages.length + 1,
        });
        newPages.push({
          id: String(page.PageID ?? ''),
          data: { label: page.Title || 'Untitled', screenshotPath: page.ScreenshotPath },
          position: { x: 100 + 60 * (nodes.length + newPages.length), y: 100 },
          type: 'pageNode',
        });
      }
      setNodes([...nodes, ...newPages]);
      message.success('Screens added!');
    } catch (e: any) {
      message.error('Failed to add screens');
    }
  };

  const onConnect = async (params: RFConnection) => {
    try {
      const edge = await createWorkflow({
        fromPageId: params.source!, // non-null assertion
        toPageId: params.target!,   // non-null assertion
      });
      setEdges((eds) => addEdge(edge, eds));
      message.success('Connection created!');
    } catch (e) {
      message.error('Failed to create connection');
    }
  };

  const onEdgeClick = async (_: any, edge: RFEdgeType) => {
    try {
      await deleteWorkflow(edge.id!); // non-null assertion
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      message.success('Connection deleted!');
    } catch (e) {
      message.error('Failed to delete connection');
    }
  };

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    changes.forEach((change) => {
      if (change.type === 'position' && change.position && change.id) {
        debouncedUpdatePagePosition(change.id, {
          PositionX: change.position.x,
          PositionY: change.position.y,
        });
      }
    });
  };

  // Handler for status change
  const handleStatusChange = async (newStatus: string) => {
    if (project.Status === newStatus) return;
    try {
      const updated = await updateProject(project.ProjectID, { status: newStatus });
      setProject((prev: any) => ({ ...prev, Status: newStatus }));
      message.success('Project status updated!');
    } catch (e) {
      message.error('Failed to update status');
    }
  };

  // Handler for PDF export
  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 15;
    const left = 15;
    const lineHeight = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxImgWidth = pageWidth - 2 * left;
    const maxImgHeight = 60;

    // Project Info
    doc.setFontSize(18);
    doc.text(project.Title, left, y);
    y += lineHeight + 2;
    doc.setFontSize(12);
    doc.text(`Source System: Epic`, left, y);
    y += lineHeight;
    doc.text(`PM: ${project.CreatedByName || pmName || project.CreatedBy}`, left, y);
    y += lineHeight;
    doc.text(`Status: ${project.Status}`, left, y);
    y += lineHeight;
    doc.text(`Generated: ${new Date().toLocaleString()}`, left, y);
    y += lineHeight * 2;
    doc.setFontSize(15);
    doc.text('Workflow Overview', left, y);
    y += lineHeight * 1.5;
    doc.setFontSize(13);
    doc.text('Screens:', left, y);
    y += lineHeight;

    // Screens (images and titles)
    for (const node of nodes) {
      if (y > 250) { doc.addPage(); y = 15; }
      doc.setFont(undefined, 'bold');
      doc.text(node.data.label || 'Untitled', left, y);
      doc.setFont(undefined, 'normal');
      y += lineHeight;
      if (node.data.screenshotPath) {
        try {
          // Load image as base64
          const imgData = await new Promise<string>((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
              const canvas = document.createElement('canvas');
              let ratio = Math.min(maxImgWidth / img.width, maxImgHeight / img.height, 1);
              canvas.width = img.width * ratio;
              canvas.height = img.height * ratio;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.92));
            };
            img.onerror = reject;
            img.src = node.data.screenshotPath;
          });
          doc.addImage(imgData, 'JPEG', left, y, maxImgWidth, maxImgHeight);
          y += maxImgHeight + 4;
        } catch {
          doc.setFontSize(11);
          doc.text('(Image failed to load)', left, y);
          y += lineHeight;
        }
      } else {
        doc.setFontSize(11);
        doc.text('(No image)', left, y);
        y += lineHeight;
      }
      y += 2;
    }
    doc.save(`${project.Title.replace(/\s+/g, '_')}_workflow.pdf`);
  };

  if (loading || !project) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Spin size="large" /></div>;

  return (
    <PageNodeContext.Provider value={{ setNodes }}>
      <div style={{ height: '100vh', background: '#f5f7fa' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: 24, background: '#fff', borderBottom: '1px solid #eee' }}>
          <Button type="link" style={{ marginRight: 16 }} href="/dashboard">&larr; Back to Dashboard</Button>
          <Title level={3} style={{ margin: 0 }}>{project.Title}</Title>
          <Tag color="green" style={{ marginLeft: 16 }}>{project.Status}</Tag>
          <div style={{ marginLeft: 32, color: '#64748b' }}>
            {project.System || ''} &bull; PM: {project.CreatedByName || pmName || project.CreatedBy || <Spin size="small" />} &bull;
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button icon={<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 10v2a2 2 0 002 2h4a2 2 0 002-2v-2" stroke="#11998e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.999 2v8m0 0l-2.5-2.5M8 10l2.5-2.5" stroke="#11998e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} onClick={handleExportPDF} style={{ border: '1px solid #e5e7eb', background: '#fff', fontWeight: 500 }}>Export PDF</Button>
            <Button
              style={{ border: '1px solid #e5e7eb', background: project.Status === 'Working' ? '#f6f8fa' : '#fff', fontWeight: 500, color: '#222', borderRadius: 8 }}
              onClick={() => handleStatusChange('Working')}
              type={project.Status === 'Working' ? 'default' : 'text'}
            >
              Working
            </Button>
            <Button
              style={{ border: '1px solid #e5e7eb', background: project.Status === 'Review' ? '#f6f8fa' : '#fff', fontWeight: 500, color: '#222', borderRadius: 8 }}
              onClick={() => handleStatusChange('Review')}
              type={project.Status === 'Review' ? 'default' : 'text'}
            >
              Review
            </Button>
            <Button
              style={{ border: 'none', background: project.Status === 'Ready' ? '#19c37d' : '#e5e7eb', color: project.Status === 'Ready' ? '#fff' : '#222', fontWeight: 600, borderRadius: 8, minWidth: 80 }}
              onClick={() => handleStatusChange('Ready')}
              type={project.Status === 'Ready' ? 'primary' : 'default'}
            >
              Ready
            </Button>
            <Button type="primary" style={{ background: '#11998e', borderColor: '#11998e' }} onClick={() => setAddModalOpen(true)}>Add Screens</Button>
          </div>
        </div>
        <div style={{ height: 'calc(100vh - 80px)' }}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView 
            onConnect={onConnect} 
            onEdgeClick={onEdgeClick}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <AddScreensModal open={addModalOpen} onCancel={() => setAddModalOpen(false)} onSubmit={handleAddScreens} />
      </div>
    </PageNodeContext.Provider>
  );
};

export default WorkflowBuilderPage; 