import React, { useEffect, useState } from 'react';
import {
  Paper,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { apiRequest } from '../api';

export function Permissions({ setStatus }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPermissions = async () => {
    setLoading(true);
    setError('');
    setStatus('Đang tải permissions...', 'info');
    try {
      const res = await apiRequest('/permissions');
      setPermissions(res || []);
      setStatus('Đã tải permissions', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setStatus('Đang tạo permission...', 'info');
    try {
      await apiRequest('/permissions', {
        method: 'POST',
        body: { name: newName, description: newDescription || undefined },
      });
      setNewName('');
      setNewDescription('');
      await loadPermissions();
      setStatus('Tạo permission thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (perm) => {
    setEditingId(perm.id);
    setEditingDescription(perm.description || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setStatus('Đang cập nhật permission...', 'info');
    try {
      await apiRequest(`/permissions/${editingId}`, {
        method: 'PUT',
        body: { description: editingDescription },
      });
      setEditingId(null);
      setEditingDescription('');
      await loadPermissions();
      setStatus('Cập nhật permission thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Permissions
          </Typography>

          <Box
            component="form"
            className="team-form"
            onSubmit={handleCreate}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}
          >
            <TextField
              label="Tên permission"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="vd: website:create"
              required
              size="small"
            />
            <TextField
              label="Mô tả"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn"
              size="small"
            />
            <Button type="submit" variant="contained" size="small" disabled={saving}>
              Thêm permission
            </Button>
          </Box>

          {loading && <Typography>Đang tải...</Typography>}
          {error && <div className="dashboard-error">Lỗi: {error}</div>}

          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="empty-row">
                    Chưa có permission nào
                  </TableCell>
                </TableRow>
              )}
              {permissions.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.description || '-'}</TableCell>
                  <TableCell>
                    <Button type="button" size="small" onClick={() => startEdit(p)}>
                      Sửa mô tả
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Cập nhật mô tả permission
          </Typography>
          {!editingId && (
            <Typography variant="body2" className="muted">
              Chọn "Sửa mô tả" ở bảng bên trái để chỉnh.
            </Typography>
          )}

          {editingId && (
            <Box
              component="form"
              className="team-form"
              onSubmit={handleUpdate}
              sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <TextField
                label="Mô tả mới"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                size="small"
              />
              <Button type="submit" variant="contained" size="small" disabled={saving}>
                Lưu mô tả
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
