// WCAG success criteria (Level A + AA) and how they map onto Canadian accessibility frameworks.
// v = WCAG version that introduced the criterion.

export const WCAG_SC = {
  '1.1.1': { name: 'Non-text Content', level: 'A', v: '2.0' },
  '1.2.1': { name: 'Audio-only and Video-only (Prerecorded)', level: 'A', v: '2.0' },
  '1.2.2': { name: 'Captions (Prerecorded)', level: 'A', v: '2.0' },
  '1.2.3': { name: 'Audio Description or Media Alternative (Prerecorded)', level: 'A', v: '2.0' },
  '1.2.4': { name: 'Captions (Live)', level: 'AA', v: '2.0' },
  '1.2.5': { name: 'Audio Description (Prerecorded)', level: 'AA', v: '2.0' },
  '1.3.1': { name: 'Info and Relationships', level: 'A', v: '2.0' },
  '1.3.2': { name: 'Meaningful Sequence', level: 'A', v: '2.0' },
  '1.3.3': { name: 'Sensory Characteristics', level: 'A', v: '2.0' },
  '1.3.4': { name: 'Orientation', level: 'AA', v: '2.1' },
  '1.3.5': { name: 'Identify Input Purpose', level: 'AA', v: '2.1' },
  '1.4.1': { name: 'Use of Color', level: 'A', v: '2.0' },
  '1.4.2': { name: 'Audio Control', level: 'A', v: '2.0' },
  '1.4.3': { name: 'Contrast (Minimum)', level: 'AA', v: '2.0' },
  '1.4.4': { name: 'Resize Text', level: 'AA', v: '2.0' },
  '1.4.5': { name: 'Images of Text', level: 'AA', v: '2.0' },
  '1.4.10': { name: 'Reflow', level: 'AA', v: '2.1' },
  '1.4.11': { name: 'Non-text Contrast', level: 'AA', v: '2.1' },
  '1.4.12': { name: 'Text Spacing', level: 'AA', v: '2.1' },
  '1.4.13': { name: 'Content on Hover or Focus', level: 'AA', v: '2.1' },
  '2.1.1': { name: 'Keyboard', level: 'A', v: '2.0' },
  '2.1.2': { name: 'No Keyboard Trap', level: 'A', v: '2.0' },
  '2.1.4': { name: 'Character Key Shortcuts', level: 'A', v: '2.1' },
  '2.2.1': { name: 'Timing Adjustable', level: 'A', v: '2.0' },
  '2.2.2': { name: 'Pause, Stop, Hide', level: 'A', v: '2.0' },
  '2.3.1': { name: 'Three Flashes or Below Threshold', level: 'A', v: '2.0' },
  '2.4.1': { name: 'Bypass Blocks', level: 'A', v: '2.0' },
  '2.4.2': { name: 'Page Titled', level: 'A', v: '2.0' },
  '2.4.3': { name: 'Focus Order', level: 'A', v: '2.0' },
  '2.4.4': { name: 'Link Purpose (In Context)', level: 'A', v: '2.0' },
  '2.4.5': { name: 'Multiple Ways', level: 'AA', v: '2.0' },
  '2.4.6': { name: 'Headings and Labels', level: 'AA', v: '2.0' },
  '2.4.7': { name: 'Focus Visible', level: 'AA', v: '2.0' },
  '2.4.11': { name: 'Focus Not Obscured (Minimum)', level: 'AA', v: '2.2' },
  '2.5.1': { name: 'Pointer Gestures', level: 'A', v: '2.1' },
  '2.5.2': { name: 'Pointer Cancellation', level: 'A', v: '2.1' },
  '2.5.3': { name: 'Label in Name', level: 'A', v: '2.1' },
  '2.5.4': { name: 'Motion Actuation', level: 'A', v: '2.1' },
  '2.5.7': { name: 'Dragging Movements', level: 'AA', v: '2.2' },
  '2.5.8': { name: 'Target Size (Minimum)', level: 'AA', v: '2.2' },
  '3.1.1': { name: 'Language of Page', level: 'A', v: '2.0' },
  '3.1.2': { name: 'Language of Parts', level: 'AA', v: '2.0' },
  '3.2.1': { name: 'On Focus', level: 'A', v: '2.0' },
  '3.2.2': { name: 'On Input', level: 'A', v: '2.0' },
  '3.2.3': { name: 'Consistent Navigation', level: 'AA', v: '2.0' },
  '3.2.4': { name: 'Consistent Identification', level: 'AA', v: '2.0' },
  '3.2.6': { name: 'Consistent Help', level: 'A', v: '2.2' },
  '3.3.1': { name: 'Error Identification', level: 'A', v: '2.0' },
  '3.3.2': { name: 'Labels or Instructions', level: 'A', v: '2.0' },
  '3.3.3': { name: 'Error Suggestion', level: 'AA', v: '2.0' },
  '3.3.4': { name: 'Error Prevention (Legal, Financial, Data)', level: 'AA', v: '2.0' },
  '3.3.7': { name: 'Redundant Entry', level: 'A', v: '2.2' },
  '3.3.8': { name: 'Accessible Authentication (Minimum)', level: 'AA', v: '2.2' },
  '4.1.1': { name: 'Parsing (obsolete in WCAG 2.2)', level: 'A', v: '2.0' },
  '4.1.2': { name: 'Name, Role, Value', level: 'A', v: '2.0' },
  '4.1.3': { name: 'Status Messages', level: 'AA', v: '2.1' },
};

