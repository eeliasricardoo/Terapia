'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProfessionalData {
  // Step 1: Dados Profissionais
  crp?: string;
  nome?: string;
  dataNascimento?: string;
  genero?: string;
  telefone?: string;
  biografia?: string;
  especialidades?: string[];
  abordagens?: string[];
  valorConsulta?: string;
  documentos?: {
    crpFile?: string;
    diplomaFile?: string;
    cvFile?: string;
  };

  // Step 2: Disponibilidade
  availability?: {
    [key: string]: {
      enabled: boolean;
      slots: Array<{ start: string; end: string }>;
    };
  };

  // Step 3: Pagamento
  payment?: {
    bank?: string;
    accountNumber?: string;
    accountType?: string;
    taxIdType?: string;
    taxIdNumber?: string;
  };
}

interface ProfessionalRegistrationContextType {
  data: ProfessionalData;
  updateData: (newData: Partial<ProfessionalData>) => void;
  clearData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const ProfessionalRegistrationContext = createContext<
  ProfessionalRegistrationContextType | undefined
>(undefined);

const STORAGE_KEY = 'professional-registration-data';

export function ProfessionalRegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProfessionalData>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed.data || {});
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.error('Error loading registration data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          data,
          currentStep,
          lastUpdated: new Date().toISOString(),
        })
      );
    }
  }, [data, currentStep, isLoaded]);

  const updateData = (newData: Partial<ProfessionalData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const clearData = () => {
    setData({});
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProfessionalRegistrationContext.Provider
      value={{
        data,
        updateData,
        clearData,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </ProfessionalRegistrationContext.Provider>
  );
}

export function useProfessionalRegistration() {
  const context = useContext(ProfessionalRegistrationContext);
  if (context === undefined) {
    throw new Error(
      'useProfessionalRegistration must be used within a ProfessionalRegistrationProvider'
    );
  }
  return context;
}

