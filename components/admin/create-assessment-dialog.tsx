"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader as Loader2, Copy, CircleCheck as CheckCircle2 } from "lucide-react";

interface CreateAssessmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAssessmentDialog({
  open,
  onClose,
  onSuccess
}: CreateAssessmentDialogProps) {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName.trim() || !candidateEmail.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const token = generateToken();

      const { error } = await supabase
        .from('assessments')
        .insert({
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          invite_token: token,
          status: 'pending'
        });

      if (error) throw error;

      const link = `${window.location.origin}/assessment/${token}`;
      setInviteLink(link);
    } catch (err) {
      console.error('Error creating assessment:', err);
      alert('Failed to create assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCandidateName("");
    setCandidateEmail("");
    setInviteLink(null);
    setCopied(false);
    onClose();
    if (inviteLink) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Assessment</DialogTitle>
          <DialogDescription>
            Generate an assessment invitation link for a candidate
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Candidate Name</Label>
                <Input
                  id="name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Candidate Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Generate Link'
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Assessment Created!
              </h3>
              <p className="text-sm text-gray-600">
                Share this link with {candidateName}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 break-all text-sm">
              {inviteLink}
            </div>

            <Button
              onClick={handleCopyLink}
              className="w-full"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
