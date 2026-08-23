import { useState, FormEvent, useEffect } from 'react';
import { apiFetch, setAccessToken } from '../api/client';

export default function Login({ onLoggedIn }: { onLoggedIn: (role: string) => void }) {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setIsLoading(true);

    console.log('Tentative de connexion avec:', identifiant);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifiant, motDePasse }),
      });
      
      console.log('Connexion réussie:', data);
      setAccessToken(data.accessToken);
      onLoggedIn(data.role);
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setErreur(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a2f1f 0%, #1E5C48 25%, #2E0854 75%, #0a2f1f 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Animated gradient orbs */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 92, 72, 0.4) 0%, transparent 60%)',
        top: '-300px',
        left: '-300px',
        animation: 'float 12s ease-in-out infinite',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46, 8, 84, 0.4) 0%, transparent 60%)',
        bottom: '-250px',
        right: '-250px',
        animation: 'float 15s ease-in-out infinite reverse',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 60%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'pulse 6s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: '50%',
            background: `rgba(255, 215, 0, ${Math.random() * 0.3 + 0.1})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(90deg); }
          50% { transform: translate(0, 0) rotate(180deg); }
          75% { transform: translate(-20px, 20px) rotate(270deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.3; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.5); }
        }
      `}</style>

      <div style={{
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(30px)',
        borderRadius: '32px',
        padding: '56px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: `
          0 30px 60px -12px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 0 60px rgba(30, 92, 72, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `,
        position: 'relative',
        zIndex: 1,
        animation: mounted ? 'slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        border: '1px solid rgba(255, 215, 0, 0.2)',
      }}>
        {/* Decorative top accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
          borderRadius: '0 0 4px 4px',
        }} />

        {/* Welcome Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #1E5C48 0%, #2E0854 50%, #1E5C48 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(30, 92, 72, 0.3), 0 0 0 4px rgba(255, 215, 0, 0.2)',
            animation: 'glow 3s ease-in-out infinite',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#FFD700',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}>LFD</span>
          </div>
          
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #1E5C48 0%, #2E0854 50%, #1E5C48 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}>
            Bienvenue
          </h1>
          
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1E5C48',
          }}>
            LFD-Services
          </p>
          
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#666',
            fontWeight: '400',
          }}>
            ABA SHOP • Connectez-vous pour continuer
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1E5C48',
              fontSize: '14px',
              letterSpacing: '0.3px',
            }}>
              Email ou téléphone
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="direction@lfd-services.com"
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 52px',
                  border: '2px solid #e8e8e8',
                  borderRadius: '16px',
                  fontSize: '15px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  background: '#fafafa',
                  letterSpacing: '0.3px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E5C48';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(30, 92, 72, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e8e8';
                  e.target.style.background = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
              <span style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                filter: 'grayscale(30%)',
              }}>📧</span>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#1E5C48',
              fontSize: '14px',
              letterSpacing: '0.3px',
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '16px 52px 16px 52px',
                  border: '2px solid #e8e8e8',
                  borderRadius: '16px',
                  fontSize: '15px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  background: '#fafafa',
                  letterSpacing: '0.3px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E5C48';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(30, 92, 72, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e8e8';
                  e.target.style.background = '#fafafa';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
              <span style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                filter: 'grayscale(30%)',
              }}>🔒</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '6px',
                  opacity: 0.5,
                  transition: 'all 0.2s',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.5';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {erreur && (
            <div style={{
              marginBottom: '24px',
              padding: '14px 18px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeInUp 0.3s ease-out',
            }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{erreur}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '18px',
              backgroundImage: isLoading 
                ? 'linear-gradient(135deg, #1E5C48 0%, #2E0854 100%)'
                : 'linear-gradient(135deg, #1E5C48 0%, #2E0854 50%, #1E5C48 100%)',
              backgroundSize: '200% 100%',
              backgroundPosition: '0% 0',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 24px rgba(30, 92, 72, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(30, 92, 72, 0.4)';
                e.currentTarget.style.backgroundPosition = '100% 0';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 92, 72, 0.3)';
                e.currentTarget.style.backgroundPosition = '0% 0';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Connexion en cours...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span>🚀</span>
                Se connecter
              </span>
            )}
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </button>

          <div style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#888',
            animation: 'fadeInUp 0.6s ease-out 0.5s both',
          }}>
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              Première connexion ?{' '}
              <a href="#" style={{
                color: '#1E5C48',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2E0854';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1E5C48';
              }}
              >
                Contactez l'administrateur
              </a>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '36px',
          paddingTop: '28px',
          borderTop: '1px solid #e8e8e8',
          textAlign: 'center',
          animation: 'fadeInUp 0.6s ease-out 0.6s both',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#888',
            marginBottom: '12px',
          }}>
            <span>📱</span>
            <span style={{ fontWeight: '500' }}>Scannez le QR code pour accéder à la boutique mobile</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#aaa',
            letterSpacing: '0.3px',
          }}>
            LFD-Services • ABA SHOP • v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
