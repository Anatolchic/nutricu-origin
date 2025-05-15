import React from "react";
import { Tabs } from "expo-router";
import { User, UserPlus, Beaker, Settings } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";

export default function TabLayout() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleSettingsPress}
            style={{ marginRight: 16 }}
          >
            <Settings size={24} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('patients'),
          tabBarLabel: t('patients'),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('addPatient'),
          tabBarLabel: t('addPatient'),
          tabBarIcon: ({ color }) => <UserPlus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mixtures"
        options={{
          title: t('mixtures'),
          tabBarLabel: t('mixtures'),
          tabBarIcon: ({ color }) => <Beaker size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patient/[id]"
        options={{
          title: t('nutritionCalculation'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit/[id]"
        options={{
          title: t('patientEditing'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-mixture"
        options={{
          title: t('mixtureAddition'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="mixture/[id]"
        options={{
          title: t('mixtureInfo'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-mixture/[id]"
        options={{
          title: t('mixtureEditing'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="select-mixtures/[id]"
        options={{
          title: t('mixtureSelection'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="mixture-calculation/[id]"
        options={{
          title: t('volumeCalculation'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          headerBackTitle: t('back'),
          // Keep this tab in the navigation stack but hide it from the tab bar
          href: null,
        }}
      />
    </Tabs>
  );
}