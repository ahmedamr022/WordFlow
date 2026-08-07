import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/ui/Primitives';

/** Stand-in for the routes that live outside this rebuild's scope. */
export function PlaceholderPage({ title }: {title: string;}) {
  const [query, setQuery] = useState('');

  return (
    <AppShell query={query} onQueryChange={setQuery}>
      <h1 className="mb-4 text-[24px] font-extrabold text-white">{title}</h1>
      <EmptyState
        icon={CompassIcon}
        title="هذه الشاشة خارج نطاق هذا التحديث"
        description="التحديث الحالي يغطي المفردات والمراجعة ولوحة التحكم ومعالجة تكرار القصص."
        action={
        <Link
          to="/words"
          className="mt-1 rounded-xl border border-white/[0.1] px-4 py-2 text-[12.5px] text-white/75 transition hover:text-white">
          
            الانتقال إلى المفردات
          </Link>
        } />
      
    </AppShell>);

}