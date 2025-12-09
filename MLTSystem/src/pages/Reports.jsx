import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  TextField as MuiTextField,
  FormControl,
  Alert
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as ReportsController from "../controllers/ReportsController";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewReportDialog, setViewReportDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
      try {
          const data = await ReportsController.getReports();
          setReports(data);
          setError('');
      } catch (err) {
          console.error('Failed to fetch reports', err);
          if (err.message.includes('Invalid or expired token') || err.message.includes('Unauthorized')) {
              // Session expired, redirect to login
              logout();
              navigate('/login', { state: { message: 'Your session has expired. Please login again.' } });
          } else {
              setError('Failed to load reports: ' + err.message);
          }
      }
  };

  const handleOpenReport = (report) => {
      setSelectedReport(report);
      setAdminNote(report.admin_notes || '');
      setViewReportDialog(true);
  };

  const handleUpdateReportStatus = async (status) => {
      if (!selectedReport) return;
      setLoading(true);
      try {
          await ReportsController.updateReport(selectedReport.id, status, adminNote);
          setViewReportDialog(false);
          fetchReports();
          // alert(`Report marked as ${status}`);
      } catch (err) {
          if (err.message.includes('Invalid or expired token') || err.message.includes('Unauthorized')) {
              logout();
              navigate('/login', { state: { message: 'Your session has expired. Please login again.' } });
          } else {
              alert('Failed to update report: ' + err.message);
          }
      } finally {
          setLoading(false);
      }
  };

  const downloadEvidence = (url, filename) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'evidence';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Reports Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Reporter</TableCell>
                    <TableCell>Reported User</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {reports.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} align="center">No reports found</TableCell>
                    </TableRow>
                ) : (
                    reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>#{report.id}</TableCell>
                            <TableCell>{report.reporter_name || report.reporter_id}</TableCell>
                            <TableCell>{report.reported_name || report.reported_id || 'N/A'}</TableCell>
                            <TableCell>
                                <Chip label={report.category} size="small" />
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={report.status === 'dismissed' ? 'Dismissed' : report.status === 'pending' ? 'Pending' : report.status === 'investigating' ? 'Investigating' : report.status === 'resolved' ? 'Resolved' : report.status} 
                                    color={report.status === 'pending' ? 'warning' : report.status === 'dismissed' ? 'error' : report.status === 'investigating' ? 'info' : report.status === 'resolved' ? 'success' : 'default'} 
                                    size="small" 
                                />
                            </TableCell>
                            <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button size="small" variant="outlined" onClick={() => handleOpenReport(report)}>
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </TableContainer>

      {/* Report Details Dialog */}
      <Dialog open={viewReportDialog} onClose={() => setViewReportDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Report Details #{selectedReport?.id}</DialogTitle>
            <DialogContent dividers>
                {selectedReport && (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Reporter</Typography>
                                <Typography variant="body1">{selectedReport.reporter_name} ({selectedReport.reporter_id})</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Reported User</Typography>
                                <Typography variant="body1">{selectedReport.reported_name || 'N/A'} ({selectedReport.reported_id || 'N/A'})</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Category</Typography>
                                <Typography variant="body1">{selectedReport.category}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Target</Typography>
                                <Typography variant="body1">{selectedReport.target_type} (ID: {selectedReport.target_id})</Typography>
                            </Grid>
                        </Grid>
                        
                        <Divider />
                        
                        <Typography variant="subtitle2">Description</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="body1">{selectedReport.description}</Typography>
                        </Paper>

                        {selectedReport.evidence_url && (
                            <Box>
                                <Typography variant="subtitle2">Evidence</Typography>
                                <Box mt={1}>
                                    {selectedReport.evidence_url.startsWith('data:image') ? (
                                        <Box>
                                            <img 
                                                src={selectedReport.evidence_url} 
                                                alt="Evidence" 
                                                style={{ maxWidth: '100%', maxHeight: 300, display: 'block', marginBottom: 8 }} 
                                            />
                                            <Button 
                                                variant="outlined" 
                                                size="small"
                                                onClick={() => downloadEvidence(selectedReport.evidence_url, `evidence-${selectedReport.id}.png`)}
                                            >
                                                Download Image
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button 
                                            variant="contained" 
                                            onClick={() => downloadEvidence(selectedReport.evidence_url, `evidence-${selectedReport.id}`)}
                                        >
                                            Download Attached File
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}

                        <Divider />

                        <FormControl fullWidth>
                            <MuiTextField 
                                label="Admin Notes"
                                multiline
                                rows={3}
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Enter notes about action taken..."
                            />
                        </FormControl>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setViewReportDialog(false)}>Close</Button>
                <Button onClick={() => handleUpdateReportStatus('dismissed')} color="error">Dismiss</Button>
                <Button onClick={() => handleUpdateReportStatus('investigating')} color="info" variant="outlined">Investigating</Button>
                <Button onClick={() => handleUpdateReportStatus('resolved')} color="success" variant="contained">Resolve</Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
}
