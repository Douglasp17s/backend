import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, getApp, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificacionesFirebaseService {
  private readonly logger = new Logger(NotificacionesFirebaseService.name);
  private firebaseInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ||
        path.join(process.cwd(), 'src/firebase-service-account.json');

      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.warn(`[Firebase] Archivo de credenciales no encontrado en: ${serviceAccountPath}`);
        this.firebaseInitialized = false;
        return;
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
      );

      if (!getApps().length) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      }

      this.firebaseInitialized = true;
      this.logger.log('[Firebase] Inicializado correctamente');
    } catch (error: any) {
      this.logger.error('[Firebase] Error al inicializar:', error.message);
      this.firebaseInitialized = false;
    }
  }

  async enviarNotificacion(
    fcmToken: string,
    titulo: string,
    mensaje: string,
    datos?: Record<string, string>
  ): Promise<string | null> {
    if (!this.firebaseInitialized || !fcmToken || !fcmToken.trim()) {
      this.logger.warn('[Firebase] No inicializado o token vacío');
      return null;
    }

    try {
      const messageId = await getMessaging().send({
        token: fcmToken,
        notification: {
          title: titulo,
          body: mensaje,
        },
        data: datos || {},
      });

      this.logger.log(`[Firebase] Notificación enviada: ${messageId}`);
      return messageId;
    } catch (error: any) {
      this.logger.error('[Firebase] Error al enviar:', error.message);
      return null;
    }
  }

  async enviarNotificacionMultiple(
    fcmTokens: string[],
    titulo: string,
    mensaje: string,
    datos?: Record<string, string>
  ): Promise<void> {
    if (!this.firebaseInitialized || !fcmTokens.length) {
      this.logger.warn('[Firebase] No inicializado o tokens vacíos');
      return;
    }

    try {
      const tokensValidos = fcmTokens.filter(t => t && t.trim());
      let enviadas = 0;
      let errores = 0;

      for (const token of tokensValidos) {
        try {
          await getMessaging().send({
            token,
            notification: {
              title: titulo,
              body: mensaje,
            },
            data: datos || {},
          });
          enviadas++;
        } catch (error: any) {
          errores++;
          this.logger.warn(`Error enviando a token ${token}: ${error.message}`);
        }
      }

      this.logger.log(
        `[Firebase] Notificaciones enviadas: ${enviadas}/${tokensValidos.length} (errores: ${errores})`
      );
    } catch (error: any) {
      this.logger.error('[Firebase] Error al enviar múltiple:', error.message);
    }
  }
}
