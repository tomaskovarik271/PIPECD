import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type HelpFeature = 'deal-to-lead-conversion' | 'lead-to-deal-conversion' | 'meeting-scheduling' | 'deals-overview' | 'kanban-vs-table' | 'task-indicators';

interface HelpContextType {
  availableHelp: HelpFeature[];
  setAvailableHelp: (features: HelpFeature[]) => void;
  addHelpFeature: (feature: HelpFeature) => void;
  removeHelpFeature: (feature: HelpFeature) => void;
  clearHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [availableHelp, setAvailableHelpState] = useState<HelpFeature[]>([]);

  const setAvailableHelp = useCallback((features: HelpFeature[]) => {
    setAvailableHelpState(features);
  }, []);

  const addHelpFeature = useCallback((feature: HelpFeature) => {
    setAvailableHelpState(prev => 
      prev.includes(feature) ? prev : [...prev, feature]
    );
  }, []);

  const removeHelpFeature = useCallback((feature: HelpFeature) => {
    setAvailableHelpState(prev => prev.filter(f => f !== feature));
  }, []);

  const clearHelp = useCallback(() => {
    setAvailableHelpState([]);
  }, []);

  return (
    <HelpContext.Provider value={{
      availableHelp,
      setAvailableHelp,
      addHelpFeature,
      removeHelpFeature,
      clearHelp
    }}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}; 