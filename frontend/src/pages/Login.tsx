import { useState, FormEvent } from 'react';
import { apiFetch, setAccessToken } from '../api/client';

export default function Login({ onLoggedIn }: { onLoggedIn: (role: string) => void }) {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifiant, motDePasse }),
      });
      setAccessToken(data.accessToken);
      onLoggedIn(data.role);
    } catch (err: any) {
      setErreur(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} placeholder="Email ou téléphone" />
      <input value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} type="password" placeholder="Mot de passe" />
      {erreur && <p role="alert">{erreur}</p>}
      <button type="submit">Se connecter</button>
    </form>
  );
}
