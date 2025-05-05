import React, { useState, useEffect } from 'react';
import TablaCompras from '../components/compras/TablaCompras';
import ModalDetallesCompra from '../components/detalles_compras/ModalDetallesCompras';
import ModalEliminacionCompra from '../components/compras/ModalEliminacionCompra';
import ModalRegistroCompra from '../components/compras/ModalRegistroCompra';
import { Container, Button, Row, Col, Alert } from "react-bootstrap";

// Declaración del componente Compras
const Compras = () => {
  const [listaCompras, setListaCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [detallesCompra, setDetallesCompra] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [errorDetalles, setErrorDetalles] = useState(null);

  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [compraAEliminar, setCompraAEliminar] = useState(null);
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [nuevaCompra, setNuevaCompra] = useState({
    id_empleado: '',
    fecha_compra: new Date(),
    total_compra: 0
  });
  const [detallesNuevos, setDetallesNuevos] = useState([]);

  const eliminarCompra = async () => {
    if (!compraAEliminar) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/eliminarcompra/${compraAEliminar.id_compra}`, {
        method: 'DELETE',
      });

      if (!respuesta.ok) {
        throw new Error('Error al eliminar la compra');
      }
      
      setMostrarModalEliminacion(false);
      await obtenerCompras();
      setCompraAEliminar(null);
      setErrorCarga(null);
      setMensajeExito('Compra eliminada correctamente');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  const abrirModalEliminacion = (compra) => {
    setCompraAEliminar(compra);
    setMostrarModalEliminacion(true);
  };

  const agregarDetalle = (detalle) => {
    setDetallesNuevos(prev => {
      const updated = [...prev, detalle];
      console.log('Detalles nuevos actualizados:', updated);
      return updated;
    });
    setNuevaCompra(prev => ({
      ...prev,
      total_compra: prev.total_compra + (detalle.cantidad * detalle.precio_unitario)
    }));
  };

  const agregarCompra = async () => {
    console.log('Validando datos para agregar compra:', {
      id_empleado: nuevaCompra.id_empleado,
      fecha_compra: nuevaCompra.fecha_compra,
      detallesNuevos: detallesNuevos
    });

    // Validaciones con mensajes más específicos
    if (!nuevaCompra.id_empleado) {
      setErrorCarga("Por favor, selecciona un empleado.");
      return;
    }
    if (!nuevaCompra.fecha_compra || !(nuevaCompra.fecha_compra instanceof Date)) {
      setErrorCarga("Por favor, selecciona una fecha válida.");
      return;
    }
    if (detallesNuevos.length === 0) {
      setErrorCarga("Por favor, agrega al menos un detalle.");
      return;
    }

    try {
      const compraData = {
        id_empleado: Number(nuevaCompra.id_empleado), // Asegura que id_empleado sea un número
        fecha_compra: nuevaCompra.fecha_compra.toISOString(),
        total_compra: detallesNuevos.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario), 0),
        detalles: detallesNuevos.map(detalle => ({
          id_producto: Number(detalle.id_producto), // Asegura que id_producto sea un número
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario
        }))
      };

      console.log('Enviando datos a la API:', compraData);

      const respuesta = await fetch('http://localhost:3000/api/registrarcompra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraData)
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || 'Error al registrar la compra');
      }

      const respuestaData = await respuesta.json();
      console.log('Respuesta de la API:', respuestaData);

      await obtenerCompras();
      setNuevaCompra({ id_empleado: '', fecha_compra: new Date(), total_compra: 0 });
      setDetallesNuevos([]);
      setMostrarModalRegistro(false);
      setErrorCarga(null);
      setMensajeExito('Compra registrada correctamente');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error) {
      console.error('Error al registrar la compra:', error);
      setErrorCarga(error.message);
    }
  };

  const obtenerEmpleados = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/empleados');
      if (!respuesta.ok) throw new Error('Error al cargar los empleados');
      const datos = await respuesta.json();
      setEmpleados(datos);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  const obtenerProductos = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/productos');
      if (!respuesta.ok) throw new Error('Error al cargar los productos');
      const datos = await respuesta.json();
      setProductos(datos);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  const obtenerDetalles = async (id_compra) => {
    setCargandoDetalles(true);
    setErrorDetalles(null);
    try {
      const respuesta = await fetch(`http://localhost:3000/api/obtenerdetallescompra/${id_compra}`);
      if (!respuesta.ok) {
        throw new Error('Error al cargar los detalles de la compra');
      }
      const datos = await respuesta.json();
      setDetallesCompra(datos);
      setCargandoDetalles(false);
      setMostrarModal(true);
    } catch (error) {
      setErrorDetalles(error.message);
      setCargandoDetalles(false);
    }
  };

  const obtenerCompras = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/obtenercompras');
      if (!respuesta.ok) {
        throw new Error('Error al cargar las compras');
      }
      const datos = await respuesta.json();
      // Ordenar las compras por id_compra en orden ascendente
      const comprasOrdenadas = datos.sort((a, b) => a.id_compra - b.id_compra);
      console.log('Compras obtenidas y ordenadas:', comprasOrdenadas);
      setListaCompras(comprasOrdenadas);
      setCargando(false);
    } catch (error) {
      setErrorCarga(error.message);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCompras();
    obtenerEmpleados();
    obtenerProductos();
  }, []);

  return (
    <>
      <Container className="mt-5">
        <br />
        <h4>Compras con Detalles</h4>
        {mensajeExito && (
          <Alert variant="success" onClose={() => setMensajeExito(null)} dismissible>
            {mensajeExito}
          </Alert>
        )}
        <Row>
          <Col lg={2} md={4} sm={4} xs={5}>
            <Button variant="primary" onClick={() => setMostrarModalRegistro(true)} style={{ width: "100%" }}>
              Nueva Compra
            </Button>
          </Col>
        </Row>
        <br />

        <TablaCompras
          compras={listaCompras}
          cargando={cargando}
          error={errorCarga}
          obtenerDetalles={obtenerDetalles}
          abrirModalEliminacion={abrirModalEliminacion}
        />

        <ModalDetallesCompra
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
          detalles={detallesCompra}
          cargandoDetalles={cargandoDetalles}
          errorDetalles={errorDetalles}
        />

        <ModalEliminacionCompra
          mostrarModalEliminacion={mostrarModalEliminacion}
          setMostrarModalEliminacion={setMostrarModalEliminacion}
          eliminarCompra={eliminarCompra}
        />

        <ModalRegistroCompra
          mostrarModal={mostrarModalRegistro}
          setMostrarModal={setMostrarModalRegistro}
          nuevaCompra={nuevaCompra}
          setNuevaCompra={setNuevaCompra}
          detallesCompra={detallesNuevos}
          setDetallesCompra={setDetallesNuevos}
          agregarDetalle={agregarDetalle}
          agregarCompra={agregarCompra}
          errorCarga={errorCarga}
          empleados={empleados}
          productos={productos}
        />
      </Container>
    </>
  );
};

export default Compras;