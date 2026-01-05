import { NextFunction, Request, RequestHandler, Response } from "express";
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

export const mockJwt = (req: Request, res: Response, next: NextFunction) => {
  req.auth = {
    sub: "mock-user",
    realm_access: {
      roles: []
    }
  };
  next();
}

export const authtest: RequestHandler = (req, res, next) =>{
  console.log("pretty")
  if(req.headers['x-test-mode'] == 'true'){
    req.auth={
      sub: "test-user",
      realm_access:{
        roles: ["user", "admin"]
      }
    }
    return next();
  }
  if(process.env.NODE_ENV === "test"){
    return mockJwt(req, res, next);
  }else{
    return keycloakJwt(req, res, next);
  }
}
