// Suite A - Setup & Access (T0). The module gate: an admin flips the Setup toggle and the
// Microlearning surfaces appear. VERIFIED against db_scripts/8716_MicrolearningSettingsRow.sql
// (the per-company `ht2_microlearning_enabled` flag, DEFAULT '0', gating admin tile + learner
// tab together). Scope: Support MDs Suite A + "TDD - Spine Test Cases".
//
// Contract-level here (flag on/off -> both surfaces); the DOM wiring (tab/tile rendering,
// tile opening the Dashboard, role gating) is the Playwright/manual lane.

import { describe, it, expect, beforeEach } from 'vitest';
import { createSettingsStore, moduleSurfaces, SETTING_KEY } from '../support/settings-contract.js';

const COMPANY_X = 100;
const COMPANY_Y = 200;

describe('Suite A - Setup & Access (T0)', () => {
  let settings;
  beforeEach(() => {
    settings = createSettingsStore();
  });

  it('A1 - toggle ON -> learner Microlearning tab AND admin module tile both appear', () => {
    settings.setFlag(COMPANY_X, true);
    expect(settings.getFlag(COMPANY_X)).toBe(true);
    expect(moduleSurfaces(settings.getFlag(COMPANY_X))).toEqual({ adminTile: true, learnerTab: true });
  });

  it('A2 - toggle OFF (and the unset default) -> both hidden', () => {
    // unset default: fnGetSettingFlag IFNULLs to 0 -> off
    expect(settings.getFlag(COMPANY_X)).toBe(false);
    expect(moduleSurfaces(settings.getFlag(COMPANY_X))).toEqual({ adminTile: false, learnerTab: false });
    // explicit off after being on
    settings.setFlag(COMPANY_X, true);
    settings.setFlag(COMPANY_X, false);
    expect(moduleSurfaces(settings.getFlag(COMPANY_X))).toEqual({ adminTile: false, learnerTab: false });
  });

  it('A2b - the flag is per-company: enabling company X does not enable company Y', () => {
    settings.setFlag(COMPANY_X, true);
    expect(settings.getFlag(COMPANY_X)).toBe(true);
    expect(settings.getFlag(COMPANY_Y)).toBe(false); // Y untouched
    expect(SETTING_KEY).toBe('ht2_microlearning_enabled');
  });

  it.todo('A3 [T1] clicking the admin tile opens the module -> Dashboard (DOM/nav - Playwright)');
  it.todo('A4 [T1] role gating: Course Admin cannot toggle in Setup but can open the module');
});
