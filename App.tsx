import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { DbService } from './src/service/db.service.ts';
import { EntryService } from './src/service/entry.service.ts';

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
    <View style={styles.container}>
      <Text style={styles.title}>Work Time Tracker</Text>

      <Button
        title={isTracking ? 'Stop' : 'Start'}
        onPress={isTracking ? stopTracking : startTracking}
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);

          const dateStr = start.toLocaleDateString();
          const startTimeStr = start.toLocaleTimeString();
          const endTimeStr = end.toLocaleTimeString();

          return (
            <View style={styles.entryContainer}>
              <View>
                <Text>Date: {dateStr}</Text>
                <Text>Start: {startTimeStr}</Text>
                <Text>End: {endTimeStr}</Text>
                <Text>Duration: {item.duration.toFixed(2)} sec</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteEntry(item.id)}
                style={styles.deleteButton}>
                <Text style={{ color: 'white' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entryContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
  },
});

export default WorkTimeTracker;
