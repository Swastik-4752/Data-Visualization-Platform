"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import './LoginForm.css';

interface LoginFormProps {
  onClose?: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const router = useRouter();
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // For login, use email (which we store in username field)
        const email = formData.username;
        if (!email || !formData.password) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
        await signIn(email, formData.password);
        if (onClose) {
          onClose();
        }
        router.push('/');
        router.refresh();
      } else {
        // For sign up
        if (!formData.email || !formData.password) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        await signUp(formData.email, formData.password, formData.username || undefined);
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await resetPassword(formData.email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setShowResetPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await signInWithGoogle();
      if (onClose) {
        onClose();
      }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <p id="heading">{showResetPassword ? 'Reset Password' : isLogin ? 'Login' : 'Sign Up'}</p>
        
        {error && (
          <div style={{ 
            color: '#dc2626', 
            fontSize: '0.9em', 
            textAlign: 'center', 
            padding: '0.5em',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '5px',
            marginBottom: '0.5em'
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{ 
            color: '#22c55e', 
            fontSize: '0.9em', 
            textAlign: 'center', 
            padding: '0.5em',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '5px',
            marginBottom: '0.5em'
          }}>
            {successMessage}
          </div>
        )}

        {showResetPassword ? (
          <>
            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
              </svg>
              <input 
                autoComplete="off" 
                placeholder="Email" 
                className="input-field" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="btn">
              <button type="button" className="button1" onClick={handleResetPassword} disabled={isLoading}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{isLoading ? 'Sending...' : 'Send Reset Email'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </button>
              <button 
                type="button" 
                className="button2"
                onClick={() => {
                  setShowResetPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {!isLogin && (
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                </svg>
                <input 
                  autoComplete="off" 
                  placeholder="Username (Optional)" 
                  className="input-field" 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
              </svg>
              <input 
                autoComplete="off" 
                placeholder="Email" 
                className="input-field" 
                type="email"
                name={isLogin ? "username" : "email"}
                value={isLogin ? formData.username : formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
              <input 
                placeholder="Password" 
                className="input-field" 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                </svg>
                <input 
                  placeholder="Confirm Password" 
                  className="input-field" 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="btn">
              <button type="submit" className="button1" disabled={isLoading}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </button>
              <button 
                type="button" 
                className="button2"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={isLoading}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </div>

            <div className="divider">OR</div>

            <button 
              type="button" 
              className="button-google"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button 
              type="button" 
              className="button3"
              onClick={() => {
                setShowResetPassword(true);
                setError('');
                setSuccessMessage('');
              }}
              disabled={isLoading}
            >
              Forgot Password
            </button>
          </>
        )}
      </form>
    </div>
  );
}

