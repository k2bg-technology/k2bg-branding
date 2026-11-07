'use client';

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, useToast } from 'ui';
import { contactFormAction } from './contactFormAction';
import { contactSchema } from './contactSchema';

export function ContactForm() {
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultValues = {
    name: '',
    email: '',
    message: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: 'onChange',
  });

  const sendContact = useMutation({
    mutationKey: ['contact'],
    mutationFn: contactFormAction,
    onSuccess: () => {
      toast.success('メールを送信しました', {
        closeButton: true,
      });
    },
    onError: () => {
      toast.error('送信に失敗しました。もう一度お試しください', {
        closeButton: true,
      });
    },
    onSettled: () => {
      if (captchaRef.current) {
        setCaptchaToken(null);
        captchaRef.current.resetCaptcha();
      }

      reset();
    },
  });

  function clearCaptchaToken() {
    setCaptchaToken(null);
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-spacious h-full md:gap-spacious"
      onSubmit={handleSubmit((visitor) => {
        if (!captchaToken) {
          alert('認証を完了してください。');

          return;
        }

        sendContact.mutate({
          ...visitor,
          token: captchaToken || '',
        });
      })}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col gap-2 w-full">
          <Form.Field>
            <Form.Label
              className="text-body-r-md leading-body-r-md text-base-black font-bold"
              htmlFor="name"
            >
              お名前
            </Form.Label>
            <Form.Input
              {...register('name')}
              type="text"
              name="name"
              id="name"
              placeholder="お名前"
              required
              error={!!errors.name}
            />
            {errors.name?.message && (
              <Form.HelperText error>{errors.name?.message}</Form.HelperText>
            )}
          </Form.Field>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Form.Field>
            <Form.Label
              className="text-body-r-md leading-body-r-md text-base-black font-bold"
              htmlFor="email"
            >
              Eメール
            </Form.Label>
            <Form.Input
              {...register('email')}
              type="email"
              name="email"
              id="email"
              placeholder="Eメール"
              required
              error={!!errors.email}
            />
            {errors.email?.message && (
              <Form.HelperText error>{errors.email?.message}</Form.HelperText>
            )}
          </Form.Field>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Form.Field>
          <Form.Label
            className="text-body-r-md leading-body-r-md text-base-black font-bold"
            htmlFor="message"
          >
            メッセージ
          </Form.Label>
          <Form.Textarea
            {...register('message')}
            name="message"
            id="message"
            rows={4}
            placeholder="メッセージ"
            required
            className="min-h-[4lh] max-h-[15lh]"
            error={!!errors.message}
          />
          {errors.message?.message && (
            <Form.HelperText error>{errors.message?.message}</Form.HelperText>
          )}
        </Form.Field>
      </div>
      <HCaptcha
        ref={captchaRef}
        sitekey={process.env.NEXT_PUBLIC_H_CAPTCHA_SITE_KEY || ''}
        onVerify={setCaptchaToken}
        onExpire={() => clearCaptchaToken()}
        onError={() => clearCaptchaToken()}
      />
      <ul className="flex flex-col gap-spacious md:flex-row">
        <li>
          <Button
            type="submit"
            color="dark"
            variant="outline"
            disabled={sendContact.isPending || !captchaToken}
          >
            送信
          </Button>
        </li>
        <li>
          <Button
            type="reset"
            color="dark"
            variant="outline"
            onClick={() => reset()}
          >
            リセット
          </Button>
        </li>
      </ul>
    </form>
  );
}
