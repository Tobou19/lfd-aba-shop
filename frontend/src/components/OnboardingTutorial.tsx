import { useState, useEffect } from 'react';

interface TutorialStep {
  title: string;
  content: string;
  target?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Bienvenue sur ABA SHOP !',
    content: 'Cette application vous permet de gérer les commandes, les clients et les stocks des centres LFD-Services. Elle fonctionne même hors connexion !',
  },
  {
    title: 'Mode Hors Connexion',
    content: 'L\'application cache automatiquement les données essentielles. Vous pouvez continuer à travailler sans connexion internet. Les données seront synchronisées automatiquement.',
  },
  {
    title: 'Recherche Globale',
    content: 'Appuyez sur Ctrl+K (ou Cmd+K sur Mac) pour rechercher rapidement des produits, clients ou centres.',
  },
  {
    title: 'Raccourcis Clavier',
    content: 'Utilisez les raccourcis clavier pour gagner du temps. Cliquez sur le bouton "⌨️ Raccourcis" pour voir la liste complète.',
  },
  {
    title: 'Synchronisation',
    content: 'Les commandes et clients créés hors connexion sont automatiquement synchronisés quand la connexion revient. Vous pouvez voir le statut dans le tableau de bord.',
  },
  {
    title: 'Prêt à commencer !',
    content: 'Vous êtes maintenant prêt à utiliser l\'application. Connectez-vous avec vos identifiants pour commencer.',
  },
];

export const OnboardingTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tutorial
    const hasSeenTutorial = localStorage.getItem('aba_tutorial_seen');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('aba_tutorial_seen', 'true');
    setIsVisible(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#1E5C48' }}>{step.title}</h2>
          <p style={{ margin: 0, lineHeight: '1.6', color: '#333' }}>{step.content}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Passer
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ddd',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1E5C48',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {currentStep === tutorialSteps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '4px' }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: index === currentStep ? '#1E5C48' : '#ddd',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};