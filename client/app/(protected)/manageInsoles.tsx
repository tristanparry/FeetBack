import { View } from 'react-native';
import DevicesPanel from '@/components/Home/DevicesPanel';
import { useBLE } from '@/contexts/BLE';
import clsx from 'clsx';

const ManageInsoles = () => {
  const { pairedDevices } = useBLE();

  return (
    <View
      className={clsx(
        'flex-1 bg-primary-background px-4',
        pairedDevices.length === 0 && 'justify-center',
      )}
    >
      <DevicesPanel manageInsolesScreen />
    </View>
  );
};

export default ManageInsoles;
