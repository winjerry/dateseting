import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';

export function BuiltWith() {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      Powered by ❤️ <a href="/" target="_blank" className="font-bold hover:underline">DateSet</a>
    </div>
  );
}
