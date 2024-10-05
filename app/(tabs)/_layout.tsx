import React, { useState } from "react";
import { Tabs, Redirect, Stack } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";

import icons from "../../constants/icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchModal from "@/components/searchmodal";

const TabIcon = ({
  icon,
  color,
  name,
  focused,
}: {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  //for global modal
  const [isModalVisible, setModalVisible] = useState(false);

  const handleModalClose = () => {
    setModalVisible(false); // Close the modal
  };
  return (
    <>

        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#FFA001",
            tabBarInactiveTintColor: "#CDCDE0",
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: "#161622",
              borderTopWidth: 1,
              borderTopColor: "#232533",
              height: 84,
            },
            tabBarHideOnKeyboard: true,
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  setModalVisible(true);
                }}
              >
                <FontAwesomeIcon icon={faSearch} size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.home}
                  color={color}
                  name="Home"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="practice"
            options={{
              title: "Practice",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.play}
                  color={color}
                  name="Practice"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="chatbot"
            options={{
              title: "learning bot",
              headerShown: true,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.chat2}
                  color={color}
                  name="Chat"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="textbook"
            options={{
              title: "Textbooks",
              headerShown: true,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.bookmark}
                  color={color}
                  name="Textbook"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              headerShown: true,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.profile}
                  color={color}
                  name="Profile"
                  focused={focused}
                />
              ),
            }}
          />
        </Tabs>
        {/* Render the global SearchModal */}
        <SearchModal visible={isModalVisible} onClose={handleModalClose} />
    </>
  );
};
export default TabsLayout;
