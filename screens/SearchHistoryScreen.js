import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const SearchHistoryScreen = ({ history, onSelectCity }) => {
  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => onSelectCity(item)}
    >
      <Ionicons name="location-outline" size={24} color="#1DA1F2" />
      <Text style={styles.cityText}>{item}</Text>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historia wyszukiwań</Text>
      </View>

      {history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Brak historii wyszukiwań</Text>
          <Text style={styles.emptySubtext}>
            Wyszukane miasta pojawią się tutaj
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cityText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchHistoryScreen;
