// components/Baby/BabyForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { babyService } from '../../services/api';
import '../../styles/components/BabyForm.module.scss'; // Asegúrate de tener este archivo CSS para estilos personalizados

const BabyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: 'M',
    is_premature: false,
    gestation_weeks: 40
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Si estamos en modo edición, cargar los datos del bebé
    if (isEditMode) {
      const fetchBaby = async () => {
        try {
          setLoading(true);
          const response = await babyService.getById(id);
          
          // Formatear la fecha para el input date (YYYY-MM-DD)
          const birthDate = new Date(response.data.birth_date);
          const formattedDate = birthDate.toISOString().split('T')[0];
          
          setFormData({
            ...response.data,
            birth_date: formattedDate
          });
        } catch (err) {
          console.error('Error al cargar datos del bebé:', err);
          setError('No se pudieron cargar los datos del bebé. Por favor, intente de nuevo.');
        } finally {
          setLoading(false);
        }
      };

      fetchBaby();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkboxes, usamos el valor de checked
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validar que la fecha de nacimiento no sea en el futuro
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      
      if (birthDate > today) {
        setError('La fecha de nacimiento no puede ser en el futuro.');
        setSubmitting(false);
        return;
      }
      
      // Validar semanas de gestación si es prematuro
      if (formData.is_premature && (formData.gestation_weeks < 24 || formData.gestation_weeks > 36)) {
        setError('Para bebés prematuros, las semanas de gestación deben estar entre 24 y 36.');
        setSubmitting(false);
        return;
      }

      // Preparar datos para enviar
      const dataToSubmit = {
        ...formData,
        // Si no es prematuro, enviar null en gestation_weeks
        gestation_weeks: formData.is_premature ? formData.gestation_weeks : null
      };

      if (isEditMode) {
        await babyService.update(id, dataToSubmit);
        setSuccess('¡Datos del bebé actualizados correctamente!');
      } else {
        await babyService.create(dataToSubmit);
        setSuccess('¡Bebé registrado correctamente!');
        // Limpiar el formulario después de crear
        setFormData({
          name: '',
          birth_date: '',
          gender: 'M',
          is_premature: false,
          gestation_weeks: 40
        });
      }
      
      // Redirigir a la lista después de un breve retraso
      setTimeout(() => {
        navigate('/babies');
      }, 2000);
      
    } catch (err) {
      console.error('Error al guardar datos del bebé:', err);
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
        <h2>{isEditMode ? 'Editar Bebé' : 'Registrar Nuevo Bebé'}</h2>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Nombre del bebé</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese el nombre del bebé"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBirthDate">
            <Form.Label>Fecha de nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formGender">
            <Form.Label>Sexo</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formIsPremature">
            <Form.Check
              type="checkbox"
              name="is_premature"
              label="Bebé prematuro"
              checked={formData.is_premature}
              onChange={handleChange}
            />
          </Form.Group>

          {formData.is_premature && (
            <Form.Group className="mb-3" controlId="formGestationWeeks">
              <Form.Label>Semanas de gestación</Form.Label>
              <Form.Control
                type="number"
                name="gestation_weeks"
                value={formData.gestation_weeks}
                onChange={handleChange}
                min="24"
                max="36"
                required={formData.is_premature}
              />
              <Form.Text className="text-muted">
                Para bebés prematuros, ingrese las semanas de gestación al nacer (entre 24 y 36 semanas).
              </Form.Text>
            </Form.Group>
          )}

          <div className="d-flex justify-content-between">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/babies')}
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
                  {isEditMode ? 'Actualizando...' : 'Guardando...'}
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

export default BabyForm;