import { describe, it, expect } from "vitest";
import { mapRole, getRoleMeta } from "./staff";
import { Role } from "@prisma/client";

describe("Staff & Roles Service (lib/services/staff.ts)", () => {
  it("should map role slugs correctly to Prisma Role Enum", () => {
    expect(mapRole("super_admin")).toBe(Role.SUPERADMIN);
    expect(mapRole("chief_editor")).toBe(Role.ADMIN);
    expect(mapRole("admin")).toBe(Role.ADMIN);
    expect(mapRole("publisher")).toBe(Role.PUBLISHER);
    expect(mapRole("reporter")).toBe(Role.REPORTER);
    expect(mapRole("author")).toBe(Role.AUTHOR);
    expect(mapRole("editor")).toBe(Role.EDITOR);
    expect(mapRole("unknown")).toBe(Role.EDITOR);
  });

  it("should generate proper role metadata and display names", () => {
    const superAdminMeta = getRoleMeta(Role.SUPERADMIN);
    expect(superAdminMeta.roleSlug).toBe("super_admin");
    expect(superAdminMeta.roleName).toBe("Super Admin");

    const chiefEditorMeta = getRoleMeta(Role.ADMIN);
    expect(chiefEditorMeta.roleSlug).toBe("chief_editor");
    expect(chiefEditorMeta.roleName).toBe("Chief Editor");

    const editorMeta = getRoleMeta(Role.EDITOR);
    expect(editorMeta.roleSlug).toBe("editor");
    expect(editorMeta.roleName).toBe("Editor");
  });
});
