'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, Form, useToast } from 'ui';

import { authClient } from '../../infrastructure/auth/auth-client';
import { type LoginInput, loginSchema } from './loginSchema';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ email, password }: LoginInput) => {
      // signIn.email resolves with { error } instead of throwing, so surface
      // failures explicitly to trigger onError.
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        throw new Error(error.message ?? 'login failed');
      }
    },
    onSuccess: () => {
      router.push('/settings');
    },
    onError: () => {
      toast.error('メールアドレスまたはパスワードが正しくありません', {
        closeButton: true,
      });
    },
  });

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-lg border border-base-light bg-white p-8">
      <div className="flex flex-col gap-condensed">
        <h1 className="text-heading-3 leading-heading-3 font-bold text-base-black">
          ログイン
        </h1>
        <p className="text-body-r-sm text-neutral-600">
          管理画面にログインします
        </p>
      </div>
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={handleSubmit((credentials) => mutation.mutate(credentials))}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-normal">
            <Form.Control error={!!errors.email}>
              <Form.Label htmlFor="email">メールアドレス</Form.Label>
              <Form.Input
                {...register('email')}
                type="email"
                id="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email?.message && (
                <Form.HelperText>{errors.email.message}</Form.HelperText>
              )}
            </Form.Control>
          </div>
          <div className="flex flex-col gap-normal">
            <Form.Control error={!!errors.password}>
              <Form.Label htmlFor="password">パスワード</Form.Label>
              <Form.Input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="current-password"
              />
              {errors.password?.message && (
                <Form.HelperText>{errors.password.message}</Form.HelperText>
              )}
            </Form.Control>
          </div>
        </div>
        <Button
          type="submit"
          color="main"
          size="lg"
          className="w-full"
          disabled={mutation.isPending}
        >
          ログイン
        </Button>
      </form>
    </div>
  );
}
