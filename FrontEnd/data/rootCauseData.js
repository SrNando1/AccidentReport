export const causeData = {
  types: [
    { id: "1", name: "Unsafe Act" },
    { id: "2", name: "Unsafe Condition" },
    { id: "3", name: "Equipment Failure" },
    { id: "4", name: "Process/Procedure Failure" },
    { id: "5", name: "Organizational Factor / Management" },
    { id: "6", name: "Contributing Human Factor" },
  ],
  categories: {
    1: [
      { id: "1-1", name: "Lack of attention (distraction)" },
      { id: "1-2", name: "Perception error" },
      { id: "1-3", name: "Procedural violation" },
      { id: "1-4", name: "Inadequate decision-making" },
      { id: "1-5", name: "Improper use of equipment" },
      { id: "1-6", name: "Action without authorization" },
      { id: "1-7", name: "Haste or overconfidence" },
      { id: "1-8", name: "Improper use or absence of PPE" },
      { id: "1-9", name: "Improvisation or not following the standard method" },
    ],
    2: [
      { id: "2-1", name: "Inadequate lighting" },
      { id: "2-2", name: "Absent or deficient signage" },
      { id: "2-3", name: "Limited or poorly planned physical space" },
      { id: "2-4", name: "Slippery or uneven surfaces" },
      { id: "2-5", name: "Damaged tools or equipment" },
      { id: "2-6", name: "Obstructions or misplaced materials" },
      { id: "2-7", name: "Lack of protective barriers" },
      { id: "2-8", name: "Noisy environment or with low visibility" },
      { id: "2-9", name: "Adverse weather conditions" },
    ],
    3: [
      { id: "3-1", name: "Lack of preventive maintenance" },
      { id: "3-2", name: "Security system malfunction" },
      { id: "3-3", name: "Manufacturing defect" },
      { id: "3-4", name: "Electrical or hydraulic failure" },
      { id: "3-5", name: "Using equipment that is not suitable for the task." },
      { id: "3-6", name: "Breakage due to excessive wear" },
      { id: "3-7", name: "Calibration or adjustment failure" },
      { id: "3-8", name: "Using expired equipment" },
    ],
    4: [
      { id: "4-1", name: "Non-existent procedure" },
      { id: "4-2", name: "Outdated procedure" },
      { id: "4-3", name: "Confusing or ambiguous work instruction" },
      { id: "4-4", name: "Lack of verification or checklist" },
      { id: "4-5", name: "Poorly defined workflow" },
      { id: "4-6", name: "Lack of control over change" },
      { id: "4-7", name: "Lack of accessible documentation" },
      {
        id: "4-8",
        name: "Procedures not adapted to operational reality",
      },
    ],
    5: [
      { id: "5-1", name: "Insufficient or non-existent training" },
      { id: "5-2", name: "Lack of supervision" },
      { id: "5-3", name: "Poor communication" },
      { id: "5-4", name: "Work overload" },
      { id: "5-5", name: "Pressure for productivity" },
      { id: "5-6", name: "Weak safety culture" },
      { id: "5-7", name: "Lack of prior risk analysis" },
      { id: "5-8", name: "Lack of resources (time, personnel, materials)" },
    ],

    6: [
      { id: "6-1", name: "Fatigue" },
      { id: "6-2", name: "Stress" },
      { id: "6-3", name: "Inattention" },
      { id: "6-4", name: "Lack of experience" },
      { id: "6-5", name: "Substance use (medication, alcohol, etc.)" },
      { id: "6-6", name: "External distractions (mobile phone use, noise)" },
      { id: "6-7", name: "Health problems" },
    ],
  },
  subcategories: {
    "1-1": [
      {
        id: "1-1-1",
        name: "Use of mobile phone or radio during operational activity",
      },
      {
        id: "1-1-2",
        name: "Loss of situational awareness due to side conversations",
      },
      { id: "1-1-3", name: "Divided attention between concurrent tasks" },
    ],

    "1-2": [
      { id: "1-2-1", name: "Incorrect assessment of distance or speed" },
      { id: "1-2-2", name: "Failure to identify visual hazards" },
      {
        id: "1-2-3",
        name: "Misinterpretation of signals or operational alerts",
      },
    ],

    "1-3": [
      { id: "1-3-1", name: "Intentional violation of safety procedures" },
      { id: "1-3-2", name: "Execution of tasks without authorization" },
      {
        id: "1-3-3",
        name: "Deviation from established procedures for convenience",
      },
    ],

    "1-4": [
      { id: "1-4-1", name: "Decision-making under time pressure" },
      { id: "1-4-2", name: "Selection of an unauthorized operational method" },
      { id: "1-4-3", name: "Problem resolution without informing supervision" },
    ],

    "1-5": [
      { id: "1-5-1", name: "Operation of equipment without adequate training" },
      {
        id: "1-5-2",
        name: "Use of equipment or tools for unintended purposes",
      },
      {
        id: "1-5-3",
        name: "Incorrect handling due to lack of operational knowledge",
      },
    ],

    "1-6": [
      { id: "1-6-1", name: "Initiation of task without formal authorization" },
      {
        id: "1-6-2",
        name: "Unauthorized access to restricted operational area",
      },
      {
        id: "1-6-3",
        name: "Use of vehicle or equipment without authorization",
      },
    ],

    "1-7": [
      {
        id: "1-7-1",
        name: "Acceleration of operational process without risk assessment",
      },
      {
        id: "1-7-2",
        name: "Overconfidence leading to negligence in task execution",
      },
      { id: "1-7-3", name: "Skipping procedural steps to save time" },
    ],

    "1-8": [
      {
        id: "1-8-1",
        name: "Failure to use required personal protective equipment (PPE)",
      },
      { id: "1-8-2", name: "Use of damaged or expired PPE" },
      { id: "1-8-3", name: "Replacement of PPE with improvised materials" },
    ],

    "1-9": [
      {
        id: "1-9-1",
        name: "Modification of tools or accessories without authorization",
      },
      {
        id: "1-9-2",
        name: "Execution of tasks outside the established workflow",
      },
      {
        id: "1-9-3",
        name: "Use of operational shortcuts without risk evaluation",
      },
    ],

    "2-1": [
      { id: "2-1-1", name: "Insufficient lighting in operational area" },
      {
        id: "2-1-2",
        name: "Lighting intensity below operational requirements",
      },
      { id: "2-1-3", name: "Failure of lighting system" },
    ],

    "2-2": [
      { id: "2-2-1", name: "Absence of required signage" },
      { id: "2-2-2", name: "Confusing or unclear signage" },
      { id: "2-2-3", name: "Improperly positioned signage" },
    ],

    "2-3": [
      { id: "2-3-1", name: "Narrow circulation areas" },
      { id: "2-3-2", name: "Inadequate layout for operational workflow" },
      { id: "2-3-3", name: "Obstructed operational areas" },
    ],

    "2-4": [
      { id: "2-4-1", name: "Presence of spilled liquids on surface" },
      { id: "2-4-2", name: "Uneven or damaged surface conditions" },
      { id: "2-4-3", name: "Loose materials present on the floor" },
    ],

    "2-5": [
      { id: "2-5-1", name: "Damaged or broken tool" },
      { id: "2-5-2", name: "Equipment malfunction or operational failure" },
      { id: "2-5-3", name: "Lack of recent maintenance inspection" },
    ],

    "2-6": [
      { id: "2-6-1", name: "Objects obstructing passageways" },
      { id: "2-6-2", name: "Improper stacking of materials" },
      { id: "2-6-3", name: "Poor housekeeping in operational area" },
    ],

    "2-7": [
      { id: "2-7-1", name: "Absence of protective barriers or guardrails" },
      { id: "2-7-2", name: "Lack of hazard warning signage" },
      { id: "2-7-3", name: "Damaged or removed protective barriers" },
    ],

    "2-8": [
      { id: "2-8-1", name: "Noise levels exceeding operational limits" },
      { id: "2-8-2", name: "Low or unstable lighting conditions" },
      { id: "2-8-3", name: "Excessive smoke or dust in operational area" },
    ],

    "2-9": [
      { id: "2-9-1", name: "Heavy rainfall conditions" },
      { id: "2-9-2", name: "Strong wind conditions" },
      { id: "2-9-3", name: "Extreme temperature conditions" },
    ],
    "3-1": [
      { id: "3-1-1", name: "Equipment without periodic inspection" },
      { id: "3-1-2", name: "Lack of maintenance records" },
      { id: "3-1-3", name: "Absence of a maintenance plan" },
    ],

    "3-2": [
      { id: "3-2-1", name: "Inoperative sensor" },
      { id: "3-2-2", name: "Faulty alarm system" },
      { id: "3-2-3", name: "Failure of locking or safety device" },
    ],

    "3-3": [
      { id: "3-3-1", name: "Manufacturing defect in component" },
      { id: "3-3-2", name: "Equipment design flaw" },
      { id: "3-3-3", name: "Material outside specification" },
    ],

    "3-4": [
      { id: "3-4-1", name: "Short circuit" },
      { id: "3-4-2", name: "Hydraulic failure due to sealing issue" },
      { id: "3-4-3", name: "Damaged or compromised wiring" },
    ],

    "3-5": [
      { id: "3-5-1", name: "Use beyond equipment capacity" },
      {
        id: "3-5-2",
        name: "Equipment incompatible with operational environment",
      },
      { id: "3-5-3", name: "Improper equipment adaptation or modification" },
    ],

    "3-6": [
      { id: "3-6-1", name: "Wear due to lack of lubrication" },
      { id: "3-6-2", name: "Wear not identified in time" },
      { id: "3-6-3", name: "Continuous operation without operational pause" },
    ],

    "3-7": [
      { id: "3-7-1", name: "Calibration not performed" },
      { id: "3-7-2", name: "Incorrect parameter adjustment" },
      { id: "3-7-3", name: "Instrument out of calibration" },
    ],

    "3-8": [
      { id: "3-8-1", name: "Expired validity without inspection" },
      { id: "3-8-2", name: "Missing validity label or certification tag" },
      {
        id: "3-8-3",
        name: "Lack of awareness regarding validity or certification",
      },
    ],

    "4-1": [
      { id: "4-1-1", name: "Critical activity without established procedure" },
      { id: "4-1-2", name: "Frequent task without formal instructions" },
      { id: "4-1-3", name: "Absence of formal operational standardization" },
    ],

    "4-2": [
      { id: "4-2-1", name: "Outdated procedure" },
      { id: "4-2-2", name: "Obsolete technical information" },
      { id: "4-2-3", name: "Procedure not aligned with best practices" },
    ],

    "4-3": [
      { id: "4-3-1", name: "Ambiguous instructions" },
      { id: "4-3-2", name: "Lack of visual clarity in instructions" },
      { id: "4-3-3", name: "Difficult-to-read format" },
    ],

    "4-4": [
      { id: "4-4-1", name: "Missing checklist" },
      { id: "4-4-2", name: "Checklist not used during operation" },
      { id: "4-4-3", name: "Required verifications ignored" },
    ],

    "4-5": [
      { id: "4-5-1", name: "Procedural steps without logical sequence" },
      { id: "4-5-2", name: "Overlapping operational activities" },
      { id: "4-5-3", name: "Poorly defined responsibilities" },
    ],

    "4-6": [
      { id: "4-6-1", name: "Change implemented without formal approval" },
      { id: "4-6-2", name: "Implementation without impact analysis" },
      { id: "4-6-3", name: "Documentation not updated after change" },
    ],

    "4-7": [
      { id: "4-7-1", name: "Procedure incorrectly archived" },
      { id: "4-7-2", name: "Instructions inaccessible during operation" },
      { id: "4-7-3", name: "Lack of digital version of procedure" },
    ],

    "4-8": [
      { id: "4-8-1", name: "Procedure incompatible with operational practice" },
      { id: "4-8-2", name: "Requirement beyond operational capability" },
      { id: "4-8-3", name: "Procedure ignored by operational team" },
    ],

    "5-1": [
      { id: "5-1-1", name: "Training not provided for new role" },
      { id: "5-1-2", name: "Outdated technical training" },
      { id: "5-1-3", name: "Incomplete onboarding of new employees" },
    ],

    "5-2": [
      { id: "5-2-1", name: "Supervisor absent during critical activities" },
      { id: "5-2-2", name: "Supervision focused only on productivity" },
      { id: "5-2-3", name: "Failure to correct observed deviations" },
    ],

    "5-3": [
      { id: "5-3-1", name: "Information communicated only verbally" },
      { id: "5-3-2", name: "Inefficient communication channel" },
      { id: "5-3-3", name: "Lack of feedback regarding identified risks" },
    ],

    "5-4": [
      { id: "5-4-1", name: "Accumulation of job responsibilities" },
      { id: "5-4-2", name: "Excessive working hours" },
      { id: "5-4-3", name: "Insufficient rest breaks" },
    ],

    "5-5": [
      { id: "5-5-1", name: "Aggressive production targets" },
      { id: "5-5-2", name: "Incentives based solely on delivery results" },
      { id: "5-5-3", name: "Informal pressure for performance results" },
    ],

    "5-6": [
      { id: "5-6-1", name: "Management does not prioritize safety" },
      { id: "5-6-2", name: "Risks ignored by leadership" },
      { id: "5-6-3", name: "Lack of safety example from managers" },
    ],

    "5-7": [
      { id: "5-7-1", name: "Task initiated without risk assessment" },
      { id: "5-7-2", name: "Generic or superficial risk analysis" },
      { id: "5-7-3", name: "Lack of validation of the risk assessment" },
    ],

    "5-8": [
      { id: "5-8-1", name: "Insufficient personnel available" },
      { id: "5-8-2", name: "Insufficient time for safe execution" },
      { id: "5-8-3", name: "Unavailable or inadequate materials" },
    ],

    "6-1": [
      { id: "6-1-1", name: "Excessively long work shift" },
      { id: "6-1-2", name: "Inadequate rest interruption" },
      { id: "6-1-3", name: "Poor sleep quality" },
    ],

    "6-2": [
      { id: "6-2-1", name: "External pressures (family, financial, etc.)" },
      { id: "6-2-2", name: "Hostile work environment" },
      { id: "6-2-3", name: "High emotional demand" },
    ],

    "6-3": [
      { id: "6-3-1", name: "Lack of focus on the task" },
      { id: "6-3-2", name: "Break in logical reasoning" },
      { id: "6-3-3", name: "Distraction due to noise or movement" },
    ],

    "6-4": [
      { id: "6-4-1", name: "Performing task without prior training" },
      { id: "6-4-2", name: "New activity performed without supervision" },
      { id: "6-4-3", name: "Execution by trial and error" },
    ],

    "6-5": [
      { id: "6-5-1", name: "Use of medication without notification" },
      { id: "6-5-2", name: "Alcohol consumption before work" },
      { id: "6-5-3", name: "Use of substances affecting reflexes" },
    ],

    "6-6": [
      { id: "6-6-1", name: "Mobile phone use during critical operation" },
      { id: "6-6-2", name: "Side conversations during operational activity" },
      { id: "6-6-3", name: "Continuous background noise" },
    ],

    "6-7": [
      { id: "6-7-1", name: "Unreported illness" },
      { id: "6-7-2", name: "Ignored physical limitation" },
      { id: "6-7-3", name: "Use of medication without medical guidance" },
    ],
  },
};
