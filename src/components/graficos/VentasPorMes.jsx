import { Card } from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';


const VentasPorMes = ({ meses, totales_por_mes }) => {

  const data = {
    labels: meses, // Nombres de los meses
    datasets: [
        {
            label: 'VENTAS(C$)', // Total de ventas por mes
            data: totales_por_mes, // Total de ventas por mes
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cordobas (C$)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Meses',
                },
            },
        },
    },
};
return (<Card style={{ height: '100%' }}>
    <Card.Title>Ventas por mes</Card.Title>
    <div style={{ height: '100%', position: "relative" }}>
        <Bar data={data} options={options} />
    </div>
</Card>);
};
export default VentasPorMes;