import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { HealthInsight } from '@/types/health';
import { getHealthInsights } from '@/utils/api/routes/healthInsights';

type HealthContextType = {
  healthInsights: HealthInsight[];
  numHealthInsights: number;
  fetchHealthInsights: () => Promise<void>;
  isLoadingHealthInsights: boolean;
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);
export const useHealth = () => useContext(HealthContext)!;

export const HealthProvider = ({ children }: { children: ReactNode }) => {
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [isLoadingHealthInsights, setIsLoadingHealthInsights] =
    useState<boolean>(false);

  const fetchHealthInsights = useCallback(async () => {
    setIsLoadingHealthInsights(true);
    try {
      const { data } = await getHealthInsights();
      setHealthInsights(data ?? []);
    } catch (error) {
      console.error('Failed to fetch health insights:', error);
    } finally {
      setIsLoadingHealthInsights(false);
    }
  }, []);

  const numHealthInsights = useMemo(
    () => healthInsights?.length ?? 0,
    [healthInsights],
  );

  return (
    <HealthContext.Provider
      value={{
        healthInsights,
        numHealthInsights,
        fetchHealthInsights,
        isLoadingHealthInsights,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};
