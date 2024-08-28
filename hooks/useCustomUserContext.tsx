// /hooks/useCustomUserContext.ts
import React, { useEffect, useState, createContext, useContext } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { UserData } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UNIQUE_USER_ID } from "@/constants/constants";
import { getAuth } from "firebase/auth";

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

  const fetchUserData = async () => {
    setLoading(true);

    try {
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("uid", "==", user?.uid))
      );
      //if cannot find user data
      if (querySnapshot.empty) {
        console.log("No user data found");
      }

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
          await AsyncStorage.setItem("userData", JSON.stringify(fetchedData));
        } else {
          await AsyncStorage.removeItem("userData"); // Clear storage if no valid data
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{ userData, setUserData, loading, refetchUserData: fetchUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};
