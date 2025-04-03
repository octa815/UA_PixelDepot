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
    // imagePath ahora es la URL completa de Cloudinary
    if (!imagePath || typeof imagePath !== 'string') {
        return '/images/placeholder.png'; // Ruta al placeholder en public/images/
    }
    // Devuelve la URL directamente si es http/https
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Si no, algo fue mal, devuelve placeholder
    console.warn("getImageUrl recibió una ruta inválida:", imagePath);
    return '/images/placeholder.png';
}
  
  // Tipos de Assets definidos en el PDF
  export const ASSET_TYPES = ['2D', '3D', 'Audio', 'Video', 'Código', 'Otros'];