import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import TabTwoScreen from './two';
import TabOneScreen from '.';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
type RootStackParamList = {
  TabOneScreen: undefined;
  TimeOffDetails: undefined;
  // other routes...
};
export default function TabLayout() {
  const Stack = createStackNavigator();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const colorScheme = useColorScheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
  name="index"
  options={{
    title: 'Tab One',
    headerRight: () => (
            <Pressable onPress={() => navigation.navigate('TimeOffDetails')}>
            {({ pressed }) => (
            <FontAwesome
              name="info-circle"
              size={25}
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
    ),
  }}
  component={TabOneScreen} // replace with your actual component
/>
<Stack.Screen
    name="TimeOffDetails"
    component={TabTwoScreen} // replace with your actual component
  />
    </Stack.Navigator>
  );
}
