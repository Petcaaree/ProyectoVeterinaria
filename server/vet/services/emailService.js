import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import logger from '../utils/logger.js';

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

// ─── Layout base HTML ───────────────────────────────────────────────

function wrapTemplate(contenido) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 28px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">
                🐾 PetConnect
            </h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Cuidamos a quienes más querés</p>
        </div>
        <div style="background: #f9fafb; padding: 30px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            ${contenido}
        </div>
        <div style="text-align: center; padding: 16px 0 0;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} PetConnect &mdash; Este email fue generado automáticamente, no respondas a este mensaje.
            </p>
        </div>
    </div>`;
}

function boton(texto, url) {
    return `
    <div style="text-align: center; margin: 28px 0;">
        <a href="${url}"
           style="background: #7c3aed; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 15px;">
            ${texto}
        </a>
    </div>`;
}

function separador() {
    return '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">';
}

// ─── Envío genérico ─────────────────────────────────────────────────

async function enviarEmail(to, subject, html) {
    const transport = getTransporter();

    if (!transport) {
        logger.info('=== EMAIL (dev mode) ===');
        logger.info(`Para: ${to}`);
        logger.info(`Asunto: ${subject}`);
        logger.info('========================');
        return;
    }

    await transport.sendMail({
        from: `"PetConnect" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });
    logger.info(`Email enviado: "${subject}" → ${to}`);
}

// ─── 0. RESET DE CONTRASEÑA ─────────────────────────────────────────

export async function enviarEmailResetPassword(email, token, nombreUsuario) {
    const resetLink = `${FRONTEND_URL}?reset-token=${token}`;

    const html = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${nombreUsuario},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
            Recibimos una solicitud para restablecer tu contraseña.
            Hacé clic en el siguiente botón para crear una nueva contraseña:
        </p>
        ${boton('Restablecer Contraseña', resetLink)}
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, podés ignorar este email.
        </p>
        ${separador()}
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
            <a href="${resetLink}" style="color: #7c3aed; word-break: break-all;">${resetLink}</a>
        </p>
    `);

    await enviarEmail(email, 'Restablecer tu contraseña - PetConnect', html);
}

// ─── 1. BIENVENIDA (registro) ───────────────────────────────────────

export async function enviarEmailBienvenida(email, nombreUsuario, tipoUsuario) {
    const roles = {
        cliente: 'dueño de mascota',
        veterinaria: 'clínica veterinaria',
        paseador: 'paseador',
        cuidador: 'cuidador'
    };
    const rol = roles[tipoUsuario] || tipoUsuario;

    const html = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">¡Bienvenido/a, ${nombreUsuario}! 🎉</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Tu cuenta como <strong>${rol}</strong> fue creada exitosamente en PetConnect.
        </p>
        <p style="color: #4b5563; line-height: 1.7;">
            Ya podés ingresar a la plataforma y ${tipoUsuario === 'cliente'
                ? 'buscar los mejores servicios para tu mascota.'
                : 'publicar tus servicios y empezar a recibir reservas.'}
        </p>
        ${boton('Ingresar a PetConnect', FRONTEND_URL)}
        ${separador()}
        <p style="color: #6b7280; font-size: 13px;">Si no creaste esta cuenta, podés ignorar este email.</p>
    `);

    await enviarEmail(email, '¡Bienvenido/a a PetConnect! 🐾', html);
}

// ─── 2. CONFIRMACIÓN DE RESERVA (al crear) ──────────────────────────

