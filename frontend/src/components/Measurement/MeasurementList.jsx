// components/Measurement/MeasurementList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { measurementService, babyService } from '../../services/api';

const MeasurementList = () => {
  const [measurements, setMeasurements] = useState([]);
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);
  const [selectedBaby, setSelectedBaby] = useState('all');
  const navigate = useNavigate();

  // Función para cargar los datos
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar la lista de bebés
      const babiesResponse = await babyService.getAll();
      setBabies(babiesResponse.data);
      
      // Cargar todas las mediciones
      const measurementsResponse = await measurementService.getAll();
      setMeasurements(measurementsResponse.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para confirmar eliminación
  const confirmDelete = (measurement) => {
    setMeasurementToDelete(measurement);
    setShowDeleteModal(true);
  };

  // Función para eliminar una medición
  const handleDelete = async () => {
    if (!measurementToDelete) return;
    
    try {
      await measurementService.delete(measurementToDelete.id);
      // Actualizar la lista después de eliminar
      fetchData();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error al eliminar medición:', err);
      setError('No se pudo eliminar la medición. Por favor, intente de nuevo.');
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Filtrar mediciones por bebé seleccionado
  const filteredMeasurements = selectedBaby === 'all' 
    ? measurements 
    : measurements.filter(m => m.baby.toString() === selectedBaby);

  // Encontrar el nombre del bebé por ID
  const getBabyName = (babyId) => {
    const baby = babies.find(b => b.id === babyId);
    return baby ? baby.name : 'Desconocido';
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Mediciones</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/measurements/new')}
          >
            Registrar Nueva Medición
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* Filtro por bebé */}
          <Form.Group className="mb-3">
            <Form.Label>Filtrar por bebé:</Form.Label>
            <Form.Select
              value={selectedBaby}
              onChange={(e) => setSelectedBaby(e.target.value)}
            >
              <option value="all">Todos los bebés</option>
              {babies.map(baby => (
                <option key={baby.id} value={baby.id}>
                  {baby.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          {filteredMeasurements.length === 0 ? (
            <Alert variant="info">
              No hay mediciones registradas para {selectedBaby === 'all' ? 'ningún bebé' : 'este bebé'}.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Bebé</th>
                  <th>Fecha</th>
                  <th>Edad (semanas)</th>
                  <th>Peso (g)</th>
                  <th>Altura (cm)</th>
                  <th>Perímetro Craneal (cm)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeasurements.map(measurement => (
                  <tr key={measurement.id}>
                    <td>{getBabyName(measurement.baby)}</td>
                    <td>{formatDate(measurement.date)}</td>
                    <td>{measurement.age_weeks}</td>
                    <td>{measurement.weight}</td>
                    <td>{measurement.height}</td>
                    <td>{measurement.head_circumference}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/measurements/edit/${measurement.id}`)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => confirmDelete(measurement)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar esta medición? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MeasurementList;