import { useState } from 'react';
import Login from './pages/Login';

// Squelette minimal : après connexion, router vers le tableau de bord
// correspondant au rôle renvoyé par l'API (Caissier / Gestionnaire / Direction),
// en reprenant les écrans validés dans le prototype interactif.
export default function App() {
  const [role, setRole] = useState<string | null>(null);
  if (!role) return <Login onLoggedIn={setRole} />;
  return <p>Connecté en tant que {role} — brancher ici les écrans du prototype.</p>;
}
