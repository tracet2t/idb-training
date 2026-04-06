// User roles in the system
export const UserRole = {
  ADMIN: 'admin',
  FACILITATOR: 'facilitator',
  SME: 'sme',
};

// This is what a User object looks like when returned from backend
// {
//   id: number,
//   email: string,
//   role: string  (one of UserRole values above)
// }

// This is what we send to login
// {
//   email: string,
//   password: string
// }

// This is what login returns
// {
//   user: User,
//   message: string
// }