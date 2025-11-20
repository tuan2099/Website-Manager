import React, { useEffect, useState } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Typography,
} from '@mui/material';
import { apiRequest } from '../api';

export function WebsiteDetail({ websiteId, onClose, setStatus }) {
  const [website, setWebsite] = useState(null);
  const [dns, setDns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'members' | 'tags'
  const [memberUserId, setMemberUserId] = useState('');
  const [memberPermission, setMemberPermission] = useState('view');
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('');
  const [editName, setEditName] = useState('');
  const [editDomain, setEditDomain] = useState('');

  useEffect(() => {
    if (!websiteId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      setStatus('Đang tải chi tiết website...', 'info');
      try {
        const [detail, dnsResult] = await Promise.all([
          apiRequest(`/websites/${websiteId}`),
          apiRequest(`/websites/${websiteId}/dns-records`),
        ]);
        if (!cancelled) {
          setWebsite(detail);
          setDns(dnsResult || []);
          setEditName(detail.name || '');
          setEditDomain(detail.domain || '');
          setStatus('Đã tải chi tiết website', 'success');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus(err.message, 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // setStatus được tạo lại ở App mỗi render nên không đưa vào deps để tránh loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberUserId.trim()) return;
    setStatus('Đang thêm member cho website...', 'info');
    try {
      await apiRequest(`/websites/${websiteId}/members`, {
        method: 'POST',
        body: { user_id: Number(memberUserId), permission: memberPermission },
      });
      setMemberUserId('');
      setStatus('Thêm member thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    };
  };

  const handleRemoveMember = async (userId) => {
    setStatus('Đang xoá member...', 'info');
    try {
      await apiRequest(`/websites/${websiteId}/members/${userId}`, {
        method: 'DELETE',
      });
      const detail = await apiRequest(`/websites/${websiteId}`);
      setWebsite(detail);
      setStatus('Đã xoá member khỏi website', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  const handleUpdateWebsite = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editDomain.trim()) return;
    setStatus('Đang cập nhật website...', 'info');
    try {
      const updated = await apiRequest(`/websites/${websiteId}`, {
        method: 'PUT',
        body: { name: editName, domain: editDomain },
      });
      setWebsite(updated);
      setStatus('Cập nhật website thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  const handleDeleteWebsite = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Bạn có chắc muốn xoá website này?')) return;
    setStatus('Đang xoá website...', 'info');
    try {
      await apiRequest(`/websites/${websiteId}`, {
        method: 'DELETE',
      });
      setStatus('Đã xoá website', 'success');
      onClose();
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    setStatus('Đang thêm tag...', 'info');
    try {
      await apiRequest(`/websites/${websiteId}/tags`, {
        method: 'POST',
        body: { name: tagName, color: tagColor || undefined },
      });
      setTagName('');
      setTagColor('');
      // reload website để có danh sách tag mới
      const detail = await apiRequest(`/websites/${websiteId}`);
      setWebsite(detail);
      setStatus('Thêm tag thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  const handleRemoveTag = async (tagId) => {
    setStatus('Đang xoá tag...', 'info');
    try {
      await apiRequest(`/websites/${websiteId}/tags/${tagId}`, {
        method: 'DELETE',
      });
      const detail = await apiRequest(`/websites/${websiteId}`);
      setWebsite(detail);
      setStatus('Đã xoá tag', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  if (!websiteId) return null;

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Chi tiết website</Typography>
        <Button variant="outlined" size="small" onClick={onClose}>
          Đóng
        </Button>
      </Box>
      {loading && <Typography>Đang tải...</Typography>}
      {error && <div className="dashboard-error">Lỗi: {error}</div>}
      {website && (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Members" value="members" />
            <Tab label="Tags" value="tags" />
          </Tabs>

          {activeTab === 'overview' && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" gutterBottom>
                  Thông tin chung
                </Typography>
                <Box sx={{ mb: 1, fontSize: 14 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span className="muted">Tên:</span>
                    <span>{website.name}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span className="muted">Domain:</span>
                    <span>{website.domain}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span className="muted">Status:</span>
                    <span>
                      <Chip
                        size="small"
                        label={website.status}
                        className={`status-chip status-${website.status}`}
                      />
                    </span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span className="muted">Registrar:</span>
                    <span>{website.registrar || '-'}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span className="muted">Hosting:</span>
                    <span>{website.hosting_provider || '-'}</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span className="muted">Tags:</span>
                    <span>
                      {Array.isArray(website.tags) && website.tags.length ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {website.tags.map((t) => (
                            <Chip key={t.id || t.name} size="small" label={t.name} className="tag-chip" />
                          ))}
                        </Box>
                      ) : (
                        <span className="muted">Không có</span>
                      )}
                    </span>
                  </Box>
                </Box>

                <Box
                  component="form"
                  onSubmit={handleUpdateWebsite}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}
                >
                  <Typography variant="subtitle1">Cập nhật cơ bản</Typography>
                  <TextField
                    label="Tên"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                    required
                  />
                  <TextField
                    label="Domain"
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    size="small"
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button type="submit" variant="contained" size="small">
                      Lưu thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleDeleteWebsite}
                    >
                      Xoá website
                    </Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Checks gần đây
                </Typography>
                {Array.isArray(website.checks) && website.checks.length ? (
                  <ul className="checks-list">
                    {website.checks.map((c) => (
                      <li key={c.id}>
                        <span className={`status-chip status-${c.status}`}>{c.status}</span>{' '}
                        <span>{c.check_type}</span>{' '}
                        <span className="muted">
                          ({new Date(c.checked_at).toLocaleString()})
                        </span>
                        {c.message && <div className="check-message">{c.message}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="muted">Chưa có checks</div>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  DNS records
                </Typography>
                {dns.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Host</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dns.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.record_type}</TableCell>
                          <TableCell>{r.host}</TableCell>
                          <TableCell>{r.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="muted">Chưa có DNS record</div>
                )}
              </Grid>
            </Grid>
          )}

          {activeTab === 'members' && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Members (per-website)
              </Typography>
              <Typography variant="body2" className="muted" gutterBottom>
                Quản lý quyền truy cập ở mức website. Backend cần trả về website.members để hiển thị danh
                sách.
              </Typography>

              {Array.isArray(website.members) && website.members.length > 0 ? (
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>User ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Tên</TableCell>
                      <TableCell>Permission</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {website.members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.id}</TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell>{m.name}</TableCell>
                        <TableCell>{m.WebsiteMember?.permission || 'view'}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveMember(m.id)}
                          >
                            Xoá
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="muted" style={{ marginTop: '4px' }}>
                  Chưa có member nào cho website này.
                </div>
              )}

              <Box
                component="form"
                onSubmit={handleAddMember}
                className="team-form"
                sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}
              >
                <TextField
                  label="User ID"
                  type="number"
                  value={memberUserId}
                  onChange={(e) => setMemberUserId(e.target.value)}
                  required
                  size="small"
                />
                <TextField
                  label="Permission"
                  select
                  SelectProps={{ native: true }}
                  value={memberPermission}
                  onChange={(e) => setMemberPermission(e.target.value)}
                  size="small"
                >
                  <option value="view">view</option>
                  <option value="edit">edit</option>
                </TextField>
                <Button type="submit" variant="contained" size="small">
                  Gán member
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 'tags' && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box
                component="form"
                onSubmit={handleAddTag}
                className="team-form"
                sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}
              >
                <TextField
                  label="Tên tag"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                  size="small"
                />
                <TextField
                  label="Màu (optional)"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  placeholder="#1d4ed8 hoặc class tuỳ bạn dùng sau"
                  size="small"
                />
                <Button type="submit" variant="contained" size="small">
                  Thêm tag
                </Button>
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Danh sách tags
              </Typography>
              {Array.isArray(website.tags) && website.tags.length ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {website.tags.map((t) => (
                    <Chip
                      key={t.id || t.name}
                      size="small"
                      label={t.name}
                      onDelete={t.id ? () => handleRemoveTag(t.id) : undefined}
                      className="tag-chip tag-chip-removable"
                    />
                  ))}
                </Box>
              ) : (
                <div className="muted">Chưa có tag</div>
              )}
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
