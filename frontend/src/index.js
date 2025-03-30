// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Importa los estilos globales PRIMERO para que otros estilos los puedan sobreescribir si es necesario
import './styles/global.css';

// 2. Importa tu componente principal App (que contiene el Router)
import App from './App';

// 3. Importa el proveedor de contexto de autenticación
import { AuthProvider } from './contexts/AuthContext';

// 4. Importa la función para medir el rendimiento (opcional pero estándar de CRA)
import reportWebVitals from './reportWebVitals';

// 5. Busca el div con id="root" en tu public/index.html
const rootElement = document.getElementById('root');

// 6. Crea el punto de renderizado principal de React 18+
const root = ReactDOM.createRoot(rootElement);

// 7. Renderiza tu aplicación
root.render(
  <React.StrictMode> {/* Ayuda a detectar problemas potenciales en la app */}
    <AuthProvider> {/* Envuelve toda la App para dar acceso al contexto de Auth */}
      <App /> {/* Tu componente App con todas las rutas */}
    </AuthProvider>
  </React.StrictMode>
);

// 8. Llama a la función para reportar métricas web (opcional)
// Puedes pasar una función como console.log para ver los resultados: reportWebVitals(console.log)
reportWebVitals();