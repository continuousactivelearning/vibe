import { Action, AuthorizationChecker, ForbiddenError, UnauthorizedError } from "routing-controllers";
import { IUser } from "../interfaces/models.js";
import { getFromContainer } from "routing-controllers";
import { FirebaseAuthService } from "#root/modules/auth/services/FirebaseAuthService.js";
import { Request } from "express";

export const authorizationChecker: AuthorizationChecker = async (action: Action, roles: any): Promise<boolean> => {
    const request = action.request as Request;
  const authService = getFromContainer(FirebaseAuthService);
  
  // Extract the token from the Authorization header
  const token = request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    // Get the current user from the token
    const user = await authService.getCurrentUserFromToken(token);
    // Attach user to the request object for further use
    action.request.user = user;
    return true;
  } catch (error) {
    return false;
  }
}

export interface AuthenticatedRequest extends Request {
    user: IUser;
}