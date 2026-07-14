// Suite F - Permissions (By User / By Company Role) [T1, wave 2]. VERIFIED 2026-07-14 against
// merged team2-hackathon f50951f: ht2mlsettings.cfc (savePermission/deletePermission) +
// ht2mllearner.cfc visibilityFilterSql (decision HAC-390) + the HAC-386 permission pivot.
// Scope: Support MDs Suite F. By-Location is out (rejected by the backend). Runs against the
// permission-contract oracle; the Add-Permission modal + homepage effect are the Playwright lane.

import { describe, it, expect, beforeEach } from 'vitest';
import { createPermissionStore, PERMISSION_TYPES } from '../support/permission-contract.js';

const TOPIC = 12;
const [ALICE, BOB] = [101, 102];
const ROLE_SUPERVISOR = 5;

describe('Suite F - Permissions (T1)', () => {
  let store;
  beforeEach(() => {
    store = createPermissionStore();
  });

  it('F0 - a topic with ZERO permissions is visible to every company learner (HAC-390)', () => {
    expect(store.canSee(TOPIC, { userId: ALICE })).toBe(true);
    expect(store.canSee(TOPIC, { userId: BOB })).toBe(true);
  });

  it('F1 - grant By User -> that user sees the topic; a non-granted user does not', () => {
    store.savePermission(TOPIC, { type: 'user', userIds: [ALICE] });
    expect(store.canSee(TOPIC, { userId: ALICE })).toBe(true);
    expect(store.canSee(TOPIC, { userId: BOB })).toBe(false); // once a perm exists, granted-only
  });

  it('F2 - grant By Company Role -> a user with that role sees it; a user without does not', () => {
    store.savePermission(TOPIC, { type: 'role', roleIds: [ROLE_SUPERVISOR] });
    expect(store.canSee(TOPIC, { userId: ALICE, roleIds: [ROLE_SUPERVISOR] })).toBe(true);
    expect(store.canSee(TOPIC, { userId: BOB, roleIds: [] })).toBe(false);
  });

  it('F3 - remove a grant -> that user loses access while the topic stays restricted', () => {
    const alice = store.savePermission(TOPIC, { type: 'user', userIds: [ALICE] });
    store.savePermission(TOPIC, { type: 'user', userIds: [BOB] }); // second grant keeps topic restricted
    expect(store.canSee(TOPIC, { userId: ALICE })).toBe(true);

    expect(store.deletePermission(alice.permissionId)).toEqual({ error: false });
    expect(store.canSee(TOPIC, { userId: ALICE })).toBe(false); // access lost
    expect(store.canSee(TOPIC, { userId: BOB })).toBe(true); // Bob unaffected
  });

  it('F3b - removing the LAST permission reverts the topic to open (HAC-390 interaction)', () => {
    const alice = store.savePermission(TOPIC, { type: 'user', userIds: [ALICE] });
    expect(store.canSee(TOPIC, { userId: BOB })).toBe(false); // restricted while a perm exists
    store.deletePermission(alice.permissionId); // now zero perms
    expect(store.canSee(TOPIC, { userId: BOB })).toBe(true); // open again - NOT access-lost
  });

  it('F4 - By Location is out of scope: savePermission type=location is rejected', () => {
    expect(store.savePermission(TOPIC, { type: 'location', userIds: [ALICE] })).toEqual({
      error: true,
      message: 'Invalid permission type',
    });
    expect(PERMISSION_TYPES).toEqual(['user', 'role']);
  });

  it('F5 - getPermissions returns the grants with users/roles + a default name', () => {
    store.savePermission(TOPIC, { type: 'user', userIds: [ALICE, BOB] });
    const { permissions } = store.getPermissions(TOPIC);
    expect(permissions).toHaveLength(1);
    expect(permissions[0]).toMatchObject({ type: 'user', name: 'By User' });
    expect(permissions[0].users.map((u) => u.userId)).toEqual([ALICE, BOB]);
  });

  it.todo('F1/F2-DOM [T1] Add Permission modal: user picker + role picker render + submit (Playwright)');
});
