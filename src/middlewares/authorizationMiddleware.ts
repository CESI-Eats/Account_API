import { Request, Response, NextFunction } from "express";
import { IdentityType } from "../enums/identityType";
import { decodeJwt } from "../services/jwtService";

export const authorize = (allowedIdentityTypes: IdentityType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const {identityId, identityType} = decodeJwt(String(req.headers.authorization?.split(' ')[1]));

        (req as any).identityId = identityId;
  
        if (!allowedIdentityTypes.includes(identityType)) {
          res.status(403).json({ message: 'Forbidden' });
        } else {
          next();
        }
  
      } catch (err) {
        res.status(500).json({ message: 'An error occurred' });
      }
    };
};
