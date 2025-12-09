import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Alert
} from '@mui/material';
import * as ReportsController from '../controllers/ReportsController';

export default function ReportDialog({ open, onClose, targetType, targetId, reportedId, defaultCategory }) {
    const [category, setCategory] = useState(defaultCategory || '');
    const [description, setDescription] = useState('');
    const [evidence, setEvidence] = useState(null); // File object
    const [evidenceBase64, setEvidenceBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large (max 5MB)');
                return;
            }
            setEvidence(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvidenceBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!category || !description) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await ReportsController.createReport({
                targetType,
                targetId,
                reportedId,
                category,
                description,
                evidenceUrl: evidenceBase64 // Sending base64 as URL for simplicity
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setCategory('');
                setDescription('');
                setEvidence(null);
                setEvidenceBase64('');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Report submitted successfully!</Alert>}
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="harassment">Harassment</MenuItem>
                            <MenuItem value="spam">Spam</MenuItem>
                            <MenuItem value="payment_issue">Payment Issue</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe the issue in detail..."
                        fullWidth
                    />

                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Attach Evidence (Optional, max 5MB)
                        </Typography>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                        />
                        {evidence && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                Selected: {evidence.name}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="error" disabled={loading || success}>
                    {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
