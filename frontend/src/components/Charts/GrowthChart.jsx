// components/Charts/GrowthCharts.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Alert, Spinner, Tabs, Tab, Button } from 'react-bootstrap';
import { babyService } from '../../services/api';
import WeightChart from './WeightChart';
import HeightChart from './HeightChart';
import HeadCircumferenceChart from './HeadCircumferenceChart';
import '../../styles/components/Charts.module.scss'; // Asegúrate de tener este archivo CSS para estilos personalizados

const GrowthChart = () => {
  const { babyId } = useParams();
  const [baby, setBaby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('weight');

  useEffect(() => {
    const fetchBaby = async () => {
      try {
        setLoading(true);
        const response = await babyService.getById(babyId);
        setBaby(response.data);
      } catch (err) {
        console.error('Error al cargar datos del bebé:', err);
        setError('No se pudieron cargar los datos del bebé. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchBaby();
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gráficos de Crecimiento - {baby?.name}</h2>
        <Button 
          as={Link} 
          to={`/measurements/new?baby=${babyId}`} 
          variant="primary"
        >
          Agregar Nueva Medición
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="weight" title="Peso">
              <WeightChart babyId={babyId} />
            </Tab>
            <Tab eventKey="height" title="Altura">
              <HeightChart babyId={babyId} />
            </Tab>
            <Tab eventKey="head" title="Perímetro Craneal">
              <HeadCircumferenceChart babyId={babyId} />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GrowthChart;