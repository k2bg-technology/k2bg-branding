'use client';

import Link from 'next/link';
import { X_TIMELINE_URL } from './const';
import { useXWidgetsScript } from './useXWidgetsScript';

export function XTimeline() {
  useXWidgetsScript();

  return (
    <div>
      <p className="mb-6 text-subtitle-sm font-bold border-b-2 border-b-slate-100">
        X
      </p>
      <div className="h-[31.25rem]">
        <Link
          className="twitter-timeline"
          href={X_TIMELINE_URL}
          data-height="500"
        />
      </div>
    </div>
  );
}
