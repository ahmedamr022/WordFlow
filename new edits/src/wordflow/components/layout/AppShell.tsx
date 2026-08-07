import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Three-column shell: sidebar (left), scrollable main (center), rail (right).
 * DOM order is [rail, main] inside a `dir="rtl"` row so the rail lands on the
 * right edge and the sidebar on the left, matching the product design.
 */
export function AppShell({
  query,
  onQueryChange,
  searchPlaceholder,
  rail,
  children






}: {query: string;onQueryChange: (value: string) => void;searchPlaceholder?: string;rail?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <div
      dir="rtl"
      className="flex h-full min-h-screen w-full bg-ink-950 font-ar text-white">
      
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          query={query}
          onQueryChange={onQueryChange}
          placeholder={searchPlaceholder} />
        
        <div className="flex min-h-0 flex-1">
          {rail ?
          <div className="hidden w-[330px] shrink-0 border-l border-white/[0.05] bg-ink-950 xl:block">
              <div className="wf-scroll h-full overflow-y-auto p-4">{rail}</div>
            </div> :
          null}
          <main className="wf-scroll min-w-0 flex-1 overflow-y-auto wf-grid-lines">
            <div className="mx-auto max-w-[1080px] px-4 py-5 sm:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Sidebar />
    </div>);

}