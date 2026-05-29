"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(_data: ForgotPasswordFormValues) {
    setIsLoading(true);
    // Simulate API call — backend endpoint can be added later
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/10">
        {!isSubmitted ? (
          <>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Forgot password?
              </CardTitle>
              <CardDescription>
                No worries. Enter your email and we&apos;ll send you a reset
                link.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="your@email.com"
                              type="email"
                              autoComplete="email"
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    variant="gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="items-center text-center space-y-4 pb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Check your email
                </CardTitle>
                <CardDescription className="max-w-xs mx-auto">
                  If an account exists with{" "}
                  <span className="font-medium text-foreground">
                    {form.getValues("email")}
                  </span>
                  , we&apos;ve sent a password reset link.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                }}
              >
                Try another email
              </Button>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-center pb-6 pt-4">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
