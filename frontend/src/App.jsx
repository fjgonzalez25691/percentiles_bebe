import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/scss/main.scss'; // Importa tus estilos personalizados

// Componentes de autenticación
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Componentes de bebés
import BabyList from './components/Baby/BabyList';
import BabyForm from './components/Baby/BabyForm';

// Componentes de mediciones
import MeasurementList from './components/Measurement/MeasurementList';
import MeasurementForm from './components/Measurement/MeasurementForm';

// Componentes de gráficos
import WeightChart from './components/Charts/WeightChart';
import HeightChart from './components/Charts/HeightChart';
import HeadCircumferenceChart from './components/Charts/HeadCircumferenceChart';
import GrowthChart from './components/Charts/GrowthChart';


// Servicios
import { authService } from './services/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la aplicación
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(authService.getCurrentUser());
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Seguimiento de Crecimiento Infantil</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/babies">Mis Bebés</Nav.Link>
                  <Nav.Link as={Link} to="/measurements">Mediciones</Nav.Link>
                  <Nav.Link as={Link} to="/charts">Gráficos</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                  <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

          {/* Rutas protegidas */}
          <Route path="/babies" element={isAuthenticated ? <BabyList /> : <Navigate to="/login" />} />
          <Route path="/babies/new" element={isAuthenticated ? <BabyForm /> : <Navigate to="/login" />} />
          <Route path="/babies/edit/:id" element={isAuthenticated ? <BabyForm /> : <Navigate to="/login" />} />
          
          <Route path="/measurements" element={isAuthenticated ? <MeasurementList /> : <Navigate to="/login" />} />
          <Route path="/measurements/new" element={isAuthenticated ? <MeasurementForm /> : <Navigate to="/login" />} />
          <Route path="/measurements/edit/:id" element={isAuthenticated ? <MeasurementForm /> : <Navigate to="/login" />} />
          
          <Route path="/charts/weight/:babyId" element={isAuthenticated ? <WeightChart /> : <Navigate to="/login" />} />
          <Route path="/charts/height/:babyId" element={isAuthenticated ? <HeightChart /> : <Navigate to="/login" />} />
          <Route path="/charts/head/:babyId" element={isAuthenticated ? <HeadCircumferenceChart /> : <Navigate to="/login" />} />
          <Route path="/charts/:babyId" element={isAuthenticated ? <GrowthChart /> : <Navigate to="/login" />} />

          
          {/* Ruta por defecto */}
          <Route path="/" element={isAuthenticated ? <BabyList /> : <Navigate to="/login" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;