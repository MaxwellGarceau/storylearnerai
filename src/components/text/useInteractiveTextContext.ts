import { useContext } from 'react';
import { InteractiveTextContext } from './InteractiveTextContext';
import type { InteractiveTextContextValue } from './InteractiveTextContext';

export const useInteractiveTextContext =
  (): InteractiveTextContextValue | null => {
    return useContext(InteractiveTextContext);
  };
