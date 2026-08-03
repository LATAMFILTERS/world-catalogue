import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Phase5APayload {
  faqs?: string;
  validation?: string;
  podcast?: string;
  improvements?: string;
}

interface ParsedOutput {
  faqs: Array<{ number: number; question: string; answer: string }>;
  validationIssues: Array<{ type: string; section: string; finding: string; recommendation: string }>;
  podcastScript: string;
  improvements: Array<{ recommendation: string; rationale: string; actionLines: string }>;
}

function parsePhase5AOutput(rawContent: string, type: 'faq' | 'validation' | 'podcast' | 'improvement'): Partial<ParsedOutput> {
  const result: Partial<ParsedOutput> = {};

  if (type === 'faq') {
    const faqs: ParsedOutput['faqs'] = [];
    const faqRegex = /^P(\d+):\s*(.+?)[\n\r]+R\1:\s*(.+?)(?=^P|$)/gm;
    let match;

    while ((match = faqRegex.exec(rawContent)) !== null) {
      faqs.push({
        number: parseInt(match[1]),
        question: match[2].trim(),
        answer: match[3].trim(),
      });
    }

    result.faqs = faqs;
  }

  if (type === 'validation') {
    const issues: ParsedOutput['validationIssues'] = [];
    const issueRegex = /\[(.+?)\]\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)$/gm;
    let match;

    while ((match = issueRegex.exec(rawContent)) !== null) {
      issues.push({
        type: match[1],
        section: match[2],
        finding: match[3],
        recommendation: match[4],
      });
    }

    result.validationIssues = issues;
  }

  if (type === 'podcast') {
    result.podcastScript = rawContent;
  }

  if (type === 'improvement') {
    const improvements: ParsedOutput['improvements'] = [];
    const improveRegex = /\[(.+?)\]\s*\|\s*(.+?)\s*\|\s*(.+?)$/gm;
    let match;

    while ((match = improveRegex.exec(rawContent)) !== null) {
      improvements.push({
        recommendation: match[1],
        rationale: match[2],
        actionLines: match[3],
      });
    }

    result.improvements = improvements;
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body: Phase5APayload = await request.json();

    if (!body.faqs && !body.validation && !body.podcast && !body.improvements) {
      return NextResponse.json({ error: 'No Phase 5A outputs provided' }, { status: 400 });
    }

    // Parse each output type
    const parsed: Partial<ParsedOutput> = {
      faqs: [],
      validationIssues: [],
      podcastScript: '',
      improvements: [],
    };

    if (body.faqs) {
      const faqParsed = parsePhase5AOutput(body.faqs, 'faq');
      parsed.faqs = faqParsed.faqs;
    }

    if (body.validation) {
      const valParsed = parsePhase5AOutput(body.validation, 'validation');
      parsed.validationIssues = valParsed.validationIssues;
    }

    if (body.podcast) {
      const podcastParsed = parsePhase5AOutput(body.podcast, 'podcast');
      parsed.podcastScript = podcastParsed.podcastScript;
    }

    if (body.improvements) {
      const impParsed = parsePhase5AOutput(body.improvements, 'improvement');
      parsed.improvements = impParsed.improvements;
    }

    // Save to JSON file in public directory for frontend access
    const publicDataPath = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(publicDataPath)) {
      fs.mkdirSync(publicDataPath, { recursive: true });
    }

    const outputFile = path.join(publicDataPath, 'phase5a-outputs.json');
    const outputData = {
      timestamp: new Date().toISOString(),
      faqs: parsed.faqs || [],
      validationIssues: parsed.validationIssues || [],
      podcastScript: parsed.podcastScript || '',
      improvements: parsed.improvements || [],
      stats: {
        faqsIntegrated: (parsed.faqs || []).length,
        validationIssuesFound: (parsed.validationIssues || []).length,
        podcastScriptReceived: !!parsed.podcastScript,
        improvementsSuggested: (parsed.improvements || []).length,
      },
    };

    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));

    return NextResponse.json(
      {
        success: true,
        message: 'Phase 5A outputs received and integrated',
        stats: outputData.stats,
        nextSteps: [
          `${outputData.stats.faqsIntegrated} FAQs integrated into Knowledge System`,
          `${outputData.stats.validationIssuesFound} validation issues documented`,
          'Podcast script saved for recording',
          `${outputData.stats.improvementsSuggested} improvement suggestions queued`,
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Phase 5A integration error:', error);
    return NextResponse.json(
      {
        error: 'Integration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const publicDataPath = path.join(process.cwd(), 'public', 'data');
    const outputFile = path.join(publicDataPath, 'phase5a-outputs.json');

    if (!fs.existsSync(outputFile)) {
      return NextResponse.json(
        {
          status: 'no-data',
          message: 'No Phase 5A outputs have been submitted yet',
        },
        { status: 200 }
      );
    }

    const fileContent = fs.readFileSync(outputFile, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(
      {
        status: 'integrated',
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reading Phase 5A data:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve Phase 5A data',
      },
      { status: 500 }
    );
  }
}
