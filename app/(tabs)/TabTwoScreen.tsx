import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Dimensions, TextInput, ScrollView, Button, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text } from '@/components/Themed';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import React, { useState, useEffect } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getUser } from '../../authUtils';
import { BASE_URL } from '../../config';
import { MarkedDates } from 'react-native-calendars/src/types';
import { useNavigation } from '@react-navigation/native';

export default function TabTwoScreen() {
  let today = new Date();
  let dateString = today.toISOString().split('T')[0];
  const navigation = useNavigation();
  const [isPickerClicked, setIsPickerClicked] = useState(false);
  const [selectedDates, setSelectedDates] = useState<MarkedDates>({});
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

  const { width } = Dimensions.get('window');
  interface DayObject {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  }

  interface MarkedDates {
    [date: string]: {
      startingDay?: boolean;
      endingDay?: boolean;
      color?: string;
      textColor?: string;
      selected?: boolean;
    };
  }

  const [markingType, setMarkingType] = useState<'dot' | 'period'>('period');

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);
  const onDayPress = (day: DayObject) => {
    const selectedDate = day.dateString;
  
    if (!startDate || (startDate && endDate)) {
      // First date selection or new selection after a complete range
      setStartDate(selectedDate);
      setEndDate(null); // Clear end date if selecting a new start date
      setSelectedDates({
        [selectedDate]: { selected: true, startingDay: true, endingDay: true, color: 'blue' }
      });
    } else {
      // Selecting the end date
      let start = new Date(startDate);
      let end = new Date(selectedDate);
  
      // Swap dates if end date is before start date
      if (end < start) {
        [start, end] = [end, start];
      }
  
      const range: MarkedDates = {};
      let currentDate = new Date(start);
  
      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (currentDate.getTime() === start.getTime()) {
          range[dateString] = { startingDay: true, color: 'blue', textColor: 'white' };
        } else if (currentDate.getTime() === end.getTime()) {
          range[dateString] = { endingDay: true, color: 'blue', textColor: 'white' };
        } else {
          range[dateString] = { color: 'blue', textColor: 'white' };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      // Update startDate and endDate with the potentially swapped values
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
      setSelectedDates(range);
    }
  };

  const handleSubmit = () => {
    let missingFields = [];

    if (!startDate) {
      missingFields.push('Start Date');
    }

    if (!selectedValue || selectedValue === 'placeholder') {
      missingFields.push('Type of Time Off');
    }

    if (!comment.trim()) {
      missingFields.push('Comment');
    }

    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please provide the following:\n${missingFields.join('\n')}`,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
      return;
    }

    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    axios.post(`${BASE_URL}/api/timeoff`, {
      startDate: startDate,
      endDate: endDate,
      type: selectedValue,
      comment: comment,
      username: currentUser.username,
      status: "Pending"
    })
      .then(response => {
        console.log('Success:', response.data);
        Alert.alert(
          'Success',
          'Your time-off request has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to the previous screen
                navigation.goBack();
              }
            }
          ]
        );
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView>
        <View>
          <Calendar
            onDayPress={onDayPress}
            markedDates={selectedDates}
            minDate={dateString}
            style={{
              width: width,
            }}
            markingType={markingType}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, width: width }}>
            <View style={{ alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>Start Date</Text>
              <Text style={{ fontSize: 20 }}>
              {startDate ? new Date(new Date(startDate).getTime() + (24 * 60 * 60 * 1000)).toLocaleDateString('en-US') : 'Not Selected'}              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
  <Text style={{ fontSize: 20 }}>End Date</Text>
  <Text style={{ fontSize: 20 }}>
    {startDate 
      ? new Date(new Date(endDate || startDate).getTime() + (24 * 60 * 60 * 1000)).toLocaleDateString('en-US')
      : 'Not Selected'}
  </Text>
</View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <RNPickerSelect
              onValueChange={(value) => {
                setIsPickerClicked(true);
                setSelectedValue(value);
              }}
              items={
                selectedValue && selectedValue !== 'placeholder'
                  ? [
                    { label: 'Family Leave', value: 'familyLeave' },
                    { label: 'Medical Leave', value: 'medicalLeave' },
                    { label: 'Vacation Time', value: 'vacationTime' },
                    { label: 'Other', value: 'other' },
                  ]
                  : [
                    { label: 'Select Time Off Type', value: 'placeholder' },
                    { label: 'Family Leave', value: 'familyLeave' },
                    { label: 'Medical Leave', value: 'medicalLeave' },
                    { label: 'Vacation Time', value: 'vacationTime' },
                    { label: 'Other', value: 'other' },
                  ]
              }
              style={{
                inputIOS: { color: 'white', fontSize: 25, borderWidth: .5, borderColor: 'gray', textAlign: 'center', borderRadius: 6, padding: 5, marginTop: '4%', marginBottom: '4%' },
                inputAndroid: { color: 'white', fontSize: 25, borderWidth: .5, borderColor: 'gray', textAlign: 'center', borderRadius: 6, padding: 5, marginTop: '4%', marginBottom: '4%' },
              }}
              placeholder={{}}
              useNativeAndroidPickerStyle={false}
            />
          </View>
          <View>
            <TextInput
              style={{ height: 100, borderColor: 'gray', borderWidth: 1, width: '90%', alignSelf: 'center', color: 'white' }}
              onChangeText={text => setComment(text)}
              multiline={true}
              numberOfLines={4}
              value={comment}
              placeholder=" Comments"
            />
            <View style={{ margin: 30 }}>
              <Button
                title="Submit Time Off Request"
                onPress={handleSubmit}
              />
            </View>
          </View>

          <EditScreenInfo path="app/modal.tsx" />

          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
