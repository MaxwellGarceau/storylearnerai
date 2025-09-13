import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { LanguageCode } from '../types/llm/prompts';
import { useAuth } from './useAuth';
import { UserService } from '../api/supabase/database/userProfileService';
import { useLanguages } from './useLanguages';

interface LanguageFilterContextValue {
  fromLanguage: LanguageCode | null;
  targetLanguage: LanguageCode;
  setTargetLanguage: (language: LanguageCode) => void;
  availableTargetLanguages: { code: LanguageCode; name: string }[];
}

const LanguageFilterContext = createContext<LanguageFilterContextValue | null>(
  null
);

export const LanguageFilterProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const { languages, getLanguageName } = useLanguages();

  const [fromLanguage, setFromLanguage] = useState<LanguageCode | null>(null);
  const [targetLanguage, setTargetLanguageState] = useState<LanguageCode>('en');

  // Initialize fromLanguage from user's native language
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const profile = await UserService.getOrCreateUser(user.id, {
        username: user.email?.split('@')[0] ?? undefined,
        display_name: user.email?.split('@')[0] ?? undefined,
      });
      const native = (profile as { native_language?: LanguageCode })
        ?.native_language;
      if (native) {
        setFromLanguage(native);
        // Ensure target is not equal to from; if equal, switch to the other known language when possible
        setTargetLanguageState(prev =>
          prev === native ? (native === 'en' ? 'es' : 'en') : prev
        );
      }
    };
    void load();
  }, [user]);

  // React to profile native_language updates at runtime (no page refresh needed)
  useEffect(() => {
    const onProfileUpdated: EventListener = (evt: Event) => {
      const updatedNative = (
        evt as CustomEvent<{ native_language?: LanguageCode }>
      ).detail?.native_language;
      if (!updatedNative) return;
      setFromLanguage(updatedNative);
      setTargetLanguageState(prev =>
        prev === updatedNative ? (updatedNative === 'en' ? 'es' : 'en') : prev
      );
    };

    window.addEventListener('user:profile-updated', onProfileUpdated);
    return () => {
      window.removeEventListener('user:profile-updated', onProfileUpdated);
    };
  }, []);

  const availableTargetLanguages = useMemo(() => {
    return languages
      .filter(l => (fromLanguage ? l.code !== fromLanguage : true))
      .map(l => ({
        code: l.code,
        name: getLanguageName(l.code),
      }));
  }, [languages, fromLanguage, getLanguageName]);

  const setTargetLanguage = (language: LanguageCode) => {
    if (fromLanguage && language === fromLanguage) {
      return; // Restrict same as native language
    }
    setTargetLanguageState(language);
  };

  const value: LanguageFilterContextValue = {
    fromLanguage,
    targetLanguage,
    setTargetLanguage,
    availableTargetLanguages,
  };

  return (
    <LanguageFilterContext.Provider value={value}>
      {children}
    </LanguageFilterContext.Provider>
  );
};

export const useLanguageFilter = (): LanguageFilterContextValue => {
  const ctx = useContext(LanguageFilterContext);
  if (!ctx) {
    throw new Error(
      'useLanguageFilter must be used within LanguageFilterProvider'
    );
  }
  return ctx;
};
