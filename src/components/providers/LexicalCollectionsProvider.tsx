import { createContext, useContext, PropsWithChildren } from 'react';
import { useLexicalCollections } from '../../hooks/useLexicalCollections';

const LexicalCollectionsContext = createContext<ReturnType<
  typeof useLexicalCollections
> | null>(null);

export function LexicalCollectionsProvider({ children }: PropsWithChildren) {
  const value = useLexicalCollections();
  return (
    <LexicalCollectionsContext.Provider value={value}>
      {children}
    </LexicalCollectionsContext.Provider>
  );
}

export function useLexicalCollectionsContext() {
  const ctx = useContext(LexicalCollectionsContext);
  if (!ctx) {
    throw new Error(
      'useLexicalCollectionsContext must be used within LexicalCollectionsProvider'
    );
  }
  return ctx;
}
