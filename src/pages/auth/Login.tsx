import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Loader, KeyRound, CheckCircle, AlertCircle, XCircle, ArrowLeft } from 'lucide-react';

const PasswordStrengthMeter = ({ strength }) => {
  const getColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
      <div 
        className={`h-full rounded-full transition-all duration-300 ${getColor()}`} 
        style={{ width: `${Math.min(100, strength * 20)}%` }}
      ></div>
    </div>
  );
};

// Password requirement item component
const PasswordRequirement = ({ text, isMet }) => (
  <div className="flex items-center gap-2 text-sm">
    {isMet ? 
      <CheckCircle className="text-green-500" size={16} /> : 
      <AlertCircle className="text-gray-400" size={16} />
    }
    <span className={isMet ? "text-green-600" : "text-gray-500"}>{text}</span>
  </div>
);

// Modal component for password change notification
const PasswordChangeModal = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-4 py-3 text-white flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center">
              <KeyRound className="mr-2" size={20} />
              Default Password Detected
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <div className="mb-5">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-gray-700 mb-4">
                Your account is using a default password. For security reasons, you need to create a new password before accessing the admin platform.
              </p>
              <p className="text-gray-600 text-sm">
                This is a one-time step to ensure your account security.
              </p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={onContinue}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue to Password Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Forgot Password Component
const ForgotPassword = ({ onBackToLogin, onResetSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendResetLink } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await sendResetLink(email);
      if (response.success) {
        setMessage('Password reset instructions have been sent to your email address.');

        // Optional: Auto redirect after success
        setTimeout(() => {
          onResetSuccess && onResetSuccess();
        }, 3000);
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-8">
          <Mail className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>
      
      <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {message}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                id="reset-email" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending...
                </span>
              ) : 'Send Reset Instructions'}
            </button>

            <button 
              type="button" 
              onClick={onBackToLogin}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDefaultPasswordModal, setShowDefaultPasswordModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const {
    login,
    isLoading,
    isNotVerified,
    verificationToken,
    verify,
    error
  } = useAuth();

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Password requirements
  const passwordRequirements = [
    {
      text: "At least 8 characters",
      isMet: password.length >= 8
    },
    {
      text: "At least one uppercase letter",
      isMet: /[A-Z]/.test(password)
    },
    {
      text: "At least one lowercase letter",
      isMet: /[a-z]/.test(password)
    },
    {
      text: "At least one number",
      isMet: /[0-9]/.test(password)
    },
    {
      text: "At least one special character",
      isMet: /[^A-Za-z0-9]/.test(password)
    }
  ];

  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    passwordRequirements.forEach(req => {
      if (req.isMet) strength++;
    });
    setPasswordStrength(strength);
  }, [password]);

  // Show modal when isNotVerified becomes true
  useEffect(() => {
    if (isNotVerified) {
      setShowDefaultPasswordModal(true);
    }
  }, [isNotVerified]);

  const handleRememberMe = (checked) => {
    setRememberMe(checked);
    
    if (checked && email) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
  };

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
    
    // Update stored email if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', newEmail);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Handle remember me functionality
    if (rememberMe && email) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }
    
    if (isNotVerified) {
      // For verification flow, ensure passwords match and meet strength requirements
      if (password !== confirmPassword) {
        return;
      }
      
      if (passwordStrength < 3) {
        return;
      }
      
      // Call verify with verificationToken and new password
      try {
        await verify(verificationToken, password);
      } catch (err) {
        // Error is handled by the auth context
      }
    } else {
      // Normal login flow
      try {
        await login(email, password);
      } catch (err) {
        // Error is handled by the auth context
      }
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "text-red-600";
    if (passwordStrength <= 4) return "text-yellow-600";
    return "text-green-600";
  };

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600 to-violet-600 transform -skew-y-6 z-0" />
        <div className="relative z-10">
          <ForgotPassword 
            onBackToLogin={() => setShowForgotPassword(false)}
            onResetSuccess={() => setShowForgotPassword(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600 to-violet-600 transform -skew-y-6 z-0" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-8">
            {isNotVerified ? <KeyRound className="w-12 h-12 text-blue-600" /> : <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isNotVerified ? "Set Your Password" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isNotVerified ? "Your account was created with a temporary password. Please set a new password to access the admin portal." : "Sign in to your admin dashboard"}
          </p>
        </div>
        <div className="mt-8">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 space-y-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <div className="rounded-md bg-red-50 p-4 animate-shake">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>}
              
              {!isNotVerified && <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      autoComplete="email" 
                      required 
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm" 
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={e => handleEmailChange(e.target.value)} 
                    />
                  </div>
                </div>}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {isNotVerified ? 'New Password' : 'Password'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete={isNotVerified ? "new-password" : "current-password"} 
                    required 
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      isNotVerified && password ? 
                        (passwordStrength >= 3 ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500') : 
                        'border-gray-300 focus:ring-blue-500'
                    } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm`}
                    placeholder={isNotVerified ? "Enter your new password" : "Enter your password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />}
                  </button>
                </div>
                
                {isNotVerified && password && (
                  <>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm">Password strength:</span>
                      <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <PasswordStrengthMeter strength={passwordStrength} />
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {passwordRequirements.map((req, index) => (
                        <PasswordRequirement 
                          key={index}
                          text={req.text}
                          isMet={req.isMet}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {isNotVerified && <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      autoComplete="new-password" 
                      required 
                      className={`block w-full pl-10 pr-10 py-2 border ${
                        confirmPassword ? 
                          (passwordsMatch ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500') : 
                          'border-gray-300 focus:ring-blue-500'
                      } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm`}
                      placeholder="Confirm your new password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />}
                    </button>
                    
                    {confirmPassword && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        {passwordsMatch ? 
                          <CheckCircle className="text-green-500" size={18} /> : 
                          <XCircle className="text-red-500" size={18} />
                        }
                      </div>
                    )}
                  </div>
                  
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
                  )}
                </div>}
              
              {!isNotVerified && <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input 
                      id="remember-me" 
                      name="remember-me" 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => handleRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button 
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>}
              
              <div>
                <button 
                  type="submit" 
                  disabled={isLoading || (isNotVerified && (password !== confirmPassword || passwordStrength < 3))} 
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isNotVerified && (password !== confirmPassword || passwordStrength < 3)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      {isNotVerified ? 'Setting password...' : 'Signing in...'}
                    </span>
                  ) : isNotVerified ? 'Set Password & Continue' : 'Sign in'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Need help?
                  </span>
                </div>
              </div>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">
                  Contact system administrator or{' '}
                </span>
                <a href="mailto:support@theaurabrand.co" className="font-medium text-blue-600 hover:text-blue-500">
                  send us an email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={showDefaultPasswordModal} 
        onClose={() => setShowDefaultPasswordModal(false)}
        onContinue={() => setShowDefaultPasswordModal(false)}
      />
    </div>
  );
}