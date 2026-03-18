import { Building2, X, Info, Coins, CalendarDays, ExternalLink, BookmarkPlus, MapPin, SearchCheck, CheckCircle2 } from "lucide-react"
import { type GovernmentScheme, formatCurrency } from "@/data/userData"
import { GradientButton } from "@/components/ui/gradient-button"

interface SchemeDrawerProps {
  scheme: GovernmentScheme | null
  isOpen: boolean
  onClose: () => void
  userMatchCount?: number
  userTotalCriteria?: number
}

export default function SchemeDrawer({ scheme, isOpen, onClose, userMatchCount = 4, userTotalCriteria = 5 }: SchemeDrawerProps) {
  if (!scheme) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-background border-l border-border z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border bg-card/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {scheme.isNew && <span className="text-[10px] bg-[#064E3B] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">NEW</span>}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${scheme.bodyType === "central" ? "bg-blue-500/15 text-blue-600" : "bg-orange-500/15 text-orange-600"}`}>
                {scheme.governmentBody}
              </span>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{scheme.category}</span>
            </div>
            
            <h2 className="text-xl font-bold leading-tight mb-2 text-foreground pr-2">{scheme.name}</h2>
            
            <div className="flex items-center gap-3 mt-3">
              <div className="bg-[#064E3B]/10 text-[#064E3B] px-3 py-1.5 rounded-lg border border-[#064E3B]/20">
                <p className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Coverage Amount</p>
                <p className="text-lg font-black leading-none">{formatCurrency(scheme.coverageAmount)}</p>
              </div>
              
              {scheme.isEligible ? (
                <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg border border-green-500/20 flex items-center gap-2 h-full">
                  <CheckCircle2 className="size-5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Status</p>
                    <p className="text-sm font-bold leading-none">Eligible</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-2 h-full">
                  <SearchCheck className="size-5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Status</p>
                    <p className="text-sm font-bold leading-none">Check Eligibility</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-accent text-muted-foreground transition-colors shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32">
          
          {/* About Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Info className="size-4 text-[#064E3B]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About the Scheme</h3>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">{scheme.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 bg-card p-2 rounded-md border border-border">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="truncate">{scheme.governmentBody}</span>
              </div>
              {scheme.launchedYear && (
                <div className="flex items-center gap-2 bg-card p-2 rounded-md border border-border">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span>Launched {scheme.launchedYear}</span>
                </div>
              )}
            </div>
          </section>

          {/* Eligibility Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SearchCheck className="size-4 text-green-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Eligibility Criteria</h3>
              </div>
              <span className="text-xs font-medium text-[#064E3B] bg-[#064E3B]/10 px-2 py-1 rounded-full">
                {userMatchCount}/{userTotalCriteria} matched for user
              </span>
            </div>
            
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {scheme.eligibilityDetails ? (
                <>
                  <CriterionRow label="Income Limit" value={scheme.eligibilityDetails.incomeLimit} matched={true} />
                  <CriterionRow label="Age Group" value={scheme.eligibilityDetails.ageGroup} matched={true} />
                  <CriterionRow label="Gender" value={scheme.eligibilityDetails.gender} matched={true} />
                  <CriterionRow label="Occupation" value={scheme.eligibilityDetails.occupation} matched={false} />
                  <CriterionRow label="Ration Card" value={scheme.eligibilityDetails.rationCard} matched={true} />
                  <CriterionRow label="State Resident" value={scheme.eligibilityDetails.stateResident} matched={true} />
                  {scheme.eligibilityDetails.specialConditions.map((cond, i) => (
                    <CriterionRow key={i} label="Condition" value={cond} matched={i === 0} />
                  ))}
                </>
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">Eligibility details pending update from ministry.</div>
              )}
            </div>
          </section>

          {/* What's Covered Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Coins className="size-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What's Covered</h3>
            </div>
            
            {scheme.coverageDetails ? (
              <div className="space-y-4">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scheme.coverageDetails.coveredTreatments.map((treatment, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{treatment}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <CoverBox label="Members" value={scheme.coverageDetails.membersCovered} />
                  <CoverBox label="Network" value={scheme.coverageDetails.hospitalNetwork + " Hospitals"} />
                  <CoverBox label="OPD" value={scheme.coverageDetails.opdIncluded ? "Included" : "Not Included"} />
                  <CoverBox label="Medicines" value={scheme.coverageDetails.medicinesIncluded ? "Included" : "Not Included"} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-card p-3 rounded-md border border-border">Details unavailable.</p>
            )}
          </section>

          {/* Duration & Validity */}
          {scheme.durationDetails && (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 pl-6 relative">
                <CalendarDays className="size-4 text-purple-500 absolute left-0 top-0.5" />
                Duration & Validity
              </h3>
              <div className="bg-card p-4 rounded-xl border border-border space-y-3 text-sm">
                <div className="flex justify-between border-b border-border border-dashed pb-2">
                  <span className="text-muted-foreground">Active Period</span>
                  <span className="font-medium text-right">{scheme.durationDetails.activePeriod}</span>
                </div>
                <div className="flex justify-between border-b border-border border-dashed pb-2">
                  <span className="text-muted-foreground">Renewal</span>
                  <span className="font-medium text-right">{scheme.durationDetails.renewal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrollment</span>
                  <span className="font-medium text-right">{scheme.durationDetails.enrollmentWindow}</span>
                </div>
              </div>
            </section>
          )}

          {/* How to Apply */}
          {scheme.applicationDetails && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="size-4 text-rose-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">How to Apply</h3>
              </div>
              
              <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-border">
                {scheme.applicationDetails.steps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-8 bg-background border-2 border-border size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10">
                      {i + 1}
                    </div>
                    <p className="text-sm pt-0.5">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-600 uppercase mb-2">Required Documents</p>
                <div className="flex flex-wrap gap-2">
                  {scheme.applicationDetails.requiredDocuments.map((doc, i) => (
                    <span key={i} className="text-xs bg-background border border-border px-2 py-1 rounded-md shadow-sm">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="absolute bottom-0 w-full p-4 bg-background border-t border-border shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)] flex items-center gap-3">
          <GradientButton 
            variant="variant"
            className="flex-1 h-11 rounded-lg text-sm font-bold shadow-md min-w-0 px-2"
          >
            Check Full Eligibility
          </GradientButton>
          <button className="h-11 px-4 border border-border bg-card hover:bg-accent rounded-lg font-medium transition-all flex items-center justify-center gap-2 tooltip-trigger" title="Save Scheme">
            <BookmarkPlus className="size-5 text-muted-foreground" />
          </button>
          <button className="h-11 px-4 border border-border bg-card hover:bg-accent rounded-lg font-medium transition-all flex items-center justify-center gap-2 tooltip-trigger" title="Official Gov Portal">
            <ExternalLink className="size-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </>
  )
}

function CriterionRow({ label, value, matched }: { label: string; value: string; matched: boolean }) {
  return (
    <div className="flex items-center p-3 text-sm">
      <div className="w-1/3 text-muted-foreground">{label}</div>
      <div className="flex-1 font-medium text-foreground">{value}</div>
      <div className="shrink-0 pl-2">
        {matched ? (
          <CheckCircle2 className="size-4 text-green-500" />
        ) : (
          <div className="size-4 border-2 border-muted-foreground/30 rounded-full" />
        )}
      </div>
    </div>
  )
}

function CoverBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg text-center flex flex-col justify-center h-full">
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{label}</span>
      <span className="text-xs font-medium leading-tight">{value}</span>
    </div>
  )
}
