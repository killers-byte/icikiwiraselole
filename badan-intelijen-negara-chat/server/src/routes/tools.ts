import { Router } from 'express';
import { osintEngine } from '../services/osint.js';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const OUTPUT_DIR = path.join(process.cwd(), 'output');

// ==========================================
// TOOL 1: PHONE TRACKER
// ==========================================
router.post('/track-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });

    const data = await osintEngine.trackPhone(phone);
    res.json({ tool: 'PHONE_TRACKER', codename: 'SIGNAL_TRACE', status: 'SUCCESS', data });
  } catch (error) {
    res.status(500).json({ tool: 'PHONE_TRACKER', codename: 'SIGNAL_TRACE', status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown' });
  }
});

// ==========================================
// TOOL 2: EMAIL TRACKER
// ==========================================
router.post('/track-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const data = await osintEngine.trackEmail(email);
    res.json({ tool: 'EMAIL_TRACKER', codename: 'INBOX_SHADOW', status: 'SUCCESS', data });
  } catch (error) {
    res.status(500).json({ tool: 'EMAIL_TRACKER', codename: 'INBOX_SHADOW', status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown' });
  }
});

// ==========================================
// TOOL 3: SOCIAL TRACKER
// ==========================================
router.post('/track-social', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const data = await osintEngine.trackSocialMedia(username);
    res.json({ tool: 'SOCIAL_TRACKER', codename: 'GHOST_PROFILE', status: 'SUCCESS', data });
  } catch (error) {
    res.status(500).json({ tool: 'SOCIAL_TRACKER', codename: 'GHOST_PROFILE', status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown' });
  }
});

// ==========================================
// TOOL 4: DOMAIN INTEL
// ==========================================
router.post('/track-domain', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain required' });

    const data = await osintEngine.trackDomain(domain);
    res.json({ tool: 'DOMAIN_INTELLIGENCE', codename: 'DNS_PHANTOM', status: 'SUCCESS', data });
  } catch (error) {
    res.status(500).json({ tool: 'DOMAIN_INTELLIGENCE', codename: 'DNS_PHANTOM', status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown' });
  }
});

// ==========================================
// TOOL 5: PERSON SEARCH
// ==========================================
router.post('/search-person', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    const data = await osintEngine.searchPerson(query);
    res.json({ tool: 'PERSON_SEARCH', codename: 'IDENTITY_HUNTER', status: 'SUCCESS', data });
  } catch (error) {
    res.status(500).json({ tool: 'PERSON_SEARCH', codename: 'IDENTITY_HUNTER', status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown' });
  }
});

// ==========================================
// TOOL 6: INDONESIA BREACH SCANNER (REAL)
// ==========================================
router.post('/check-breaches', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required (NIK, email, phone, name, or sector)' });

    const data = await osintEngine.scanIndonesiaBreaches(query);

    res.json({
      tool: 'INDONESIA_BREACH_SCANNER',
      codename: 'DATA_GRAVE',
      status: 'SUCCESS',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      tool: 'INDONESIA_BREACH_SCANNER',
      codename: 'DATA_GRAVE',
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown',
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// FILE DOWNLOAD ENDPOINT
// ==========================================
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Security: cek file ada dan di dalam output dir
    const realPath = path.resolve(filepath);
    const realOutputDir = path.resolve(OUTPUT_DIR);
    
    if (!realPath.startsWith(realOutputDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    const ext = path.extname(filename);
    let contentType = 'application/octet-stream';
    
    if (ext === '.json') contentType = 'application/json';
    else if (ext === '.csv') contentType = 'text/csv';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.zip') contentType = 'application/zip';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileBuffer = await fs.readFile(filepath);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Download failed', details: error instanceof Error ? error.message : 'Unknown' });
  }
});

// ==========================================
// TOOL 7: PENTEST ASSISTANT
// ==========================================
router.post('/pentest-assist', async (req, res) => {
  const { target, scope } = req.body;
  
  res.json({
    tool: 'PENTEST_ASSISTANT',
    codename: 'GHOST_PROTOCOL',
    target,
    scope,
    checklist: {
      reconnaissance: ['WHOIS lookup & DNS enumeration', 'Subdomain enumeration (amass, subfinder)', 'Port scanning (nmap -sV -sC)', 'Technology fingerprinting (wappalyzer, whatweb)'],
      scanning: ['Nmap comprehensive scan: nmap -p- -sV -sC -O --script=vuln', 'Nikto web scan', 'Dirb/Gobuster directory brute force', 'SSL/TLS analysis (testssl.sh)'],
      exploitation: ['Check for SQLi in all input vectors', 'Test XSS (stored, reflected, DOM)', 'CSRF token validation', 'JWT token analysis', 'File upload restrictions bypass'],
      post_exploitation: ['Privilege escalation vectors', 'Credential harvesting', 'Lateral movement paths', 'Persistence mechanisms']
    },
    generated_commands: [
      `nmap -sV -sC -p- ${target}`,
      `nikto -h ${target}`,
      `gobuster dir -u http://${target} -w /usr/share/wordlists/dirb/common.txt`,
      `sqlmap -u "http://${target}/page.php?id=1" --batch --risk=3 --level=5`
    ],
    note: 'All commands must be run against systems you own or have explicit written permission to test.'
  });
});

