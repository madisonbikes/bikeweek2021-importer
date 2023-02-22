import "reflect-metadata";
import { injectable } from "tsyringe";
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedUser, authenticatedUserSchema } from "../routes/contract";
import { DbUser } from "../database/types";
import { LocalStrategyProvider } from "./local";
import { GoogleStrategy } from "./google";

export type AuthenticatedExpressUser = Express.User & AuthenticatedUser;

export type ExpressMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

export enum Roles {
  ADMIN = "admin",
  EDITOR = "editor",
}

export const userHasRole = (user: AuthenticatedUser, role: string) => {
  return user.roles.find((r) => r === role) !== undefined;
};

export const localMiddleware: ExpressMiddleware = passport.authenticate(
  "local",
  {
    session: true,
    failWithError: false,
  }
);

export const googleMiddleware: ExpressMiddleware = passport.authenticate(
  "google",
  {
    session: true,
    failWithError: false,
  }
);

export const finalizeAuthenticationMiddleware: ExpressMiddleware = (
  request,
  response
) => {
  const user = request.user as AuthenticatedUser;
  response.send(user);
};

@injectable()
export class AuthenticationStrategies {
  constructor(
    private localProvider: LocalStrategyProvider,
    readonly google: GoogleStrategy
  ) {}

  readonly local = this.localProvider.strategy;
}

/** sanitizes user info for export to passport and into request object */
export const buildAuthenticatedUser = (user: DbUser) => {
  return authenticatedUserSchema.parse(user);
};
