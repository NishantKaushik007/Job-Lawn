import jwt, { JwtPayload } from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export interface MyJwtPayload extends JwtPayload {
  userId: string;
  deviceId: string;
  subscriptionExpires: string; // or Date, depending on how you store it
}

// Set default expiration to 1 day (86,400 seconds)
export function signJwt(payload: object, expiresIn: number = 86400) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt(token: string): MyJwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && decoded !== null && "subscriptionExpires" in decoded) {
      return decoded as MyJwtPayload;
    }
    return null;
  } catch (error) {
    return null;
  }
}
