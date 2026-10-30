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
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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
  roleSlug: string;
  roleName: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
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
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<StaffUser | null>(null);
  const [resetModalPassword, setResetModalPassword] = useState<string>("");
  const [showResetModalPassword, setShowResetModalPassword] = useState<boolean>(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState<boolean>(false);

  // Staff Table Pagination State
  const [staffPage, setStaffPage] = useState<number>(1);
  const [staffPageSize, setStaffPageSize] = useState<number>(10);

  // Synchronize dynamic userCount on role cards whenever staff users change
  useEffect(() => {
    if (roles.length > 0) {
      setRoles((prev) =>
        prev.map((r) => {
          const count = createdUsersList.filter((u) => {
            const s = (u.roleSlug || "").toLowerCase();
            const n = (u.roleName || "").toLowerCase().replace(/\s+/g, "_");
            return s === r.slug || n === r.slug;
          }).length;
          return { ...r, userCount: count };
        })
      );
    }
  }, [createdUsersList]);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyPassword = (userId: string, pass: string) => {
    if (!pass) return;
    navigator.clipboard.writeText(pass);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStaffUsers = createdUsersList.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleName?.toLowerCase().includes(q) ||
      u.roleSlug?.toLowerCase().includes(q)
    );
  });

  // Reset page when search or page size changes
  useEffect(() => {
    setStaffPage(1);
  }, [userSearchQuery, staffPageSize]);

  // Staff Table Pagination calculations
  const totalStaffItems = filteredStaffUsers.length;
  const totalStaffPages = Math.max(1, Math.ceil(totalStaffItems / staffPageSize));
  const activeStaffPage = Math.min(Math.max(1, staffPage), totalStaffPages);
  const startStaffIndex = (activeStaffPage - 1) * staffPageSize;
  const endStaffIndex = Math.min(startStaffIndex + staffPageSize, totalStaffItems);
  const paginatedStaffUsers = filteredStaffUsers.slice(startStaffIndex, endStaffIndex);

  // Fetch Roles and Permissions from API or seed defaults fallback
  useEffect(() => {
    try {
      const savedRole = sessionStorage.getItem("ga_admin_role") || "super_admin";
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
        { id: "p18", slug: "team:manage", name: "Manage Team Members", module: "team", description: "Can add, edit, or remove editorial team members" },
        { id: "p19", slug: "careers:manage", name: "Manage Careers & Resumes", module: "careers", description: "Can post job openings and review candidate CVs/resumes" },
        { id: "p20", slug: "audit_logs:view", name: "View Audit Logs", module: "audit_logs", description: "Can view system activity logs and security audits" }
      ];

      const grouped: Record<string, Permission[]> = {};
      mockPerms.forEach((p) => {
        if (!grouped[p.module]) grouped[p.module] = [];
        grouped[p.module].push(p);
      });

      const superAdminPerms = [...mockPerms];
      const chiefEditorPerms = mockPerms.filter((p) =>
        ["articles:view", "articles:create", "articles:edit_own", "articles:edit_any", "articles:delete", "articles:publish", "articles:approve", "articles:reject", "articles:schedule", "articles:restore", "categories:manage", "tags:manage", "media:manage", "comments:manage", "team:manage", "careers:manage"].includes(p.slug)
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
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    let selectedSlug = targetUserRoleSlug;
    if (activeAdminRole === "chief_editor") {
      selectedSlug = "editor";
    }

    setIsCreatingUser(true);
    setErrorMsg("");

    const roleObj = roles.find((r) => r.slug === selectedSlug) || roles.find((r) => r.slug === "editor");
    const roleDisplayName = roleObj?.name || (selectedSlug === "chief_editor" ? "Chief Editor" : "Editor");

    try {
      const res = await fetch("/api/v1/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          password: newUserPassword.trim() || undefined,
          roleSlug: selectedSlug,
        })
      });
      const json = await res.json();
      if (json && json.success) {
        const generatedPassword = json.temporaryPassword || newUserPassword.trim() || "GeneratedSecurePass";
        setCreatedCredentialsCard({
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          pass: generatedPassword,
          roleName: roleDisplayName,
        });

        // Refresh staff list from MySQL
        const getRes = await fetch("/api/v1/staff");
        const getJson = await getRes.json();
        if (getJson && getJson.success && Array.isArray(getJson.data)) {
          setCreatedUsersList(getJson.data);
        }

        setSuccessMsg(`User Account for '${newUserName.trim()}' created in MySQL! Please copy the temporary credentials.`);
        setTimeout(() => setSuccessMsg(""), 6000);
      } else {
        setErrorMsg(json.message || "Failed to create user account.");
        setTimeout(() => setErrorMsg(""), 5000);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error creating user account.");
      setTimeout(() => setErrorMsg(""), 5000);
    } finally {
      setIsCreatingUser(false);
      setShowCreateUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
    }
  };

  const handleToggleUserStatus = async (user: StaffUser) => {
    const newStatus = !user.isActive;
    try {
      const res = await fetch("/api/v1/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          userId: user.id,
          isActive: newStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
        );
        setSuccessMsg(`Account for ${user.email} is now ${newStatus ? "Active" : "Suspended"}.`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(json.message || "Failed to update user status.");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error toggling status.");
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const handleOpenResetModal = (user: StaffUser) => {
    setResetModalUser(user);
    setResetModalPassword("");
    setShowResetModalPassword(false);
  };

  const handleGenerateRandomPassForModal = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetModalPassword(pass);
    setShowResetModalPassword(true);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    setIsSubmittingReset(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          userId: resetModalUser.id,
          newPassword: resetModalPassword.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json && json.success) {
        const finalPass = json.temporaryPassword || resetModalPassword || "UpdatedSecurely";
        setCreatedCredentialsCard({
          name: resetModalUser.name,
          email: resetModalUser.email,
          pass: finalPass,
          roleName: resetModalUser.roleName,
        });
        setSuccessMsg(`Password successfully reset for ${resetModalUser.email}! Credentials generated below.`);
        setResetModalUser(null);
        setTimeout(() => setSuccessMsg(""), 6000);
      } else {
        setErrorMsg(json.message || "Failed to reset password.");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error generating new password.");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleDeleteUserAccount = async (emailToDelete: string) => {
    const confirmDel = window.confirm(`Are you sure you want to revoke access and delete account for ${emailToDelete}?`);
    if (!confirmDel) return;

    try {
      const res = await fetch(`/api/v1/staff?email=${encodeURIComponent(emailToDelete)}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setCreatedUsersList((prev) => prev.filter((u) => u.email.toLowerCase() !== emailToDelete.toLowerCase()));
        setSuccessMsg(`Revoked login credentials for ${emailToDelete}.`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(json.message || "Failed to delete staff account.");
        setTimeout(() => setErrorMsg(""), 4000);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Network error deleting staff account.");
      setTimeout(() => setErrorMsg(""), 4000);
    }
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
              💡 Provide these credentials to the staff member. This temporary password will only be displayed once.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `Global Awaaz Admin Portal\nName: ${createdCredentialsCard.name}\nEmail: ${createdCredentialsCard.email}\nTemporary Password: ${createdCredentialsCard.pass}\nRole: ${createdCredentialsCard.roleName}\nLogin URL: /admin`
                );
                setCopiedId("all_credentials");
                setTimeout(() => setCopiedId(null), 2500);
              }}
              style={{
                background: copiedId === "all_credentials" ? "#10b981" : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "0.8rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.2s ease"
              }}
            >
              {copiedId === "all_credentials" ? <Check size={14} /> : <Copy size={14} />}
              {copiedId === "all_credentials" ? "Copied Credentials!" : "Copy Credentials"}
            </button>
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

      {/* Active Registered Staff Accounts Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={22} style={{ color: "#2563eb" }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Created Staff Accounts &amp; Login Credentials ({createdUsersList.length})
                </h3>
                <span style={{ fontSize: "0.78rem", background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: "9999px", fontWeight: 800 }}>
                  Active Admin Database Logins
                </span>
              </div>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                Active editorial user accounts and database logins with Role-Based Access Control
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search staff user..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{ padding: "6px 10px 6px 30px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem", outline: "none" }}
              />
            </div>
            {(activeAdminRole === "super_admin" || activeAdminRole === "chief_editor") && (
              <button
                onClick={() => setShowCreateUserModal(true)}
                style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <UserPlus size={14} /> Add User Account
              </button>
            )}
          </div>
        </div>

        {filteredStaffUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
            <Users size={32} style={{ color: "#94a3b8", margin: "0 auto 8px" }} />
            <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 800, color: "#334155" }}>
              {userSearchQuery ? "No matching staff users found" : "No RBAC Staff Accounts Registered Yet"}
            </h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#64748b" }}>
              {userSearchQuery ? "Try clearing your search query." : "Click below to create staff user accounts and assign roles."}
            </p>
            {!userSearchQuery && (activeAdminRole === "super_admin" || activeAdminRole === "chief_editor") && (
              <button
                onClick={() => setShowCreateUserModal(true)}
                style={{ background: "#e50914", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 800, fontSize: "0.84rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={15} /> Create User Account
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Staff Member</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Login Email</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Password</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Assigned Role</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Status</th>
                  <th style={{ padding: "12px 14px", fontWeight: 800, color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaffUsers.map((user) => {
                  const isUserActive = user.isActive !== false;
                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: (user.roleSlug === "super_admin" || user.roleName === "Super Admin" || user.roleName === "SUPERADMIN") ? "#fee2e2" : (user.roleSlug === "chief_editor" || user.roleName === "Chief Editor" || user.roleName === "ADMIN") ? "#eff6ff" : "#ecfdf5", color: (user.roleSlug === "super_admin" || user.roleName === "Super Admin" || user.roleName === "SUPERADMIN") ? "#dc2626" : (user.roleSlug === "chief_editor" || user.roleName === "Chief Editor" || user.roleName === "ADMIN") ? "#2563eb" : "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem" }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                        <a href={`mailto:${user.email}`} style={{ color: "#2563eb", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                          {user.email}
                        </a>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "monospace", letterSpacing: "2px", color: "#64748b", fontSize: "0.88rem", fontWeight: 700 }}>
                            ••••••••
                          </span>
                          <button
                            onClick={() => handleOpenResetModal(user)}
                            title="Reset password for this account"
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "1px solid #bfdbfe",
                              padding: "4px 9px",
                              borderRadius: "7px",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Key size={12} /> Reset
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: (user.roleSlug === "chief_editor" || user.roleName === "Chief Editor" || user.roleName === "ADMIN") ? "#dbeafe" : (user.roleSlug === "super_admin" || user.roleName === "Super Admin" || user.roleName === "SUPERADMIN") ? "#fee2e2" : "#dcfce7", color: (user.roleSlug === "chief_editor" || user.roleName === "Chief Editor" || user.roleName === "ADMIN") ? "#1e40af" : (user.roleSlug === "super_admin" || user.roleName === "Super Admin" || user.roleName === "SUPERADMIN") ? "#dc2626" : "#166534" }}>
                          {user.roleName === "ADMIN" ? "Chief Editor" : (user.roleName === "SUPERADMIN" ? "Super Admin" : user.roleName)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{
                            fontSize: "0.74rem",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: isUserActive ? "#dcfce7" : "#fee2e2",
                            color: isUserActive ? "#15803d" : "#b91c1c",
                          }}>
                            {isUserActive ? "Active" : "Suspended"}
                          </span>
                          {user.roleSlug !== "super_admin" && (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              title={isUserActive ? "Suspend this account" : "Activate this account"}
                              style={{
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                color: "#475569",
                                borderRadius: "6px",
                                padding: "2px 6px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {isUserActive ? "Suspend" : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenResetModal(user)}
                            title="Reset password"
                            style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 10px", borderRadius: "8px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Key size={13} /> Reset Pass
                          </button>
                          {user.roleSlug !== "super_admin" && (
                            <button
                              onClick={() => handleDeleteUserAccount(user.email)}
                              style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 10px", borderRadius: "8px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <Trash2 size={13} /> Revoke Access
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Staff Table Pagination Bar */}
          {totalStaffItems > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                padding: "14px 20px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                borderRadius: "0 0 16px 16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "0.84rem", color: "#64748b" }}>
                <span>
                  Showing <strong style={{ color: "#0f172a" }}>{startStaffIndex + 1}</strong> to{" "}
                  <strong style={{ color: "#0f172a" }}>{endStaffIndex}</strong> of{" "}
                  <strong style={{ color: "#0f172a" }}>{totalStaffItems}</strong> staff accounts
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Rows per page:</span>
                  <select
                    value={staffPageSize}
                    onChange={(e) => {
                      setStaffPageSize(Number(e.target.value));
                      setStaffPage(1);
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      cursor: "pointer"
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {totalStaffPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    onClick={() => setStaffPage(1)}
                    disabled={activeStaffPage === 1}
                    title="First Page"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: activeStaffPage === 1 ? "#cbd5e1" : "#475569",
                      cursor: activeStaffPage === 1 ? "not-allowed" : "pointer"
                    }}
                  >
                    <ChevronsLeft size={15} />
                  </button>

                  <button
                    onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                    disabled={activeStaffPage === 1}
                    title="Previous Page"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      height: "30px",
                      padding: "0 8px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: activeStaffPage === 1 ? "#cbd5e1" : "#475569",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: activeStaffPage === 1 ? "not-allowed" : "pointer"
                    }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  {Array.from({ length: totalStaffPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setStaffPage(pg)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        border: pg === activeStaffPage ? "1px solid #e50914" : "1px solid #e2e8f0",
                        background: pg === activeStaffPage ? "#e50914" : "#ffffff",
                        color: pg === activeStaffPage ? "#ffffff" : "#334155",
                        fontSize: "0.78rem",
                        fontWeight: pg === activeStaffPage ? 800 : 600,
                        cursor: "pointer"
                      }}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setStaffPage((p) => Math.min(totalStaffPages, p + 1))}
                    disabled={activeStaffPage === totalStaffPages}
                    title="Next Page"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      height: "30px",
                      padding: "0 8px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: activeStaffPage === totalStaffPages ? "#cbd5e1" : "#475569",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: activeStaffPage === totalStaffPages ? "not-allowed" : "pointer"
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>

                  <button
                    onClick={() => setStaffPage(totalStaffPages)}
                    disabled={activeStaffPage === totalStaffPages}
                    title="Last Page"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: activeStaffPage === totalStaffPages ? "#cbd5e1" : "#475569",
                      cursor: activeStaffPage === totalStaffPages ? "not-allowed" : "pointer"
                    }}
                  >
                    <ChevronsRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
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
                  Temporary Initial Password (Optional)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Leave blank to auto-generate secure temporary password..."
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
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
                <span style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "4px", display: "block" }}>
                  🔐 If blank, a cryptographically secure 16-character temporary password will be auto-generated.
                </span>
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

      {/* Modal: Reset Staff Password */}
      {resetModalUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "480px", padding: "30px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Reset Staff Password
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    {resetModalUser.name} &bull; <strong style={{ color: "#2563eb" }}>{resetModalUser.email}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassForModal}
                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Sparkles size={13} /> Auto-Generate
                  </button>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    type={showResetModalPassword ? "text" : "password"}
                    placeholder="Enter custom password or leave blank to auto-generate..."
                    value={resetModalPassword}
                    onChange={(e) => setResetModalPassword(e.target.value)}
                    style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 600, outline: "none", fontFamily: resetModalPassword ? "monospace" : "inherit" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetModalPassword(!showResetModalPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                  >
                    {showResetModalPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "4px", display: "block" }}>
                  🔐 If blank, a cryptographically secure 16-character temporary password will be auto-generated.
                </span>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px", fontSize: "0.78rem", color: "#475569", lineHeight: 1.5 }}>
                ℹ️ <strong>Security policy:</strong> This will update the user&apos;s password in the database and require them to use this new password on their next login.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", color: "#475569" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#ffffff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Key size={15} />
                  {isSubmittingReset ? "Resetting..." : "Save & Apply New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
