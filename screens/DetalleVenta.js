import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DetalleVenta = ({ navigation }) => {
    const [productos, setProductos] = useState([
        {
            id: 1,
            nombre: 'Te Divina',
            modelo: 'Modelo 01',
            codigo: '30023',
            precio: 140,
            cantidad: 2,
        },
        {
            id: 2,
            nombre: 'Te Divina',
            modelo: 'Modelo 01',
            codigo: '30023',
            precio: 140,
            cantidad: 2,
        },
        {
            id: 3,
            nombre: 'Te Divina',
            modelo: 'Modelo 01',
            codigo: '30023',
            precio: 140,
            cantidad: 2,
        },
    ]);

    const incrementarCantidad = (index) => {
        const nuevosProductos = [...productos];
        nuevosProductos[index].cantidad += 1;
        setProductos(nuevosProductos);
    };

    const decrementarCantidad = (index) => {
        const nuevosProductos = [...productos];
        if (nuevosProductos[index].cantidad > 1) {
            nuevosProductos[index].cantidad -= 1;
            setProductos(nuevosProductos);
        }
    };

    const total = productos.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>     
                   <Text style={styles.headerTitle}>Detalles de la Venta</Text>
                <View style={styles.cartIcon}>
                    <Icon name="shopping-cart" size={24} color="black" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>4</Text>
                    </View>
                </View>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre del cliente"
                    placeholderTextColor="#999"
                />
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.halfInput]}
                        placeholder="Courier"
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={[styles.input, styles.halfInput]}
                        placeholder="Tipo"
                        placeholderTextColor="#999"
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Descuento"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Carrito */}
            <Text style={styles.carritoTitle}>Carrito</Text>
            <ScrollView style={styles.productList}>
                {productos.map((producto, index) => (
                    <View key={index} style={styles.productCard}>
                        <View style={styles.productImage}>
                            <View style={styles.imagePlaceholder} />
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{producto.nombre}</Text>
                            <Text style={styles.productModel}>{producto.modelo}</Text>
                            <Text style={styles.productCode}>Code: {producto.codigo}</Text>
                            <Text style={styles.productPrice}>s/.{producto.precio}</Text>
                        </View>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={() => decrementarCantidad(index)}>
                                <Icon name="remove-circle-outline" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.quantity}>{producto.cantidad}</Text>
                            <TouchableOpacity onPress={() => incrementarCantidad(index)}>
                                <Icon name="add-circle-outline" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.deleteButton}>
                            <Icon name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Total y Botones */}
            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total: s/ {total}</Text>
                </View>
                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.buttonText}>CANCELAR VENTA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.buttonText}>REGISTRAR VENTA</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    cartIcon: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
    },
    form: {
        padding: 16,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    carritoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 16,
    },
    productList: {
        flex: 1,
    },
    productCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 80,
        marginRight: 16,
    },
    imagePlaceholder: {
        backgroundColor: '#f0f0f0',
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productModel: {
        color: '#666',
    },
    productCode: {
        color: '#999',
    },
    productPrice: {
        fontWeight: 'bold',
        marginTop: 4,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    quantity: {
        marginHorizontal: 8,
        fontSize: 16,
    },
    deleteButton: {
        padding: 4,
    },
    footer: {
        padding: 16,
        backgroundColor: '#211132',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    totalContainer: {
        backgroundColor: '#211132',
        padding: 16,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 2,
        marginBottom: 16,
    },
    totalText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: '#B90909',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    registerButton: {
        backgroundColor: '#EFB810',
        padding: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default DetalleVenta;
