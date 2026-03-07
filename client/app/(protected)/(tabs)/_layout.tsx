import NavBar from '@/components/UI/NavBar';
import { HealthProvider } from '@/contexts/Health';

const TabsLayout = () => {
  return (
    <HealthProvider>
      <NavBar />
    </HealthProvider>
  );
};

export default TabsLayout;
