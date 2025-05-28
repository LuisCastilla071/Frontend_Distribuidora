import React, { useState, useEffect } from 'react';
import VentasPorMes from '../components/graficos/VentasPorMes';
import VentasPorEmpleado from '../components/graficos/VentasPorEmpleado';
import ChatIA from '../components/chat/ChatIA';
import { Container, Row, Col, Button } from 'react-bootstrap';
const Estadisticas = () => {
  // State variables for chart data
  const [meses, setMeses] = useState([]);
  const [totalesPorMes, setTotalesPorMes] = useState([]);

  const [empleados, setEmpleados] = useState([]);
  const [totalesPorEmpleado, setTotalesPorEmpleado] = useState([]);

  const [mostrarChatModal, setMostrarChatModal] = useState(false); // Estado para el modal

const cargaVentas = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/totalventaspormes');
        const data = await response.json();
        setMeses(data.map(item => item.mes)); // e.g., ['Enero', 'Febrero', ...]
        setTotalesPorMes(data.map(item => item.total_ventas)); // e.g., [1000, 2000, ...]
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        alert('Error al cargar ventas: ' + error.message);
      }
    };

    
const cargatotalVentasporempleado = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/totalventasporempleado');
        const data = await response.json();
        setEmpleados(data.map(item => item.primer_nombre + ' ' + item.primer_apellido)); // e.g., ['Enero', 'Febrero', ...]
        setTotalesPorEmpleado(data.map(item => item.total_ventas)); // e.g., [1000, 2000, ...]
      } catch (error) {
        console.error('Error al cargar el total de ventas de empleados:', error);
        alert('Error al cargar el total de ventas de empleados: ' + error.message);
      }
    };
  
  // Fetch data on component mount
  useEffect(() => {
    cargaVentas();
    cargatotalVentasporempleado();
  }, []); // Empty dependency array to run once on mount

  return (
    <Container className="mt-5">
      <h4>Estadísticas</h4>

    <Button 
      variant="primary" 
      className="mb-4"
      onClick={() => setMostrarChatModal(true)}
    >
      Consultar con IA
    </Button>

      <Row className="mt-4">
        <Col xs={12} sm={12} md={12} lg={6} className="mb-4">
          <VentasPorMes meses={meses} totales_por_mes={totalesPorMes} />
        </Col>
        <Col xs={12} sm={12} md={12} lg={6} className="mb-4">
          <VentasPorEmpleado empleados={empleados} totales_por_empleado={totalesPorEmpleado} />
          <ChatIA mostrarChatModal={mostrarChatModal} setMostrarChatModal={setMostrarChatModal} />
        </Col>
      </Row>
    </Container>
  );
};

export default Estadisticas;