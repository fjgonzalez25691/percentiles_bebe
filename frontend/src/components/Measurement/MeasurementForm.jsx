// components/Measurement/MeasurementForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { measurementService, babyService } from '../../services/api';
import '../../styles/components/MeasurementForm.module.scss'; // Asegúrate de tener este archivo CSS para estilos personalizados

const MeasurementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Obtener el ID del bebé de los query params si existe
  const queryParams = new URLSearchParams(location.search);
  const babyIdFromQuery = queryParams.get('baby');

  const [formData, setFormData] = useState({
    baby: babyIdFromQuery || '',
    date: new Date().toISOString().split('T')[0],
    age_weeks: 0,
    weight: '',
    height: '',
    head_circumference: ''
  });

  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar la lista de bebés
        const babiesResponse = await babyService.getAll();
        setBabies(babiesResponse.data);
        
        // Si estamos en modo edición, cargar los datos de la medición
        if (isEditMode) {
          const measurementResponse = await measurementService.getById(id);
          
          // Formatear la fecha para el input date (YYYY-MM-DD)
          const measurementDate = new Date(measurementResponse.data.date);
          const formattedDate = measurementDate.toISOString().split('T')[0];
          
          setFormData({
            ...measurementResponse.data,
            date: formattedDate
          });
        } 
        // Si tenemos un ID de bebé en la URL y no estamos en modo edición
        else if (babyIdFromQuery) {
          // Buscar el bebé para calcular la edad en semanas
          const baby = babiesResponse.data.find(b => b.id.toString() === babyIdFromQuery);
          if (baby) {
            const birthDate = new Date(baby.birth_date);
            const today = new Date();
            const diffTime = Math.abs(today - birthDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const ageInWeeks = Math.floor(diffDays / 7);
            
            setFormData(prev => ({
              ...prev,
              baby: babyIdFromQuery,
              age_weeks: ageInWeeks
            }));
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudieron cargar los datos necesarios. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, babyIdFromQuery]);

  // Actualizar la edad en semanas cuando cambia el bebé seleccionado
  useEffect(() => {
    if (formData.baby && babies.length > 0) {
      const selectedBaby = babies.find(b => b.id.toString() === formData.baby.toString());
      if (selectedBaby) {
        const birthDate = new Date(selectedBaby.birth_date);
        const measurementDate = new Date(formData.date);
        const diffTime = Math.abs(measurementDate - birthDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const ageInWeeks = Math.floor(diffDays / 7);
        
        setFormData(prev => ({
          ...prev,
          age_weeks: ageInWeeks
        }));
      }
    }
  }, [formData.baby, formData.date, babies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validaciones
      if (!formData.baby) {
        setError('Debe seleccionar un bebé.');
        setSubmitting(false);
        return;
      }
      
      if (parseFloat(formData.weight) <= 0 || parseFloat(formData.height) <= 0 || parseFloat(formData.head_circumference) <= 0) {
        setError('Todas las medidas deben ser mayores que cero.');
        setSubmitting(false);
        return;
      }

      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData,
        // Convertir a números
        baby: parseInt(formData.baby),
        age_weeks: parseInt(formData.age_weeks),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        head_circumference: parseFloat(formData.head_circumference)
      };

      if (isEditMode) {
        await measurementService.update(id, dataToSubmit);
        setSuccess('¡Medición actualizada correctamente!');
      } else {
        await measurementService.create(dataToSubmit);
        setSuccess('¡Medición registrada correctamente!');
        // Limpiar el formulario después de crear
        setFormData({
          baby: formData.baby, // Mantener el bebé seleccionado
          date: new Date().toISOString().split('T')[0],
          age_weeks: formData.age_weeks, // Mantener la edad calculada
          weight: '',
          height: '',
          head_circumference: ''
        });
      }
      
      // Redirigir a la lista después de un breve retraso
      setTimeout(() => {
        navigate('/measurements');
      }, 2000);

      
    } catch (err) {
      console.error('Error al guardar medición:', err);
      setError('Ocurrió un error al guardar los datos. Por favor, intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
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
    <Card>
      <Card.Header>
        <h2>{isEditMode ? 'Editar Medición' : 'Registrar Nueva Medición'}</h2>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBaby">
            <Form.Label>Bebé</Form.Label>
            <Form.Select
              name="baby"
              value={formData.baby}
              onChange={handleChange}
              disabled={isEditMode || !!babyIdFromQuery}
              required
            >
              <option value="">Seleccione un bebé</option>
              {babies.map(baby => (
                <option key={baby.id} value={baby.id}>
                  {baby.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formDate">
            <Form.Label>Fecha de medición</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAgeWeeks">
            <Form.Label>Edad (semanas)</Form.Label>
            <Form.Control
              type="number"
              name="age_weeks"
              value={formData.age_weeks}
              onChange={handleChange}
              readOnly
              required
            />
            <Form.Text className="text-muted">
              La edad se calcula automáticamente basada en la fecha de nacimiento y la fecha de medición.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formWeight">
            <Form.Label>Peso (gramos)</Form.Label>
            <Form.Control
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Ej: 3500"
              step="1"
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formHeight">
            <Form.Label>Altura (centímetros)</Form.Label>
            <Form.Control
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="Ej: 50.5"
              step="0.1"
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formHeadCircumference">
            <Form.Label>Perímetro craneal (centímetros)</Form.Label>
            <Form.Control
              type="number"
              name="head_circumference"
              value={formData.head_circumference}
              onChange={handleChange}
              placeholder="Ej: 35.2"
              step="0.1"
              min="0"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/measurements')}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {isEditMode ? 'Actualizando...' : 'Guardar'}
                </>
              ) : (
                isEditMode ? 'Actualizar' : 'Guardar'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MeasurementForm;