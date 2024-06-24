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

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface TimeOffRequest {
  _id: string;
  startDate: string;
  endDate: string;
  type: string;
  comment: string;
  status: string;
}
const { width: screenWidth } = Dimensions.get('window');

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
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
      const response = await axios.post('https://290d-2600-1700-92a0-ae0-31d8-a6ec-2fd2-85e7.ngrok-free.app/api/timeoff/users', {
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
      await axios.delete(`https://290d-2600-1700-92a0-ae0-31d8-a6ec-2fd2-85e7.ngrok-free.app/api/timeoff/${item._id}`);
      setTimeOffRequests(prevRequests => prevRequests.filter(request => request._id !== item._id));
    } catch (error) {
      console.error('Error deleting time-off request:', error);
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
      <Text style={styles.statusText}>Status: {item.status}</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
        <Text style={styles.dateText}>{formatDate(item.endDate)}</Text>
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
      marginBottom: 5,
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
