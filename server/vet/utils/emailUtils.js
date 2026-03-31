import nodemailer from 'nodemailer';
import logger from './logger.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        logger.warn('SMTP no configurado. Los emails se loguearan a consola.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host,
        port: parseInt(port || '587', 10),
        secure: port === '465',
        auth: { user, pass }
    });

    return transporter;
}

/**
 * Envía un email de reset de contraseña.
 * Si SMTP no está configurado, loguea el link a consola (útil en desarrollo).
 */
export async function enviarEmailResetPassword(email, token, nombreUsuario) {
    const resetLink = `${FRONTEND_URL}?reset-token=${token}`;

    const transport = getTransporter();

    if (!transport) {
        logger.info('=== EMAIL DE RESET DE CONTRASEÑA (dev mode) ===');
        logger.info(`Para: ${email}`);
        logger.info(`Usuario: ${nombreUsuario}`);
        logger.info(`Link de reset: ${resetLink}`);
        logger.info('================================================');
        return;
    }

    const mailOptions = {
        from: `"PetCare" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Restablecer tu contraseña - PetCare',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(to right, #2563eb, #7c3aed); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">PetCare</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Hola ${nombreUsuario},</h2>
                    <p style="color: #4b5563; line-height: 1.6;">
                        Recibimos una solicitud para restablecer tu contraseña.
                        Hacé clic en el siguiente botón para crear una nueva contraseña:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}"
                           style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                        Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, podés ignorar este email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
                        <a href="${resetLink}" style="color: #7c3aed; word-break: break-all;">${resetLink}</a>
                    </p>
                </div>
            </div>
        `
    };

    await transport.sendMail(mailOptions);
    logger.info('Email de reset de contraseña enviado', { email });
}
