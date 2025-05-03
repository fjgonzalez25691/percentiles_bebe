// components/Charts/HeightChart.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Alert, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { growthChartService } from '../../services/api';
import '../../styles/components/Charts.module.scss'; // Asegúrate de tener este archivo CSS para estilos personalizados

const HeightChart = () => {
  const { babyId } = useParams();
  const [chartData, setChartData] = useState([]);
  const [baby, setBaby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await growthChartService.getData(babyId);
        
        // Extraer datos del bebé
        setBaby(response.data.baby);
        
        // Preparar datos para el gráfico
        const measurements = response.data.measurements;
        const heightPercentiles = response.data.percentiles.height;
        
        // Crear un conjunto de todas las edades únicas
        const allAges = new Set();
        measurements.forEach(m => allAges.add(m.age_weeks));
        heightPercentiles.forEach(p => allAges.add(p.age_weeks));
        
        // Ordenar las edades
        const sortedAges = Array.from(allAges).sort((a, b) => a - b);
        
        // Función para encontrar un valor en un array por edad
        const findByAge = (arr, age, key) => {
          const item = arr.find(item => item.age_weeks === age);
          return item ? item[key] : null;
        };
        
        // Función para encontrar un percentil específico
        const findPercentile = (arr, age, percentile) => {
          const item = arr.find(item => item.age_weeks === age && item.percentile === percentile);
          return item ? item.value : null;
        };
        
        // Crear datos combinados
        const combinedData = sortedAges.map(age => {
          const height = findByAge(measurements, age, 'height');
          const p3 = findPercentile(heightPercentiles, age, 3);
          const p50 = findPercentile(heightPercentiles, age, 50);
          const p97 = findPercentile(heightPercentiles, age, 97);
          
          return {
            age,
            height,
            p3,
            p50,
            p97
          };
        });
        
        setChartData(combinedData);
      } catch (err) {
        console.error('Error al cargar datos del gráfico:', err);
        setError('No se pudieron cargar los datos del gráfico. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [babyId]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card>
      <Card.Header>
        <h3>Gráfico de Altura - {baby?.name}</h3>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="age" 
              label={{ value: 'Edad (semanas)', position: 'insideBottomRight', offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'Altura (cm)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip />
            <Legend />
            
            {/* Área entre P3 y P97 (la "boca del cocodrilo") */}
            <Area 
              type="monotone" 
              dataKey="p97" 
              stroke="none" 
              fillOpacity={0.1} 
              fill="#8884d8" 
              name="Percentil 97" 
            />
            <Area 
              type="monotone" 
              dataKey="p3" 
              stroke="none" 
              fillOpacity={0.1} 
              fill="#8884d8" 
              name="Percentil 3" 
            />
            
            {/* Líneas de percentiles */}
            <Line 
              type="monotone" 
              dataKey="p3" 
              stroke="#8884d8" 
              strokeDasharray="5 5" 
              dot={false} 
              name="Percentil 3" 
            />
            <Line 
              type="monotone" 
              dataKey="p50" 
              stroke="#82ca9d" 
              strokeDasharray="3 3" 
              dot={false} 
              name="Percentil 50" 
            />
            <Line 
              type="monotone" 
              dataKey="p97" 
              stroke="#8884d8" 
              strokeDasharray="5 5" 
              dot={false} 
              name="Percentil 97" 
            />
            
            {/* Línea de mediciones reales */}
            <Line 
              type="monotone" 
              dataKey="height" 
              stroke="#ff7300" 
              strokeWidth={2} 
              activeDot={{ r: 8 }} 
              name="Altura del bebé" 
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-3">
          <p>
            <strong>Interpretación:</strong> Este gráfico muestra la altura de {baby?.name} en comparación con los 
            percentiles estándar de la OMS. La línea naranja representa la altura real del bebé, mientras que las 
            áreas sombreadas muestran el rango normal (entre los percentiles 3 y 97).
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default HeightChart;