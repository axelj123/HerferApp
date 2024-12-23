import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ModalImagePicker from '../components/ModalImagePicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { getDBConnection,createProducto } from '../database';
import CustomInput from '../components/CustomInput';
import CustomDatePicker from '../components/CustomDatePicker';
import { useToast } from '../components/ToastContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

const FORM_DATA_KEY = 'form_data_key'; 

const RegistrarProducto = () => {
  const navigation = useNavigation();
  const db = useSQLiteContext(); 
  const { showToast } = useToast(); 
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [openCategoria, setOpenCategoria] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categoriaItems, setCategoriaItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCategorias();
    loadFormData();
  }, []);

  const fetchCategorias = async () => {
    try {
      const result = await db.getAllAsync(`SELECT * FROM Categoria_Producto`);
      if (result && result.length > 0) {
        const categoriasList = result.map(categoria => ({
          label: categoria.nombre,
          value: categoria.categoria_id
        }));
        setCategoriaItems(categoriasList);
      } else {
        setCategoriaItems([]);
      }
    } catch (error) {
      console.error("Error al obtener categorias:", error);
    }
  };

  const loadFormData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(FORM_DATA_KEY);
      if (savedData) {
        const formData = JSON.parse(savedData);
        setNombre(formData.nombre || '');
        setDescripcion(formData.descripcion || '');
        setPrecioCompra(formData.precioCompra || '');
        setPrecioVenta(formData.precioVenta || '');
        setCantidad(formData.cantidad || '');
        setFechaIngreso(formData.fechaIngreso || '');
        setFechaVencimiento(formData.fechaVencimiento || '');
        setSelectedCategoria(formData.selectedCategoria || null);
        setSelectedImage(formData.selectedImage || null);
      }
    } catch (error) {
      console.error("Error al cargar los datos del formulario:", error);
    }
  };

  const saveFormData = async () => {
    try {
      const formData = {
        nombre,
        descripcion,
        precioCompra,
        precioVenta,
        cantidad,
        fechaIngreso,
        fechaVencimiento,
        selectedCategoria,
        selectedImage,
      };
      await AsyncStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error("Error al guardar los datos del formulario:", error);
    }
  };

  useEffect(() => {
    saveFormData();
  }, [nombre, descripcion, precioCompra, precioVenta, cantidad, fechaIngreso, fechaVencimiento, selectedCategoria, selectedImage]);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleRegistrarProducto = async () => {
    if (!nombre || !descripcion || !precioCompra || !precioVenta || !cantidad || !fechaIngreso || !fechaVencimiento || !selectedCategoria) {
      showToast('Error', 'Por favor, complete todos los campos.', 'warning');
      return;
    }

    const fechaIngresoFormateada = formatDate(fechaIngreso);
    const fechaVencimientoFormateada = formatDate(fechaVencimiento);

    const producto = {
      nombre,
      descripcion,
      precio_compra: parseFloat(precioCompra),
      precio_venta: parseFloat(precioVenta),
      cantidad: parseInt(cantidad),
      imagen: selectedImage,
      fecha_ingreso: fechaIngresoFormateada,
      fecha_vencimiento: fechaVencimientoFormateada,
      categoria_id: selectedCategoria
    };

    try {
      await createProducto(db,producto);

      setNombre('');
      setDescripcion('');
      setPrecioCompra('');
      setPrecioVenta('');
      setCantidad('');
      setFechaIngreso('');
      setFechaVencimiento('');
      setSelectedCategoria(null);
      setSelectedImage(null);
      setOpenCategoria(false);

      await AsyncStorage.removeItem(FORM_DATA_KEY);
    
      Keyboard.dismiss();
      showToast('Éxito', 'Producto registrado correctamente.', 'success');
    } catch (error) {
      console.error("Error al registrar el producto:", error);
      showToast('Error', 'Hubo un problema al registrar el producto.', 'warning');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Producto</Text>
      </View>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.imagePlaceholder}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="contain" />
          ) : (
            <MaterialIcons name="camera-alt" size={24} color="#6200EE" />
          )}
        </TouchableOpacity>
      </View>

      <ModalImagePicker
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        setSelectedImage={setSelectedImage}
      />

      <View style={styles.form}>
        <CustomInput
          value={nombre}
          onChangeText={setNombre}
          
          placeholder="Nombre del producto"
          focusedBorderColor="#000"
          unfocusedBorderColor="#E0E0E0"
          placeholderTextColor="#999"
          containerStyle={styles.fullWidthInput}
        />
        <CustomInput
          value={descripcion}
          onChangeText={setDescripcion}
          isTextArea={true}

          placeholder="Descripción"
          focusedBorderColor="#000"
          unfocusedBorderColor="#E0E0E0"
          placeholderTextColor="#999"
          containerStyle={styles.fullWidthInput}
        />

        <View style={styles.row}>
          <CustomDatePicker
            value={fechaIngreso}
            onDateChange={setFechaIngreso}
            placeholder="Fecha de ingreso"
            focusedBorderColor="#000"
            containerStyle={styles.halfInput}
            errorMessage="Este campo es obligatorio"
          />
          <CustomDatePicker
            value={fechaVencimiento}
            onDateChange={setFechaVencimiento}
            placeholder="Fecha de vencimiento"
            focusedBorderColor="#000"
            containerStyle={styles.halfInput}
            errorMessage="Este campo es obligatorio"
          />
        </View>

        <View style={styles.row}>
          <CustomInput
            value={precioCompra}
            onChangeText={setPrecioCompra}
            placeholder="Precio original (Soles)"
            focusedBorderColor="#000"
            unfocusedBorderColor="#E0E0E0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
          <CustomInput
            value={precioVenta}
            onChangeText={setPrecioVenta}
            placeholder="Precio Venta (Soles)"
            focusedBorderColor="#000"
            unfocusedBorderColor="#E0E0E0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
        </View>

        <View style={styles.row}>
          <CustomInput
            value={cantidad}
            onChangeText={setCantidad}
            placeholder="Stock"
            focusedBorderColor="#000"
            unfocusedBorderColor="#E0E0E0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            containerStyle={styles.halfInput}
          />
        </View>

        <DropDownPicker
          open={openCategoria}
          value={selectedCategoria}
          items={categoriaItems}
          setOpen={setOpenCategoria}
          setValue={setSelectedCategoria}
          setItems={setCategoriaItems}
          placeholder="Categoría"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={1000}
        />

        <View style={styles.containerButton}>
          <TouchableOpacity style={styles.button} onPress={handleRegistrarProducto}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    marginTop:20,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
        marginLeft: -8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 14,
    color: "#000",
    marginTop: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  form: {
    paddingHorizontal: 20,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    height: 45,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '60%',
    alignSelf: 'center',
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  fullWidthInput: {
    width: '100%',
    marginBottom: 15,
  },
  containerButton: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  button: {
    width: 145,
    height: 50,
    backgroundColor: '#6B21A8',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default RegistrarProducto;
