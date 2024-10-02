import { useUserStore } from '@/store/useUserStore';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';


const App = () => {
  const { initializeUserData } = useUserStore();
    //try to initialize user data
  useEffect(() => {
      initializeUserData();
    }, [initializeUserData]);
  return <Redirect href="/home" />;
}

export default App;