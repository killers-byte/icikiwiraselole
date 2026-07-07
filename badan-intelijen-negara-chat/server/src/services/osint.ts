import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);

const NUMVERIFY_KEY = process.env.NUMVERIFY_API_KEY || '1a9d41ba8ac64284bfb575f12ea38ed6';

export interface PhoneData {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string;
}

export interface EmailData {
  email: string;
  valid: boolean;
  disposable: boolean;
  domain: string;
  mx_records: string[];
  breaches: string[];
  patterns: {
    username: string;
    common_variants: string[];
  };
}

export interface SocialData {
  username: string;
  platforms: {
    name: string;
    url: string;
    exists: boolean;
    profile_data?: any;
  }[];
  related_accounts: string[];
  avatar_urls: string[];
}

export interface DomainData {
  domain: string;
  ip: string;
  dns_records: any[];
  whois: any;
  subdomains: string[];
  technologies: string[];
  ssl_info: any;
  http_headers: any;
}

export interface PersonData {
  query: string;
  possible_names: string[];
  possible_locations: string[];
  associated_emails: string[];
  associated_phones: string[];
  social_profiles: SocialData;
  public_records: any[];
  data_sources: string[];
}

class OSINTDatabase {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour

  private getCache(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  // ==========================================
  // MODULE 1: PHONE TRACKER (NumVerify + Enhanced)
  // ==========================================
  async trackPhone(phoneNumber: string): Promise<any> {
    const cacheKey = `phone:${phoneNumber}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // NumVerify API
      const numVerifyRes = await axios.get('http://apilayer.net/api/validate', {
        params: {
          access_key: NUMVERIFY_KEY,
          number: phoneNumber,
          country_code: '',
          format: 1
        },
        timeout: 10000
      });

      const phoneData: PhoneData = numVerifyRes.data;

      // Enhanced analysis
      const enhanced = {
        ...phoneData,
        risk_assessment: this.assessPhoneRisk(phoneData),
        carrier_info: await this.enhanceCarrierInfo(phoneData.carrier, phoneData.country_code),
        possible_locations: this.estimateLocations(phoneData),
        related_numbers: this.generateRelatedNumbers(phoneNumber),
        timestamp: new Date().toISOString(),
        source: 'NumVerify + BIN_OSINT_Engine'
      };

      this.setCache(cacheKey, enhanced);
      return enhanced;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`NumVerify API Error: ${error.response?.data?.error?.info || error.message}`);
      }
      throw error;
    }
  }

  private assessPhoneRisk(data: PhoneData): any {
    const risks = [];
    if (!data.valid) risks.push({ level: 'CRITICAL', reason: 'Invalid phone number format' });
    if (data.line_type === 'voip') risks.push({ level: 'MEDIUM', reason: 'VOIP number - easily spoofed' });
    if (data.line_type === 'special_services') risks.push({ level: 'HIGH', reason: 'Special service number' });
    if (!data.carrier || data.carrier === '') risks.push({ level: 'MEDIUM', reason: 'Unknown carrier' });
    
    return {
      score: risks.length === 0 ? 'LOW' : risks.length <= 2 ? 'MEDIUM' : 'HIGH',
      factors: risks,
      recommendation: risks.length > 0 ? 'Proceed with caution' : 'Standard verification'
    };
  }

  private async enhanceCarrierInfo(carrier: string, countryCode: string): Promise<any> {
    const carrierDatabase: Record<string, any> = {
      'AT&T': { type: 'Major US Carrier', coverage: 'Nationwide', prepaid: false },
      'Verizon': { type: 'Major US Carrier', coverage: 'Nationwide', prepaid: false },
      'T-Mobile': { type: 'Major US Carrier', coverage: 'Nationwide', prepaid: false },
      'Vodafone': { type: 'International', coverage: 'Europe/Asia/Africa', prepaid: true },
      'Orange': { type: 'International', coverage: 'Europe/Africa', prepaid: true },
      'Telefonica': { type: 'International', coverage: 'Europe/LatAm', prepaid: true },
    };

    return {
      name: carrier,
      ...carrierDatabase[carrier] || { type: 'Unknown', coverage: 'Unknown', prepaid: 'Unknown' },
      country: countryCode,
      lookup_date: new Date().toISOString()
    };
  }

  private estimateLocations(data: PhoneData): string[] {
    const locations = [data.location].filter(Boolean);
    
    const countryCityMap: Record<string, string[]> = {
      'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      'GB': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
      'ID': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'],
      'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
      'CN': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu'],
    };

    if (data.country_code && countryCityMap[data.country_code]) {
      locations.push(...countryCityMap[data.country_code].slice(0, 3));
    }

    return [...new Set(locations)];
  }

  private generateRelatedNumbers(phone: string): string[] {
    const clean = phone.replace(/\D/g, '');
    const variants = [];
    
    // Generate possible variants
    if (clean.length >= 10) {
      variants.push(
        `+1${clean.slice(-10)}`,
        `+44${clean.slice(-10)}`,
        `+62${clean.slice(-10)}`,
        `+91${clean.slice(-10)}`,
        `+86${clean.slice(-10)}`
      );
    }
    
    return variants.filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
  }

  // ==========================================
  // MODULE 2: EMAIL TRACKER & BREACH SCANNER
  // ==========================================
  async trackEmail(email: string): Promise<EmailData> {
    const cacheKey = `email:${email}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const [username, domain] = email.split('@');
    
    // Check MX records
    let mxRecords: string[] = [];
    try {
      mxRecords = await dnsResolve(domain, 'MX').catch(() => []);
    } catch {
      mxRecords = [];
    }

    // Check if disposable email
    const disposableDomains = [
      'tempmail.com', 'guerrillamail.com', '10minutemail.com',
      'mailinator.com', 'throwawaymail.com', 'yopmail.com',
      'sharklasers.com', 'getairmail.com', 'burnermail.io'
    ];

    const isDisposable = disposableDomains.some(d => domain.toLowerCase().includes(d));

    // Generate common username variants
    const variants = this.generateUsernameVariants(username);

    const result: EmailData = {
      email,
      valid: this.validateEmailFormat(email),
      disposable: isDisposable,
      domain,
      mx_records: mxRecords,
      breaches: [], // Would integrate HaveIBeenPwned API
      patterns: {
        username,
        common_variants: variants
      }
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private validateEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private generateUsernameVariants(username: string): string[] {
    const variants = [username];
    const clean = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    variants.push(
      clean,
      `${clean}123`,
      `${clean}official`,
      `${clean}_real`,
      `real_${clean}`,
      `${clean}2024`,
      `${clean}2025`,
      `the${clean}`,
      `${clean}official`,
      `its${clean}`
    );

    // Add common separators
    variants.push(
      clean.replace(/(.)(?=.)/g, '$1_'),
      clean.replace(/(.)(?=.)/g, '$1.'),
      clean.replace(/(.)(?=.)/g, '$1-')
    );

    return [...new Set(variants)].slice(0, 15);
  }

  // ==========================================
  // MODULE 3: SOCIAL MEDIA TRACKER
  // ==========================================
  async trackSocialMedia(username: string): Promise<SocialData> {
    const cacheKey = `social:${username}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const platforms = [
      { name: 'GitHub', url: `https://github.com/${username}`, checkField: 'login' },
      { name: 'Twitter/X', url: `https://twitter.com/${username}`, checkField: null },
      { name: 'Instagram', url: `https://instagram.com/${username}`, checkField: null },
      { name: 'Facebook', url: `https://facebook.com/${username}`, checkField: null },
      { name: 'LinkedIn', url: `https://linkedin.com/in/${username}`, checkField: null },
      { name: 'TikTok', url: `https://tiktok.com/@${username}`, checkField: null },
      { name: 'Reddit', url: `https://reddit.com/user/${username}`, checkField: null },
      { name: 'YouTube', url: `https://youtube.com/@${username}`, checkField: null },
      { name: 'Telegram', url: `https://t.me/${username}`, checkField: null },
      { name: 'Pinterest', url: `https://pinterest.com/${username}`, checkField: null },
    ];

    const results = await Promise.all(
      platforms.map(async (platform) => {
        try {
          const response = await axios.get(platform.url, {
            timeout: 5000,
            maxRedirects: 2,
            validateStatus: (status) => status < 500
          });

          const exists = response.status === 200;
          let profileData = null;

          // Try to extract profile data from HTML
          if (exists && response.headers['content-type']?.includes('text/html')) {
            const $ = cheerio.load(response.data);
            profileData = {
              title: $('title').text().trim(),
              description: $('meta[name="description"]').attr('content'),
              image: $('meta[property="og:image"]').attr('content'),
            };
          }

          return {
            name: platform.name,
            url: platform.url,
            exists,
            profile_data: profileData
          };
        } catch {
          return {
            name: platform.name,
            url: platform.url,
            exists: false,
            profile_data: null
          };
        }
      })
    );

    const foundProfiles = results.filter(r => r.exists);
    const relatedAccounts = foundProfiles.map(r => `${r.name}:${username}`);

    const result: SocialData = {
      username,
      platforms: results,
      related_accounts: relatedAccounts,
      avatar_urls: foundProfiles.map(r => r.profile_data?.image).filter(Boolean) as string[]
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ==========================================
  // MODULE 4: DOMAIN INTELLIGENCE
  // ==========================================
  async trackDomain(domain: string): Promise<DomainData> {
    const cacheKey = `domain:${domain}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // DNS lookup
    let ip = '';
    let dnsRecords: any[] = [];
    try {
      const lookup = await dnsLookup(domain);
      ip = lookup.address;
      dnsRecords = await dnsResolve(domain, 'ANY').catch(() => []);
    } catch {
      ip = 'Resolution failed';
    }

    // HTTP headers analysis
    let httpHeaders: any = {};
    let technologies: string[] = [];
    try {
      const response = await axios.get(`https://${domain}`, {
        timeout: 8000,
        maxRedirects: 3
      });
      httpHeaders = response.headers;
      
      // Detect technologies from headers
      if (response.headers['server']) technologies.push(response.headers['server']);
      if (response.headers['x-powered-by']) technologies.push(response.headers['x-powered-by']);
      if (response.data.includes('wp-content')) technologies.push('WordPress');
      if (response.data.includes('react')) technologies.push('React');
      if (response.data.includes('next.js')) technologies.push('Next.js');
      if (response.data.includes('vue')) technologies.push('Vue.js');
      if (response.data.includes('angular')) technologies.push('Angular');
    } catch {
      httpHeaders = { error: 'HTTPS connection failed' };
    }

    const result: DomainData = {
      domain,
      ip,
      dns_records: dnsRecords,
      whois: {
        note: 'Use whois-json library for full WHOIS data',
        domain,
        lookup_date: new Date().toISOString()
      },
      subdomains: this.generateCommonSubdomains(domain),
      technologies: [...new Set(technologies)],
      ssl_info: {
        note: 'Use ssl-checker library for full SSL analysis',
        domain
      },
      http_headers: httpHeaders
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private generateCommonSubdomains(domain: string): string[] {
    return [
      `www.${domain}`,
      `mail.${domain}`,
      `ftp.${domain}`,
      `admin.${domain}`,
      `api.${domain}`,
      `dev.${domain}`,
      `staging.${domain}`,
      `blog.${domain}`,
      `shop.${domain}`,
      `cdn.${domain}`,
      `app.${domain}`,
      `portal.${domain}`
    ];
  }

  // ==========================================
  // MODULE 5: PERSON SEARCH (Aggregated)
  // ==========================================
  async searchPerson(query: string): Promise<PersonData> {
    const cacheKey = `person:${query}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // Parse query type
    const isEmail = query.includes('@');
    const isPhone = /^[\d\s\+\-\(\)]+$/.test(query);
    const isDomain = query.includes('.') && !query.includes(' ');

    const result: PersonData = {
      query,
      possible_names: [],
      possible_locations: [],
      associated_emails: [],
      associated_phones: [],
      social_profiles: await this.trackSocialMedia(query.replace(/[@\s]/g, '')),
      public_records: [],
      data_sources: []
    };

    if (isEmail) {
      const emailData = await this.trackEmail(query);
      result.associated_emails.push(query);
      result.possible_names.push(emailData.patterns.username);
      result.data_sources.push('Email Analysis');
    }

    if (isPhone) {
      const phoneData = await this.trackPhone(query);
      result.associated_phones.push(query);
      result.possible_locations.push(...phoneData.possible_locations);
      result.data_sources.push('Phone Intelligence');
    }

    if (isDomain) {
      const domainData = await this.trackDomain(query);
      result.data_sources.push('Domain Intelligence');
    }

    if (!isEmail && !isPhone && !isDomain) {
      // Treat as username/name
      result.possible_names.push(query);
      result.data_sources.push('Username Search');
    }

    this.setCache(cacheKey, result);
    return result;
  }

  // ==========================================
  // MODULE 6: BREACH DATABASE SIMULATOR
  // ==========================================
  async checkBreaches(query: string, type: 'email' | 'phone' | 'username'): Promise<any> {
    // Simulated breach database - in production, integrate real APIs
    const simulatedBreaches: Record<string, any[]> = {
      'email': [
        { source: 'Collection#1', date: '2019-01-01', data_types: ['email', 'password'] },
        { source: 'Apollo.io', date: '2022-07-01', data_types: ['email', 'name', 'company'] },
      ],
      'phone': [
        { source: 'Facebook 2021', date: '2021-04-01', data_types: ['phone', 'name', 'location'] },
      ],
      'username': [
        { source: 'LinkedIn 2012', date: '2012-06-01', data_types: ['username', 'password_hash'] },
      ]
    };

    return {
      query,
      type,
      found_in_breaches: simulatedBreaches[type] || [],
      total_breaches: (simulatedBreaches[type] || []).length,
      recommendation: 'Change passwords immediately if found in breaches',
      note: 'This is a simulation framework. Integrate HaveIBeenPwned or DeHashed API for real data.'
    };
  }
}

export const osintEngine = new OSINTDatabase();
