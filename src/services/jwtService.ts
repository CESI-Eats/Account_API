import { error } from 'console';
import jwt from 'jsonwebtoken';
import { IdentityType } from '../enums/identityType';

interface TokenPayload {
  sub: string;
  type: string;
  exp: number;
  iat: number;
}

export function decodeJwt(token: string): { identityId: string, identityType: IdentityType } {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return { identityId: decoded.sub, identityType: getIdentityType(decoded.type) };
  } catch (err) {
    throw error('Unable to decode token')
  }
}

function getIdentityType(type: string): IdentityType {
    if (Object.values(IdentityType).includes(type as IdentityType)) {
      return type as IdentityType;
    } else {
      throw new Error('Invalid identity type: ' + type);
    }
  }
