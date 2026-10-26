export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}
