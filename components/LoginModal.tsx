"use client";

import React from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <button
          onClick={onClose}
          className="login-modal-close"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        <LoginForm onClose={onClose} />
      </div>
    </div>
  );
}

