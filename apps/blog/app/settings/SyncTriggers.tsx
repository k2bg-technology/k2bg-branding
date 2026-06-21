'use client';

import { useMutation } from '@tanstack/react-query';
import { Button, useToast } from 'ui';

import { syncHeroImagesAction, syncPostsAction } from './syncActions';

export function SyncTriggers() {
  const { toast } = useToast();

  const syncPosts = useMutation({
    mutationKey: ['sync-posts'],
    mutationFn: syncPostsAction,
    onSuccess: (result) => {
      toast.success(`記事を同期しました（${result.count}件）`, {
        closeButton: true,
      });
    },
    onError: () => {
      toast.error('記事の同期に失敗しました。もう一度お試しください', {
        closeButton: true,
      });
    },
  });

  const syncHeroImages = useMutation({
    mutationKey: ['sync-hero-images'],
    mutationFn: syncHeroImagesAction,
    onSuccess: (result) => {
      const message =
        result.failedCount > 0
          ? `画像を同期しました（${result.count}件、失敗${result.failedCount}件）`
          : `画像を同期しました（${result.count}件）`;
      toast.success(message, { closeButton: true });
    },
    onError: () => {
      toast.error('画像の同期に失敗しました。もう一度お試しください', {
        closeButton: true,
      });
    },
  });

  return (
    <section className="flex w-full flex-col gap-normal">
      <h2 className="text-heading-4 leading-heading-4 font-bold text-base-black">
        手動同期
      </h2>
      <p className="text-body-r-sm text-neutral-600">
        外部ソースから記事と画像を取り込みます。
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          color="dark"
          variant="outline"
          onClick={() => syncPosts.mutate()}
          disabled={syncPosts.isPending}
        >
          Notionから記事を同期
        </Button>
        <Button
          color="dark"
          variant="outline"
          onClick={() => syncHeroImages.mutate()}
          disabled={syncHeroImages.isPending}
        >
          Cloudinaryから画像を同期
        </Button>
      </div>
    </section>
  );
}
