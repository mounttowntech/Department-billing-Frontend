export const hasPermission = (moduleName, permissionName) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.role) return false;

  const permissions = user.role.permissions || [];

  // Admin (*)
  const admin = permissions.find((p) => p.module === "*");

  if (admin && admin[permissionName]) {
    return true;
  }

  const modulePermission = permissions.find(
    (p) => p.module === moduleName
  );

  if (!modulePermission) return false;

  return modulePermission[permissionName] === true;
};