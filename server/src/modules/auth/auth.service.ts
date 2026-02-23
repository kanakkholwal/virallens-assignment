import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import User from '../../models/User';

const generateToken = (id: string) => {
    return jwt.sign({ id }, config.jwtSecret || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (email: string, password: string) => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        email,
        password: hashedPassword,
    });

    return {
        _id: user._id,
        email: user.email,
        token: generateToken(user._id.toString()),
    };
};

export const login = async (email: string, password: string) => {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        return {
            _id: user._id,
            email: user.email,
            token: generateToken(user._id.toString()),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};
