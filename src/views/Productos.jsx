import React, { useState, useEffect } from 'react';
import TablaProductos from '../components/producto/TablaProductos';
import ModalRegistroProducto from '../components/producto/ModalRegistroProducto';
import ModalEliminacionProducto from '../components/producto/ModalEliminacionProducto';
import ModalEdicionProducto from '../components/producto/ModalEdicionProducto';
import CuadroBusquedas from '../components/busquedas/CuadroBusquedas';
import { Container, Button, Row, Col } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Productos = () => {
  const [listaProductos, setListaProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [paginaActual, establecerPaginaActual] = useState(1);
  const elementosPorPagina = 3;

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: '',
    descripcion_producto: '',
    id_categoria: '',
    precio_unitario: '',
    stock: '',
    imagen: ''
  });

  const obtenerProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await fetch('http://localhost:3000/api/productos');
      if (!respuesta.ok) throw new Error('Error al cargar los productos');
      const datos = await respuesta.json();
      setListaProductos(datos);
      setProductosFiltrados(datos);
      setCargando(false);
    } catch (error) {
      setErrorCarga(error.message);
      setCargando(false);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/categorias');
      if (!respuesta.ok) throw new Error('Error al cargar las categorías');
      const datos = await respuesta.json();
      setListaCategorias(datos);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarProducto = async () => {
    if (!nuevoProducto.nombre_producto || !nuevoProducto.id_categoria ||
        !nuevoProducto.precio_unitario || !nuevoProducto.stock) {
      setErrorCarga("Por favor, completa todos los campos requeridos antes de guardar.");
      return;
    }

    try {
      const respuesta = await fetch('http://localhost:3000/api/registrarproductos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto),
      });
      if (!respuesta.ok) throw new Error('Error al agregar el producto');

      await obtenerProductos();
      setNuevoProducto({
        nombre_producto: '',
        descripcion_producto: '',
        id_categoria: '',
        precio_unitario: '',
        stock: '',
        imagen: ''
      });
      setMostrarModal(false);
      setErrorCarga(null);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/eliminarproducto/${productoAEliminar.id_producto}`, {
        method: 'DELETE',
      });
      if (!respuesta.ok) throw new Error('Error al eliminar el producto');

      await obtenerProductos();
      setMostrarModalEliminacion(false);
      establecerPaginaActual(1);
      setProductoAEliminar(null);
      setErrorCarga(null);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditado(producto);
    setMostrarModalEdicion(true);
  };

  const actualizarProducto = async () => {
    if (!productoEditado?.nombre_producto || !productoEditado?.id_categoria ||
        !productoEditado?.precio_unitario || !productoEditado?.stock) {
      setErrorCarga("Por favor, completa todos los campos requeridos antes de guardar.");
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3000/api/actualizarproducto/${productoEditado.id_producto}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoEditado),
      });
      if (!respuesta.ok) throw new Error('Error al actualizar el producto');

      await obtenerProductos();
      setMostrarModalEdicion(false);
      setProductoEditado(null);
      setErrorCarga(null);
    } catch (error) {
      setErrorCarga(error.message);
    }
  };

  const manejarCambioBusqueda = (e) => {
    const texto = e.target.value.toLowerCase();
    setTextoBusqueda(texto);
    establecerPaginaActual(1);

    const filtrados = listaProductos.filter(
      (producto) =>
        producto.nombre_producto.toLowerCase().includes(texto) ||
        (producto.descripcion_producto && producto.descripcion_producto.toLowerCase().includes(texto)) ||
        (producto.precio_unitario && producto.precio_unitario.toString().includes(texto))
    );
    setProductosFiltrados(filtrados);
  };

  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );
  
  const generarPDFProductos = () => {
    
    const doc = new jsPDF( );

    // Encabezado del PDF
    doc.setFillColor(28, 41, 51);
    doc.rect(0, 0, 220, 30, 'F'); //

    // Titulo centrado con texto blanco
    doc.setTextColor(255, 255, 255); // Color del titulo
    doc.setFontSize(28);
    doc.text("Lista de Productos", doc.internal.pageSize.getWidth( ) / 2, 18, { align: "center" });

    const columnas = ["ID", "Nombre", "Descripción", "Categoria", "Precio", "Stock"];

    const filas = productosFiltrados.map( (producto) => [
    producto.id_producto,
    producto.nombre_producto,
    producto.descripcion_producto,
    producto.id_categoria,
    producto.precio_unitario,
    producto.stock,
    ])

        // Marcador para mostrar el total de paginas
    const totalPaginas = "{total_pages_count_string}";

   //Configuración de la tabla
    autoTable(doc, {
    head: [columnas],
    body: filas,
    startY: 40,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    margin: { top: 20, left: 14, right: 14 },
    tableWidth: "auto", // Ajuste de ancho automatico
    columnStyles: {
    0: { cellWidth: 'auto' }, // Ajuste de ancho automatico
    1: { cellWidth: 'auto' },
    2: { cellWidth: 'auto' },
    },
    pageBreak: "auto",
    rowPageBreak: "auto",
    // Hook que se ejecuta al dibujar cada página
    didDrawPage: function (data) {
    // Altura y ancho de la página actual
    const alturaPagina = doc. internal.pageSize.getHeight( );
    const anchoPagina = doc.internal.pageSize.getWidth( );

    // Número de página actual
    const numeroPagina = doc. internal.getNumberOfPages();

    // Definir texto de número de página en el centro del documento
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const piePagina =`Página ${numeroPagina} de ${totalPaginas} `;
    doc. text(piePagina, anchoPagina / 2 + 15, alturaPagina - 10, { align: "center" });

    },
    });

    // Actualizar el marcador con el total real de páginas
    if (typeof doc.putTotalPages === 'function' ) {
    doc.putTotalPages(totalPaginas);
    }

    // Guardar el PDF con un nombre basado en la fecha actual
    const fecha = new Date( );
    const dia = String(fecha.getDate()).padStart(2,'0');
    const mes = String(fecha.getMonth() +1).padStart(2,'0');
    const anio = fecha.getFullYear();
    const nombreArchivo = `productos_${dia}${mes}${anio}.pdf` ; 

    // Actualizar el marcador con el total real de páginas
    if (typeof doc.putTotalPages === 'function' ) {
    doc.putTotalPages(totalPaginas);

    }

    // Guardar el documento PDF
    doc.save(nombreArchivo);

 }

const generarPDFDetalleProducto = (producto) => {
const pdf = new jsPDF( );
const anchoPagina = pdf. internal.pageSize.getWidth( );

// Encabezado
pdf.setFillColor(28, 41, 51);
pdf.rect(0, 0, 220, 30, 'F');
pdf.setTextColor(255, 255, 255);
pdf.setFontSize(22);
pdf.text(producto.nombre_producto, anchoPagina / 2, 18, { align: "center" });

let posicionY = 50;

if (producto. imagen) {
const propiedadesImagen = pdf.getImageProperties(producto.imagen);
const anchoImagen = 100;
const altoImagen = (propiedadesImagen.height * anchoImagen) / propiedadesImagen.width;
const posicionX = (anchoPagina - anchoImagen) / 2;

pdf.addImage(producto.imagen, 'JPEG', posicionX, 40, anchoImagen, altoImagen);
posicionY = 40 + altoImagen + 10;

}

pdf.setTextColor(0, 0, 0);
pdf.setFontSize(14);

pdf.text(`Descripcion: ${producto.descripcion_producto}`, anchoPagina / 2, posicionY, { align: "center" });
pdf.text(`Categoria: ${producto. id_categoria}`, anchoPagina / 2, posicionY + 10, { align: "center" });
pdf.text(`Precio: C$ ${producto.precio_unitario}`, anchoPagina / 2, posicionY + 20, { align: "center" });
pdf. text(`Stock: ${producto. stock}`, anchoPagina / 2, posicionY + 30, { align: "center" });

pdf.save(`${producto.nombre_producto}.pdf` );
}

const exportarExcelProductos = () => {

  // Estructura de datos para la hoja Excel
const datos = productosFiltrados.map((producto) => ({
  ID: producto.id_producto,
  Nombre: producto.nombre_producto,
  Descripción: producto.descripcion_producto,
  "Id Categoría": producto.id_categoria,
  Precio: parseFloat(producto.precio_unitario),
  Stock: producto.stock

}));

// Crear hoja y libro Excel
const hoja = XLSX.utils.json_to_sheet(datos);
const libro = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(libro, hoja, "Productos");

// Crear el archivo binario
const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });

// Guardar el Excel con un nombre basado en la fecha actual
const fecha = new Date();
const dia = String(fecha.getDate()).padStart(2, '0');
const mes = String(fecha.getMonth() + 1).padStart(2, '0');
const anio = fecha.getFullYear();

const nombreArchivo = `productos_${dia}${mes}${anio}.xlsx`;

// Guardar archivo con nombre previamente configurado
const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
saveAs(blob, nombreArchivo);

}

  return (
    <Container className="mt-5">
      <br />
      <h4>Productos</h4>

      <Row>
        <Col lg={2} md={4} sm={4} xs={5}>
          <Button variant="primary" onClick={() => setMostrarModal(true)} style={{ width: "100%" }}>
            Nuevo Producto
          </Button>
        </Col>
        <Col lg={6} md={8} sm={8} xs={7}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarCambioBusqueda}
          />
        </Col>

        <Col lg={3} md={4} sm={4} xs={5}>

        <Button
           className="mb-3"
           onClick={generarPDFProductos}
           variant="secondary"
           style={{ width: "100%" }}
         >
         Generar reporte PDF
        </Button>
       </Col>

       <Col lg={3} md={4} sm={4} xs={5}>
        <Button
        className="mb-3"
        onClick={exportarExcelProductos}
        variant="secondary"
        style={{ width: "100%" }}
        >
        Generar Excel
        </Button>
        </Col>

        </Row>

      <br /><br />

      <TablaProductos
        productos={productosPaginados}
        cargando={cargando}
        error={errorCarga}
        abrirModalEliminacion={abrirModalEliminacion}
        abrirModalEdicion={abrirModalEdicion}
        totalElementos={listaProductos.length}
        elementosPorPagina={elementosPorPagina}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        generarPDFDetalleProducto={generarPDFDetalleProducto}
      />

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejarCambioInput={manejarCambioInput}
        agregarProducto={agregarProducto}
        errorCarga={errorCarga}
        categorias={listaCategorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarProducto={eliminarProducto}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditado={productoEditado}
        manejarCambioInputEdicion={manejarCambioInputEdicion}
        actualizarProducto={actualizarProducto}
        errorCarga={errorCarga}
        categorias={listaCategorias}
      />
    </Container>
  );
};

export default Productos;
