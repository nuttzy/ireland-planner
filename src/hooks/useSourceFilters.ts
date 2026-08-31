import * as React from 'react';
import type { Place, SourceType } from '../types';

const ALL_SOURCES: SourceType[] = ['TV', 'Personal', 'GPT', '2018'];
const STORAGE_KEY = 'ireland_filters_sources_v1';

const getSource = (p: Place): SourceType => p.source ?? 'GPT';

const load = (): Set<SourceType> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(ALL_SOURCES);
    const arr = JSON.parse(raw) as SourceType[];
    return new Set(arr.length ? arr : ALL_SOURCES);
  } catch {
    return new Set(ALL_SOURCES);
  }
};

const save = (s: Set<SourceType>) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));

export function useSourceFilters(allPlaces: Place[]) {
  const [selected, setSelected] = React.useState<Set<SourceType>>(load);

  // cross-tab/page sync
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSelected(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // counts (for pills)
  const counts = React.useMemo(() => {
    const c: Record<SourceType, number> = { TV: 0, Personal: 0, GPT: 0, '2018': 0 };
    for (const p of allPlaces) c[getSource(p)]++;
    return c;
  }, [allPlaces]);

  // actions
  const toggle = (s: SourceType) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      if (next.size === 0) ALL_SOURCES.forEach(x => next.add(x)); // never empty
      save(next);
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set(ALL_SOURCES);
    setSelected(all);
    save(all);
  };

  const setOnly = (s: SourceType) => {
    const only = new Set<SourceType>([s]);
    setSelected(only);
    save(only);
  };

  // helper to get a filtered/sorted list (alpha by name)
  const filterPlaces = React.useCallback(
    (extraPredicate?: (p: Place) => boolean) => {
      const arr = allPlaces.filter(
        p => selected.has(getSource(p)) && (!extraPredicate || extraPredicate(p))
      );
      arr.sort((a, b) => a.name.localeCompare(b.name));
      return arr;
    },
    [allPlaces, selected]
  );

  return {
    selected,        // Set<SourceType>
    counts,          // Record<SourceType, number>
    toggle, selectAll, setOnly,
    filterPlaces,
    getSource,
    ALL_SOURCES
  };
}
