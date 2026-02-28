import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GameProvider, useGame } from './src/context/GameContext';
import TodoScreen from './src/screens/TodoScreen';
import BattleScreen from './src/screens/BattleScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import StatsScreen from './src/screens/StatsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused, color }: { emoji: string; label: string; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 22 : 18 }}>{emoji}</Text>
      <Text style={{ fontSize: 9, color, fontWeight: focused ? '700' : '400', marginTop: 1 }}>{label}</Text>
    </View>
  );
}

function AppNavigator() {
  const { theme, themeMode } = useGame();

  const navTheme = themeMode === 'dark'
    ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: theme.bg,
        card: theme.tabBar,
        border: theme.tabBarBorder,
      },
    }
    : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.bg,
        card: theme.tabBar,
        border: theme.tabBarBorder,
      },
    };

  return (
    <>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.tabBar,
              borderTopColor: theme.tabBarBorder,
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 80 : 60,
              paddingBottom: Platform.OS === 'ios' ? 20 : 6,
            },
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#facc15',
            tabBarInactiveTintColor: theme.textDim,
          }}
        >
          <Tab.Screen
            name="Quest"
            component={TodoScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon emoji="📋" label="퀘스트" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Battle"
            component={BattleScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon emoji="⚔️" label="전투" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Inventory"
            component={InventoryScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon emoji="🎒" label="인벤" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon emoji="🏅" label="업적" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon emoji="📊" label="통계" focused={focused} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GameProvider>
          <AppNavigator />
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
