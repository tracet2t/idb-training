export const getEmailUsername = (email) => {
  if (!email || typeof email !== 'string') return 'User';
  const local = email.split('@')[0]?.trim();
  return local || 'User';
};

export const formatRole = (role) => {
  if (!role) return '';
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getUserInitial = (displayName) =>
  (displayName?.charAt(0) ?? 'U').toUpperCase();
