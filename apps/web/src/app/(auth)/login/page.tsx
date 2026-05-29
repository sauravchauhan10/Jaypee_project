"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  UserRound,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

const roles = [
  {
    value: "DOCTOR" as const,
    label: "Doctor",
    icon: Stethoscope,
    description: "Prescribe & manage",
  },
  {
    value: "PATIENT" as const,
    label: "Patient",
    icon: UserRound,
    description: "View & track",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "DOCTOR",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Welcome back!", {
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      toast.error("Authentication failed", { description: message });
    }
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/10">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to your PrescribeFlow account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* ── Role Selector ─────────────────────────── */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      I am a
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((role) => (
                        <label
                          key={role.value}
                          className={cn(
                            "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                            field.value === role.value
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                              : "border-border hover:border-primary/40 hover:bg-accent/50",
                          )}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            value={role.value}
                            checked={field.value === role.value}
                            onChange={() => field.onChange(role.value)}
                          />
                          <role.icon
                            className={cn(
                              "w-5 h-5 transition-colors",
                              field.value === role.value
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-semibold transition-colors",
                              field.value === role.value
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {role.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {role.description}
                          </span>
                          {field.value === role.value && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-in zoom-in-50 duration-200" />
                          )}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="!my-5" />

              {/* ── Email ─────────────────────────────────── */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="doctor@hospital.com"
                          type="email"
                          autoComplete="email"
                          className="pl-10"
                          disabled={loginMutation.isPending}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Password ──────────────────────────────── */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="pl-10 pr-10"
                          disabled={loginMutation.isPending}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Remember & Forgot ─────────────────────── */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="login-remember" />
                  <label
                    htmlFor="login-remember"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* ── Submit ────────────────────────────────── */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                variant="gradient"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
