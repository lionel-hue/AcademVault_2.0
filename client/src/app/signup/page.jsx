// client/src/app/signup/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthService from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: 'student',
    fullName: '',
    email: '',
    institution: '',
    fieldOfStudy: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email.includes('@')) {
        alert('Please fill all required fields correctly');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.password.length < 6 || formData.password !== formData.confirmPassword) {
        alert('Password must be at least 6 characters and match confirmation');
        return;
      }
    }
    if (currentStep === 3 && !formData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await AuthService.signup(formData);
      if (result.success) {
        router.push('/dashboard');
      }
    } catch (error) {
      alert(error.message || 'Signup failed');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step active">
            <div className="form-group">
              <label htmlFor="userType">I am a</label>
              <div className="role-selector">
                {['student', 'teacher', 'researcher'].map(type => (
                  <div key={type}>
                    <input
                      type="radio"
                      name="userType"
                      id={`type${type.charAt(0).toUpperCase() + type.slice(1)}`}
                      value={type}
                      checked={formData.userType === type}
                      onChange={handleInputChange}
                      hidden
                    />
                    <label htmlFor={`type${type.charAt(0).toUpperCase() + type.slice(1)}`} className="role-option">
                      <i className={`fas fa-${type === 'student' ? 'graduation-cap' : type === 'teacher' ? 'chalkboard-teacher' : 'flask'}`}></i>
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="button" className="btn btn-primary btn-block" onClick={nextStep}>
              Continue <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        );

      case 2:
        return (
          <div className="form-step active">
            <div className="form-group">
              <label htmlFor="institution">
                <i className="fas fa-university"></i> Institution
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                placeholder="e.g., MIT, Stanford, etc."
                value={formData.institution}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fieldOfStudy">
                <i className="fas fa-book"></i> Field of Study
              </label>
              <select
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your field</option>
                <option value="computer-science">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="medicine">Medicine & Health Sciences</option>
                <option value="business">Business & Economics</option>
                <option value="natural-sciences">Natural Sciences</option>
                <option value="social-sciences">Social Sciences</option>
                <option value="humanities">Humanities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="step-navigation">
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Continue <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step active">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  required
                />
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
            </div>

            <div className="step-navigation">
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Continue <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step active">
            <div className="verification-step">
              <div className="verification-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <h3>Verify Your Email</h3>
              <p>We&apos;ve sent a verification code to:</p>
              <p className="verification-email">{formData.email}</p>
              
              <div className="verification-input">
                {[1,2,3,4,5,6].map(i => (
                  <input key={i} type="text" maxLength="1" className="code-input" />
                ))}
              </div>
              
              <div className="step-navigation">
                <button type="button" className="btn btn-outline" onClick={prevStep}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Verify Email
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-step active">
            <div className="welcome-step">
              <div className="welcome-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Welcome to AcademVault!</h3>
              <p>Your account has been successfully created.</p>
              
              <button 
                type="button" 
                className="btn btn-primary btn-block" 
                onClick={handleSubmit}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <h1>AcademVault</h1>
            </div>
            <h2>Create Account</h2>
            <p>Start your research journey with us</p>
          </div>

          <div className="signup-steps">
            <div className="step-indicator">
              {[1,2,3,4,5].map(step => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                  <div className="step-number">{step}</div>
                  <span className="step-label">
                    {step === 1 && 'Account'}
                    {step === 2 && 'Profile'}
                    {step === 3 && 'Terms'}
                    {step === 4 && 'Verify'}
                    {step === 5 && 'Complete'}
                  </span>
                </div>
              ))}
            </div>

            <div className="step-progress">
              <div className="progress-bar" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
            </div>
          </div>

          {renderStep()}

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}