'use client';

import { motion } from 'motion/react';
import { useConversion } from '@/components/conversion/ConversionContext';

interface AssetSelectorProps {
  onSelect: (industry: string, assetType: string) => void;
}

const INDUSTRIES = [
  { id: 'agriculture', label: 'Agriculture', icon: '🌾', assetType: 'Tractors & Harvesters', risk: 'Mineral dust ingestion' },
  { id: 'mining', label: 'Mining', icon: '⛏', assetType: 'Excavators & Haul Trucks', risk: 'Silica & coal dust' },
  { id: 'marine', label: 'Marine', icon: '⚓', assetType: 'Vessels & Generators', risk: 'Catalytic fines & water' },
  { id: 'construction', label: 'Construction', icon: '🏗', assetType: 'Cranes & Loaders', risk: 'Particle wear & water' },
  { id: 'oil-gas', label: 'Oil & Gas', icon: '🛢', assetType: 'Pumps & Compressors', risk: 'Contamination & corrosion' },
  { id: 'power', label: 'Power Generation', icon: '⚡', assetType: 'Turbines & Generators', risk: 'Air & lube contamination' },
  { id: 'transport', label: 'Transport & Logistics', icon: '🚛', assetType: 'Fleet Trucks', risk: 'Air intake & fuel quality' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭', assetType: 'CNC & Hydraulic Presses', risk: 'Hydraulic particle wear' },
  { id: 'forestry', label: 'Forestry', icon: '🌲', assetType: 'Harvesters & Forwarders', risk: 'Extreme dust & debris' },
  { id: 'food', label: 'Food & Beverage', icon: '🥫', assetType: 'Processing Equipment', risk: 'Compressed air purity' },
  { id: 'military', label: 'Defence', icon: '🎖', assetType: 'Tactical Vehicles', risk: 'Extreme dust & reliability' },
  { id: 'rail', label: 'Rail', icon: '🚂', assetType: 'Locomotives', risk: 'Diesel & lube contamination' },
] as const;

export function AssetSelector({ onSelect }: AssetSelectorProps) {
  const { dispatchTrustSignal, setJourneySelection } = useConversion();

  function handleSelect(industry: typeof INDUSTRIES[number]) {
    dispatchTrustSignal('T-1');
    setJourneySelection('industryId', industry.id);
    setJourneySelection('assetType', industry.assetType);
    onSelect(industry.id, industry.assetType);
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)',
          fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem',
        }}>
          SELECT YOUR INDUSTRY
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', margin: 0 }}>
          We will identify the contamination risks specific to your assets and operations.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.75rem',
      }}>
        {INDUSTRIES.map((industry, i) => (
          <motion.button
            key={industry.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ borderColor: 'rgba(255,241,45,0.35)', background: 'rgba(255,241,45,0.04)' }}
            onClick={() => handleSelect(industry)}
            style={{
              padding: '1rem', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{industry.icon}</div>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff',
              fontSize: '0.9rem', marginBottom: '0.25rem',
            }}>
              {industry.label}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem' }}>
              {industry.assetType}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(253,186,116,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>
              ⚠ {industry.risk}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
