import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Link,
  Divider,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Cancel, OpenInNew } from "@mui/icons-material";
import { createClient } from "@supabase/supabase-js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { moderators } from "../../libs/userGroups";

interface PendingSubmission {
  id: number;
  title: string;
  descr_short: string;
  url: string;
  type: string;
  language: string;
  author: string;
  pricing_type: string;
  uses_ai_content: boolean;
  additional_notes: string;
  discord_account: string;
  requester_email: string;
  requester_uuid: string;
  requester_display_name: string;
  terms_accepted: boolean;
  contact_consent: boolean;
  license_accepted: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_by: string;
  reviewed_at: string;
  rejection_reason: string;
}

interface ResourceModerationPanelProps {
  open: boolean;
  onClose: () => void;
}

const ResourceModerationPanel: React.FC<ResourceModerationPanelProps> = ({
  open,
  onClose,
}) => {
  const [user] = useAuthState(auth);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const webhookUrl = import.meta.env.VITE_DISCORD_APPLICATIONS_WEBHOOK_URL;

  // Check if user is moderator
  const isModerator = user && moderators.includes(user.uid);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending submissions:", error);
        return;
      }

      setPendingSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isModerator) {
      fetchPendingSubmissions();
    }
  }, [open, isModerator]);

  const approveSubmission = async (submission: PendingSubmission) => {
    if (!isModerator) return;

    setProcessing(submission.id);
    try {
      // Update submission status to approved (this will trigger the database function)
      const { error } = await supabase
        .from("submissions")
        .update({
          status: 'approved',
          reviewed_by: user?.uid,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (error) {
        throw new Error(`Approval failed: ${error.message}`);
      }

      // Send Discord notification
      if (webhookUrl) {
        const embedDescription = `
**✅ RESOURCE APPROVED ✅**

**Resource Details:**
• **Name:** ${submission.title}
• **URL:** ${submission.url}
• **Type:** ${submission.type}
• **Language:** ${submission.language}
• **Author:** ${submission.author}

**Approved by:** ${user?.displayName || user?.email || user?.uid}
• **Submission ID:** ${submission.id}
        `.trim();

        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: null,
              embeds: [{
                title: "✅ Homebrew Resource Approved",
                description: embedDescription,
                color: 65280, // Green color
                footer: {
                  text: "Fultimator Resource System - Approved",
                },
              }],
              username: "Fultimator-Resources",
            }),
          });
        } catch (webhookError) {
          console.warn("Discord notification failed:", webhookError);
        }
      }

      // Remove from pending list
      setPendingSubmissions(prev => prev.filter(s => s.id !== submission.id));
    } catch (error) {
      console.error("Error approving submission:", error);
      alert("Failed to approve submission: " + (error as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const rejectSubmission = async (submission: PendingSubmission) => {
    if (!isModerator) return;

    setProcessing(submission.id);
    try {
      // Update submission status to rejected
      const { error } = await supabase
        .from("submissions")
        .update({
          status: 'rejected',
          reviewed_by: user?.uid,
          reviewed_at: new Date().toISOString(),
          rejection_reason: 'Rejected by moderator'
        })
        .eq("id", submission.id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Send Discord notification
      if (webhookUrl) {
        const embedDescription = `
**❌ RESOURCE REJECTED ❌**

**Resource Details:**
• **Name:** ${submission.title}
• **URL:** ${submission.url}
• **Type:** ${submission.type}
• **Author:** ${submission.author}

**Rejected by:** ${user?.displayName || user?.email || user?.uid}
• **Submission ID:** ${submission.id}
        `.trim();

        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: null,
              embeds: [{
                title: "❌ Homebrew Submission Rejected",
                description: embedDescription,
                color: 16711680, // Red color
                footer: {
                  text: "Fultimator Submission System - Rejected",
                },
              }],
              username: "Fultimator-Resources",
            }),
          });
        } catch (webhookError) {
          console.warn("Discord notification failed:", webhookError);
        }
      }

      // Remove from pending list
      setPendingSubmissions(prev => prev.filter(s => s.id !== submission.id));
    } catch (error) {
      console.error("Error rejecting submission:", error);
      alert("Failed to reject submission: " + (error as Error).message);
    } finally {
      setProcessing(null);
    }
  };


  if (!user) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Access Denied</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            You must be logged in to access the moderation panel.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!isModerator) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Access Denied</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            You do not have moderator permissions to access this panel.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">Resource Moderation Panel</Typography>
        <Typography variant="body2" color="textSecondary">
          Review and approve pending community resources
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : pendingSubmissions.length === 0 ? (
          <Alert severity="info">
            No pending submissions to review.
          </Alert>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pending Submissions ({pendingSubmissions.length})
            </Typography>

            {pendingSubmissions.map((submission) => (
              <Card key={submission.id} sx={{ mb: 2, border: '1px solid #ddd' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div">
                      {submission.title}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={submission.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={submission.language}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Typography color="text.secondary" gutterBottom>
                    <strong>Author:</strong> {submission.author}
                  </Typography>

                  <Typography variant="body2" paragraph>
                    {submission.descr_short}
                  </Typography>

                  <Box mb={2}>
                    <Link
                      href={submission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      {submission.url}
                      <OpenInNew fontSize="small" />
                    </Link>
                  </Box>

                  {submission.additional_notes && (
                    <Box mb={2}>
                      <Typography variant="body2" component="div" sx={{
                        whiteSpace: 'pre-line',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        p: 2,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}>
                        <strong>Additional Notes:</strong><br />
                        {submission.additional_notes}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="caption" color="text.secondary">
                    <strong>Submitted:</strong> {new Date(submission.created_at).toLocaleString()} <br />
                    <strong>Pricing:</strong> {submission.pricing_type || "Not specified"} <br />
                    <strong>AI Content:</strong> {submission.uses_ai_content ? "Yes" : "No"} <br />
                    <strong>Discord:</strong> {submission.discord_account || "Not provided"} <br />
                    <strong>Status:</strong> Pending Approval
                  </Typography>

                  <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={processing === submission.id ? <CircularProgress size={16} /> : <Cancel />}
                      disabled={processing === submission.id}
                      onClick={() => rejectSubmission(submission)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={processing === submission.id ? <CircularProgress size={16} /> : <CheckCircle />}
                      disabled={processing === submission.id}
                      onClick={() => approveSubmission(submission)}
                    >
                      Approve
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourceModerationPanel;