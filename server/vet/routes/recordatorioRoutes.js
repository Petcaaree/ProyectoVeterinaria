import { Router } from "express";

const router = Router();

// Endpoint temporal para verificar recordatorios manualmente
router.get('/verificar-recordatorios', async (req, res) => {
    try {
        // Acceder al servicio de recordatorios desde el contexto global
        const recordatorioService = req.app.get('recordatorioService');
        
        if (!recordatorioService) {
            return res.status(500).json({ error: 'Servicio de recordatorios no disponible' });
        }

        const resultado = await recordatorioService.verificarRecordatoriosManual();
        
        res.json({ 
            success: true, 
            message: 'Verificación de recordatorios ejecutada',
            resultado: resultado
        });
    } catch (error) {
        console.error('Error en verificación manual de recordatorios:', error);
        res.status(500).json({ 
            error: 'Error al verificar recordatorios',
            details: error.message 
        });
    }
});

export default router;
