import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Role = 'admin' | 'editor' | 'viewer';

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'documents' | 'templates' | 'users' | 'settings';
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { action: 'create', resource: 'documents' },
    { action: 'read', resource: 'documents' },
    { action: 'update', resource: 'documents' },
    { action: 'delete', resource: 'documents' },
    { action: 'create', resource: 'templates' },
    { action: 'read', resource: 'templates' },
    { action: 'update', resource: 'templates' },
    { action: 'delete', resource: 'templates' },
    { action: 'create', resource: 'users' },
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users' },
    { action: 'delete', resource: 'users' },
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
  ],
  editor: [
    { action: 'create', resource: 'documents' },
    { action: 'read', resource: 'documents' },
    { action: 'update', resource: 'documents' },
    { action: 'read', resource: 'templates' },
    { action: 'create', resource: 'templates' },
    { action: 'update', resource: 'templates' },
    { action: 'read', resource: 'users' },
  ],
  viewer: [
    { action: 'read', resource: 'documents' },
    { action: 'read', resource: 'templates' },
  ],
};

export class RBAC {
  private static instance: RBAC;
  private userRole: Role | null = null;

  private constructor() {}

  static getInstance(): RBAC {
    if (!RBAC.instance) {
      RBAC.instance = new RBAC();
    }
    return RBAC.instance;
  }

  async getUserRole(user: User): Promise<Role> {
    if (this.userRole) return this.userRole;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    this.userRole = data.role as Role;
    return this.userRole;
  }

  async hasPermission(user: User, permission: Permission): Promise<boolean> {
    const role = await this.getUserRole(user);
    return rolePermissions[role].some(
      (p) => p.action === permission.action && p.resource === permission.resource
    );
  }

  async checkPermission(user: User, permission: Permission): Promise<void> {
    const hasPermission = await this.hasPermission(user, permission);
    if (!hasPermission) {
      throw new Error('Unauthorized: Insufficient permissions');
    }
  }
}
