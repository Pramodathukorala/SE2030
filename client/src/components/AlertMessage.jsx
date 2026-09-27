import React from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;
  return (
    <Alert variant={type} onClose={onClose} dismissible={!!onClose}>
      {message}
    </Alert>
  );
};

export default AlertMessage;
