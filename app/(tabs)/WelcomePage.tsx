import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, useColorScheme, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome'; 
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import TabOneScreen from './TabOneScreen';
import TabTwoScreen from './TabTwoScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WelcomePage = () => {
  const Stack = createStackNavigator(); 
  const navigation = useNavigation<NavigationProp>(); 
  const colorScheme = useColorScheme(); 

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon.Button
          onPress={() => navigation.navigate('(tabs)/TabTwoScreen')}
          size={25}
          name="plus"
          backgroundColor={"transparent"}
          color="white" // change this to match your color scheme
        />
      ),
      headerLeft: () => null, // this removes the back button
    });
  }, [navigation]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
}
export default WelcomePage;
