import React, {useState} from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Button, Pressable, TextInput, View, StyleSheet, Text} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import WelcomePage from './WelcomePage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import {storeUser} from '../../authUtils';
import axios, { AxiosError } from 'axios'; 
import {BASE_URL} from '../../config';

const TabOneScreen = ()  => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const Stack = createStackNavigator<RootStackParamList>();


  const handleSubmit = async () => {
    try {
      const endpoint = isSignUp ? '/api/signup' : '/api/signin';
      const response = await axios.post(`${BASE_URL}${endpoint}`, {
        username,
        password,
      });
      
      setMessage(response.data.message);
      if (response.data.success) {
        // Store user information
        await storeUser({ username });
        setMessage('Authentication successful');
        navigation.navigate('(tabs)/WelcomePage');
      } else {
        setMessage(response.data.message);
      }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response) {
        console.error('Error data:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
        setMessage(`Error: ${axiosError.response.data.message || 'An unknown error occurred'}`);
      } else if (axiosError.request) {
        console.error('Error request:', axiosError.request);
        setMessage('No response received from server');
      } else {
        console.error('Error message:', axiosError.message);
        setMessage(`Error: ${axiosError.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
      setMessage('An unexpected error occurred');
    }
  }
};
  return (

    <View style={styles.container} >
      <TextInput   
        style={styles.input}
        onChangeText={setUsername}
        value={username}
        placeholder="Username"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        onPress={handleSubmit}
      />
      <Text style={styles.toggleText} onPress={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginBottom: 10,
    paddingLeft: 10,
  },
  toggleText: {
    marginTop: 20,
    color: 'blue',
  },
  message: {
    marginTop: 20,
    color: 'red',
  },
});

export default TabOneScreen;