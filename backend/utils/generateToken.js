// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d', // El token expira en 30 días (puedes ajustarlo)
  });
};

export default generateToken;