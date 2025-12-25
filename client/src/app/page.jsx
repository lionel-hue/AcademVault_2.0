// client/src/app/page.jsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <h1>AcademVault</h1>
            </div>
            <h2>Welcome to AcademVault</h2>
            <p>Your intelligent research platform</p>
          </div>

          <div className="auth-options">
            <div className="option-card">
              <i className="fas fa-user-plus"></i>
              <h3>New to AcademVault?</h3>
              <p>Create an account to start your research journey</p>
              <Link href="/signup" className="btn btn-primary btn-block">
                Create Account
              </Link>
            </div>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="option-card">
              <i className="fas fa-sign-in-alt"></i>
              <h3>Already have an account?</h3>
              <p>Sign in to continue your research</p>
              <Link href="/login" className="btn btn-outline btn-block">
                Sign In
              </Link>
            </div>
          </div>

          <div className="auth-footer">
            <p className="terms">
              By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="feature">
            <i className="fas fa-search"></i>
            <h3>Intelligent Search</h3>
            <p>Discover research papers, videos, and articles with our advanced search engine</p>
          </div>
          <div className="feature">
            <i className="fas fa-users"></i>
            <h3>Collaborate</h3>
            <p>Connect with researchers worldwide and collaborate on groundbreaking projects</p>
          </div>
          <div className="feature">
            <i className="fas fa-folder-plus"></i>
            <h3>Organize</h3>
            <p>Create collections, tag resources, and manage your research efficiently</p>
          </div>
        </div>
      </div>
    </div>
  )
}