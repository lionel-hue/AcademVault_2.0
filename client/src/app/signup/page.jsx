// client/src/app/signup/page.jsx - UPDATED WITH VERIFICATION LINK FIX
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

const FIXED_CIRCLE_POSITIONS = [
  { cx: '10%', cy: '20%', delay: '0s' },
  { cx: '90%', cy: '80%', delay: '0.2s' },
  { cx: '50%', cy: '60%', delay: '0.4s' },
  { cx: '30%', cy: '40%', delay: '0.6s' },
  { cx: '70%', cy: '30%', delay: '0.8s' },
  { cx: '20%', cy: '70%', delay: '1s' },
  { cx: '80%', cy: '10%', delay: '1.2s' },
  { cx: '40%', cy: '50%', delay: '1.4s' },
];

export default function SignupPage() {
  const router = useRouter();
  const { alert, confirm, prompt } = useModal();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isClient, setIsClient] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [verificationMode, setVerificationMode] = useState('manual'); // 'manual' or 'link'
  const codeInputsRef = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'student',
    email: '',
    password: '',
    confirmPassword: '',
    registration_date: '',
    institution: '',
    department: '',
    phone: '',
    bio: '',
    termsAccepted: false
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setFormData(prev => ({
      ...prev,
      registration_date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  // NEW: Load form data from URL parameters if coming from verification link
  useEffect(() => {
    if (!isClient) return;

    const urlParams = new URLSearchParams(window.location.search);
    const verifyParam = urlParams.get('verify');
    const emailParam = urlParams.get('email');
    const codeParam = urlParams.get('code');

    if (verifyParam === '1' && emailParam && codeParam) {
      console.log('📧 Verification link detected:', { emailParam, codeParam });

      // Check if we have saved form data for this email
      const savedData = localStorage.getItem(`academvault_signup_${emailParam}`);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('📦 Found saved form data for email:', emailParam);

          // Set all form data from saved data
          setFormData(prev => ({
            ...prev,
            ...parsedData,
            email: emailParam // Ensure email from link is used
          }));

          // Fill verification code
          const codeArray = codeParam.split('').slice(0, 6);
          setVerificationCode(codeArray);

          // Set verification mode to 'link' and skip to verification step
          setVerificationMode('link');
          setVerificationSent(true);
          setCurrentStep(5);

          // Auto-verify after short delay if we have full code
          if (codeArray.length === 6) {
            console.log('✅ Auto-verifying with code from link');

            // Small delay to ensure state is updated
            setTimeout(() => {
              handleVerifyEmail();
            }, 1500);
          }
          return;
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }

      // If no saved data, just pre-fill email and code
      console.log('⚠️ No saved form data found, pre-filling email and code only');
      setFormData(prev => ({
        ...prev,
        email: emailParam
      }));

      const codeArray = codeParam.split('').slice(0, 6);
      setVerificationCode(codeArray);

      // Show info and ask user to complete registration
      alert({
        title: 'Complete Your Registration',
        message: `We found your verification code for ${emailParam}. Please complete the registration form to create your account.`,
        variant: 'info',
        confirmText: 'Continue'
      }).then(() => {
        // Stay at step 1 to complete form
        setVerificationMode('link');
        setVerificationSent(true);
        setCurrentStep(1);
      });
    }

    setFormDataLoaded(true);
  }, [isClient, alert, handleVerifyEmail]);

  // Save form data to localStorage with email as key
  useEffect(() => {
    if (!isClient || !formData.email || !formDataLoaded) return;

    // Save form data with email as identifier
    const dataToSave = {
      name: formData.name,
      type: formData.type,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      registration_date: formData.registration_date,
      institution: formData.institution,
      department: formData.department,
      phone: formData.phone,
      bio: formData.bio,
      termsAccepted: formData.termsAccepted
    };

    localStorage.setItem(`academvault_signup_${formData.email}`, JSON.stringify(dataToSave));
    console.log('💾 Saved form data for email:', formData.email);
  }, [formData, isClient, formDataLoaded]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        codeInputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const validateStep = async (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          await alert({
            title: 'Missing Information',
            message: 'Please enter your full name',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
          await alert({
            title: 'Invalid Email',
            message: 'Please enter a valid email address',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.institution.trim()) {
          await alert({
            title: 'Missing Information',
            message: 'Please enter your institution',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      case 3:
        if (formData.password.length < 8) {
          await alert({
            title: 'Weak Password',
            message: 'Password must be at least 8 characters long',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        if (passwordStrength < 50) {
          await alert({
            title: 'Weak Password',
            message: 'Please use a stronger password with uppercase, numbers, and special characters',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          await alert({
            title: 'Password Mismatch',
            message: 'Passwords do not match. Please try again.',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      case 4:
        if (!formData.termsAccepted) {
          await alert({
            title: 'Terms Required',
            message: 'Please accept the terms and conditions to continue',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);

      if (currentStep === 4) {
        await sendVerificationCode();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      const checkResult = await AuthService.checkEmail(formData.email);
      if (checkResult.data && checkResult.data.exists) {
        await alert({
          title: 'Email Already Exists',
          message: 'This email is already registered. Please use a different email or login.',
          variant: 'warning',
          confirmText: 'OK'
        });
        return;
      }

      const result = await AuthService.sendVerificationCode(formData.email);
      if (result.success) {
        setVerificationSent(true);
        setVerificationMode('manual');
        await alert({
          title: 'Verification Code Sent! ✅',
          message: `A 6-digit code has been sent to ${formData.email}. Please check your email (including spam folder).`,
          variant: 'success',
          confirmText: 'Got it'
        });
      }
    } catch (error) {
      console.error('Send verification error:', error);
      await alert({
        title: 'Failed to Send Code',
        message: error.message || 'Unable to send verification code. Please try again.',
        variant: 'danger',
        confirmText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = useCallback(async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      await alert({
        title: 'Incomplete Code',
        message: 'Please enter the complete 6-digit verification code',
        variant: 'warning',
        confirmText: 'Got it'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.verifyEmail(formData.email, code);
      if (result.success) {
        // If verification was successful via link, we already have the mode set
        if (verificationMode === 'link') {
          console.log('✅ Verification via link successful, proceeding to registration');
          await registerUser();
        } else {
          // Manual verification - show success and proceed
          await alert({
            title: 'Email Verified!',
            message: 'Your email has been verified successfully. Creating your account now...',
            variant: 'success',
            confirmText: 'Continue'
          });
          await registerUser();
        }
      }
    } catch (error) {
      console.error('Verify email error:', error);
      await alert({
        title: 'Verification Failed',
        message: error.message || 'Invalid verification code. Please try again.',
        variant: 'danger',
        confirmText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  }, [verificationCode, formData.email, verificationMode, alert, registerUser]);

  const registerUser = useCallback(async () => {
    const requiredFields = ['name', 'type', 'email', 'password', 'confirmPassword', 'registration_date'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (missingFields.length > 0) {
      await alert({
        title: 'Missing Information',
        message: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'warning',
        confirmText: 'Continue'
      });
      setCurrentStep(1);
      throw new Error('Missing required fields');
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        registration_date: formData.registration_date,
        institution: formData.institution || null,
        department: formData.department || null,
        phone: formData.phone || null,
        bio: formData.bio || null
      };

      console.log('📤 Registering user with data:', { ...userData, password: '***' });

      const result = await AuthService.register(userData);

      if (result.success) {
        console.log('✅ Registration successful:', result.data);

        // Clean up saved data
        localStorage.removeItem(`academvault_signup_${formData.email}`);
        localStorage.removeItem('academvault_signup_data');

        await alert({
          title: 'Registration Successful! 🎉',
          message: 'Your account has been created successfully. You can now login.',
          variant: 'success',
          confirmText: 'Go to Login'
        });

        // Clear any existing auth data and redirect
        AuthService.clearAuthData();
        router.push('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);

      if (error.message && error.message.includes('verify your email first')) {
        await alert({
          title: 'Verification Required',
          message: 'Please verify your email before registering. Check your email for the verification code.',
          variant: 'warning',
          confirmText: 'OK'
        });
        setVerificationSent(true);
        setCurrentStep(5);
      } else if (error.message && error.message.includes('email already registered')) {
        await alert({
          title: 'Email Already Registered',
          message: 'This email is already registered. Please login instead.',
          variant: 'info',
          confirmText: 'Go to Login'
        });
        router.push('/login');
      } else {
        await alert({
          title: 'Registration Failed',
          message: error.message || 'Unable to create account. Please try again.',
          variant: 'danger',
          confirmText: 'Try Again'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [formData, alert, router]);

  const resendVerificationCode = async () => {
    const confirmed = await confirm({
      title: 'Resend Verification Code?',
      message: `Send a new 6-digit code to ${formData.email}?`,
      variant: 'default'
    });

    if (confirmed) {
      await sendVerificationCode();
    }
  };

  const renderStep = () => {
    const steps = [
      { number: 1, title: 'Basic Info', icon: 'fas fa-user-circle' },
      { number: 2, title: 'Academic Info', icon: 'fas fa-university' },
      { number: 3, title: 'Security', icon: 'fas fa-lock' },
      { number: 4, title: 'Terms', icon: 'fas fa-file-contract' },
      { number: 5, title: 'Verify Email', icon: 'fas fa-envelope' }
    ];

    return (
      <div className="space-y-8">
        {/* Step Progress */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.number
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400'
                }`}>
                <i className={step.icon}></i>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 ${currentStep > step.number
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                  : 'bg-gray-800'
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    id: 'student',
                    icon: 'fas fa-graduation-cap',
                    label: 'Student',
                    desc: 'Access course materials and research'
                  },
                  {
                    id: 'teacher',
                    icon: 'fas fa-chalkboard-teacher',
                    label: 'Teacher',
                    desc: 'Share resources and collaborate'
                  },
                ].map((type) => (
                  <label key={type.id} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="type"
                      value={type.id}
                      checked={formData.type === type.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 group-hover:scale-105 ${formData.type === type.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${formData.type === type.id
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gray-700'
                        }`}>
                        <i className={`${type.icon} text-white text-lg`}></i>
                      </div>
                      <h4 className="font-bold text-white mb-2">{type.label}</h4>
                      <p className="text-sm text-gray-400">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-user text-blue-400"></i>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-envelope text-blue-400"></i>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@university.edu"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    required
                    readOnly={verificationSent && verificationMode === 'link'}
                  />
                  {verificationSent && verificationMode === 'link' && (
                    <p className="text-sm text-green-400 mt-2">
                      <i className="fas fa-check-circle mr-2"></i>
                      Email pre-filled from verification link
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 2 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Academic Information</h3>
              <div className="space-y-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-university text-blue-400"></i>
                    Institution *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="e.g., MIT, Stanford University"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <i className="fas fa-book text-blue-400"></i>
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science"
                      className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <i className="fas fa-phone text-blue-400"></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (123) 456-7890"
                      className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-info-circle text-blue-400"></i>
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your research interests, projects, or background..."
                    rows="3"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Account Security</h3>
              <div className="space-y-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-lock text-blue-400"></i>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password (min. 8 characters)"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    required
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Password strength</span>
                        <span className={`${passwordStrength >= 75 ? 'text-green-400' :
                          passwordStrength >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                          {passwordStrength >= 75 ? 'Strong' :
                            passwordStrength >= 50 ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength >= 75 ? 'bg-green-500' :
                            passwordStrength >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Include uppercase, numbers, and special characters for better security
                      </div>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-lock text-blue-400"></i>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat your password"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Terms */}
          {currentStep === 4 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Terms & Conditions</h3>
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-white mb-4">AcademVault Terms of Service</h4>
                <div className="space-y-3 text-gray-400 text-sm">
                  <p>Welcome to AcademVault! By creating an account, you agree to our terms:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>You will use the platform for academic purposes only</li>
                    <li>You respect intellectual property rights of others</li>
                    <li>You maintain the confidentiality of your account</li>
                    <li>You comply with all applicable laws and regulations</li>
                    <li>You are responsible for content you upload or share</li>
                  </ul>
                  <p className="mt-4">By checking the box below, you acknowledge that you have read and agree to these terms.</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700 cursor-pointer group hover:border-gray-600 transition-colors">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="sr-only"
                    required
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.termsAccepted
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent'
                    : 'border-gray-600 group-hover:border-gray-500'
                    }`}>
                    {formData.termsAccepted && (
                      <i className="fas fa-check text-white text-xs"></i>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-white">I agree to the Terms of Service and Privacy Policy *</span>
                  <p className="text-sm text-gray-400 mt-1">Required to create your account</p>
                </div>
              </label>
            </>
          )}

          {/* Step 5: Email Verification */}
          {currentStep === 5 && (
            <>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-envelope-open-text text-3xl text-blue-400"></i>
                </div>

                {verificationMode === 'link' ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-2">Verification Complete!</h3>
                    <p className="text-gray-400 mb-2">Your email has been verified:</p>
                    <p className="font-medium text-green-400 mb-8">{formData.email}</p>

                    <div className="flex justify-center gap-2 mb-8">
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <input
                          key={i}
                          ref={el => codeInputsRef.current[i] = el}
                          type="text"
                          maxLength="1"
                          value={verificationCode[i]}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-green-500/10 border-2 border-green-500 rounded-xl text-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                          readOnly
                        />
                      ))}
                    </div>

                    <p className="text-green-400 mb-4">
                      <i className="fas fa-check-circle mr-2"></i>
                      Code verified from email link
                    </p>

                    <button
                      onClick={() => handleVerifyEmail()}
                      disabled={loading}
                      className="w-full max-w-md mx-auto group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <i className="fas fa-check-circle ml-2"></i>
                        </>
                      )}
                    </button>
                  </>
                ) : verificationSent ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-2">Verify Your Email</h3>
                    <p className="text-gray-400 mb-2">Enter the 6-digit code sent to:</p>
                    <p className="font-medium text-blue-400 mb-8">{formData.email}</p>

                    <div className="flex justify-center gap-2 mb-8">
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <input
                          key={i}
                          ref={el => codeInputsRef.current[i] = el}
                          type="text"
                          maxLength="1"
                          value={verificationCode[i]}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(i, e)}
                          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleVerifyEmail}
                        disabled={loading || verificationCode.join('').length !== 6}
                        className="w-full max-w-md mx-auto group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify & Create Account
                            <i className="fas fa-check-circle ml-2"></i>
                          </>
                        )}
                      </button>

                      <button
                        onClick={resendVerificationCode}
                        disabled={loading}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
                      >
                        <i className="fas fa-redo mr-2"></i>
                        Resend verification code
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-4">Email Verification Required</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      We need to verify your email address before creating your account.
                      A 6-digit code will be sent to {formData.email}
                    </p>
                    <button
                      onClick={sendVerificationCode}
                      disabled={loading}
                      className="w-full max-w-md mx-auto group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Verification Code
                          <i className="fas fa-paper-plane ml-2"></i>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex gap-4 pt-6 border-t border-gray-800">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-700/50 transition-all duration-300"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${currentStep === 4
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 4 ? 'Register & Verify' : 'Continue'}
                  <i className="fas fa-arrow-right ml-2"></i>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Illustration */}
          <div className="order-2 lg:order-1 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>

              {/* Main Illustration Container */}
              <div className="relative bg-gray-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl overflow-hidden">
                {/* Registration Illustration */}
                <div className="relative h-80 mb-8">
                  {/* Floating Elements */}
                  <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl rotate-12 animate-float">
                    <i className="fas fa-user-plus absolute inset-0 flex items-center justify-center text-blue-400 text-xl"></i>
                  </div>

                  <div className="absolute top-24 right-12 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: '0.3s' }}>
                    <i className="fas fa-graduation-cap absolute inset-0 flex items-center justify-center text-purple-400 text-2xl"></i>
                  </div>

                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl flex items-center justify-center">
                      <i className="fas fa-check-circle text-white text-3xl"></i>
                    </div>
                  </div>

                  {/* Connecting Dots - FIXED POSITIONS */}
                  <svg className="absolute inset-0 w-full h-full">
                    {FIXED_CIRCLE_POSITIONS.map((pos, i) => (
                      <circle
                        key={i}
                        cx={pos.cx}
                        cy={pos.cy}
                        r="2"
                        fill="#3b82f6"
                        opacity="0.3"
                        className="animate-pulse"
                        style={{ animationDelay: pos.delay }}
                      />
                    ))}
                  </svg>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white mb-4">Join Our Academic Community</h4>

                  <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-database text-blue-400"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Secure Registration</h4>
                      <p className="text-sm text-gray-400">Your data is protected with encryption</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-green-400"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Email Verification</h4>
                      <p className="text-sm text-gray-400">Secure account with email confirmation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-rocket text-purple-400"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Quick Setup</h4>
                      <p className="text-sm text-gray-400">Get started in just 5 simple steps</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="order-1 lg:order-2 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl">
                    <i className="fas fa-graduation-cap text-white text-xl"></i>
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AcademVault
                </h1>
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                Create Your Account
                <div className="text-lg font-normal text-gray-400 mt-2">
                  Join our research community in {currentStep === 5 ? 'final verification' : `${5 - currentStep} more step${5 - currentStep === 1 ? '' : 's'}`}
                </div>
              </h2>
            </div>

            {/* Form Container */}
            <div className="auth-card bg-gray-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
              {renderStep()}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-center text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign In
                  </Link>
                </p>
                <p className="text-center text-gray-500 text-sm mt-2">* Required fields</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}