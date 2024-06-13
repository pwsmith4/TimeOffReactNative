import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Dimensions, TextInput, ScrollView, Button} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text } from '@/components/Themed';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import React, { useState } from 'react';

export default function TabTwoScreen() {
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
    <ScrollView>
    <View>
      <Calendar
        onDayPress={onDayPress}
        markedDates={selectedDates.selectedDates}
        style={{
          width: width, // Set the width to the full width of the device
          top: 0, // Push it to the top of the screen
        }}
      />
<View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, width:width }}>
  <View style={{ alignItems: 'flex-start' }}>
    <Text style={{fontSize: 20 }}>Start Date</Text>
    <Text style={{fontSize: 20 }}>{startDate.toLocaleDateString('en-US')}</Text>
      </View>
  <View style={{ alignItems: 'flex-end' }}>
    <Text style={{fontSize: 20 }}>End Date</Text>
    <Text style={{fontSize: 20 }}>{endDate.toLocaleDateString('en-US')}</Text>
  </View>
</View>
<View>
<Text style={{ textAlign: 'center', fontSize: 25 }}>Select a Time Off Request Type</Text>
  <Picker
    selectedValue={selectedValue}
    onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
    itemStyle={{ color: 'white' }}
    style={{margin: 0}}
  >
    <Picker.Item label="Family Leave" value="familyLeave" />
    <Picker.Item label="Medical Leave" value="medicalLeave" />
    <Picker.Item label="Vacation Time" value="vacationTime" />
    <Picker.Item label="Other" value="other" />
  </Picker>
  </View>
  <View>
  <Text style={{ textAlign: 'center', fontSize: 25 }}>Comments</Text>
  <TextInput
    style={{ height: 100, borderColor: 'gray', borderWidth: 1, width: '90%', alignSelf: 'center', marginTop:'2%', color: 'white'}}
    onChangeText={text => setComment(text)}
    value={comment}
    placeholder="Type your comments here..."
  />
<View style={{ margin: 30 }}>
  <Button
    title="Submit Time Off Request"
    onPress={() => {
      // Handle your submit logic here
    }}
  />
</View>
</View>

      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
    </ScrollView>
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
