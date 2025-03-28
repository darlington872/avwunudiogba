import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [, navigate] = useLocation();
  const { login, isLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled in useAuth hook
      console.error("Login submission error:", error);
    }
  };

  return (
    <div className="py-6 md:py-10 max-w-md mx-auto">
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white neon-text">Welcome Back</h1>
        <p className="mt-2 md:mt-3 text-purple-300">Sign in to access your account</p>
      </div>

      <div className="glass-card rounded-lg p-4 md:p-6 border border-purple-500/30">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-200">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      className="bg-gray-900/50 border-purple-600/30 text-white placeholder:text-gray-500"
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
                  <FormLabel className="text-purple-200">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="bg-gray-900/50 border-purple-600/30 text-white placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-purple-500 data-[state=checked]:bg-purple-600"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm text-purple-200 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                )}
              />

              <div className="text-sm">
                <Link href="/forgot-password">
                  <a className="text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot password?
                  </a>
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border-none"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-800/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 glass-effect rounded text-purple-300">
                Don't have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/register">
              <a className="w-full inline-flex justify-center py-2 px-4 border border-purple-600/30 rounded-md shadow-sm backdrop-blur-sm bg-purple-900/20 text-sm font-medium text-purple-300 hover:bg-purple-800/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500/50">
                Register now
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
