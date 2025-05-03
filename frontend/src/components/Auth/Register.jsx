// components/Auth/Register.jsx
import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import styles from '../../styles/components/Auth.module.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar errores al cambiar el valor
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre de usuario
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setServerError('');
    setSuccess('');
    
    try {
      // Enviar datos de registro
      await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      
      setSuccess('¡Registro exitoso! Redirigiendo a la página de inicio de sesión...');
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error de registro:', error);
      
      // Manejar errores específicos del servidor
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        if (serverErrors.username) {
          setErrors(prev => ({ ...prev, username: serverErrors.username[0] }));
        }
        
        if (serverErrors.email) {
          setErrors(prev => ({ ...prev, email: serverErrors.email[0] }));
        }
        
        if (serverErrors.password) {
          setErrors(prev => ({ ...prev, password: serverErrors.password[0] }));
        }
        
        if (serverErrors.non_field_errors) {
          setServerError(serverErrors.non_field_errors[0]);
        } else if (serverErrors.detail) {
          setServerError(serverErrors.detail);
        } else {
          setServerError('Ocurrió un error durante el registro. Por favor, intente de nuevo.');
        }
      } else {
        setServerError('Error de conexión. Por favor, verifique su conexión a internet e intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <Card.Header>
          <h2 className={styles.authTitle}>Crear Cuenta</h2>
        </Card.Header>
        <Card.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingrese un nombre de usuario"
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese su correo electrónico"
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingrese una contraseña"
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                La contraseña debe tener al menos 8 caracteres.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme su contraseña"
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <div className={styles.formActions}>
              <Button 
                variant="primary" 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Registrando...
                  </>
                ) : (
                  'Registrarse'
                )}
              </Button>
            </div>
          </Form>
          
          <div className={styles.authFooter}>
            <p className="text-center mt-3">
              ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;