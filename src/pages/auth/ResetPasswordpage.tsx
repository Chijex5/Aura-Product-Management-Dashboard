import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, KeyRound, Loader } from 'lucide-react';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface PasswordRequirement {
  text: string;
  isMet: boolean;
}

// Password strength meter component
const PasswordStrengthMeter = ({ strength }: {strength: number}) => {
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
const PasswordRequirement = ({ text, isMet }: { text: string; isMet: boolean }) => (
  <div className="flex items-center gap-2 text-sm">
    {isMet ? 
      <CheckCircle className="text-green-500" size={16} /> : 
      <AlertCircle className="text-gray-400" size={16} />
    }
    <span className={isMet ? "text-green-600" : "text-gray-500"}>{text}</span>
  </div>
);

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const { validateResetToken, changePassword, isLoading } = useAuth();
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Add a ref to track if verification has been attempted
  const verificationAttempted = useRef(false);

  // Password requirements
  const passwordRequirements = [
    {
      text: "At least 8 characters",
      isMet: formData.newPassword.length >= 8
    },
    {
      text: "At least one uppercase letter",
      isMet: /[A-Z]/.test(formData.newPassword)
    },
    {
      text: "At least one lowercase letter",
      isMet: /[a-z]/.test(formData.newPassword)
    },
    {
      text: "At least one number",
      isMet: /[0-9]/.test(formData.newPassword)
    },
    {
      text: "At least one special character",
      isMet: /[^A-Za-z0-9]/.test(formData.newPassword)
    }
  ];

  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    passwordRequirements.forEach(req => {
      if (req.isMet) strength++;
    });
    setPasswordStrength(strength);
  }, [formData.newPassword]);

  useEffect(() => {
    // If no token, redirect to home
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    // Validate token on component mount, but only once
    const validateToken = async () => {
      // Only verify if we haven't attempted verification yet
      if (verificationAttempted.current) return;
      
      // Mark that we've attempted verification
      verificationAttempted.current = true;
      
      try {
        setPageLoading(true);
        const result = await validateResetToken(token);
        if (result.success) {
          setIsTokenValid(true);
          setMessage('Please set your new password to continue');
        } else {
          setError(result.error || 'Invalid or expired token');
          setTimeout(() => navigate('/', { replace: true }), 5000);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during verification');
        setTimeout(() => navigate('/', { replace: true }), 5000);
      } finally {
        setPageLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, validateResetToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    
    // Validate passwords match and meet requirements
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (passwordStrength < 3) {
      setError("Password doesn't meet minimum strength requirements");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      const result = await changePassword(formData.newPassword, token);
      if (result.success) {
        setMessage(result.message || 'Password successfully updated!');
        setHasChanged(true);     
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing your password');
    } finally {
      setIsSubmitting(false);
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

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600 to-violet-600 transform -skew-y-6 z-0" />
        <div className="relative z-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-8">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verifying Reset Token...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we validate your request.
          </p>
        </div>
      </div>
    );
  }

  // Error state (invalid token)
  if (!isTokenValid && !pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600 to-violet-600 transform -skew-y-6 z-0" />
        <div className="relative z-10">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-8">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This password reset link is invalid or has expired.
              </p>
            </div>
            
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error || 'The reset link you used is invalid or has expired.'}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Redirecting you back to the login page...
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success message display
  if (message && !error && !isSubmitting && hasChanged) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600 to-violet-600 transform -skew-y-6 z-0" />
        <div className="relative z-10">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-8">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Password Updated!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been successfully changed.
              </p>
            </div>
            
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-green-50 p-4 mb-6">
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
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Redirecting you to the login page...
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-blue-600 to-violet-600 transform -skew-y-6 z-0" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-8">
            <KeyRound className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below to reset your account access.
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 animate-shake">
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

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  id="newPassword" 
                  name="newPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  required 
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    formData.newPassword ? 
                      (passwordStrength >= 3 ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500') : 
                      'border-gray-300 focus:ring-blue-500'
                  } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm`}
                  placeholder="Enter your new password" 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  }
                </button>
              </div>
              
              {formData.newPassword && (
                <>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm">Password strength:</span>
                    <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <PasswordStrengthMeter strength={passwordStrength} />
                  
                  <div className="grid grid-cols-1 gap-2 mt-3">
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  required 
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    formData.confirmPassword ? 
                      (passwordsMatch ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500') : 
                      'border-gray-300 focus:ring-blue-500'
                  } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm`}
                  placeholder="Confirm your new password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  }
                </button>
                
                {formData.confirmPassword && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? 
                      <CheckCircle className="text-green-500" size={18} /> : 
                      <XCircle className="text-red-500" size={18} />
                    }
                  </div>
                )}
              </div>
              
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
              )}
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isSubmitting || !passwordsMatch || passwordStrength < 3 || !formData.newPassword || !formData.confirmPassword} 
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting || !passwordsMatch || passwordStrength < 3 || !formData.newPassword || !formData.confirmPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Updating Password...
                  </span>
                ) : 'Update Password'}
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
  );
};

export default ResetPasswordPage;