// components/Baby/BabyList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { babyService } from '../../services/api';

const BabyList = () => {
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState(null);
  const navigate = useNavigate();

  // Función para cargar la lista de bebés
  const fetchBabies = async () => {
    try {
      setLoading(true);
      const response = await babyService.getAll();
      setBabies(response.data);
    } catch (err) {
      console.error('Error al cargar la lista de bebés:', err);
      setError('No se pudo cargar la lista de bebés. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBabies();
  }, []);

  // Función para confirmar eliminación
  const confirmDelete = (baby) => {
    setBabyToDelete(baby);
    setShowDeleteModal(true);
  };

  // Función para eliminar un bebé
  const handleDelete = async () => {
    if (!babyToDelete) return;
    
    try {
      await babyService.delete(babyToDelete.id);
      // Actualizar la lista después de eliminar
      fetchBabies();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error al eliminar bebé:', err);
      setError('No se pudo eliminar el bebé. Por favor, intente de nuevo.');
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para calcular la edad en semanas
  const calculateAgeInWeeks = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
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
          <h2>Mis Bebés</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/babies/new')}
          >
            Registrar Nuevo Bebé
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {babies.length === 0 ? (
            <Alert variant="info">
              No hay bebés registrados. ¡Comience registrando uno nuevo!
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Edad (semanas)</th>
                  <th>Sexo</th>
                  <th>Prematuro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {babies.map(baby => (
                  <tr key={baby.id}>
                    <td>{baby.name}</td>
                    <td>{formatDate(baby.birth_date)}</td>
                    <td>{calculateAgeInWeeks(baby.birth_date)}</td>
                    <td>{baby.gender === 'M' ? 'Masculino' : 'Femenino'}</td>
                    <td>{baby.is_premature ? 'Sí' : 'No'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/babies/edit/${baby.id}`)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => confirmDelete(baby)}
                        >
                          Eliminar
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => navigate(`/measurements/new?baby=${baby.id}`)}
                        >
                          Nueva Medición
                        </Button>
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          onClick={() => navigate(`/charts/weight/${baby.id}`)}
                        >
                          Ver Gráficos
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
          ¿Está seguro que desea eliminar a <strong>{babyToDelete?.name}</strong>? 
          Esta acción no se puede deshacer y se eliminarán todas las mediciones asociadas.
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

export default BabyList;