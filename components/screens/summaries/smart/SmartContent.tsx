'use client';
import { useMemo } from 'react';
import { Stethoscope } from 'lucide-react';
import RichText from '../RichText';
import { parseSmart, bulletsOf, type SmartNode } from './parse';
import { TreeDiagram } from './TreeDiagram';
import { MatrixTable } from './MatrixTable';
import { FlowChain } from './FlowChain';
import { MathBlock, InlineMath } from './MathText';
import { PearlCards } from './PearlCards';
import { markHeadings } from './splitSections';
import './smart.css';

function Nodes({ nodes, isDark, recall, skipTitle }: { nodes: SmartNode[]; isDark: boolean; recall: boolean; skipTitle?: string }) {
  const same = (t: string) => !!skipTitle && t.trim().toLowerCase() === skipTitle.trim().toLowerCase();
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.kind) {
          case 'md':
            return <RichText key={i} text={markHeadings(n.text)} isDark={isDark} />;
          case 'tree':
            return <TreeDiagram key={i} items={n.items} isDark={isDark} />;
          case 'table':
            return <MatrixTable key={i} header={n.header} rows={n.rows} isDark={isDark} />;
          case 'flow':
            return <FlowChain key={i} steps={n.steps} label={n.label} isDark={isDark} />;
          case 'math':
            return <MathBlock key={i} tex={n.tex} isDark={isDark} />;
          case 'inline':
            return <InlineMath key={i} parts={n.parts} bullet={n.bullet} isDark={isDark} />;
          case 'callout':
            if (n.variant === 'core') {
              return (
                <section key={i} className="mt-2">
                  {!same(n.title) && (
                    <h3 className={`mb-2 flex items-center gap-2 text-sm font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      <Stethoscope size={16} /> {n.title}
                    </h3>
                  )}
                  <Nodes nodes={n.children} isDark={isDark} recall={recall} />
                </section>
              );
            }
            return (
              <PearlCards
                key={i}
                items={bulletsOf(n.body)}
                variant={n.variant}
                title={same(n.title) ? '' : n.title}
                isDark={isDark}
                recall={recall}
              />
            );
        }
      })}
    </>
  );
}

export default function SmartContent({ text, isDark, recall = false, stepTitle }: { text: string; isDark: boolean; recall?: boolean; stepTitle?: string }) {
  const nodes = useMemo(() => parseSmart(text), [text]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!recall) return;
    const el = (e.target as HTMLElement).closest('strong, b');
    if (el) el.classList.toggle('is-revealed');
  };

  return (
    <div className="smart-recall lesson-prose" data-recall={recall ? 'true' : 'false'} onClick={onClick}>
      <Nodes nodes={nodes} isDark={isDark} recall={recall} skipTitle={stepTitle} />
    </div>
  );
}