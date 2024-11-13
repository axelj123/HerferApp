import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getDBConnection } from '../database';

const ClientSearchInput = ({ onClientSelect, style }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDNI, setNewClientDNI] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      fetchClients(searchTerm);
    } else {
      setClients([]);
    }
  }, [searchTerm]);

  const fetchClients = async (dni) => {
    try {
      const db = await getDBConnection();
      const result = await db.getAllAsync(
        'SELECT * FROM Cliente WHERE dni LIKE ?', 
        [`%${dni}%`]
      );
      setClients(result);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    }
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    if (selectedClient && selectedClient.dni !== text) {
      setSelectedClient(null);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    onClientSelect(client);
    setSearchTerm(client.dni.toString());
    setClients([]);
  };

  const handleAddNewClient = async () => {
    try {
      if (!newClientName.trim() || !newClientDNI.trim()) {
        alert('Por favor complete todos los campos');
        return;
      }

      const db = await getDBConnection();
      
      // Check if client already exists
      const existingClient = await db.getAllAsync(
        'SELECT * FROM Cliente WHERE dni = ?',
        [newClientDNI]
      );

      if (existingClient.length > 0) {
        alert('Ya existe un cliente con este DNI');
        return;
      }

      await db.runAsync(
        'INSERT INTO Cliente (nombre_completo, dni) VALUES (?, ?)', 
        [newClientName, newClientDNI]
      );
      
      const newClient = await db.getAllAsync(
        'SELECT * FROM Cliente WHERE dni = ?',
        [newClientDNI]
      );
      
      if (newClient && newClient.length > 0) {
        handleClientSelect(newClient[0]);
      }

      setNewClientName('');
      setNewClientDNI('');
      setIsModalVisible(false);
      alert('Cliente agregado correctamente');
      
    } catch (error) {
      console.error("Error adding client:", error);
      alert('Error al agregar cliente');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Icon name="person-search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar cliente por DNI"
          value={searchTerm}
          onChangeText={handleSearchChange}
          keyboardType="numeric"
        />
        {selectedClient && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setSearchTerm('');
              setSelectedClient(null);
              onClientSelect(null);
            }}
          >
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {selectedClient && (
        <View style={styles.selectedClientInfo}>
          <Text style={styles.selectedClientName}>{selectedClient.nombre_completo}</Text>
          <Text style={styles.selectedClientDetails}>DNI: {selectedClient.dni}</Text>
        </View>
      )}

      {clients.length > 0 && !selectedClient && (
        <View style={[styles.suggestionsContainer, { height: Math.min(200, clients.length * 65) }]}>
          <FlatList
            data={clients}
            keyExtractor={item => item.dni.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, selectedClient?.dni === item.dni && styles.selectedItem]}
                onPress={() => handleClientSelect(item)}
              >
                <Text style={styles.clientName}>{item.nombre_completo}</Text>
                <Text style={styles.clientDNI}>DNI: {item.dni}</Text>
              </TouchableOpacity>
            )}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {searchTerm.length > 0 && clients.length === 0 && !selectedClient && (
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => {
            setNewClientDNI(searchTerm);
            setIsModalVisible(true);
          }}
        >
          <Icon name="person-add" size={20} color="#007AFF" style={styles.addIcon} />
          <Text style={styles.addNewButtonText}>
            Añadir nuevo cliente
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Nuevo Cliente</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre completo del cliente"
              value={newClientName}
              onChangeText={setNewClientName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="DNI"
              value={newClientDNI}
              onChangeText={setNewClientDNI}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddNewClient}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    zIndex: 10000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  selectedClientInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  selectedClientDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f0f0',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
  },
  clientDNI: {
    fontSize: 14,
    color: '#666',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 8,
  },
  addIcon: {
    marginRight: 8,
  },
  addNewButtonText: {
    color: '#007AFF',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ClientSearchInput;