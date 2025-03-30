// src/utils/helpers.js

// Formatear fecha (ejemplo simple)
export const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      // Puedes usar Intl.DateTimeFormat para más opciones y localización
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      //   hour: '2-digit', // Descomenta si quieres la hora
      //   minute: '2-digit',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Devuelve el string original si falla
    }
  };
  
  // Obtener una URL segura para previsualización de imagen (si viene de API)
  // Asume que tu backend sirve las imágenes desde una ruta específica o devuelve URLs completas.
  // Si no, necesitarás construir la URL base.
  export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        // Asegúrate que esta ruta a tu placeholder en 'public/images/' sea correcta
        return '/images/placeholder.png';
    }
    // Si imagePath ya es una URL completa (improbable en nuestro caso)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // --- CORRECCIÓN ---
    // Asumiendo que imagePath desde la BD es "uploads/images/file.png"
    // Simplemente añadimos una barra al inicio.
    // El proxy se encargará de dirigir "/uploads/images/file.png"
    // a "http://localhost:5000/uploads/images/file.png"
    return `/${imagePath}`;
    // --- FIN CORRECCIÓN ---
}
  
  // Tipos de Assets definidos en el PDF
  export const ASSET_TYPES = ['2D', '3D', 'Audio', 'Video', 'Código', 'Otros'];