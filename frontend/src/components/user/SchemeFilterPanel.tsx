import React from "react"
import { Filter, X, Zap } from "lucide-react"

interface SchemeFilterPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SchemeFilterPanel({ isOpen, onClose }: SchemeFilterPanelProps) {
  if (!isOpen) return null

  // Smart Pre-fill simulations based on userData.ts
  // The system detects a 'Mother' in the family data mapping, so Elderly is pre-selected.
  // The user is marked as BPL in some logic, simulating BPL pre-selection.

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:justify-center sm:items-center bg-black/40 backdrop-blur-sm">
      <div className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:w-[500px] bg-background sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 dialog-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#064E3B]/10 text-[#064E3B] rounded-md">
              <Filter className="size-4" />
            </div>
            <h3 className="font-bold">Filter Schemes</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-full text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>

        {/* Smart Notice */}
        <div className="bg-[#064E3B]/5 border-b border-[#064E3B]/10 p-3 flex items-start gap-2.5">
          <Zap className="size-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" />
          <p className="text-xs text-[#064E3B] leading-relaxed">
            <strong className="font-semibold">Smart Filter Active:</strong> Based on your family network profile, we've pre-selected <strong>Elderly Care</strong> and <strong>BPL</strong> to save you time.
          </p>
        </div>

        {/* Scrollable Filters */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          <FilterGroup title="Scheme Type">
            <FilterChip label="Central Govt." />
            <FilterChip label="State Govt." />
            <FilterChip label="Both" active />
          </FilterGroup>

          <FilterGroup title="Eligibility Status">
            <FilterChip label="Eligible for me" />
            <FilterChip label="Eligible for family" />
            <FilterChip label="Check eligibility" />
            <FilterChip label="All schemes" active />
          </FilterGroup>

          <FilterGroup title="Coverage Amount">
            <FilterChip label="Free / No cost" />
            <FilterChip label="Up to ₹1 lakh" />
            <FilterChip label="₹1L – ₹5L" active />
            <FilterChip label="₹5L – ₹15L" />
            <FilterChip label="Above ₹15L" />
          </FilterGroup>

          <FilterGroup title="Category / Health Need">
            <FilterChip label="General health" />
            <FilterChip label="Maternity" />
            <FilterChip label="Child health" />
            <FilterChip label="Cancer/Critical" />
            <FilterChip label="Elderly care" active smart />
            <FilterChip label="Accident" />
            <FilterChip label="Mental health" />
          </FilterGroup>

          <FilterGroup title="Income Group">
            <FilterChip label="Below Poverty Line (BPL)" active smart />
            <FilterChip label="Low income (APL)" />
            <FilterChip label="All income groups" />
          </FilterGroup>

          <FilterGroup title="Family Member">
            <FilterChip label="Self" active />
            <FilterChip label="Spouse" />
            <FilterChip label="Child" />
            <FilterChip label="Parents/Grandparents" active smart />
            <FilterChip label="Any" />
          </FilterGroup>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex gap-3">
          <button className="flex-1 h-10 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors">
            Clear All
          </button>
          <button 
            onClick={onClose}
            className="flex-[2] h-10 rounded-lg font-bold bg-[#064E3B] text-white hover:bg-[#001a12] shadow-md transition-colors"
          >
            Apply 12 Matches
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}

function FilterChip({ label, active = false, smart = false }: { label: string; active?: boolean; smart?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active 
          ? smart 
            ? "border-amber-400 bg-amber-500/10 text-amber-600 shadow-sm" 
            : "border-[#064E3B] bg-[#064E3B]/10 text-[#064E3B] shadow-sm"
          : "border-border bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
      {smart && active && <Zap className="inline-flex ml-1 size-3 text-amber-500" fill="currentColor" />}
    </button>
  )
}
