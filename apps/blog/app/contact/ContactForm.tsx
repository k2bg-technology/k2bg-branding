'use client';

import { Button, Form, useToast } from 'ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import { contactSchema } from '../../modules/interfaces/contact/validator';

import { contactFormAction } from './contactFormAction';

export default function ContactForm() {
  const captchaRef = useRef<HCaptcha>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultValues = {
    name: '',
    email: '',
    message: '',
  };

  const mutation = useMutation({
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
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: 'onBlur',
  });

  function onExpire() {
    setToken(null);
  }

  function onError() {
    setToken(null);
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-spacious h-full md:gap-spacious"
      onSubmit={handleSubmit((visitor) => {
        if (!token) {
          // eslint-disable-next-line no-alert
          alert('認証を完了してください。');

          return;
        }

        mutation.mutate({
          ...visitor,
          token: token || '',
        });
      })}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col gap-2 w-full">
          <Form.Control>
            <Form.Label
              className="text-body-r-md leading-body-r-md text-base-black font-bold"
              htmlFor="name"
            >
              お名前
            </Form.Label>
            <Form.Input
              // eslint-disable-next-line react/jsx-props-no-spreading
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
          </Form.Control>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Form.Control>
            <Form.Label
              className="text-body-r-md leading-body-r-md text-base-black font-bold"
              htmlFor="email"
            >
              Eメール
            </Form.Label>
            <Form.Input
              // eslint-disable-next-line react/jsx-props-no-spreading
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
          </Form.Control>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Form.Control>
          <Form.Label
            className="text-body-r-md leading-body-r-md text-base-black font-bold"
            htmlFor="message"
          >
            メッセージ
          </Form.Label>
          <Form.Textarea
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register('message')}
            name="message"
            id="message"
            rows={4}
            placeholder="メッセージ"
            required
            error={!!errors.message}
          />
          {errors.message?.message && (
            <Form.HelperText error>{errors.message?.message}</Form.HelperText>
          )}
        </Form.Control>
      </div>
      <HCaptcha
        ref={captchaRef}
        sitekey={process.env.NEXT_PUBLIC_H_CAPTCHA_SITE_KEY || ''}
        onVerify={setToken}
        onExpire={() => onExpire()}
        onError={() => onError()}
      />
      <ul className="flex flex-col gap-spacious md:flex-row">
        <li>
          <Button
            type="submit"
            color="dark"
            variant="outline"
            disabled={mutation.isPending || !token}
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