// ==========================================
// TOOL 8: CODE ANALYZER
// ==========================================
router.post('/code-analyzer', async (req, res) => {
  const { code, language } = req.body;
  const vulnerabilities: any[] = [];
  
  const patterns: Record<string, any[]> = {
    javascript: [
      { pattern: /eval\s*\(/, severity: 'CRITICAL', issue: 'Eval usage detected - Code Injection risk' },
      { pattern: /innerHTML\s*=/, severity: 'HIGH', issue: 'XSS via innerHTML' },
      { pattern: /document\.write\s*\(/, severity: 'MEDIUM', issue: 'Potential XSS' },
      { pattern: /new\s+Function\s*\(/, severity: 'HIGH', issue: 'Dynamic code execution' },
      { pattern: /password\s*=\s*['"][^'"]+['"]/, severity: 'HIGH', issue: 'Hardcoded credential' }
    ],
    python: [
      { pattern: /exec\s*\(/, severity: 'CRITICAL', issue: 'Exec usage - Code Injection' },
      { pattern: /eval\s*\(/, severity: 'CRITICAL', issue: 'Eval usage - Code Injection' },
      { pattern: /subprocess\.\w+.*shell\s*=\s*True/, severity: 'HIGH', issue: 'Shell injection risk' },
      { pattern: /pickle\.loads/, severity: 'HIGH', issue: 'Insecure deserialization' },
      { pattern: /input\s*\(/, severity: 'MEDIUM', issue: 'Unsafe input in Python 2' }
    ],
    sql: [
      { pattern: /\+\s*.*\+\s*.*(SELECT|INSERT|UPDATE|DELETE)/i, severity: 'CRITICAL', issue: 'SQL Injection - String concatenation' },
      { pattern: /EXEC\s*\(/i, severity: 'CRITICAL', issue: 'Dynamic SQL execution' }
    ]
  };

  const langPatterns = patterns[language as keyof typeof patterns] || [];
  
  for (const { pattern, severity, issue } of langPatterns) {
    if (pattern.test(code)) {
      vulnerabilities.push({ severity, issue, line: 'Detected in code block' });
    }
  }

  res.json({
    tool: 'CODE_ANALYZER',
    codename: 'BINARY_AUDIT',
    language,
    scan_timestamp: new Date().toISOString(),
    vulnerabilities_found: vulnerabilities.length,
    vulnerabilities,
    recommendations: [
      'Use parameterized queries for all database operations',
      'Implement Content Security Policy (CSP)',
      'Use AST-based static analysis (Semgrep, SonarQube) for production',
      'Never trust user input - validate and sanitize all data'
    ]
  });
});

// ==========================================
// TOOL 9: NETWORK RECON
// ==========================================
router.post('/network-recon', async (req, res) => {
  const { target, ports } = req.body;
  const commonPorts = ports || [80, 443, 22, 21, 3306, 5432, 8080, 8443];
  
  res.json({
    tool: 'NETWORK_RECON',
    codename: 'SPECTRE_SCAN',
    target,
    methodology: 'Use nmap for actual scanning',
    example_commands: [
      `nmap -sS -O ${target}`,
      `nmap -sV --script=banner ${target} -p ${commonPorts.join(',')}`,
      `masscan ${target} -p0-65535 --rate=1000`
    ],
    common_ports: commonPorts.map(port => ({
      port,
      service: getServiceName(port),
      risk: port === 22 ? 'SSH - Check for key auth' : 
            port === 3306 ? 'MySQL - Check for default creds' :
            port === 5432 ? 'PostgreSQL - Verify auth' : 'Standard service'
    })),
    disclaimer: 'Only scan networks you own or have explicit authorization to test.'
  });
});

function getServiceName(port: number): string {
  const services: Record<number, string> = {
    21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
    53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
    443: 'HTTPS', 3306: 'MySQL', 5432: 'PostgreSQL',
    8080: 'HTTP-Alt', 8443: 'HTTPS-Alt'
  };
  return services[port] || 'Unknown';
}

// ==========================================
// TOOL 10: AI AGENT
// ==========================================
router.post('/ai-agent', async (req, res) => {
  const { mission, parameters } = req.body;
  
  res.json({
    tool: 'AI_AGENT',
    codename: 'PHANTOM_EXECUTOR',
    agent_plan: {
      mission_id: `BIN-AGENT-${Date.now()}`,
      status: 'PLANNED',
      objective: mission,
      phases: [
        { phase: 1, name: 'RECONNAISSANCE', tasks: ['Gather target information', 'Identify attack surface', 'Map dependencies'], tools: ['OSINT_RECON', 'NETWORK_RECON'] },
        { phase: 2, name: 'ANALYSIS', tasks: ['Process collected data', 'Identify vulnerabilities', 'Prioritize targets'], tools: ['CODE_ANALYZER', 'PENTEST_ASSISTANT'] },
        { phase: 3, name: 'EXECUTION', tasks: ['Execute approved actions', 'Monitor results', 'Adapt strategy'], tools: ['AI_CORE', 'CUSTOM_SCRIPTS'] },
        { phase: 4, name: 'REPORTING', tasks: ['Compile findings', 'Generate evidence', 'Recommend remediation'], tools: ['REPORT_GENERATOR'] }
      ],
      parameters,
      autonomy_level: 'SUPERVISED',
      created_at: new Date().toISOString()
    },
    note: 'AI Agent operates under human supervision. All actions require authorization.'
  });
});

export default router;
