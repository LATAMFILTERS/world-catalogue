// Phase 5A Auto-Integration Client
// Handles submission of NotebookLM outputs and auto-integration

interface Phase5AOutput {
  faqs?: string;
  validation?: string;
  podcast?: string;
  improvements?: string;
}

interface IntegrationResponse {
  success: boolean;
  message: string;
  stats: {
    faqsIntegrated: number;
    validationIssuesFound: number;
    podcastScriptReceived: boolean;
    improvementsSuggested: number;
  };
  nextSteps: string[];
  timestamp: string;
}

export async function submitPhase5AOutputs(outputs: Phase5AOutput): Promise<IntegrationResponse> {
  try {
    const response = await fetch('/api/phase5a-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outputs),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: IntegrationResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to submit Phase 5A outputs: ${error}`);
  }
}

export function validatePhase5AOutput(content: string, type: 'faq' | 'validation' | 'podcast' | 'improvement'): {
  valid: boolean;
  errors: string[];
  stats: { [key: string]: number };
} {
  const errors: string[] = [];
  const stats: { [key: string]: number } = {};

  if (!content || content.trim().length === 0) {
    errors.push(`${type} output is empty`);
    return { valid: false, errors, stats };
  }

  switch (type) {
    case 'faq':
      const faqMatches = (content.match(/^P\d+:/gm) || []).length;
      stats.questions = faqMatches;
      if (faqMatches < 1) errors.push('No FAQ questions found (expected P1:, P2:, etc.)');
      if (faqMatches < 20) errors.push(`Only ${faqMatches} FAQs found (expected 20)`);
      break;

    case 'validation':
      const issueMatches = (content.match(/\[.+?\]/gm) || []).length;
      stats.issues = issueMatches;
      if (issueMatches === 0) errors.push('No validation issues found');
      break;

    case 'podcast':
      const segments = (content.match(/\[SEGMENT\]|\[INTRO\]|\[ACT/gm) || []).length;
      stats.segments = segments;
      const scriptLength = content.length;
      stats.characters = scriptLength;
      if (scriptLength < 2000) errors.push('Script seems too short for 15-minute podcast');
      break;

    case 'improvement':
      const improvements = (content.match(/\[RECOMENDACIÓN\]/gm) || []).length;
      stats.recommendations = improvements;
      if (improvements === 0) errors.push('No recommendations found');
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    stats,
  };
}

export function formatPhase5AForSubmission(
  faqContent?: string,
  validationContent?: string,
  podcastContent?: string,
  improvementContent?: string
): Phase5AOutput {
  return {
    faqs: faqContent?.trim(),
    validation: validationContent?.trim(),
    podcast: podcastContent?.trim(),
    improvements: improvementContent?.trim(),
  };
}

export function generateSubmissionSummary(outputs: Phase5AOutput): string {
  const parts: string[] = ['# Phase 5A Submission Summary\n'];

  if (outputs.faqs) {
    const faqCount = (outputs.faqs.match(/^P\d+:/gm) || []).length;
    parts.push(`- ✓ FAQs: ${faqCount} questions extracted`);
  }

  if (outputs.validation) {
    const issues = (outputs.validation.match(/\[.+?\]/gm) || []).length;
    parts.push(`- ✓ Validation: ${issues} issues identified`);
  }

  if (outputs.podcast) {
    parts.push(`- ✓ Podcast Script: ${Math.round(outputs.podcast.length / 1000)}KB received`);
  }

  if (outputs.improvements) {
    const improvements = (outputs.improvements.match(/\[RECOMENDACIÓN\]/gm) || []).length;
    parts.push(`- ✓ Improvements: ${improvements} suggestions`);
  }

  return parts.join('\n');
}
