import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';

// Test de bout en bout du flux d'authentification contre une VRAIE base
// PostgreSQL (fournie par le service `postgres` du workflow CI, ou par
// `docker compose up postgres` en local). Couvre ce que les tests
// unitaires ne peuvent pas : le vrai schéma Prisma, la vraie contrainte
// d'unicité, le vrai cycle de vie d'une requête HTTP.
describe('Authentification (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const emailTest = 'e2e.caissier@lfd.test';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    const centre = await prisma.centre.upsert({
      where: { id: 'e2e-centre-douala' },
      update: {},
      create: {
        id: 'e2e-centre-douala',
        nom: 'Douala (test e2e)',
        adresse: 'Adresse test',
        pays: 'Cameroun',
        devise: 'FCFA',
      },
    });

    await prisma.utilisateur.upsert({
      where: { email: emailTest },
      update: {},
      create: {
        nomComplet: 'Caissier E2E',
        email: emailTest,
        motDePasseHash: await bcrypt.hash('MotDePasseValide123', 12),
        role: 'CAISSIER',
        centres: { create: [{ centreId: centre.id }] },
      },
    });
  });

  afterAll(async () => {
    await prisma.utilisateur.deleteMany({ where: { email: emailTest } });
    await prisma.centre.deleteMany({ where: { id: 'e2e-centre-douala' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('refuse un identifiant ou un mot de passe manquant (400)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifiant: emailTest })
      .expect(400);
  });

  it('refuse un mauvais mot de passe (401)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifiant: emailTest, motDePasse: 'mauvais-mot-de-passe' })
      .expect(401);
  });

  it('renvoie un jeton d\u2019accès pour des identifiants valides', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifiant: emailTest, motDePasse: 'MotDePasseValide123' })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('refuse l\u2019accès à une route protégée sans jeton (401)', () => {
    return request(app.getHttpServer()).get('/api/v1/centers').expect(401);
  });

  it('autorise l\u2019accès à une route protégée avec un jeton valide', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifiant: emailTest, motDePasse: 'MotDePasseValide123' });

    return request(app.getHttpServer())
      .get('/api/v1/centers')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
  });
});
