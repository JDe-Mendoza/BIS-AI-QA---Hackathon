// Executable spec of the Microlearning module ENABLEMENT toggle (Suite A - Setup & Access),
// VERIFIED against the merged code:
//   db_scripts/8716_MicrolearningSettingsRow.sql registers the per-company flag
//   `ht2_microlearning_enabled` (tblSettings, type flag, DEFAULT '0'). ONE flag gates BOTH
//   the admin tile AND the learner tab (row description: "Show Microlearning module, admin
//   tile and learner tab"). Read via fnGetSettingFlag (IFNULL -> 0), written by the generic
//   Setup toggle's updateCompanySettingsValue, per-company (decision HAC-372: settings-row
//   toggle, no new module infra).
//
// CONTRACT ORACLE. The flag logic (default off; one flag drives both surfaces; per-company)
// is executable here; the DOM wiring (tab/tile actually rendering in the portal nav, and the
// tile opening the Dashboard) is the Playwright/manual lane.

export const SETTING_KEY = 'ht2_microlearning_enabled';

// One flag gates both surfaces - admin tile AND learner tab move together. (A1/A2)
export function moduleSurfaces(enabled) {
  return { adminTile: !!enabled, learnerTab: !!enabled };
}

// Per-company flag store (think: the tblSettings flag row read via fnGetSettingFlag, which
// IFNULLs an unset flag to 0/off).
export function createSettingsStore() {
  const byCompany = new Map(); // companyId -> boolean

  function getFlag(companyId) {
    return byCompany.get(companyId) ?? false; // unset => 0 => off
  }
  function setFlag(companyId, on) {
    byCompany.set(companyId, !!on);
    return { error: false };
  }
  return { getFlag, setFlag };
}
