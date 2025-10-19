"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/use-auth";

export default function SignUpPage() {
  const t = useTranslations("SignUp");
  const signupMutation = useSignup();
  const [showPassword, setShowPassword] = useState(false);

  const signupSchema = useMemo(() => z.object({
    name: z
      .string()
      .min(1, t("Name.required"))
      .regex(/^[a-zA-Z ]+$/, t("Name.letters-only")),
    email: z.string().min(1, t("Email.required")).email(t("Email.valid")),
    civilianId: z
      .string()
      .min(1, t("CivilianId.required"))
      .length(12, t("CivilianId.exact-length"))
      .regex(/^\d{12}$/, t("CivilianId.numbers-only")),
    phoneNumber: z.string().min(1, t("Phone.required")),
    password: z.string().min(1, t("Password.required")).min(6, t("Password.valid")),
  }), [t]);

  type SignupFormData = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      civilianId: "",
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      civilianId: data.civilianId,
      phoneNumber: data.phoneNumber,
      password: data.password,
      type: "consumer",
      role: "user",
    });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 md:py-24">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("create-account")}</h1>
        <p className="mt-2 text-gray-600">{t("sub")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Name.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Name.placeholder")}
                    className="h-12"
                    disabled={signupMutation.isPending}
                    {...field}
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
                <FormLabel className="text-gray-700">{t("Email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Email.placeholder")}
                    className="h-12"
                    disabled={signupMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="civilianId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("CivilianId.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("CivilianId.placeholder")}
                    className="h-12"
                    maxLength={12}
                    disabled={signupMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Phone.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={t("Phone.placeholder")}
                    className="h-12"
                    disabled={signupMutation.isPending}
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
                <FormLabel className="text-gray-700">{t("Password.label")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Password.placeholder")}
                      className="h-12 pr-12"
                      disabled={signupMutation.isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={signupMutation.isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-12 w-full bg-main-500 text-white transition-colors hover:bg-main-600"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("loading")}
              </>
            ) : (
              t("sign-up")
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 space-y-3 text-center text-sm">
        <p className="text-gray-600">
          {t("got-account")}{" "}
          <Link
            href="/login"
            className="font-semibold text-main-500 transition-colors hover:text-main-600 hover:underline"
          >
            {t("login")}
          </Link>
        </p>
        <p className="text-gray-600">
          {t("is-owner")}{" "}
          <Link
            href={process.env.NEXT_PUBLIC_OWNER_DASHBOARD_URL || "#"}
            className="font-semibold text-main-500 transition-colors hover:text-main-600 hover:underline"
          >
            {t("owner-login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
