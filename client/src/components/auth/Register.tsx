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

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  referralCode: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [, navigate] = useLocation();
  const { register, isLoading } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      terms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Remove confirmPassword and terms from the data sent to API
      const { confirmPassword, terms, ...registerData } = values;
      
      await register({
        ...registerData,
        referredBy: values.referralCode || undefined,
      });
      
      navigate("/dashboard");
    } catch (error) {
      // Error is already handled in useAuth hook
      console.error("Registration submission error:", error);
    }
  };

  return (
    <div className="py-6 md:py-10 max-w-md mx-auto">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex justify-center mb-3">
          <img 
            src="/src/assets/ethervox-logo.svg" 
            alt="Ethervox SMS" 
            className="h-12 md:h-14" 
          />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Create Account</h1>
        <p className="mt-2 text-purple-300 text-sm">Join our service to get WhatsApp numbers</p>
      </div>

      <div className="glass-card rounded-lg p-4 md:p-6 border border-purple-500/30">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-200">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-200">Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="johndoe" 
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-200">Confirm Password</FormLabel>
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

            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-200">Referral Code (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter referral code if you have one"
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
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-purple-500 data-[state=checked]:bg-purple-600"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-purple-200">
                      I agree to the{" "}
                      <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border-none mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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
                Already have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/login">
              <a className="w-full inline-flex justify-center py-2 px-4 border border-purple-600/30 rounded-md shadow-sm backdrop-blur-sm bg-purple-900/20 text-sm font-medium text-purple-300 hover:bg-purple-800/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500/50">
                Sign in instead
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
