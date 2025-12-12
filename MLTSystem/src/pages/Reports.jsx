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
  Alert,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as ReportsController from "../controllers/ReportsController";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewReportDialog, setViewReportDialog] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
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
    <Box sx={{ 
      background: 'linear-gradient(135deg, #e5b8f5 0%, #f3e0f9 100%)', 
      minHeight: "100vh", 
      pt: 10, 
      pb: 4, 
      px: 4 
    }}>
      {/* Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', 
          color: 'white', 
          p: 4, 
          borderRadius: 4, 
          mb: 4,
          boxShadow: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Reports Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Review and resolve user reports and issues
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3, 
          boxShadow: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
      >
        <Table>
            <TableHead sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>Reporter</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>Reported User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {reports.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No reports found</Typography>
                        </TableCell>
                    </TableRow>
                ) : (
                    reports.map((report) => (
                        <TableRow key={report.id} hover sx={{ '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.05)' } }}>
                            <TableCell>#{report.id}</TableCell>
                            <TableCell>{report.reporter_name || report.reporter_id}</TableCell>
                            <TableCell>{report.reported_name || report.reported_id || 'N/A'}</TableCell>
                            <TableCell>
                                <Chip label={report.category} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={report.status === 'dismissed' ? 'Dismissed' : report.status === 'pending' ? 'Pending' : report.status === 'investigating' ? 'Investigating' : report.status === 'resolved' ? 'Resolved' : report.status} 
                                    color={report.status === 'pending' ? 'warning' : report.status === 'dismissed' ? 'error' : report.status === 'investigating' ? 'info' : report.status === 'resolved' ? 'success' : 'default'} 
                                    size="small" 
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </TableCell>
                            <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  onClick={() => handleOpenReport(report)}
                                  sx={{ borderRadius: 2 }}
                                >
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
      <Dialog 
        open={viewReportDialog} 
        onClose={() => setViewReportDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
            <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Report Details #{selectedReport?.id}</Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 3 }}>
                {selectedReport && (
                    <Box display="flex" flexDirection="column" gap={3}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Reporter</Typography>
                                <Typography variant="body1" fontWeight="500">{selectedReport.reporter_name} ({selectedReport.reporter_id})</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Reported User</Typography>
                                <Typography variant="body1" fontWeight="500">{selectedReport.reported_name || 'N/A'} ({selectedReport.reported_id || 'N/A'})</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                                <Typography variant="body1" fontWeight="500">{selectedReport.category}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">Target</Typography>
                                <Typography variant="body1" fontWeight="500">{selectedReport.target_type} (ID: {selectedReport.target_id})</Typography>
                            </Grid>
                        </Grid>
                        
                        <Divider />
                        
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                              <Typography variant="body1">{selectedReport.description}</Typography>
                          </Paper>
                        </Box>

                        {selectedReport.evidence_url && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Evidence</Typography>
                                <Box mt={1}>
                                    {selectedReport.evidence_url.startsWith('data:image') ? (
                                        <Box>
                                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                                                <img 
                                                    src={selectedReport.evidence_url} 
                                                    alt="Evidence" 
                                                    style={{ maxWidth: '100%', maxHeight: 300, display: 'block', borderRadius: 8, border: '1px solid #eee', cursor: 'pointer' }} 
                                                    onClick={() => setExpandedImage(selectedReport.evidence_url)}
                                                />
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 5,
                                                        right: 5,
                                                        bgcolor: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                                    }}
                                                    onClick={() => setExpandedImage(selectedReport.evidence_url)}
                                                    title="Expand image"
                                                >
                                                    <SearchIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <Box>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => downloadEvidence(selectedReport.evidence_url, `evidence-${selectedReport.id}.png`)}
                                                >
                                                    Download Image
                                                </Button>
                                            </Box>
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
                                variant="outlined"
                            />
                        </FormControl>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                <Button onClick={() => setViewReportDialog(false)} color="inherit">Close</Button>
                <Button onClick={() => handleUpdateReportStatus('dismissed')} color="error">Dismiss</Button>
                <Button onClick={() => handleUpdateReportStatus('investigating')} color="info" variant="outlined">Investigating</Button>
                <Button onClick={() => handleUpdateReportStatus('resolved')} color="success" variant="contained" disableElevation>Resolve</Button>
            </DialogActions>
        </Dialog>

        {/* Image Expansion Dialog */}
        <Dialog
            open={!!expandedImage}
            onClose={() => setExpandedImage(null)}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconButton
                    onClick={() => setExpandedImage(null)}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                        zIndex: 1
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <img
                    src={expandedImage}
                    alt="Expanded view"
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: 8
                    }}
                />
            </Box>
        </Dialog>
    </Box>
  );
}
