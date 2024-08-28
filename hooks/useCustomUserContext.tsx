// /hooks/useCustomUserContext.ts
import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UNIQUE_USER_ID } from "@/constants/constants";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { set } from "date-fns";

interface UserContextType {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  loading: boolean;
  refetchUserData: () => Promise<void>; // Add a refetch function to the context type
}

const UserContext = createContext<UserContextType | null>(null);

export const useCustomUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCustomUserContext must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode; // Correctly typing the children prop
}

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
}: UserProviderProps) => {
  const user = getAuth().currentUser;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      console.log("Fetching user data...");

      try {
        const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        const querySnapshot = await getDocs(q);
        //if cannot find user data
        if (querySnapshot.empty) {
          console.log("No user data found");
          setUserData(null);
        } else {
          const userdoc = querySnapshot.docs[0];
          const fetchedData = {
            id: userdoc.id as string,
            ...userdoc.data(),
          } as UserData;

          // Check if the fetched data is different from the current userData
          if (JSON.stringify(fetchedData) !== JSON.stringify(userData)) {
            setUserData(fetchedData);
            // Only store data if it's not null or undefined
            if (fetchedData) {
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(fetchedData)
              );
            } else {
              await AsyncStorage.removeItem("userData"); // Clear storage if no valid data
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    } else {
      setUserData(null);
    }
    setLoading(false);
  }, [userData]);
  


    // Initialize onAuthStateChanged listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(); // Fetch user data if the user is authenticated
      } else {
        setUserData(null);
        setLoading(false);
        AsyncStorage.removeItem("userData"); // Clear user data if logged out
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [fetchUserData]);

  return (
    <UserContext.Provider
      value={{ userData, setUserData, loading, refetchUserData: fetchUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};
