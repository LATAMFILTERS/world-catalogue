'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface TechStage {
  tag: string;
  number: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

interface StagesAccordionProps {
  stages: TechStage[];
}

const accentOpacity = (idx: number) => 1 - idx * 0.22;

export function StagesAccordion({ stages }: StagesAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue="stage-0" className="w-full">
      {stages.map((stage, idx) => (
        <AccordionItem
          key={idx}
          value={`stage-${idx}`}
          className={cn(
            'border-b-0 border-l-[3px] mb-[2px]',
          )}
          style={{
            borderLeftColor: `rgba(255,241,45,${accentOpacity(idx)})`,
            background: `rgba(255,255,255,${0.018 - idx * 0.002})`,
            border: '1px solid rgba(255,255,255,0.04)',
            borderLeft: `3px solid rgba(255,241,45,${accentOpacity(idx)})`,
          }}
        >
          <AccordionTrigger
            className="px-6 hover:no-underline group"
            style={{ textDecoration: 'none' }}
          >
            <div className="flex items-center gap-5 text-left">
              {/* Zone tag + number */}
              <div className="w-14 shrink-0">
                <div
                  className="text-[0.5rem] tracking-[0.2em] font-mono mb-1"
                  style={{ color: `rgba(255,241,45,${accentOpacity(idx)})`, fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {stage.tag}
                </div>
                <div
                  className="text-4xl font-black leading-none"
                  style={{ color: 'rgba(255,255,255,0.05)', fontFamily: 'Titillium Web, sans-serif' }}
                >
                  {stage.number}
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-base font-bold tracking-wide text-white group-data-[state=open]:text-[#FFF12D] transition-colors"
                style={{ fontFamily: 'Titillium Web, sans-serif' }}
              >
                {stage.title}
              </h3>
            </div>

            {/* Stat — visible in collapsed state */}
            <div className="ml-auto mr-4 text-right shrink-0 group-data-[state=open]:opacity-0 transition-opacity">
              <div className="text-2xl font-black text-[#FFF12D]" style={{ fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>
                {stage.stat}
              </div>
              <div className="text-[0.55rem] text-white/30 mt-1 max-w-[90px] text-right leading-tight" style={{ fontFamily: 'Titillium Web, sans-serif' }}>
                {stage.statLabel}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6">
            <div className="flex items-start justify-between gap-8">
              <p
                className="text-[0.86rem] leading-[1.9] text-white/50 max-w-[600px]"
                style={{ fontFamily: 'Titillium Web, sans-serif' }}
              >
                {stage.body}
              </p>
              {/* Stat — visible in expanded state */}
              <div className="text-right shrink-0 pt-1">
                <div className="text-3xl font-black text-[#FFF12D]" style={{ fontFamily: 'Titillium Web, sans-serif', lineHeight: 1 }}>
                  {stage.stat}
                </div>
                <div className="text-[0.55rem] text-white/30 mt-1 max-w-[90px] text-right leading-tight" style={{ fontFamily: 'Titillium Web, sans-serif' }}>
                  {stage.statLabel}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