// Canadian frameworks. `includes(sc)` decides whether a WCAG SC is in scope.
export const FRAMEWORKS = {
  aca: {
    id: 'aca',
    short: 'ACA / EN 301 549',
    name: 'Accessible Canada Act — CAN/ASC-EN 301 549:2024 (WCAG 2.1 AA, clause 9)',
    jurisdiction: 'Federal (federally regulated organizations & Government of Canada)',
    wcag: 'WCAG 2.1 AA',
    includes: (sc) => ['2.0', '2.1'].includes(WCAG_SC[sc]?.v),
    // EN 301 549 clause 9 mirrors WCAG numbering: SC 1.4.3 -> clause 9.1.4.3
    clause: (sc) => `9.${sc}`,
  },
  aoda: {
    id: 'aoda',
    short: 'AODA',
    name: 'Ontario AODA — IASR O. Reg. 191/11, s.14 (WCAG 2.0 AA, excl. 1.2.4 & 1.2.5)',
    jurisdiction: 'Ontario',
    wcag: 'WCAG 2.0 AA',
    includes: (sc) => WCAG_SC[sc]?.v === '2.0' && !['1.2.4', '1.2.5'].includes(sc),
    clause: () => 'IASR s.14',
  },
  quebec: {
    id: 'quebec',
    short: 'Québec SGQRI 008',
    name: 'Québec — Standard SGQRI 008 2.0 (based on WCAG 2.0 AA)',
    jurisdiction: 'Québec public bodies',
    wcag: 'WCAG 2.0 AA',
    includes: (sc) => WCAG_SC[sc]?.v === '2.0',
    clause: () => 'SGQRI 008-01',
  },
  wcag22: {
    id: 'wcag22',
    short: 'WCAG 2.2 AA',
    name: 'WCAG 2.2 AA (current W3C recommendation; best target for future-proofing)',
    jurisdiction: 'Best practice / upcoming standard revisions',
    wcag: 'WCAG 2.2 AA',
    includes: (sc) => !!WCAG_SC[sc] && sc !== '4.1.1',
    clause: () => '',
  },
};

// Scan profiles: which axe-core tags to run and which framework is primary.
export const PROFILES = {
  aca: { framework: 'aca', axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  aoda: { framework: 'aoda', axeTags: ['wcag2a', 'wcag2aa'] },
  quebec: { framework: 'quebec', axeTags: ['wcag2a', 'wcag2aa'] },
  wcag22: { framework: 'wcag22', axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
};

// axe tag "wcag1410" -> "1.4.10"
export function tagToSc(tag) {
  const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

export function frameworksForSc(scList) {
  const out = {};
  for (const fw of Object.values(FRAMEWORKS)) {
    const hits = scList.filter((sc) => fw.includes(sc));
    if (hits.length) out[fw.id] = hits.map((sc) => fw.clause(sc)).filter(Boolean);
  }
  return out;
}
