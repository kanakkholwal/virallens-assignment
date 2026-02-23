import api from '@/api/client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signupSchema } from '@/constants/auth-schema';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';


type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
    const { signup } = useAuth();

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    const onSubmit = async (values: SignupFormValues) => {
        try {
            const { data } = await api.post('/auth/signup', {
                email: values.email,
                password: values.password,
            });
            signup(data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>Get started with ViralLens Support today</CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? 'Creating account…' : 'Sign up'}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-primary hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
};

