import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as commentService from '../../services/commentService';
import styles from './CommentSection.module.css';

function CommentSection({ assetId }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentService.getCommentsByAsset(assetId);
        setComments(data);
      } catch (err) {
        console.error('Error al obtener comentarios:', err);
      }
    };
    fetchComments();
  }, [assetId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('El comentario no puede estar vacío.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const commentData = { content: newComment, assetId };
      const createdComment = await commentService.createComment(commentData, token);
      setComments([...comments, createdComment]);
      setNewComment('');
    } catch (err) {
      console.error('Error al añadir comentario:', err);
      setError('No se pudo añadir el comentario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.commentSection}>
      <h3>Comentarios</h3>
      <ul className={styles.commentList}>
        {comments.map((comment) => (
          <li key={comment._id} className={styles.comment}>
            <p><strong>{comment.author.nombre}:</strong> {comment.content}</p>
          </li>
        ))}
      </ul>
      {user ? (
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            rows="3"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Añadiendo...' : 'Añadir comentario'}
          </button>
        </form>
      ) : (
        <p>Inicia sesión para añadir un comentario.</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default CommentSection;