import React, { useEffect, useState } from 'react';
import {
  Paper,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { apiRequest } from '../api';

export function Roles({ setStatus }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [userId, setUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [permsLoading, setPermsLoading] = useState(false);
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    setStatus('Đang tải danh sách roles...', 'info');
    try {
      const res = await apiRequest('/roles');
      setRoles(res || []);
      setStatus('Đã tải danh sách roles', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    const loadPermissions = async () => {
      setPermsLoading(true);
      try {
        const res = await apiRequest('/permissions');
        setAllPermissions(res || []);
      } catch (err) {
        // lỗi load permissions sẽ hiển thị trong phần role nếu cần
      } finally {
        setPermsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await apiRequest('/users');
        setUsers(res || []);
      } catch (err) {
        // lỗi load users sẽ không chặn chức năng khác
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setEditingName('');
      setEditingDesc('');
      setSelectedPermIds([]);
      return;
    }
    const r = roles.find((x) => x.id === selectedRoleId);
    if (r) {
      setEditingName(r.name || '');
      setEditingDesc(r.description || '');
      if (Array.isArray(r.permissions)) {
        setSelectedPermIds(
          r.permissions.map((p) => (p.id != null ? p.id : p.name)).filter(Boolean),
        );
      } else {
        setSelectedPermIds([]);
      }
    }
  }, [selectedRoleId, roles]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !selectedRoleId) return;
    setAssigning(true);
    setStatus('Đang gán role cho user...', 'info');
    try {
      await apiRequest(`/users/${Number(userId)}/roles`, {
        method: 'POST',
        body: { roleIds: [selectedRoleId] },
      });
      setStatus('Gán role thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setSavingRole(true);
    setStatus('Đang tạo role...', 'info');
    try {
      await apiRequest('/roles', {
        method: 'POST',
        body: { name: newRoleName, description: newRoleDesc || undefined },
      });
      setNewRoleName('');
      setNewRoleDesc('');
      await loadRoles();
      setStatus('Tạo role thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleTogglePermission = (permIdOrName) => {
    setSelectedPermIds((prev) => {
      if (prev.includes(permIdOrName)) {
        return prev.filter((id) => id !== permIdOrName);
      }
      return [...prev, permIdOrName];
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPerms(true);
    setStatus('Đang cập nhật permissions cho role...', 'info');
    try {
      await apiRequest(`/roles/${selectedRoleId}/permissions`, {
        method: 'POST',
        body: { permissionIds: selectedPermIds },
      });
      await loadRoles();
      setStatus('Cập nhật permissions cho role thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSavingPerms(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedRoleId || !editingName.trim()) return;
    setSavingRole(true);
    setStatus('Đang cập nhật role...', 'info');
    try {
      await apiRequest(`/roles/${selectedRoleId}`, {
        method: 'PUT',
        body: { name: editingName, description: editingDesc || undefined },
      });
      await loadRoles();
      setStatus('Cập nhật role thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    if (!window.confirm('Bạn có chắc muốn xoá role này?')) return;
    setSavingRole(true);
    setStatus('Đang xoá role...', 'info');
    try {
      await apiRequest(`/roles/${selectedRoleId}`, {
        method: 'DELETE',
      });
      setSelectedRoleId(null);
      await loadRoles();
      setStatus('Đã xoá role', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Roles
          </Typography>
          {loading && <Typography>Đang tải...</Typography>}
          {error && <div className="dashboard-error">Lỗi: {error}</div>}

          <List dense sx={{ maxHeight: 260, overflowY: 'auto' }}>
            {roles.map((r) => (
              <ListItem key={r.id} disablePadding>
                <ListItemButton
                  selected={selectedRoleId === r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                >
                  <ListItemText
                    primary={r.name}
                    secondary={r.description}
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ className: 'muted' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {roles.length === 0 && !loading && (
            <Typography variant="body2" className="muted">
              Chưa có role nào
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleCreateRole}
            sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <Typography variant="subtitle1">Tạo role mới</Typography>
            <TextField
              label="Tên role"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Mô tả (optional)"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              size="small"
            />
            <Button type="submit" variant="contained" size="small" disabled={savingRole}>
              Tạo role
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Chi tiết role
          </Typography>
          {!selectedRoleId && <div className="muted">Chọn một role để xem chi tiết</div>}

          {selectedRoleId && (
            <>
              {roles
                .filter((r) => r.id === selectedRoleId)
                .map((r) => (
                  <Box key={r.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box
                      component="form"
                      onSubmit={handleUpdateRole}
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: 14 }}
                    >
                      <Typography variant="subtitle1">Thông tin role</Typography>
                      <TextField
                        label="Tên role"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        required
                        size="small"
                      />
                      <TextField
                        label="Mô tả"
                        value={editingDesc}
                        onChange={(e) => setEditingDesc(e.target.value)}
                        size="small"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="small"
                          disabled={savingRole}
                        >
                          Lưu role
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={savingRole}
                          onClick={handleDeleteRole}
                        >
                          Xoá role
                        </Button>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1">Permissions</Typography>
                      {permsLoading && (
                        <Typography variant="body2" className="muted">
                          Đang tải danh sách permissions...
                        </Typography>
                      )}
                      {!permsLoading && allPermissions.length === 0 && (
                        <Typography variant="body2" className="muted">
                          Chưa có permission nào. Hãy tạo ở trang Permissions.
                        </Typography>
                      )}
                      {allPermissions.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <FormGroup>
                            {allPermissions.map((p) => {
                              const idOrName = p.id != null ? p.id : p.name;
                              return (
                                <FormControlLabel
                                  key={idOrName}
                                  control={(
                                    <Checkbox
                                      size="small"
                                      checked={selectedPermIds.includes(idOrName)}
                                      onChange={() => handleTogglePermission(idOrName)}
                                    />
                                  )}
                                  label={p.name}
                                />
                              );
                            })}
                          </FormGroup>
                          <Button
                            type="button"
                            variant="contained"
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={handleSavePermissions}
                            disabled={savingPerms}
                          >
                            Lưu permissions
                          </Button>
                        </Box>
                      )}
                    </Box>

                    <Box
                      component="form"
                      className="team-form"
                      onSubmit={handleAssign}
                      sx={{ mt: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}
                    >
                      <TextField
                        label="User ID"
                        type="number"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        size="small"
                      />
                      <Button type="submit" variant="contained" size="small" disabled={assigning}>
                        Gán role này cho user
                      </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">Users đã có role này</Typography>
                      {usersLoading && (
                        <Typography variant="body2" className="muted">
                          Đang tải danh sách users...
                        </Typography>
                      )}
                      {!usersLoading && (
                        (() => {
                          const usersWithRole = users.filter((u) =>
                            Array.isArray(u.roles) && u.roles.some((ur) => ur.id === r.id),
                          );
                          if (usersWithRole.length === 0) {
                            return (
                              <Typography variant="body2" className="muted">
                                Chưa có user nào được gán role này.
                              </Typography>
                            );
                          }
                          return (
                            <ul className="checks-list">
                              {usersWithRole.map((u) => (
                                <li key={u.id}>
                                  #{u.id} - {u.email || u.name || 'User'}
                                </li>
                              ))}
                            </ul>
                          );
                        })()
                      )}
                    </Box>
                  </Box>
                ))}
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
