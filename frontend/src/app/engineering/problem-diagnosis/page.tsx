import type { Metadata } from 'next';
import { ProblemDiagnosisConsultation } from './ProblemDiagnosisConsultation';
import { ConversionProvider } from '@/components/conversion/ConversionContext';

export const metadata: Metadata = {
  title: 'Engineering Root-Cause Diagnosis | ELIMFILTERS',
  description:
    'A structured engineering investigation that maps your observed symptoms to contamination mechanisms, failure modes, and the most probable root cause — before recommending any corrective action.',
  alternates: {
    canonical: 'https://elimfilters.com/engineering/problem-diagnosis',
  },
};

export default function ProblemDiagnosisPage() {
  return (
    <ConversionProvider>
      <ProblemDiagnosisConsultation />
    </ConversionProvider>
  );
}