export async function enviarEmailReservaCreada(reserva) {
    const { cliente, servicioReservado, rangoFechas, horario, serviciOfrecido, mascota } = reserva;
    const fechaInicio = dayjs(rangoFechas.fechaInicio).format('DD/MM/YYYY');
    const fechaFin = dayjs(rangoFechas.fechaFin).format('DD/MM/YYYY');
    const nombreServicio = servicioReservado.nombreServicio || 'Servicio';
    const proveedor = servicioReservado.usuarioProveedor?.nombreUsuario || '';

    // Email al cliente
    const htmlCliente = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">Reserva creada con éxito ✅</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Hola <strong>${cliente.nombreUsuario}</strong>, tu reserva fue registrada correctamente.
        </p>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; font-weight: 600;">Servicio:</td><td style="padding: 6px 0;">${nombreServicio}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Proveedor:</td><td style="padding: 6px 0;">${proveedor}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Mascota:</td><td style="padding: 6px 0;">${mascota?.nombre || '-'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Fecha:</td><td style="padding: 6px 0;">${fechaInicio}${fechaInicio !== fechaFin ? ` al ${fechaFin}` : ''}</td></tr>
                ${horario ? `<tr><td style="padding: 6px 0; font-weight: 600;">Horario:</td><td style="padding: 6px 0;">${horario} hs</td></tr>` : ''}
                <tr><td style="padding: 6px 0; font-weight: 600;">Estado:</td><td style="padding: 6px 0;"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px;">PENDIENTE</span></td></tr>
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
            El proveedor debe confirmar tu reserva. Te notificaremos cuando haya una respuesta.
        </p>
        ${boton('Ver mis reservas', FRONTEND_URL)}
    `);

    // Email al proveedor
    const proveedorEmail = servicioReservado.usuarioProveedor?.email;
    const htmlProveedor = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">Nueva reserva recibida 📋</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Hola <strong>${proveedor}</strong>, recibiste una nueva solicitud de reserva.
        </p>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; font-weight: 600;">Cliente:</td><td style="padding: 6px 0;">${cliente.nombreUsuario}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Servicio:</td><td style="padding: 6px 0;">${nombreServicio}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Mascota:</td><td style="padding: 6px 0;">${mascota?.nombre || '-'} (${mascota?.tipo || '-'})</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Fecha:</td><td style="padding: 6px 0;">${fechaInicio}${fechaInicio !== fechaFin ? ` al ${fechaFin}` : ''}</td></tr>
                ${horario ? `<tr><td style="padding: 6px 0; font-weight: 600;">Horario:</td><td style="padding: 6px 0;">${horario} hs</td></tr>` : ''}
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Ingresá a PetConnect para confirmar o rechazar la reserva.</p>
        ${boton('Ver mis turnos', FRONTEND_URL)}
    `);

    await enviarEmail(cliente.email, 'Tu reserva fue creada - PetConnect', htmlCliente);
    if (proveedorEmail) {
        await enviarEmail(proveedorEmail, 'Nueva reserva recibida - PetConnect', htmlProveedor);
    }
}

// ─── 3. RESERVA ACEPTADA (confirmada) ───────────────────────────────

export async function enviarEmailReservaConfirmada(reserva) {
    const { cliente, servicioReservado, rangoFechas, horario } = reserva;
    const fechaInicio = dayjs(rangoFechas.fechaInicio).format('DD/MM/YYYY');
    const proveedor = servicioReservado.usuarioProveedor?.nombreUsuario || '';

    const html = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">¡Tu reserva fue confirmada! 🎉</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Hola <strong>${cliente.nombreUsuario}</strong>, <strong>${proveedor}</strong> confirmó tu reserva.
        </p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; font-weight: 600;">Servicio:</td><td style="padding: 6px 0;">${servicioReservado.nombreServicio || 'Servicio'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Fecha:</td><td style="padding: 6px 0;">${fechaInicio}</td></tr>
                ${horario ? `<tr><td style="padding: 6px 0; font-weight: 600;">Horario:</td><td style="padding: 6px 0;">${horario} hs</td></tr>` : ''}
                <tr><td style="padding: 6px 0; font-weight: 600;">Estado:</td><td style="padding: 6px 0;"><span style="background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px; font-size: 12px;">CONFIRMADA</span></td></tr>
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Te enviaremos un recordatorio antes de la cita.</p>
        ${boton('Ver mis reservas', FRONTEND_URL)}
    `);

    await enviarEmail(cliente.email, '¡Reserva confirmada! - PetConnect', html);
}

// ─── 4. RESERVA CANCELADA ───────────────────────────────────────────

export async function enviarEmailReservaCancelada(reserva, destinatarioEmail, destinatarioNombre, canceladoPor) {
    const { servicioReservado, rangoFechas, horario } = reserva;
    const fechaInicio = dayjs(rangoFechas.fechaInicio).format('DD/MM/YYYY');

    const html = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">Reserva cancelada ❌</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Hola <strong>${destinatarioNombre}</strong>, la siguiente reserva fue cancelada por el <strong>${canceladoPor}</strong>.
        </p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; font-weight: 600;">Servicio:</td><td style="padding: 6px 0;">${servicioReservado.nombreServicio || 'Servicio'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Fecha:</td><td style="padding: 6px 0;">${fechaInicio}</td></tr>
                ${horario ? `<tr><td style="padding: 6px 0; font-weight: 600;">Horario:</td><td style="padding: 6px 0;">${horario} hs</td></tr>` : ''}
                <tr><td style="padding: 6px 0; font-weight: 600;">Estado:</td><td style="padding: 6px 0;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px;">CANCELADA</span></td></tr>
            </table>
        </div>
        ${boton('Ir a PetConnect', FRONTEND_URL)}
    `);

    await enviarEmail(destinatarioEmail, 'Reserva cancelada - PetConnect', html);
}

