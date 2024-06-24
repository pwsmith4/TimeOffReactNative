import React, { useEffect, useState} from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, RefreshControl, useColorScheme, Dimensions, Alert, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome'; 
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import TabOneScreen from './TabOneScreen';
import TabTwoScreen from './TabTwoScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import {getUser} from '../../authUtils';
import axios from 'axios';
import {BASE_URL} from '../../config';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TimeOffRequest = require('../models/TimeOffRequest');
const { width: screenWidth } = Dimensions.get('window');

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return `${utcDate.getMonth() + 1}/${utcDate.getDate()}/${utcDate.getFullYear().toString().substr(-2)}`;
};



const WelcomePage = () => {
  const Stack = createStackNavigator(); 
  const navigation = useNavigation<NavigationProp>(); 
  const colorScheme = useColorScheme(); 
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTimeOffRequests = async () => {
    try {
      const user = await getUser();
      if (user) {
      const response = await axios.post(`${BASE_URL}/api/timeoff/users`, {
        username: user.username
      });        
      setTimeOffRequests(response.data.timeOffRequests);
      }else {
        console.log('No user found');
      }
    } catch (error) {
      console.error('Error fetching time-off requests:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTimeOffRequests();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTimeOffRequests();
    }, [])
  );

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

  const formatType = (type: string): string => {
    switch (type) {
      case 'familyLeave':
        return 'Family Leave';
      case 'medicalLeave':
        return 'Medical Leave';
      case 'vacationTime':
        return 'Vacation Time';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };
  
  const handleDelete = async (item: TimeOffRequest) => {
    try {
      console.log('Attempting to delete time-off request:', item);
      const response = await axios.delete(`${BASE_URL}/api/timeoff`, { data: { id: item._id } });
      console.log('Delete response:', response);
      if (response.status === 200) {
        setTimeOffRequests(prevRequests => prevRequests.filter(request => request._id !== item._id));
      }
    } catch (error: any) {
      console.error('Error deleting time-off request:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      Alert.alert('Error', 'Failed to delete the time-off request.');
    }
  };
  

  const confirmDelete = (item: TimeOffRequest) => {
    Alert.alert(
      'Delete Time-Off Request?',
      `Are you sure you want to delete this request?\n\n${formatDate(item.startDate)} - ${formatDate(item.endDate)}\n\n${formatType(item.type)}\n\nStatus: ${(item.status)}\n\nComment: ${item.comment}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleDelete(item),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: TimeOffRequest }) => (
    <TouchableOpacity onPress={() => confirmDelete(item)}>
      <View style={styles.requestBox}>
        <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Status: </Text>
        <Text style={styles.statusValue}>{item.status}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
          <Text style={styles.dateText}>
            {item.endDate ? formatDate(item.endDate) : formatDate(item.startDate)}
          </Text>
        </View>
        <Text style={styles.typeText}>Type: {formatType(item.type)}</Text>
        <Text style={styles.commentText}>Comment: {item.comment}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={timeOffRequests}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No time-off requests found. Press the Plus icon at the top right to add new Time Off Requests.</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5FCFF',
    },
    listContainer: {
      alignItems: 'center',
    },
    requestBox: {
      backgroundColor: 'white',
      padding: 15,
      marginVertical: 8,
      width: screenWidth * 0.75,
      borderRadius: 5,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    statusText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    statusContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
    },
    statusValue: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'grey',
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    dateText: {
      fontSize: 16,
    },
    typeText: {
      fontSize: 16,
      marginBottom: 15,
      textAlign: 'center',
    },
    commentText: {
      fontSize: 16,
    },
    emptyText: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 50,
    },
  });

export default WelcomePage;
