import z from "zod";


export const signupSchema = z
    .object({
        email: z
            .email('Enter a valid email address')
            .min(1, 'Email is required'),
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Must contain at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
export const loginSchema = z.object({
    email: z
        .email('Enter a valid email address')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});
