// ==========================================
// TOOL 6: DARKWEB BREACH SCANNER (REAL)
// ==========================================
import { darkwebScanner } from '../services/osint.js';

router.post('/check-breaches', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query required (email, phone, username, NIK, etc)' });
    }

    // Jalankan full darkweb breach scan
    const data = await darkwebScanner.fullBreachScan(query);

    res.json({
      tool: 'DARKWEB_BREACH_SCANNER',
      codename: 'DATA_GRAVE',
      status: 'SUCCESS',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      tool: 'DARKWEB_BREACH_SCANNER',
      codename: 'DATA_GRAVE',
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});
