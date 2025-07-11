import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Add interceptor to include Bearer token in all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export async function register({ name, email, password, role }: { name?: string; email: string; password: string; role: string }) {
  const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password, role });
  return res.data; // { user, token }
}

export async function login({ email, password }: { email: string; password: string }) {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
  return res.data; // { user, token }
}

export async function fetchProjectManagers() {
  const res:any = await axios.get(`${API_BASE_URL}/auth/users`);
  return res.data.users;
}

export async function createProject({ name, pm, system }: { name: string; pm: string; system: string }) {
  const res:any = await axios.post(`${API_BASE_URL}/projects`, {
    Title: name,
    CreatedBy: pm,
    System: system,
  });
  return res.data.project;
}

export async function fetchProjectById(id: string) {
  const res:any = await axios.get(`${API_BASE_URL}/projects/${id}`);
  return res.data.project;
}

export async function fetchPagesByProject(projectId: string) {
  const res:any = await axios.get(`${API_BASE_URL}/pages?projectId=${projectId}`);
  return res.data.pages;
}

export async function fetchWorkflowsByProject(projectId: string) {
  const res:any = await axios.get(`${API_BASE_URL}/workflows?projectId=${projectId}`);
  // Map backend fields to ReactFlow edge fields
  return res.data.workflows.map((w: any) => ({
    id: String(w.WorkflowID ?? ''),
    source: String(w.FromPageID ?? ''),
    target: String(w.ToPageID ?? ''),
    label: w.Label,
    type: 'smoothstep',
  }));
}

export async function fetchProjects() {
  const res:any = await axios.get(`${API_BASE_URL}/projects`);
  return res.data.projects;
}

export async function createPage({ projectId, title, screenshotPath, order }: { projectId: string; title: string; screenshotPath: string; order: number }) {
  const res:any = await axios.post(`${API_BASE_URL}/pages`, {
    projectId,
    title,
    screenshotPath,
    order,
  });
  return res.data.page;
}

export async function createWorkflow({ fromPageId, toPageId, label }: { fromPageId: string; toPageId: string; label?: string }) {
  const res:any = await axios.post(`${API_BASE_URL}/workflows`, {
    fromPageId,
    toPageId,
    label,
  });
  // Map backend fields to ReactFlow edge fields
  const w = res.data.workflow;
  return {
    id: String(w.WorkflowID ?? ''),
    source: String(w.FromPageID ?? ''),
    target: String(w.ToPageID ?? ''),
    label: w.Label,
    type: 'smoothstep',
  };
}

export async function deleteWorkflow(id: string) {
  await axios.delete(`${API_BASE_URL}/workflows/${id}`);
}

export async function updatePagePosition(pageId: string, position: { PositionX: number; PositionY: number }) {
  const res:any = await axios.put(`${API_BASE_URL}/pages/${pageId}`, position);
  return res.data.page;
}

export async function updatePageTitle(pageId: string, title: string) {
  const res:any = await axios.put(`${API_BASE_URL}/pages/${pageId}`, { title });
  return res.data.page;
}

export async function deletePage(pageId: string) {
  const res = await axios.delete(`${API_BASE_URL}/pages/${pageId}`);
  return res;
}

export async function fetchUserById(userId: string) {
  const res:any = await axios.get(`${API_BASE_URL}/auth/users?id=${userId}`);
  return res.data.user;
}

export async function fetchCommentsByPage(pageId: string) {
  const res:any = await axios.get(`${API_BASE_URL}/comments?pageId=${pageId}`);
  return res.data.comments;
}

export async function addComment({ pageId, content }: { pageId: string; content: string }) {
  const res:any = await axios.post(`${API_BASE_URL}/comments`, { pageId, content });
  return res.data.comment;
}

export async function updateProject(projectId: string, data: { status?: string; title?: string; description?: string }) {
  const res: any = await axios.put(`${API_BASE_URL}/projects/${projectId}`, data);
  return res.data.project;
} 