// ─── 5. RECORDATORIO 24h / día de inicio ────────────────────────────

export async function enviarEmailRecordatorio(reserva, tipoRecordatorio) {
    const { cliente, servicioReservado, rangoFechas, horario } = reserva;
    const fechaInicio = dayjs(rangoFechas.fechaInicio).format('DD/MM/YYYY');
    const proveedor = servicioReservado.usuarioProveedor?.nombreUsuario || '';

    let titulo, subtitulo;
    if (tipoRecordatorio === 'cuidador-dia-inicio') {
        titulo = '¡Hoy comienza tu servicio de cuidado! 📅';
        subtitulo = `Tu mascota comienza el cuidado con <strong>${proveedor}</strong> hoy.`;
    } else {
        titulo = '¡Tu cita es pronto! ⏰';
        subtitulo = `Tu cita con <strong>${proveedor}</strong> es dentro de poco.`;
    }

    const html = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">${titulo}</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Hola <strong>${cliente.nombreUsuario}</strong>, ${subtitulo}
        </p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; font-weight: 600;">Servicio:</td><td style="padding: 6px 0;">${servicioReservado.nombreServicio || 'Servicio'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Proveedor:</td><td style="padding: 6px 0;">${proveedor}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Fecha:</td><td style="padding: 6px 0;">${fechaInicio}</td></tr>
                ${horario ? `<tr><td style="padding: 6px 0; font-weight: 600;">Horario:</td><td style="padding: 6px 0;">${horario} hs</td></tr>` : ''}
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Si necesitás cancelar, hacelo desde la plataforma con anticipación.</p>
        ${boton('Ver mis reservas', FRONTEND_URL)}
    `);

    await enviarEmail(cliente.email, `Recordatorio: ${servicioReservado.nombreServicio || 'tu cita'} - PetConnect`, html);
}

// ─── 6. CANCELACIÓN AUTOMÁTICA ──────────────────────────────────────

export async function enviarEmailCancelacionAutomatica(reserva, email, nombreUsuario, motivo) {
    const { servicioReservado, rangoFechas, horario } = reserva;
    const fechaInicio = dayjs(rangoFechas.fechaInicio).format('DD/MM/YYYY');

    const html = wrapTemplate(`
        <h2 style="color: #1f2937; margin-top: 0;">Reserva cancelada automáticamente ⚠️</h2>
        <p style="color: #4b5563; line-height: 1.7;">
            Hola <strong>${nombreUsuario}</strong>, tu reserva fue cancelada automáticamente.
        </p>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #92400e; margin: 0 0 12px; font-weight: 600;">Motivo: ${motivo}</p>
            <table style="width: 100%; font-size: 14px; color: #374151;">
                <tr><td style="padding: 6px 0; font-weight: 600;">Servicio:</td><td style="padding: 6px 0;">${servicioReservado.nombreServicio || 'Servicio'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Fecha:</td><td style="padding: 6px 0;">${fechaInicio}</td></tr>
                ${horario ? `<tr><td style="padding: 6px 0; font-weight: 600;">Horario:</td><td style="padding: 6px 0;">${horario} hs</td></tr>` : ''}
            </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Podés crear una nueva reserva desde la plataforma.</p>
        ${boton('Ir a PetConnect', FRONTEND_URL)}
    `);

    await enviarEmail(email, 'Reserva cancelada automáticamente - PetConnect', html);
}
