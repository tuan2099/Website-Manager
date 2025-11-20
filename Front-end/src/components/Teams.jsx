import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';
import { apiRequest } from '../api';

export function Teams({ setStatus }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  const load = async () => {
    setLoading(true);
    setError('');
    setStatus('Đang tải danh sách teams...', 'info');
    try {
      const res = await apiRequest('/teams');
      setTeams(res || []);
      setStatus('Đã tải danh sách teams', 'success');
    } catch (err) {
      setError(err.message);
      setStatus(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setStatus('Đang tạo team...', 'info');
    try {
      await apiRequest('/teams', {
        method: 'POST',
        body: { name: newTeamName, description: newTeamDesc },
      });
      setNewTeamName('');
      setNewTeamDesc('');
      await load();
      setStatus('Tạo team thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || !memberUserId.trim()) return;
    setStatus('Đang thêm member...', 'info');
    try {
      await apiRequest(`/teams/${selectedTeamId}/users`, {
        method: 'POST',
        body: { user_id: Number(memberUserId), role: memberRole },
      });
      setMemberUserId('');
      await load();
      setStatus('Thêm member thành công', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    setStatus('Đang xoá member...', 'info');
    try {
      await apiRequest(`/teams/${teamId}/users/${userId}`, {
        method: 'DELETE',
      });
      await load();
      setStatus('Đã xoá member khỏi team', 'success');
    } catch (err) {
      setStatus(err.message, 'error');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Teams
          </Typography>
          {loading && <Typography>Đang tải...</Typography>}
          {error && <div className="dashboard-error">Lỗi: {error}</div>}

          <Box sx={{ maxHeight: 320, overflowY: 'auto', mb: 2 }}>
            {teams.map((t) => (
              <Box
                key={t.id}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  bgcolor: selectedTeamId === t.id ? '#eff6ff' : 'white',
                }}
                onClick={() => setSelectedTeamId(t.id)}
              >
                <Typography sx={{ fontWeight: 500 }}>{t.name}</Typography>
                {t.description && (
                  <Typography variant="body2" className="muted">
                    {t.description}
                  </Typography>
                )}
                <Typography variant="caption" className="muted">
                  {Array.isArray(t.members) ? t.members.length : 0} members
                </Typography>
              </Box>
            ))}
            {teams.length === 0 && !loading && (
              <Typography variant="body2" className="muted">
                Chưa có team nào
              </Typography>
            )}
          </Box>

          <Box
            component="form"
            className="team-form"
            onSubmit={handleCreateTeam}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <Typography variant="subtitle1">Tạo team mới</Typography>
            <TextField
              label="Tên team"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Mô tả (optional)"
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              size="small"
            />
            <Button type="submit" variant="contained" size="small">
              Tạo
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Chi tiết team
          </Typography>
          {!selectedTeamId && <div className="muted">Chọn một team để xem chi tiết</div>}

          {selectedTeamId && (
            <>
              {teams
                .filter((t) => t.id === selectedTeamId)
                .map((t) => (
                  <Box key={t.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ fontSize: 14 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <span className="muted">Tên:</span>
                        <span>{t.name}</span>
                      </Box>
                      {t.description && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <span className="muted">Mô tả:</span>
                          <span>{t.description}</span>
                        </Box>
                      )}
                    </Box>

                    <Typography variant="subtitle1">Members</Typography>
                    {Array.isArray(t.members) && t.members.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>User ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {t.members.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell>{m.id}</TableCell>
                              <TableCell>{m.email}</TableCell>
                              <TableCell>{m.UserTeam?.role || 'member'}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleRemoveMember(t.id, m.id)}
                                >
                                  Xoá
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="muted">Chưa có member</div>
                    )}

                    <Box
                      component="form"
                      className="team-form"
                      onSubmit={handleAddMember}
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
                      <Select
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="member">member</MenuItem>
                        <MenuItem value="owner">owner</MenuItem>
                      </Select>
                      <Button type="submit" variant="contained" size="small">
                        Thêm
                      </Button>
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
