import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Coeur de l'isolation par centre exigée par le cahier des charges (§4.1, §12) :
// un Caissier ou un Gestionnaire ne doit jamais pouvoir lire ou modifier les
// données d'un centre auquel il n'est pas rattaché, y compris en changeant
// un identifiant de centre dans l'URL ou le corps de la requête.
// La Direction/CMB passe outre (accès consolidé).
@Injectable()
export class CenterScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;
    if (user.role === 'DIRECTION') return true;

    const requestedCenterId =
      req.params?.centerId || req.query?.centerId || req.body?.centreId;

    if (!requestedCenterId) return true;

    const autorise = (user.centreIds || []).includes(requestedCenterId);
    if (!autorise) {
      throw new ForbiddenException(
        "Accès refusé : ce centre n'est pas rattaché à votre compte.",
      );
    }
    return true;
  }
}
