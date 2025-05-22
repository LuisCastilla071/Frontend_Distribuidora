import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';


const VentasPorEmpleado = ({ empleados, totales_por_empleado }) => {
  // Define chart data
  const data = {
    labels: empleados,// Array de nombres de empleados
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

  return (
    <Card>
      <Card.Body>
        <Card.Title>Ventas por Empleado</Card.Title>
        <Bar data={data} options={options} />
      </Card.Body>
    </Card>
  );
};

export default VentasPorEmpleado;