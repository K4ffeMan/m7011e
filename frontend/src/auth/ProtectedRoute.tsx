import type { PropsWithChildren } from "react";
import { Navigate } from "react-router";
import { getKeycloak } from "../auth/keycloak";

interface Props {
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin,
}: PropsWithChildren<Props>) {
  const keycloak = getKeycloak();

  // Not logged in
  if (!keycloak?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const roles =
      (keycloak.tokenParsed as any)?.realm_access?.roles ?? [];

    if (!roles.includes("admin")) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
