import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

export const keycloakJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: "https://keycloak-dev.ltu-m7011e-7.se/realms/user/protocol/openid-connect/certs",
    cache: true,
    rateLimit: true,
  }),
  audience: "frontend-dev",
  issuer: "https://keycloak-dev.ltu-m7011e-7.se/realms/user",
  algorithms: ["RS256"],
});