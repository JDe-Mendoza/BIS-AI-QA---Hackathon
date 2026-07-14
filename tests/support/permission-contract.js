// Executable spec of the Microlearning permission + learner-visibility contract (Suite F),
// VERIFIED 2026-07-14 against merged team2-hackathon f50951f:
//   v1/model/services/ht2mlsettings.cfc  savePermission / getPermissions / deletePermission
//   v1/model/services/ht2mllearner.cfc   visibilityFilterSql (decision HAC-390)
//   db_scripts/8716_MicrolearningPermissionPivot.sql  (PermissionUser / PermissionRole)
//
// Types: By User + By Company Role ONLY (HAC-386 pivot; By-Location rejected). Visibility
// (HAC-390): a topic with ZERO permission rows is visible to EVERY company learner; once any
// permission exists, only users granted directly (PermissionUser) OR via an active company
// role (PermissionRole) can see it.
//
// CONTRACT ORACLE (the CF backend can't be imported into Vitest; real visibility is exercised
// in Playwright-on-staging). NB the merged code additionally filters the grant picker to active
// accounts (fldAccountActive IN (1,2)) - not modelled here (needs account state).
//
// OPEN QA QUESTION (flagged, not asserted): savePermission stores roleIds from tbltrainingrole
// (fldTrainingRole_ID), but visibilityFilterSql joins PermissionRole.fldRoleID against
// tblUserCompanyRoleRelation.fldSysCompanyRoleID - confirm those are the same ID space, else
// By-Company-Role grants would never resolve (F2).

export const PERMISSION_TYPES = ['user', 'role'];

export function createPermissionStore() {
  const byId = new Map(); // permissionId -> { permissionId, topicId, type, name, userIds:Set, roleIds:Set }
  let nextId = 7; // matches the CONTRACTS.md example permissionId

  const topicPerms = (topicId) => [...byId.values()].filter((p) => p.topicId === topicId);

  // Mirrors savePermission: type must be user|role (By-Location rejected); name defaults.
  function savePermission(topicId, { permissionId = 0, type = 'user', userIds = [], roleIds = [], name = '' } = {}) {
    if (!PERMISSION_TYPES.includes(type)) return { error: true, message: 'Invalid permission type' };
    const id = permissionId && byId.has(permissionId) ? permissionId : nextId++;
    byId.set(id, {
      permissionId: id,
      topicId,
      type,
      name: String(name).trim() || (type === 'user' ? 'By User' : 'By Company Role'),
      userIds: new Set(type === 'user' ? userIds : []),
      roleIds: new Set(type === 'role' ? roleIds : []),
    });
    return { error: false, permissionId: id };
  }

  // Mirrors deletePermission(permissionId) - removes the whole permission row.
  function deletePermission(permissionId) {
    if (!byId.has(permissionId)) return { error: true, message: 'Permission not found' };
    byId.delete(permissionId);
    return { error: false };
  }

  function getPermissions(topicId) {
    return {
      error: false,
      permissions: topicPerms(topicId).map((p) => ({
        permissionId: p.permissionId,
        name: p.name,
        type: p.type,
        users: [...p.userIds].map((userId) => ({ userId })),
        roles: [...p.roleIds].map((roleId) => ({ roleId })),
      })),
    };
  }

  // Mirrors visibilityFilterSql (HAC-390): open when no perms; else direct-user OR role grant.
  function canSee(topicId, { userId, roleIds = [] } = {}) {
    const perms = topicPerms(topicId);
    if (perms.length === 0) return true; // zero perms => visible to all
    const userRoles = new Set(roleIds);
    return perms.some((p) => p.userIds.has(userId) || [...p.roleIds].some((r) => userRoles.has(r)));
  }

  return { savePermission, deletePermission, getPermissions, canSee };
}
