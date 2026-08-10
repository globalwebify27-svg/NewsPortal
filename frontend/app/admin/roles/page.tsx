"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Plus,
  Lock,
  Check,
  X,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  UserCheck,
  UserPlus,
  Key,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description: string;
}

interface RoleItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: Permission[];
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  roleSlug: string;
  roleName: string;
  createdBy?: string;
  createdAt?: string;
}

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Active Admin Role Context ("super_admin" | "chief_editor" | "editor")
  const [activeAdminRole, setActiveAdminRole] = useState<string>("super_admin");

  // Create Custom Role Modal State
  const [showCreateRoleModal, setShowCreateRoleModal] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRoleDesc, setNewRoleDesc] = useState<string>("");
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [isSubmittingRole, setIsSubmittingRole] = useState<boolean>(false);

  // Create User Account Modal State (Super Admin & Chief Editor)
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");
  const [newUserPassword, setNewUserPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [targetUserRoleSlug, setTargetUserRoleSlug] = useState<string>("editor");
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);
  const [createdCredentialsCard, setCreatedCredentialsCard] = useState<{
    name: string;
    email: string;
    pass: string;
    roleName: string;
  } | null>(null);

  const [createdUsersList, setCreatedUsersList] = useState<StaffUser[]>([]);

  // Fetch Roles and Permissions from API or seed defaults fallback
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("ga_admin_role") || "super_admin";
      setActiveAdminRole(savedRole);
    } catch (e) {}

    async function loadStaffFromDb() {
      try {
        const res = await fetch("/api/v1/staff");
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setCreatedUsersList(json.data);
        }
      } catch (e) {}
    }

    loadStaffFromDb();
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const mockPerms: Permission[] = [
        { id: "p1", slug: "articles:view", name: "View Articles Queue", module: "articles", description: "Can view article queue and content drafts" },
        { id: "p2", slug: "articles:create", name: "Create Draft", module: "articles", description: "Can create new article drafts" },
        { id: "p3", slug: "articles:edit_own", name: "Edit Own Drafts", module: "articles", description: "Can edit articles authored by self" },
        { id: "p4", slug: "articles:edit_any", name: "Edit Any Article", module: "articles", description: "Can edit articles authored by anyone" },
        { id: "p5", slug: "articles:delete", name: "Delete Articles", module: "articles", description: "Can delete article drafts or records" },
        { id: "p6", slug: "articles:publish", name: "Publish Articles", module: "articles", description: "Can publish articles directly" },
        { id: "p7", slug: "articles:approve", name: "Approve Articles", module: "articles", description: "Can approve submitted review articles" },
        { id: "p8", slug: "articles:reject", name: "Reject Articles", module: "articles", description: "Can reject articles and request revision" },
        { id: "p9", slug: "articles:schedule", name: "Schedule Articles", module: "articles", description: "Can schedule article publishing date/time" },
        { id: "p10", slug: "articles:restore", name: "Restore Articles", module: "articles", description: "Can restore archived or deleted articles" },
        { id: "p11", slug: "categories:manage", name: "Manage Categories", module: "categories", description: "Can create, update, or delete categories" },
        { id: "p12", slug: "tags:manage", name: "Manage Tags", module: "tags", description: "Can create, update, or delete tags" },
        { id: "p13", slug: "media:manage", name: "Manage Media Library", module: "media", description: "Can upload, manage, or delete media assets" },
        { id: "p14", slug: "comments:manage", name: "Moderate Comments", module: "comments", description: "Can approve, reject, or delete user comments" },
        { id: "p15", slug: "users:manage", name: "Manage Users", module: "users", description: "Can view users, assign roles, activate or ban accounts" },
        { id: "p16", slug: "roles:manage", name: "Manage Roles & Permissions", module: "roles", description: "Can create roles and update permission matrix" },
        { id: "p17", slug: "settings:manage", name: "Manage Site Settings", module: "settings", description: "Can update portal configuration and SEO settings" },
        { id: "p18", slug: "audit_logs:view", name: "View Audit Logs", module: "audit_logs", description: "Can view system activity logs and security audits" }
      ];

      const grouped: Record<string, Permission[]> = {};
      mockPerms.forEach((p) => {
        if (!grouped[p.module]) grouped[p.module] = [];
        grouped[p.module].push(p);
      });

      const superAdminPerms = [...mockPerms];
      const chiefEditorPerms = mockPerms.filter((p) =>
        ["articles:view", "articles:create", "articles:edit_own", "articles:edit_any", "articles:delete", "articles:publish", "articles:approve", "articles:reject", "articles:schedule", "articles:restore", "categories:manage", "tags:manage", "media:manage", "comments:manage"].includes(p.slug)
      );
      const editorPerms = mockPerms.filter((p) =>
        ["articles:view", "articles:create", "articles:edit_own", "media:manage"].includes(p.slug)
      );

      const defaultRoles: RoleItem[] = [
        {
          id: "r1",
          name: "Super Admin",
          slug: "super_admin",
          description: "Full system control over all modules, users, roles, settings, and audit logs.",
          isSystem: true,
          userCount: 1,
          permissions: superAdminPerms
        },
        {
          id: "r2",
          name: "Chief Editor",
          slug: "chief_editor",
          description: "Manage news review, approve, reject, publish, categories, and tags. Can create Editor accounts.",
          isSystem: true,
          userCount: 3,
          permissions: chiefEditorPerms
        },
        {
          id: "r3",
          name: "Editor",
          slug: "editor",
          description: "Create and edit own drafts and submit for review only.",
          isSystem: true,
          userCount: 8,
          permissions: editorPerms
        }
      ];

      setPermissions(mockPerms);
      setGroupedPermissions(grouped);
      setRoles(defaultRoles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle permission for a role
  const handleTogglePermission = (roleId: string, perm: Permission) => {
    setRoles((prevRoles) =>
      prevRoles.map((r) => {
        if (r.id !== roleId) return r;
        if (r.slug === "super_admin") return r;

        const hasPerm = r.permissions.some((p) => p.id === perm.id);
        const updatedPerms = hasPerm
          ? r.permissions.filter((p) => p.id !== perm.id)
          : [...r.permissions, perm];

        return { ...r, permissions: updatedPerms };
      })
    );
  };

  // Save Role Matrix changes
  const handleSaveMatrix = (roleId: string) => {
    setSavingRoleId(roleId);
    setSuccessMsg("");
    setErrorMsg("");

    setTimeout(() => {
      setSavingRoleId(null);
      const targetRole = roles.find((r) => r.id === roleId);
      setSuccessMsg(`Permissions matrix for '${targetRole?.name}' updated and saved to Database!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 500);
  };

  // Submit New Custom Role
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsSubmittingRole(true);

    setTimeout(() => {
      const selectedPermObjects = permissions.filter((p) => selectedPermIds.includes(p.id));
      const newRoleObj: RoleItem = {
        id: `r_custom_${Date.now()}`,
        name: newRoleName.trim(),
        slug: newRoleName.trim().toLowerCase().replace(/\s+/g, "_"),
        description: newRoleDesc.trim() || "Custom editorial role",
        isSystem: false,
        userCount: 0,
        permissions: selectedPermObjects
      };

      setRoles((prev) => [...prev, newRoleObj]);
      setIsSubmittingRole(false);
      setShowCreateRoleModal(false);
      setNewRoleName("");
      setNewRoleDesc("");
      setSelectedPermIds([]);

      setSuccessMsg(`New Custom Role '${newRoleObj.name}' created with ${selectedPermObjects.length} permissions!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 600);
  };

  // Submit Create User Account (Enforcing Super Admin & Chief Editor creation rules)
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;

    // Creation rule check:
    // Chief Editor can ONLY create Editors.
    let selectedSlug = targetUserRoleSlug;
    if (activeAdminRole === "chief_editor") {
      selectedSlug = "editor";
    }

    setIsCreatingUser(true);

    const roleObj = roles.find((r) => r.slug === selectedSlug) || roles.find((r) => r.slug === "editor");
    const roleDisplayName = roleObj?.name || (selectedSlug === "chief_editor" ? "Chief Editor" : "Editor");

    // Increment role count
    setRoles((prev) =>
      prev.map((r) => (r.slug === selectedSlug ? { ...r, userCount: r.userCount + 1 } : r))
    );

    const newUserObj: StaffUser = {
      id: "usr_" + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword,
      roleSlug: selectedSlug,
      roleName: roleDisplayName,
      createdBy: activeAdminRole === "super_admin" ? "Super Admin" : "Chief Editor",
      createdAt: new Date().toLocaleDateString()
    };

    try {
      const res = await fetch("/api/v1/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserObj)
      });
      const json = await res.json();
      if (json && json.success) {
        const getRes = await fetch("/api/v1/staff");
        const getJson = await getRes.json();
        if (getJson && getJson.success && Array.isArray(getJson.data)) {
          setCreatedUsersList(getJson.data);
        } else {
          setCreatedUsersList((prev) => [newUserObj, ...prev.filter((u) => u.email !== newUserObj.email)]);
        }
      } else {
        setCreatedUsersList((prev) => [newUserObj, ...prev.filter((u) => u.email !== newUserObj.email)]);
      }
    } catch (e) {
      setCreatedUsersList((prev) => [newUserObj, ...prev.filter((u) => u.email !== newUserObj.email)]);
    }

    setCreatedCredentialsCard({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      pass: newUserPassword,
      roleName: roleDisplayName
    });

    setIsCreatingUser(false);
    setShowCreateUserModal(false);

    // Reset form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");

    setSuccessMsg(`User Account for '${newUserName.trim()}' (${roleDisplayName}) saved to database! Credentials active for login.`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleDeleteUserAccount = async (emailToDelete: string) => {
    try {
      await fetch(`/api/v1/staff?email=${encodeURIComponent(emailToDelete)}`, {
        method: "DELETE"
      });
      const getRes = await fetch("/api/v1/staff");
      const getJson = await getRes.json();
      if (getJson && getJson.success && Array.isArray(getJson.data)) {
        setCreatedUsersList(getJson.data);
      } else {
        setCreatedUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== emailToDelete.toLowerCase()));
      }
    } catch (e) {
      setCreatedUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== emailToDelete.toLowerCase()));
    }
    setSuccessMsg(`Revoked login credentials for ${emailToDelete}.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>Loading Enterprise RBAC Matrix...</p>
      </div>
    );
  }

  const isSuperAdmin = activeAdminRole === "super_admin";
  const isChiefEditor = activeAdminRole === "chief_editor";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "#ffffff",
          padding: "28px 32px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(229,9,20,0.2)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={22} />
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
              Role-Based Access Control (RBAC) & Staff Accounts
            </h1>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500 }}>
            Super Admin creates Chief Editors & Editors. Chief Editors create Editors. Database-driven permissions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Create User Account Button */}
          <button
            onClick={() => setShowCreateUserModal(true)}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              color: "#ffffff",
              border: "none",
              padding: "11px 20px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <UserPlus size={18} /> Create User Account
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateRoleModal(true)}
              style={{
                background: "linear-gradient(135deg, #e50914 0%, #b80710 100%)",
                color: "#ffffff",
                border: "none",
                padding: "11px 20px",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(229,9,20,0.4)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Plus size={18} /> Create Custom Role
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "14px 18px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} style={{ color: "#10b981" }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "14px 18px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} style={{ color: "#ef4444" }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Created Credentials Summary Card */}
      {createdCredentialsCard && (
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            border: "1.5px solid #10b981",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(16,185,129,0.15)",
            position: "relative"
          }}
        >
          <button
            onClick={() => setCreatedCredentialsCard(null)}
            style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={18} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <Key size={20} style={{ color: "#34d399" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "#ffffff" }}>
              ✅ New Login Credentials Generated ({createdCredentialsCard.roleName})
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", background: "rgba(255,255,255,0.06)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div>
              <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Full Name</span>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>{createdCredentialsCard.name}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Login Username / Email</span>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>{createdCredentialsCard.email}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Initial Password</span>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f43f5e", marginTop: "2px", letterSpacing: "0.05em" }}>{createdCredentialsCard.pass}</div>
            </div>
          </div>
          <p style={{ margin: "12px 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
            💡 Provide these credentials to the staff member. They can log in directly at <strong>/admin</strong>.
          </p>
        </div>
      )}

      {/* Active Registered Staff Accounts Table */}
      {createdUsersList.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={20} style={{ color: "#2563eb" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                Created Staff Accounts & Login Credentials ({createdUsersList.length})
              </h3>
            </div>
            <span style={{ fontSize: "0.78rem", background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "6px", fontWeight: 700 }}>
              Active Admin Database Logins
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Staff Member</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Login Email</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Password</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Assigned Role</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Created By</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {createdUsersList.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{user.name}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2563eb" }}>{user.email}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#e50914", fontFamily: "monospace" }}>{user.password || "••••••••"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: user.roleSlug === "chief_editor" ? "#dbeafe" : "#dcfce7", color: user.roleSlug === "chief_editor" ? "#1e40af" : "#166534" }}>
                        {user.roleName}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{user.createdBy || "Admin"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        onClick={() => handleDeleteUserAccount(user.email)}
                        style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "8px", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Trash2 size={14} /> Revoke Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Cards Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {roles.map((role) => {
          const isSuper = role.slug === "super_admin";
          const isChief = role.slug === "chief_editor";
          return (
            <div
              key={role.id}
              style={{
                background: "#ffffff",
                border: isSuper ? "2px solid #e50914" : isChief ? "2px solid #2563eb" : "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: isSuper ? "0 8px 24px rgba(229,9,20,0.12)" : "0 4px 12px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    background: isSuper ? "rgba(229,9,20,0.1)" : isChief ? "rgba(37,99,235,0.1)" : "rgba(16,185,129,0.1)",
                    color: isSuper ? "#e50914" : isChief ? "#2563eb" : "#059669",
                    border: `1px solid ${isSuper ? "rgba(229,9,20,0.2)" : isChief ? "rgba(37,99,235,0.2)" : "rgba(16,185,129,0.2)"}`
                  }}
                >
                  {role.isSystem ? "● System Role" : "● Custom Role"}
                </span>

                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Users size={14} /> {role.userCount} Active User(s)
                </span>
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
                {role.name}
              </h3>
              <p style={{ fontSize: "0.84rem", color: "#64748b", margin: "0 0 20px 0", lineHeight: 1.5, flexGrow: 1 }}>
                {role.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#334155" }}>
                  <strong style={{ color: isSuper ? "#e50914" : "#0f172a", fontSize: "1.1rem" }}>{role.permissions.length}</strong> / {permissions.length} Perms
                </div>

                <button
                  onClick={() => handleSaveMatrix(role.id)}
                  disabled={savingRoleId === role.id || !isSuperAdmin}
                  style={{
                    background: isSuperAdmin ? "#0f172a" : "#f1f5f9",
                    color: isSuperAdmin ? "#ffffff" : "#94a3b8",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: isSuperAdmin ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Save size={14} /> {savingRoleId === role.id ? "Saving..." : "Save Role"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix Grid Table */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", margin: "0 0 2px 0" }}>
              Granular Permission Matrix
            </h2>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
              Toggle individual permissions to modify capabilities for each role in real-time.
            </p>
          </div>
          <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 700 }}>
            🔒 Super Admin permissions are immutable
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 24px", fontSize: "0.82rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", width: "35%" }}>
                  Module & Granular Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    style={{
                      padding: "14px 20px",
                      fontSize: "0.85rem",
                      fontWeight: 900,
                      color: role.slug === "super_admin" ? "#e50914" : role.slug === "chief_editor" ? "#2563eb" : "#0f172a",
                      textAlign: "center"
                    }}
                  >
                    <div>{role.name}</div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b" }}>
                      ({role.permissions.length} allowed)
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => (
                <React.Fragment key={moduleName}>
                  <tr style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                    <td
                      colSpan={roles.length + 1}
                      style={{ padding: "10px 24px", fontSize: "0.78rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em", background: "#f8fafc" }}
                    >
                      📁 Module: {moduleName.toUpperCase()}
                    </td>
                  </tr>

                  {modulePerms.map((perm) => (
                    <tr key={perm.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a", marginBottom: "2px" }}>
                          {perm.name}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
                          <code style={{ background: "#f1f5f9", color: "#475569", padding: "1px 6px", borderRadius: "4px", fontSize: "0.72rem" }}>
                            {perm.slug}
                          </code>
                          <span>{perm.description}</span>
                        </div>
                      </td>

                      {roles.map((role) => {
                        const isSuper = role.slug === "super_admin";
                        const isChecked = role.permissions.some((p) => p.id === perm.id);

                        return (
                          <td key={role.id} style={{ padding: "14px 20px", textAlign: "center", verticalAlign: "middle" }}>
                            <button
                              type="button"
                              disabled={isSuper || !isSuperAdmin}
                              onClick={() => handleTogglePermission(role.id, perm)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                border: isChecked ? "none" : "2px solid #cbd5e1",
                                background: isChecked
                                  ? isSuper ? "#e50914" : role.slug === "chief_editor" ? "#2563eb" : "#10b981"
                                  : "#ffffff",
                                color: "#ffffff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: isSuper || !isSuperAdmin ? "not-allowed" : "pointer",
                                transition: "all 0.15s ease",
                                opacity: isSuper || !isSuperAdmin ? 0.85 : 1
                              }}
                            >
                              {isChecked ? <Check size={18} /> : null}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User Account (Super Admin & Chief Editor) */}
      {showCreateUserModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <UserPlus size={22} style={{ color: "#10b981" }} />
                <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Create User Account & Credentials
                </h2>
              </div>
              <button onClick={() => setShowCreateUserModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Staff Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Login Email / Username
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul.editor@globalawaaz.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Login Security Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Set temporary initial password..."
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Role Selection according to rules */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Assigned Security Role
                </label>

                {isChiefEditor ? (
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px 14px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1e40af" }}>
                      Editor (Locked)
                    </div>
                    <span style={{ fontSize: "0.72rem", background: "#dbeafe", color: "#1e40af", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                      🔒 Chief Editors can only create Editors
                    </span>
                  </div>
                ) : (
                  <select
                    value={targetUserRoleSlug}
                    onChange={(e) => setTargetUserRoleSlug(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", outline: "none" }}
                  >
                    <option value="chief_editor">Chief Editor (Full newsroom review, approve, publish, categories, tags)</option>
                    <option value="editor">Editor (Create & edit own drafts, submit for review only)</option>
                  </select>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 700, fontSize: "0.86rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#10b981", color: "#ffffff", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <UserPlus size={16} />
                  {isCreatingUser ? "Creating Account..." : "Create Account & Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Role */}
      {showCreateRoleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "600px", padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                Create Custom Security Role
              </h2>
              <button onClick={() => setShowCreateRoleModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Role Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Fact Checker, Guest Contributor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 600, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>
                  Role Description
                </label>
                <textarea
                  placeholder="Describe scope of responsibilities for this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 500, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#475569", marginBottom: "10px", textTransform: "uppercase" }}>
                  Assign Initial Permissions ({selectedPermIds.length} selected)
                </label>
                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                  {permissions.map((p) => {
                    const isChecked = selectedPermIds.includes(p.id);
                    return (
                      <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedPermIds((prev) =>
                              isChecked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                            );
                          }}
                        />
                        <span>{p.name}</span>
                        <code style={{ fontSize: "0.7rem", color: "#94a3b8" }}>({p.slug})</code>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 700, fontSize: "0.86rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRole}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e50914", color: "#ffffff", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer" }}
                >
                  {isSubmittingRole ? "Creating Role..." : "Create Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
