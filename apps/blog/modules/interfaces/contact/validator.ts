import { z } from 'zod';

export type Contact = z.infer<typeof contactSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z
    .string()
    .min(1, 'Eメールを入力してください')
    .email('有効なEメールアドレスを入力してください'),
  message: z.string().min(1, 'メッセージを入力してください'),
});
