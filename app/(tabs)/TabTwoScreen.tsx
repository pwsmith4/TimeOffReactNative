import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Dimensions, TextInput, ScrollView, Button, Keyboard, TouchableWithoutFeedback} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text } from '@/components/Themed';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import React, { useState } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TabTwoScreen() {
  let today = new Date();
let dateString = today.toISOString().split('T')[0];
  const [isPickerClicked, setIsPickerClicked] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{start: string | null, end: string | null, selectedDates: Record<string, any>}>({start: null, end: null, selectedDates: {}});
  const [selectedValue, setSelectedValue] = useState("");
  const [comment, setComment] = useState('');
  interface SelectedDates {
    start: string | null;
    end: string | null;
    selectedDates: Record<string, any>;
  }
  let newSelectedDates: SelectedDates = {...selectedDates};
  const { width } = Dimensions.get('window');

  interface Day {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  }

  const onDayPress = (day : Day) => {
    if (newSelectedDates.start == null || (newSelectedDates.start && newSelectedDates.end)) {
      newSelectedDates = {start: day.dateString, end: null, selectedDates: {[day.dateString]: {selected: true, startingDay: true}}};
    } else if (!newSelectedDates.end) {
      newSelectedDates.end = day.dateString;
      let startDate = new Date(newSelectedDates.start);
      let endDate = new Date(day.dateString);
      while (startDate <= endDate) {
        let dateString = startDate.toISOString().split('T')[0];
        if (dateString === newSelectedDates.start) {
          newSelectedDates.selectedDates[dateString] = {selected: true, startingDay: true};
        } else if (dateString === day.dateString) {
          newSelectedDates.selectedDates[dateString] = {selected: true, endingDay: true};
        } else {
          newSelectedDates.selectedDates[dateString] = {selected: true};
        }
        startDate.setDate(startDate.getDate() + 1);
      }
    }
    setSelectedDates(newSelectedDates);
  };
  let startDate = selectedDates.start ? new Date(selectedDates.start) : new Date();
  startDate.setDate(startDate.getDate() + 1);
  let endDate = selectedDates.end ? new Date(selectedDates.end) : new Date();
  endDate.setDate(endDate.getDate() + 1);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView>
    <View>
    <Calendar
          onDayPress={onDayPress}
          markedDates={selectedDates.selectedDates}
          minDate={dateString} // Disable past dates
          style={{
            width: width, // Set the width to the full width of the device
          }}
        />
<View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, width:width }}>
  <View style={{ alignItems: 'flex-start' }}>
    <Text style={{fontSize: 20 }}>Start Date</Text>
    <Text style={{fontSize: 20 }}>
      {selectedDates.start ? startDate.toLocaleDateString('en-US') : 'Not Selected'}
    </Text>
  </View>
  <View style={{ alignItems: 'flex-end' }}>
    <Text style={{fontSize: 20 }}>End Date</Text>
    <Text style={{fontSize: 20 }}>
      {selectedDates.end ? endDate.toLocaleDateString('en-US') : 'Not Selected'}
    </Text>
  </View> 
</View>
<View style={{flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
    inputIOS: { color: 'white', fontSize: 25, borderWidth: .5, borderColor: 'gray', textAlign: 'center', borderRadius: 6, padding: 5, marginTop: '4%', marginBottom: '4%'},
    inputAndroid: { color: 'white', fontSize: 25, borderWidth: .5, borderColor: 'gray', textAlign: 'center', borderRadius: 6, padding: 5, marginTop: '4%', marginBottom: '4%'},
  }}
  placeholder={{}}
  useNativeAndroidPickerStyle={false}

/>
  </View>
  <View>
  <TextInput
    style={{ height: 100, borderColor: 'gray', borderWidth: 1, width: '90%', alignSelf: 'center', color: 'white'}}
    onChangeText={text => setComment(text)}
    multiline = {true}
    numberOfLines = {4}
    value={comment}
    placeholder=" Comments"
  />
<View style={{ margin: 30 }}>
<Button
  title="Submit Time Off Request"
  onPress={() => {
    axios.post('https://830d-2600-1700-92a0-ae0-3895-fe75-7c13-f424.ngrok-free.app/api/timeoff', {
        startDate: selectedDates.start,
        endDate: selectedDates.end, 
        type: selectedValue,
        comment: comment,
    })
    .then(response => {
      console.log('Success:', response.data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }}
/>
</View>
</View>

      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center the elements vertically
    alignItems: 'center', // Center the elements horizontally
  },
  text: {
    textAlign: 'center',
    marginBottom: 10, // Adjust this value to reduce or increase the gap
  },
});
