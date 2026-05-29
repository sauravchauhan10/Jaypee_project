"use client";

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
  ArrowLeft,
  User,
  Calendar,
  Droplets,
  Award,
  Building2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useRegister } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

const roles = [
  {
    value: "DOCTOR" as const,
    label: "I'm a Doctor",
    icon: Stethoscope,
    description: "Create and manage prescriptions for your patients",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    value: "PATIENT" as const,
    label: "I'm a Patient",
    icon: UserRound,
    description: "View prescriptions and track your medications",
    gradient: "from-cyan-500 to-blue-500",
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "DOCTOR",
      phone: "",
      specialty: "",
      licenseNumber: "",
      clinicName: "",
      clinicAddress: "",
      dob: "",
      gender: undefined,
      bloodGroup: undefined,
    },
    mode: "onTouched",
  });

  const selectedRole = form.watch("role");

  async function handleNext() {
    const valid = await form.trigger([
      "name",
      "email",
      "password",
      "confirmPassword",
    ]);
    if (valid) setStep(2);
  }

  async function onSubmit(data: RegisterFormValues) {
    try {
      // Strip empty strings so optional backend fields aren't sent as ""
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(
          ([, v]) => v !== "" && v !== undefined,
        ),
      ) as RegisterFormValues;

      await registerMutation.mutateAsync(cleanData);
      toast.success("Account created!", {
        description: "Welcome to PrescribeFlow. Redirecting...",
      });
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      toast.error("Registration failed", { description: message });
    }
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/10">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter your details to get started"
              : "Tell us about your professional role"}
          </CardDescription>

          {/* ── Progress Indicator ────────────────────────── */}
          <div className="flex items-center gap-2 pt-3">
            {[1, 2].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    s <= step ? "bg-primary" : "bg-muted",
                  )}
                />
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-1 tabular-nums">
              {step}/2
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* ── Step 1: Account Details ────────────────── */}
              <div
                className={cn(
                  "space-y-4 transition-all duration-300",
                  step === 1
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8 h-0 overflow-hidden pointer-events-none",
                )}
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Dr. Sarah Johnson"
                            className="pl-10"
                            autoComplete="name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
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
                            placeholder="sarah@hospital.com"
                            type="email"
                            autoComplete="email"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
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
                            autoComplete="new-password"
                            className="pl-10 pr-10"
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

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="••••••••"
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirm ? (
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

                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  variant="gradient"
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* ── Step 2: Role & Profile ─────────────────── */}
              <div
                className={cn(
                  "space-y-5 transition-all duration-300",
                  step === 2
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8 h-0 overflow-hidden pointer-events-none",
                )}
              >
                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Select your role
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <label
                            key={role.value}
                            className={cn(
                              "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
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
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br transition-opacity",
                                role.gradient,
                                field.value === role.value
                                  ? "opacity-100"
                                  : "opacity-60",
                              )}
                            >
                              <role.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-semibold">
                              {role.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground text-center leading-tight">
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

                <Separator />

                {/* ── Doctor Fields ────────────────────────── */}
                {selectedRole === "DOCTOR" && (
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialty</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g., Cardiology"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., MED-12345"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clinicName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Clinic Name{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="City General Hospital"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* ── Patient Fields ───────────────────────── */}
                {selectedRole === "PATIENT" && (
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="date"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                              <SelectItem value="PREFER_NOT_TO_SAY">
                                Prefer not to say
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Blood Group{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                              ].map((bg) => (
                                <SelectItem key={bg} value={bg}>
                                  <span className="flex items-center gap-2">
                                    <Droplets className="w-3 h-3 text-red-400" />
                                    {bg}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* ── Action Buttons ──────────────────────── */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    variant="gradient"
                    className="flex-[2]"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
