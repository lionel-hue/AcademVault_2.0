// client/src/app/components/UI/Illustration.jsx
export default function Illustration({ page = 'signup' }) {
  const getIllustration = () => {
    switch (page) {
      case 'signup':
        return (
          <div className="illustration-signup">
            <div className="relative w-full h-full max-w-lg mx-auto">
              <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple/20 rounded-full blur-xl"></div>
              
              <svg viewBox="0 0 400 400" className="relative z-10 w-full h-auto">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                
                {/* Academic cap */}
                <path d="M200,100 L300,150 L200,200 L100,150 Z" fill="url(#grad1)" opacity="0.8"/>
                <circle cx="200" cy="150" r="40" fill="url(#grad1)" opacity="0.6"/>
                
                {/* Graduation lines */}
                <path d="M150,200 L150,300" stroke="url(#grad1)" strokeWidth="3" fill="none"/>
                <path d="M200,200 L200,300" stroke="url(#grad1)" strokeWidth="3" fill="none"/>
                <path d="M250,200 L250,300" stroke="url(#grad1)" strokeWidth="3" fill="none"/>
                
                {/* Books */}
                <rect x="120" y="280" width="40" height="20" rx="2" fill="#10b981" opacity="0.7"/>
                <rect x="180" y="280" width="40" height="20" rx="2" fill="#f59e0b" opacity="0.7"/>
                <rect x="240" y="280" width="40" height="20" rx="2" fill="#ef4444" opacity="0.7"/>
                
                {/* Search icon */}
                <circle cx="320" cy="250" r="30" fill="none" stroke="url(#grad1)" strokeWidth="3"/>
                <line x1="340" y1="270" x2="380" y2="310" stroke="url(#grad1)" strokeWidth="3"/>
              </svg>
              
              <div className="text-center mt-8 px-4">
                <h3 className="text-xl font-bold text-white mb-3">Start Your Research Journey</h3>
                <p className="text-text-secondary">
                  Join thousands of researchers, students, and academics in our collaborative platform
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'login':
        return (
          <div className="illustration-login">
            <div className="relative w-full h-full max-w-lg mx-auto">
              <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-primary/15 rounded-full blur-2xl"></div>
              
              <svg viewBox="0 0 400 400" className="relative z-10 w-full h-auto">
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                
                {/* Shield/security */}
                <path d="M200,120 Q200,80 240,80 Q280,80 280,120 L280,200 Q280,240 240,280 L200,300 L160,280 Q120,240 120,200 L120,120 Q120,80 160,80 Q200,80 200,120" 
                      fill="url(#grad2)" opacity="0.7"/>
                
                {/* Lock */}
                <rect x="170" y="180" width="60" height="80" rx="10" fill="url(#grad2)" opacity="0.9"/>
                <circle cx="200" cy="200" r="15" fill="white" opacity="0.3"/>
                
                {/* Key lines */}
                <line x1="250" y1="220" x2="300" y2="220" stroke="url(#grad2)" strokeWidth="3"/>
                <circle cx="300" cy="220" r="10" fill="url(#grad2)"/>
              </svg>
              
              <div className="text-center mt-8 px-4">
                <h3 className="text-xl font-bold text-white mb-3">Secure Academic Access</h3>
                <p className="text-text-secondary">
                  Access millions of research papers with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="illustration-default">
            <div className="text-center">
              <i className="fas fa-graduation-cap text-8xl text-primary mb-6 opacity-80"></i>
              <h3 className="text-xl font-bold text-white mb-3">Academic Excellence</h3>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="illustration-container relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-primary to-bg-secondary p-8 border border-border-color">
      {getIllustration()}
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}