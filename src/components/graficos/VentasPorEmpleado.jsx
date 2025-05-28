import React, { useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const VentasPorEmpleado = ({ empleados, totales_por_empleado }) => {
  const chartRef = useRef(null);

  // Define chart data
  const data = {
    labels: empleados, // Array de nombres de empleados
    datasets: [
      {
        label: 'Ventas por Empleado (C$)',
        data: totales_por_empleado, // Array de totales de ventas
        backgroundColor: 'rgba(75, 192, 87, 0.6)',
        borderColor: 'rgb(43, 54, 202)',
        borderWidth: 1,
      },
    ],
  };

  // Define chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Ventas',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Empleados',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(28, 41, 51);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Reporte de Ventas por Empleado', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Capturar gráfico como imagen
    const chartInstance = chartRef.current;
    const chartCanvas = chartInstance?.canvas;
    const chartImage = chartCanvas?.toDataURL('image/png', 1.0);

    if (chartImage) {
      doc.addImage(chartImage, 'PNG', 14, 40, 180, 100);
    }

    // Tabla de datos
    const columnas = ['Empleado', 'Ventas (C$)'];
    const filas = empleados.map((empleado, index) => [empleado, totales_por_empleado[index]]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 150,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { top: 20, left: 14, right: 14 },
    });

    // Generar un nombre dinámico para el archivo PDF
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const nombreArchivo = `VentasPorEmpleado_${dia}${mes}${anio}.pdf`;

    // Guardar PDF
    doc.save(nombreArchivo);
  };


  return (
    <Card style={{ height: '100%' }}>
 
        <Card.Title>Ventas por Empleado</Card.Title>
        <div style={{ height: '300px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <Bar ref={chartRef} data={data} options={options} />
        </div>
        <Button className="btn btn-primary mt-3" onClick={generarPDF}>
          Generar Reporte <i className="bi bi-download"></i>
        </Button>
    
    </Card>
  );
};

export default VentasPorEmpleado;