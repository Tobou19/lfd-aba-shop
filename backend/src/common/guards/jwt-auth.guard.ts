import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Valide le JWT d'accès sur chaque route protégée.
// Toute route de l'API doit être protégée par ce guard, sauf /auth/login et /auth/reset-password.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
