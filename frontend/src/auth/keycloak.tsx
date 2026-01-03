import Keycloak from "keycloak-js";
import { keycloakConfig } from "./keycloak-config";

let keycloakInstance: Keycloak | null = null;

export const getKeycloak = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};
