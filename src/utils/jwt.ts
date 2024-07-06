import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const secret = process.env.JWT_SECRET!;
if (!secret) {
    throw new Error('JWT_SECRET is not defined');
}

const generateToken = (data: Object) => {
    return jwt.sign(data, secret as Secret);
};

const verifyToken = (token: string) => {
    return jwt.verify(token, secret as Secret);
};

export { generateToken, verifyToken };
