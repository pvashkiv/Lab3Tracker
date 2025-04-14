import React, {useEffect, useState} from 'react';
import {View, Text, Button, FlatList, TouchableOpacity} from 'react-native';
import {DbService} from './src/service/db.service.ts';
import {EntryService} from './src/service/entry.service.ts'; // шлях до файлу з DB

interface Entry {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
}

const WorkTimeTracker: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const fetchEntries = async () => {
    setEntries(await EntryService.getAll());
  };

  useEffect(() => {
    (async () => {
      await DbService.init();
      await fetchEntries();
    })();
  }, []);

  const startTracking = () => {
    setStartTime(new Date());
    setIsTracking(true);
  };

  const stopTracking = async () => {
    if (startTime) {
      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      await EntryService.create({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
      });

      await fetchEntries();

      setIsTracking(false);
      setStartTime(null);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    await EntryService.delete(id);
    await fetchEntries();
  };

  return (
    <View style={{padding: 20, marginTop: 60}}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>
        Work Time Tracker
      </Text>

      <Button
        title={isTracking ? 'Stop' : 'Start'}
        onPress={isTracking ? stopTracking : startTracking}
      />

      <FlatList
        data={entries}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => {
          const start = new Date(item.startTime).toLocaleTimeString();
          const end = new Date(item.endTime).toLocaleTimeString();

          return (
            <View
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View>
                <Text>Start: {start}</Text>
                <Text>End: {end}</Text>
                <Text>Duration: {item.duration.toFixed(2)} sec</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteEntry(item.id)}
                style={{
                  backgroundColor: 'red',
                  padding: 8,
                  borderRadius: 5,
                }}>
                <Text style={{color: 'white'}}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

export default WorkTimeTracker;
