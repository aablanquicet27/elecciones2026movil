import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import RegionsScreen from './src/screens/RegionsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            
            if (route.name === 'Inicio') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Análisis') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Demografía') {
              iconName = focused ? 'map' : 'map-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#7c3aed',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Inicio" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Candidatos',
          }}
        />
        <Tab.Screen 
          name="Análisis" 
          component={AnalysisScreen}
          options={{
            tabBarLabel: 'Análisis',
          }}
        />
        <Tab.Screen 
          name="Demografía" 
          component={RegionsScreen}
          options={{
            tabBarLabel: 'Regiones',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
