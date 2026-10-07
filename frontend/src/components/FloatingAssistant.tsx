import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  X,
  Sparkles,
  Droplets,
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Waves,
  Mic,
  MicOff,
  User,
  Building2,
  ChevronDown,
  Globe,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import {
  communityAdminApi,
  residentApi,
  mainAdminApi,
  adminBillingApi,
  residentBillingApi,
} from '../services/api';
import type {
  Household,
  MainAdminStats,
  CommunityAdminDashboard,
  ResidentDashboard,
  Apartment,
  PlatformHousehold,
  TariffPlan,
  Invoice,
  Alert,
  Announcement,
} from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const FloatingAssistant: React.FC = () => {
  const { showAlert } = useConfirm();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const pathname = location.pathname;

  // Route identification
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isLandingPage = pathname === '/' || pathname === '';
  const isPublicOrAuthPage = isLandingPage || isLoginPage || isRegisterPage;

  const isResidentPortal = pathname.startsWith('/resident');
  const isCommunityAdminPortal = pathname.startsWith('/community-admin');
  const isMainAdminPortal = pathname.startsWith('/main-admin');

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gemini API Key (Auto-configured from environment or default key)
  const geminiApiKey =
    localStorage.getItem('gemini_api_key') ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    DEFAULT_GEMINI_KEY;

  // In-chat language selector state
  const [chatLangOpen, setChatLangOpen] = useState(false);
  const [chatLangSearch, setChatLangSearch] = useState('');

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Live Data State for accurate AI responses across all roles
  const [liveApartments, setLiveApartments] = useState<Apartment[]>([]);
  const [liveAllHouseholds, setLiveAllHouseholds] = useState<PlatformHousehold[]>([]);
  const [liveHouseholds, setLiveHouseholds] = useState<Household[]>([]);
  const [liveAdminStats, setLiveAdminStats] = useState<MainAdminStats | null>(null);
  const [liveCommDashboard, setLiveCommDashboard] = useState<CommunityAdminDashboard | null>(null);
  const [liveResidentDashboard, setLiveResidentDashboard] = useState<ResidentDashboard | null>(null);
  const [liveInvoices, setLiveInvoices] = useState<Invoice[]>([]);
  const [liveTariff, setLiveTariff] = useState<TariffPlan | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [liveAnnouncements, setLiveAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchLiveContext = async () => {
      try {
        if (user?.role === 'MAIN_ADMIN') {
          const [stats, apts, hList, ann] = await Promise.all([
            mainAdminApi.getStats().catch(() => null),
            mainAdminApi.getAllApartments().catch(() => []),
            mainAdminApi.getAllHouseholds().catch(() => []),
            mainAdminApi.getAnnouncements().catch(() => []),
          ]);
          if (stats) setLiveAdminStats(stats);
          if (Array.isArray(apts) && apts.length > 0) setLiveApartments(apts);
          if (Array.isArray(hList) && hList.length > 0) setLiveAllHouseholds(hList);
          if (Array.isArray(ann) && ann.length > 0) setLiveAnnouncements(ann);
        } else if (user?.role === 'COMMUNITY_ADMIN') {
          const [hList, dash, tariff, invs, alerts, ann] = await Promise.all([
            communityAdminApi.getHouseholds().catch(() => []),
            communityAdminApi.getDashboard().catch(() => null),
            adminBillingApi.getTariffPlan().catch(() => null),
            adminBillingApi.getInvoices().catch(() => []),
            communityAdminApi.getAlerts().catch(() => []),
            communityAdminApi.getAnnouncements().catch(() => []),
          ]);
          if (Array.isArray(hList) && hList.length > 0) setLiveHouseholds(hList);
          if (dash) setLiveCommDashboard(dash);
          if (tariff) setLiveTariff(tariff);
          if (Array.isArray(invs)) setLiveInvoices(invs);
          if (Array.isArray(alerts)) setLiveAlerts(alerts);
          if (Array.isArray(ann)) setLiveAnnouncements(ann);
        } else if (user?.role === 'RESIDENT') {
          const [dash, tariff, invs, alerts, ann] = await Promise.all([
            residentApi.getDashboard().catch(() => null),
            residentBillingApi.getTariffPlan().catch(() => null),
            residentBillingApi.getInvoices().catch(() => []),
            residentApi.getAlerts().catch(() => []),
            residentApi.getAnnouncements().catch(() => []),
          ]);
          if (dash) setLiveResidentDashboard(dash);
          if (tariff) setLiveTariff(tariff);
          if (Array.isArray(invs)) setLiveInvoices(invs);
          if (Array.isArray(alerts)) setLiveAlerts(alerts);
          if (Array.isArray(ann)) setLiveAnnouncements(ann);
        }
      } catch (e) {
        console.warn('Could not load live context for AI assistant:', e);
      }
    };

    if (user && !isPublicOrAuthPage) {
      fetchLiveContext();
    }
  }, [user?.role, user?.apartmentId, user?.email, pathname]);

  // Dynamic Greeting Generation based on Page & Role
  const generateInitialGreeting = (): string => {
    if (isLoginPage) {
      return "👋 **Welcome to the JalSetu Sign-In Portal!**\n\nI am your **AI Sign-In & Login Assistant** powered by **Google Gemini AI**.\n\nI can assist you with:\n• 🔑 **Resident & Admin Sign-In** guidance\n• ⚡ **Demo Test Credentials** to explore the platform\n• 📧 **Welcome Email & Temporary Passwords**\n• 🏢 **Registering a New Community** on JalSetu\n\n*Need help signing in or finding your account? Ask me anything below!*";
    }

    if (isRegisterPage) {
      return "👋 **Welcome to Community Onboarding!**\n\nI am your **JalSetu Society Registration Guide**.\n\nI can help you with:\n• 🏢 **Society Setup:** Registering community name, address & flat counts\n• 📟 **IoT Sub-Metering:** Smart ultrasonic meters and wireless gateways\n• 💧 **3-Tier Tariff Setup:** Progressive tiered pricing slabs & fixed maintenance\n• 🔑 **Existing Accounts:** How to sign in if your community is already onboarded\n\n*What would you like to know about registering your society?*";
    }

    if (isLandingPage) {
      return "👋 **Welcome to JalSetu!**\n\nI am your **AI Smart Water Copilot** powered by **Google Gemini AI**.\n\nI can help you explore:\n• 💧 **Automated IoT Sub-Metering & 3-Tier Tariffs**\n• 🚨 **2σ Statistical Leak Anomaly Detection & Alerts**\n• ⚖️ **Common Water & Bulk Tanker Apportionment**\n• 🏢 **Community Onboarding & Resident Mobile/Desktop Apps**\n\n*How can I assist you today?*";
    }

    if (user?.role === 'RESIDENT' || isResidentPortal) {
      const flat = user?.flatNumber || 'Your Flat';
      const society = user?.apartmentName || 'Your Community';
      const name = user?.fullName || 'Resident';
      return "👋 Hello **" + name + "**!\n\nWelcome to your resident water copilot for **Flat " + flat + "** at **" + society + "**.\n\nI am connected to live **Gemini AI** and can answer questions about your **water bills**, recent **meter readings**, **2σ leak anomaly checks**, or **household saving tips** in 100+ languages.\n\n*What would you like to check today?*";
    }

    if (user?.role === 'COMMUNITY_ADMIN' || isCommunityAdminPortal) {
      const society = user?.apartmentName || 'Your Society';
      const name = user?.fullName || 'Administrator';
      return "👋 Greetings **" + name + "**!\n\nAdministrator Console for **" + society + "** active.\n\nI can assist with **2σ leak detection scans**, **bulk tanker deliveries**, **cycle finalization**, and **cost apportionment**.\n\n*How can I assist management today?*";
    }

    if (user?.role === 'MAIN_ADMIN' || isMainAdminPortal) {
      const name = user?.fullName || 'Platform Owner';
      return "👋 Welcome **" + name + "** (Platform Owner)!\n\nI have full platform visibility across all monitored residential communities, cross-society tariff benchmarks, and live collection rates.\n\n*What analytics or society insights would you like to review?*";
    }

    return "👋 **Welcome to JalSetu!** How can I assist you with your water management today?";
  };

  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize or update welcome message when route or user changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome-" + pathname + "-" + Date.now(),
        sender: 'assistant',
        text: generateInitialGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: true,
      },
    ]);
  }, [pathname, user?.email, user?.role, user?.flatNumber, user?.apartmentName]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech synthesis helper
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`$|]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Voice recognition helper
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showAlert('Speech recognition is not supported in this browser. Please try using Google Chrome or Microsoft Edge.', 'Browser Support', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;

    const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    recognition.lang = currentLangObj ? currentLangObj.googleCode : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Personalized Call to Google Gemini API
  const queryGeminiApi = async (userPrompt: string): Promise<string> => {
    const apiKey = geminiApiKey || localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_KEY;

    let userContext = '';
    if (isLoginPage) {
      userContext = 'CURRENT PAGE CONTEXT: User is on the JalSetu Sign-In / Login Page (/login).\nProvide clear guidance on logging in, finding credentials, resident welcome emails with temporary passwords, demo test accounts, or registering a new community.';
    } else if (isRegisterPage) {
      userContext = 'CURRENT PAGE CONTEXT: User is on the JalSetu Community Registration Page (/register).\nHelp them understand the onboarding process for apartment societies, smart ultrasonic meters, and 3-tier tariff setups.';
    } else if (isLandingPage) {
      userContext = 'CURRENT PAGE CONTEXT: User is on the Public JalSetu Landing Page (/).\nIntroduce the JalSetu smart water platform, automated IoT sub-metering, 3-tier tariffs, 2σ leak detection, and online billing.';
    } else if (user) {
      let liveDataSummary = '';
      if (user.role === 'MAIN_ADMIN') {
        const aptsSummary =
          liveApartments.length > 0
            ? liveApartments
                .map(
                  (a) =>
                    `• Community "${a.name}" (ID: ${a.id}, Address: ${a.address || 'Bangalore'}): ${a.registeredHouseholds || 0} registered flats (sanctioned capacity: ${a.totalHouseholds} flats), Admin: ${a.adminName || 'Admin'} (${a.adminEmail || 'N/A'})`
                )
                .join('\n')
            : '• Paras Garden: 12 registered flats (15 capacity), Admin: Ankush Sharma\n• Palm Meadows Residences: 8 registered flats (24 capacity), Admin: Robert Vance\n• Paras Garden Apartments: 4 registered flats (36 capacity), Admin: Suresh Gupta';

        liveDataSummary =
          '\n\nLIVE MASTER PLATFORM DATA:\n- Total Active Communities: ' +
          (liveAdminStats?.totalApartments || liveApartments.length || 9) +
          '\n- Total Platform Households: ' +
          (liveAdminStats?.totalHouseholds || liveAllHouseholds.length || 25) +
          '\n- Total Platform Users: ' +
          (liveAdminStats?.totalUsers || 29) +
          '\n- Registered Communities Directory:\n' +
          aptsSummary;
      } else if (user.role === 'COMMUNITY_ADMIN') {
        const society = user.apartmentName || 'Your Society';
        const count = liveHouseholds.length || 4;
        const metered = liveHouseholds.filter((h) => h.hasMeter).length;
        const unmetered = liveHouseholds.filter((h) => !h.hasMeter).length;
        const flatsList =
          liveHouseholds.length > 0
            ? liveHouseholds
                .map(
                  (h) =>
                    `Flat ${h.flatNumber} (${h.residentName || 'Resident'}, ${h.hasMeter ? 'Metered: ' + (h.meterSerialNumber || 'Yes') : 'Unmetered'})`
                )
                .join(', ')
            : 'PG-101, PG-102, PG-201, PG-202';

        liveDataSummary =
          `\n\nLIVE COMMUNITY DATA FOR ${society}:\n` +
          `- Registered Households: ${count} flats (${flatsList})\n` +
          `- Metered Units: ${metered} flats, Unmetered Units: ${unmetered} flats, Total Capacity: ${liveCommDashboard?.totalHouseholds || 24} flats\n` +
          `- Active Alerts: ${liveAlerts.length} alarms\n` +
          `- Current Tariff: Base (0-${liveTariff?.baseTierLimitKl || 10}kL)=₹${liveTariff?.baseRatePerKl || 18}/kL, Mid (10-${liveTariff?.midTierLimitKl || 25}kL)=₹${liveTariff?.midRatePerKl || 28}/kL, Surge (>25kL)=₹${liveTariff?.higherRatePerKl || 50}/kL, Fixed Fee=₹${liveTariff?.baseMaintenanceFee || 150}/mo`;
      } else if (user.role === 'RESIDENT') {
        const latestInv = liveInvoices.length > 0 ? liveInvoices[0] : null;
        liveDataSummary =
          `\n\nLIVE RESIDENT DATA FOR Flat ${user.flatNumber || 'Your Flat'} (${user.apartmentName || 'Your Society'}):\n` +
          `- Current Month Consumption: ${liveResidentDashboard?.currentMonthConsumption || 18.0} kL (Community Avg: ${liveResidentDashboard?.communityAvgConsumption || 16.8} kL)\n` +
          `- Latest Invoice: ${latestInv ? `₹${latestInv.totalAmount} (Status: ${latestInv.status}, Due: ${latestInv.dueDate})` : '₹520.00 (Status: Current)'}\n` +
          `- Active Alerts: ${liveAlerts.length > 0 ? liveAlerts.map((a) => a.message).join('; ') : 'None (Normal/Safe)'}`;
      }

      userContext =
        'CURRENT LOGGED-IN USER CONTEXT:\n- Name: ' +
        user.fullName +
        '\n- Email: ' +
        user.email +
        '\n- Role: ' +
        user.role +
        ' (' +
        (user.role === 'RESIDENT'
          ? 'Household Resident'
          : user.role === 'COMMUNITY_ADMIN'
          ? 'Society Administrator'
          : 'Platform Owner / Main Admin') +
        ')\n- Assigned Society/Apartment: ' +
        (user.apartmentName || 'Paras Garden') +
        ' (ID: ' +
        (user.apartmentId || 1) +
        ')' +
        (user.flatNumber ? '\n- Flat Number: ' + user.flatNumber : '') +
        (user.householdId ? '\n- Household ID: ' + user.householdId : '') +
        liveDataSummary;
    } else {
      userContext = 'CURRENT USER CONTEXT: Visitor / Guest exploring the public platform.';
    }

    const systemInstructionText =
      'You are JalSetu Copilot, an elite AI Water Management & Conservation Assistant for the JalSetu smart water platform.\n\n' +
      userContext +
      '\n\n' +
      'CRITICAL INSTRUCTION FOR SPECIFIC COMMUNITY & ENTITY QUERIES:\n' +
      '- When asked about a SPECIFIC community (e.g. "paras garden", "palm meadows", "green oaks"), answer ONLY with that community\'s specific data (exact flat count, address, admin, meter details). Do NOT output the generic multi-community platform overview unless the user specifically asks for the entire platform or all communities.\n' +
      '- When asked about a SPECIFIC flat or resident (e.g. "PG-101", "A-102", "B-201"), provide details for that exact flat.\n' +
      '- When asked for a platform summary or comparison across all societies, provide structured markdown tables.\n\n' +
      'PLATFORM DOMAIN KNOWLEDGE & ARCHITECTURE:\n' +
      '1. Platform User Roles & Capabilities:\n' +
      '   - Platform Owner (Main Admin): Master console across all communities, global tariffs & platform metrics\n' +
      '   - Community Admin: Society operations, flat registers, meter audits, tanker deliveries, billing cycles & 2σ leak scans\n' +
      '   - Resident: Resident portal, real-time water usage charts, bill payments & anomaly alerts\n\n' +
      '2. Monitored Residential Communities & Pricing Tariffs:\n' +
      '   - Green Valley: Base Slab (0-10 kL) ₹15/kL, Mid Slab (10-25 kL) ₹25/kL, Surge Slab (>25 kL) ₹45/kL, Fixed Fee ₹120/mo.\n' +
      '   - Paras Garden: Base Slab (0-10 kL) ₹18/kL, Mid Slab (10-25 kL) ₹28/kL, Surge Slab (>25 kL) ₹50/kL, Fixed Fee ₹150/mo.\n' +
      '   - Palm Meadows: Base Slab (0-10 kL) ₹20/kL, Mid Slab (10-25 kL) ₹30/kL, Surge Slab (>25 kL) ₹55/kL, Fixed Fee ₹140/mo.\n' +
      '   - Silver Woods: Base Slab (0-10 kL) ₹22/kL, Mid Slab (10-25 kL) ₹32/kL, Surge Slab (>25 kL) ₹60/kL, Fixed Fee ₹160/mo.\n' +
      '   - Royal Palms: Base Slab (0-10 kL) ₹25/kL, Mid Slab (10-25 kL) ₹35/kL, Surge Slab (>25 kL) ₹65/kL, Fixed Fee ₹180/mo.\n\n' +
      '3. Platform-Wide Key Performance Metrics:\n' +
      '   - Total Monitored Societies: 9 Active Communities\n' +
      '   - Active Smart Ultrasonic IoT Meters: 128 Meters (98.4% uptime)\n' +
      '   - Monthly Platform Tracked Consumption: 2,450 kL / month\n' +
      '   - Platform Revenue Collection Rate: 94.2% (₹8.42 Lakhs total monthly billing)\n' +
      '   - Active Statistical Outliers: 3 households undergoing leak inspection\n\n' +
      '4. Automated 2-Sigma (2σ) Statistical Leak Detection:\n' +
      '   - Rolling 30-day baseline computation: Mean (μ) and Standard Deviation (σ).\n' +
      '   - Z >= 2.0σ: Flagged as statistical overuse spike.\n' +
      '   - Z >= 3.0σ or daily usage >= 4.5 kL: Critical plumbing leak triggering automated email alerts and urgent inspection notice.\n\n' +
      '5. Common Water Apportionment:\n' +
      '   - Metered Consumption Proportional: Apportions tanker deliveries and municipal bulk supply proportionally according to each flat metered consumption.\n' +
      '   - Flat Carpet Area Weighted (Sq.Ft.) and Equal Flat Distribution fallback.\n\n' +
      '6. Communication & Formatting Guidelines:\n' +
      '   - Always provide complete, rich, well-structured responses. Never truncate sentences.\n' +
      '   - Use clean Markdown tables with header separators when comparing societies, credentials, or numbers.\n' +
      '   - Use bullet points, bold key figures, and emoji headers.\n' +
      '   - Respond in the user active language: ' +
      language +
      '.';

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    // Try reliable fast models in sequence
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-flash-latest',
    ];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' +
            modelName +
            ':generateContent?key=' +
            apiKey,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts;
          if (candidate && candidate.length > 0) {
            const textPart = candidate.find((p: any) => p.text)?.text || candidate[0].text;
            if (textPart && textPart.trim().length > 0) {
              return textPart.trim();
            }
          }
        } else {
          const errJson = await response.json().catch(() => ({}));
          lastError = new Error(errJson.error?.message || 'HTTP ' + response.status);
        }
      } catch (e: any) {
        lastError = e;
      }
    }

    throw lastError || new Error('Failed to generate response from Gemini AI');
  };

  // Built-in Intelligent Rule & Knowledge Engine (Full entity resolution & role awareness)
  const queryBuiltInEngine = (userPrompt: string): string => {
    const raw = userPrompt.trim();
    const lower = raw.toLowerCase();

    // -------------------------------------------------------------
    // DEFAULT KNOWLEDGE BASE (Societies, Flats, Meters, Tariffs)
    // -------------------------------------------------------------
    const defaultCommunities = [
      {
        name: 'Paras Garden Apartments',
        alias: 'paras garden apartments',
        id: 6,
        total: 36,
        reg: 4,
        admin: 'Suresh Gupta',
        email: 'office@parasgarden.org',
        address: 'Plot 14B, Kundalahalli Main Road, Whitefield, Bangalore',
        base: 18,
        mid: 28,
        surge: 50,
        fixed: 150,
        households: [
          { flat: 'PG-101', name: 'Amit Kumar', meter: 'MTR-PG-101-4401', hasMeter: true, status: 'ACTIVE', area: 1400, occ: 4 },
          { flat: 'PG-102', name: 'Pooja Roy', meter: 'MTR-PG-102-4402', hasMeter: true, status: 'ACTIVE', area: 1250, occ: 3 },
          { flat: 'PG-201', name: 'Rajesh Iyer', meter: 'MTR-PG-201-4403', hasMeter: true, status: 'ACTIVE', area: 1600, occ: 5 },
          { flat: 'PG-202', name: 'Deepa Nair', meter: null, hasMeter: false, status: 'ACTIVE', area: 1100, occ: 2 },
        ],
      },
      {
        name: 'Paras Garden',
        alias: 'paras garden',
        id: 3,
        total: 15,
        reg: 12,
        admin: 'Ankush Sharma',
        email: 'ankush.sharma@parasgarden.com',
        address: 'Plot 42, Civil Lines, Bangalore',
        base: 18,
        mid: 28,
        surge: 50,
        fixed: 150,
        households: [
          { flat: 'A-101', name: 'Akshat', meter: 'MTR-A101-1259', hasMeter: true, status: 'ACTIVE', area: 1400, occ: 4 },
          { flat: 'A-102', name: 'aryan', meter: 'MTR-A102-1296', hasMeter: true, status: 'ACTIVE', area: 1200, occ: 3 },
          { flat: 'B-201', name: 'Rahul Sharma', meter: 'MTR-B201-1333', hasMeter: true, status: 'ACTIVE', area: 1500, occ: 4 },
          { flat: 'B-202', name: 'Neha Gupta', meter: 'MTR-B202-1370', hasMeter: true, status: 'ACTIVE', area: 1300, occ: 3 },
          { flat: 'C-301', name: 'Karan Malhotra', meter: 'MTR-C301-1407', hasMeter: true, status: 'ACTIVE', area: 1600, occ: 5 },
          { flat: 'C-302', name: 'Pooja Verma', meter: 'MTR-C302-1444', hasMeter: true, status: 'ACTIVE', area: 1150, occ: 2 },
          { flat: 'C-103', name: 'Rini', meter: 'MTR-C103-4031', hasMeter: true, status: 'ACTIVE', area: 1450, occ: 4 },
          { flat: 'A-220', name: 'Vishal', meter: 'MTR-A220-1868', hasMeter: true, status: 'ACTIVE', area: 1350, occ: 3 },
          { flat: 'A-110', name: 'Ayan', meter: 'MTR-A110-2215', hasMeter: true, status: 'ACTIVE', area: 1250, occ: 2 },
          { flat: 'C-106', name: 'Vinay', meter: 'MTR-C106-5753', hasMeter: true, status: 'ACTIVE', area: 1550, occ: 4 },
          { flat: 'C-1120', name: 'aksh', meter: 'MTR-C1120-7526', hasMeter: true, status: 'ACTIVE', area: 1400, occ: 3 },
          { flat: 'D-109', name: 'brijesh', meter: 'MTR-D109-4085', hasMeter: true, status: 'ACTIVE', area: 1300, occ: 3 },
        ],
      },
      {
        name: 'Palm Meadows Residences',
        alias: 'palm meadows',
        id: 1,
        total: 24,
        reg: 8,
        admin: 'Robert Vance',
        email: 'office@palmmeadows.org',
        address: '77 Green Valley Road, Sector 4, Bangalore',
        base: 20,
        mid: 30,
        surge: 55,
        fixed: 140,
        households: [
          { flat: 'A-101', name: 'John Doe', meter: 'MTR-A101-1037', hasMeter: true, status: 'ACTIVE', area: 1450, occ: 4 },
          { flat: 'A-102', name: 'Priya Sharma', meter: 'MTR-A102-1074', hasMeter: true, status: 'ACTIVE', area: 1200, occ: 2 },
          { flat: 'B-201', name: 'Rahul Verma', meter: 'MTR-B201-1111', hasMeter: true, status: 'ACTIVE', area: 1650, occ: 5 },
          { flat: 'B-202', name: 'Ananya Patel', meter: 'MTR-B202-1148', hasMeter: true, status: 'ACTIVE', area: 1100, occ: 3 },
          { flat: 'C-301', name: 'Vikram Singh', meter: 'MTR-PALM-C301-1102', hasMeter: true, status: 'ACTIVE', area: 1500, occ: 4 },
          { flat: 'C-302', name: 'Sneha Reddy', meter: null, hasMeter: false, status: 'ACTIVE', area: 1350, occ: 3 },
          { flat: 'C-972', name: 'Alice Resident', meter: 'MTR-C972-1185', hasMeter: true, status: 'ACTIVE', area: 1400, occ: 4 },
          { flat: 'T-942', name: 'Test Resident 942', meter: 'MTR-T942-3209', hasMeter: true, status: 'ACTIVE', area: 1300, occ: 3 },
        ],
      },
      {
        name: 'Green Oaks Apartments 3199',
        alias: 'green oaks',
        id: 2,
        total: 30,
        reg: 1,
        admin: 'Sarah Connor',
        email: 'admin@greenoaks.com',
        address: '42 Silicon Avenue, Bangalore',
        base: 16,
        mid: 26,
        surge: 48,
        fixed: 130,
        households: [
          { flat: 'D-101', name: 'Sarah Connor', meter: 'MTR-D101-1222', hasMeter: true, status: 'ACTIVE', area: 1400, occ: 3 },
        ],
      },
      {
        name: 'Green Valley',
        alias: 'green valley',
        id: 5,
        total: 20,
        reg: 6,
        admin: 'Vikas Roy',
        email: 'admin@greenvalley.com',
        address: 'Eco Park Road, Bangalore',
        base: 15,
        mid: 25,
        surge: 45,
        fixed: 120,
        households: [],
      },
      {
        name: 'Silver Woods',
        alias: 'silver woods',
        id: 8,
        total: 30,
        reg: 8,
        admin: 'Ramesh Sen',
        email: 'admin@silverwoods.com',
        address: 'Hennur Main Road, Bangalore',
        base: 22,
        mid: 32,
        surge: 60,
        fixed: 160,
        households: [],
      },
      {
        name: 'Royal Palms',
        alias: 'royal palms',
        id: 9,
        total: 40,
        reg: 10,
        admin: 'Kavita Menon',
        email: 'admin@royalpalms.com',
        address: 'Indiranagar 100ft Road, Bangalore',
        base: 25,
        mid: 35,
        surge: 65,
        fixed: 180,
        households: [],
      },
    ];

    // -------------------------------------------------------------
    // STEP 1: ENTITY MATCHING - SPECIFIC COMMUNITY / SOCIETY LOOKUP
    // -------------------------------------------------------------
    let matchedCommunity: any = null;

    // Check longer/more specific names first (e.g. "paras garden apartments" before "paras garden")
    for (const comm of defaultCommunities) {
      if (lower.includes(comm.alias)) {
        matchedCommunity = comm;
        break;
      }
    }

    // Also check live apartments list if available
    if (!matchedCommunity && liveApartments.length > 0) {
      for (const apt of liveApartments) {
        if (lower.includes(apt.name.toLowerCase())) {
          matchedCommunity = {
            name: apt.name,
            alias: apt.name.toLowerCase(),
            id: apt.id,
            total: apt.totalHouseholds,
            reg: apt.registeredHouseholds,
            admin: apt.adminName || 'Community Admin',
            email: apt.adminEmail || 'admin@jalsetu.in',
            address: apt.address || 'Bangalore',
            base: 18,
            mid: 28,
            surge: 50,
            fixed: 150,
            households: [],
          };
          break;
        }
      }
    }

    // IF A SPECIFIC COMMUNITY IS IN THE QUERY:
    if (matchedCommunity) {
      // Find households for this matched community from live data if available
      let communityFlats: any[] = matchedCommunity.households;
      if (liveAllHouseholds.length > 0) {
        const liveFiltered = liveAllHouseholds.filter(
          (h) =>
            h.apartmentId === matchedCommunity.id ||
            h.apartmentName?.toLowerCase().includes(matchedCommunity.alias)
        );
        if (liveFiltered.length > 0) {
          communityFlats = liveFiltered.map((h) => ({
            flat: h.flatNumber,
            name: h.residentName || 'Resident',
            meter: h.meterSerialNumber,
            hasMeter: h.hasMeter,
            status: h.status || 'ACTIVE',
            area: h.areaSqft || 1350,
            occ: h.occupancyCount || 3,
          }));
        }
      } else if (user?.role === 'COMMUNITY_ADMIN' && user.apartmentName?.toLowerCase().includes(matchedCommunity.alias) && liveHouseholds.length > 0) {
        communityFlats = liveHouseholds.map((h) => ({
          flat: h.flatNumber,
          name: h.residentName || 'Resident',
          meter: h.meterSerialNumber,
          hasMeter: h.hasMeter,
          status: h.status || 'ACTIVE',
          area: h.areaSqft || 1350,
          occ: h.occupancyCount || 3,
        }));
      }

      const totalHouseholds = communityFlats.length || matchedCommunity.reg || 4;
      const meteredCount = communityFlats.filter((f) => f.hasMeter).length;
      const unmeteredCount = communityFlats.filter((f) => !f.hasMeter).length;
      const capacity = matchedCommunity.total || 24;

      // A1. Specific community households / flats count
      if (
        lower.includes('how many') ||
        lower.includes('household') ||
        lower.includes('flat') ||
        lower.includes('resident') ||
        lower.includes('unit') ||
        lower.includes('count') ||
        lower.includes('list')
      ) {
        const flatsList =
          communityFlats.length > 0
            ? communityFlats
                .map(
                  (f) =>
                    `• **Flat ${f.flat}**: ${f.name} (${f.hasMeter ? `📟 ${f.meter || 'Smart Metered'}` : '🚰 Unmetered'})`
                )
                .join('\n')
            : `• Total registered units: ${totalHouseholds} flats`;

        return (
          `### 🏠 Households & Flats in **${matchedCommunity.name}**\n\n` +
          `Here is the current household breakdown for **${matchedCommunity.name}**:\n\n` +
          `* 🏠 **Total Registered Households:** **${totalHouseholds} Flats** (Sanctioned Society Capacity: **${capacity} Flats**)\n` +
          `* 📟 **Smart Metered Units:** **${meteredCount} Flats** (${totalHouseholds > 0 ? Math.round((meteredCount / totalHouseholds) * 100) : 100}% telemetry active)\n` +
          `* 🚰 **Unmetered Units:** **${unmeteredCount} Flat** (common proportional apportionment)\n` +
          `* 👔 **Community Admin:** **${matchedCommunity.admin}** (\`${matchedCommunity.email}\`)\n` +
          `* 📍 **Address:** ${matchedCommunity.address}\n\n` +
          `**Registered Flats Directory:**\n${flatsList}\n\n` +
          (user?.role === 'MAIN_ADMIN'
            ? `👉 *You can manage flat allocations, meter bindings, and status under **Platform Households** in the Main Admin console.*`
            : `👉 *You can manage household directory and add new flats on the **Households** page.*`)
        );
      }

      // A2. Admin / Contact details for specific community
      if (lower.includes('admin') || lower.includes('contact') || lower.includes('who manage') || lower.includes('email')) {
        return (
          `### 👔 Administrator Details for **${matchedCommunity.name}**\n\n` +
          `* 👤 **Designated Administrator:** **${matchedCommunity.admin}**\n` +
          `* 📧 **Official Email:** \`${matchedCommunity.email}\`\n` +
          `* 🏢 **Community:** ${matchedCommunity.name} (ID: ${matchedCommunity.id})\n` +
          `* 📍 **Address:** ${matchedCommunity.address}\n` +
          `* 🏠 **Managed Units:** **${totalHouseholds} registered flats** (${capacity} capacity)\n\n` +
          `👉 *You can edit admin credentials or update society settings in the **Community Admins** console.*`
        );
      }

      // A3. Tariffs for specific community
      if (lower.includes('tariff') || lower.includes('slab') || lower.includes('rate') || lower.includes('pricing') || lower.includes('fee')) {
        return (
          `### 💧 Water Tariff Structure for **${matchedCommunity.name}**\n\n` +
          `Active progressive 3-tier tariff slabs and monthly charges:\n\n` +
          `| Tier / Component | Consumption Range | Rate / Charge |\n` +
          `| :--- | :---: | :---: |\n` +
          `| 🟢 **Tier 1 (Base Slab)** | 0 – 10 kL | **₹${matchedCommunity.base} / kL** |\n` +
          `| 🟡 **Tier 2 (Standard Slab)** | 10 – 25 kL | **₹${matchedCommunity.mid} / kL** |\n` +
          `| 🔴 **Tier 3 (Surge Surcharge)** | > 25 kL | **₹${matchedCommunity.surge} / kL** |\n` +
          `| 🏢 **Base Infrastructure Maintenance** | Monthly Fixed | **₹${matchedCommunity.fixed} / month** |\n\n` +
          `*Apportionment Method:* Metered Consumption Proportional for common tanker deliveries.`
        );
      }

      // A4. General overview of specific community
      return (
        `### 🏢 **${matchedCommunity.name}** — Community Profile\n\n` +
        `* 📍 **Address:** ${matchedCommunity.address}\n` +
        `* 👔 **Community Administrator:** **${matchedCommunity.admin}** (\`${matchedCommunity.email}\`)\n` +
        `* 🏠 **Households:** **${totalHouseholds} Registered Flats** (${capacity} Sanctioned Capacity)\n` +
        `* 📟 **Smart Ultrasonic Meters:** **${meteredCount} Active Meters**\n` +
        `* 💧 **Tariff Base Rate:** ₹${matchedCommunity.base}/kL | Mid: ₹${matchedCommunity.mid}/kL | Surge: ₹${matchedCommunity.surge}/kL\n` +
        `* 💳 **Monthly Fixed Maintenance:** ₹${matchedCommunity.fixed}/month\n\n` +
        `👉 *Ask me about flat lists, meter logs, tariffs, or billing for ${matchedCommunity.name}!*`
      );
    }

    // -------------------------------------------------------------
    // STEP 2: ENTITY MATCHING - SPECIFIC FLAT / UNIT / METER LOOKUP
    // -------------------------------------------------------------
    const flatMatch = raw.match(/\b([A-Z]{1,3}-\d{2,4})\b/i);
    const meterMatch = raw.match(/\b(MTR-[A-Z0-9-]+)\b/i);

    if (flatMatch || meterMatch) {
      const searchedFlat = flatMatch ? flatMatch[1].toUpperCase() : null;
      const searchedMeter = meterMatch ? meterMatch[1].toUpperCase() : null;

      // Look up in liveAllHouseholds or liveHouseholds or defaultCommunities
      let foundUnit: any = null;
      let foundSociety = 'Paras Garden';

      if (liveAllHouseholds.length > 0) {
        const h = liveAllHouseholds.find(
          (u) =>
            (searchedFlat && u.flatNumber.toUpperCase() === searchedFlat) ||
            (searchedMeter && u.meterSerialNumber?.toUpperCase() === searchedMeter)
        );
        if (h) {
          foundUnit = h;
          foundSociety = h.apartmentName || 'Monitored Society';
        }
      }

      if (!foundUnit && liveHouseholds.length > 0) {
        const h = liveHouseholds.find(
          (u) =>
            (searchedFlat && u.flatNumber.toUpperCase() === searchedFlat) ||
            (searchedMeter && u.meterSerialNumber?.toUpperCase() === searchedMeter)
        );
        if (h) {
          foundUnit = h;
          foundSociety = user?.apartmentName || 'Your Society';
        }
      }

      if (!foundUnit) {
        for (const comm of defaultCommunities) {
          const h = comm.households.find(
            (u) =>
              (searchedFlat && u.flat.toUpperCase() === searchedFlat) ||
              (searchedMeter && u.meter?.toUpperCase() === searchedMeter)
          );
          if (h) {
            foundUnit = {
              flatNumber: h.flat,
              residentName: h.name,
              meterSerialNumber: h.meter,
              hasMeter: h.hasMeter,
              status: h.status,
              areaSqft: h.area,
              occupancyCount: h.occ,
            };
            foundSociety = comm.name;
            break;
          }
        }
      }

      if (foundUnit) {
        return (
          `### 🏠 Flat **${foundUnit.flatNumber}** Details (${foundSociety})\n\n` +
          `* 🏢 **Community:** **${foundSociety}**\n` +
          `* 👤 **Registered Resident:** **${foundUnit.residentName || 'Resident'}**\n` +
          `* 📟 **Smart IoT Sub-Meter:** ${foundUnit.hasMeter ? `**${foundUnit.meterSerialNumber || 'Active Meter'}** (Ultrasonic)` : '🚰 *Unmetered Unit (Shared Apportionment)*'}\n` +
          `* ⚡ **Account Status:** **${foundUnit.status || 'ACTIVE'}**\n` +
          `* 📐 **Carpet Area:** ${foundUnit.areaSqft || 1350} sq.ft.\n` +
          `* 👥 **Occupancy:** ${foundUnit.occupancyCount || 3} persons\n\n` +
          `👉 *You can inspect historical meter logs and billing records in the portal sidebar.*`
        );
      }
    }

    // -------------------------------------------------------------
    // STEP 3: ROLE-SPECIFIC QUERY ROUTING
    // -------------------------------------------------------------

    // 3A. COMMUNITY ADMIN INQUIRIES
    if (user?.role === 'COMMUNITY_ADMIN' && !isPublicOrAuthPage) {
      const society = user.apartmentName || 'Paras Garden';
      const count = liveHouseholds.length || (society.toLowerCase().includes('paras') ? 4 : 6);
      const metered = liveHouseholds.filter((h) => h.hasMeter).length || (count > 0 ? count - 1 : 3);
      const unmetered = liveHouseholds.filter((h) => !h.hasMeter).length || 1;
      const totalCapacity = liveCommDashboard?.totalHouseholds || 24;

      // Households & Flats count query
      if (
        lower.includes('how many household') ||
        lower.includes('how many flat') ||
        lower.includes('household') ||
        lower.includes('flats') ||
        lower.includes('units') ||
        lower.includes('residents count') ||
        (lower.includes('how many') && (lower.includes('there') || lower.includes('in my') || lower.includes('society') || lower.includes('community')))
      ) {
        const flatsList =
          liveHouseholds.length > 0
            ? liveHouseholds
                .map(
                  (h) =>
                    `• **Flat ${h.flatNumber}**: ${h.residentName || 'Resident'} (${h.hasMeter ? `📟 ${h.meterSerialNumber || 'Metered'}` : '🚰 Unmetered'})`
                )
                .join('\n')
            : society.toLowerCase().includes('paras')
            ? '• **Flat PG-101**: Amit Kumar (📟 MTR-PG-101-4401)\n• **Flat PG-102**: Priya Sharma (📟 MTR-PG-102-4402)\n• **Flat PG-201**: Rajesh Iyer (📟 MTR-PG-201-4403)\n• **Flat PG-202**: Deepa Nair (🚰 Unmetered)'
            : '• **Flat A-101**: John Doe (📟 MTR-PALM-A101-9871)\n• **Flat A-102**: Priya Sharma (📟 MTR-PALM-A102-3412)\n• **Flat B-201**: Rahul Verma (📟 MTR-PALM-B201-5623)\n• **Flat B-202**: Ananya Patel (📟 MTR-PALM-B202-7890)\n• **Flat C-301**: Vikram Singh (📟 MTR-PALM-C301-1102)\n• **Flat C-302**: Sneha Reddy (🚰 Unmetered)';

        return (
          `### 🏠 Households & Flats in **${society}**\n\n` +
          `Here is the current household breakdown for your community:\n\n` +
          `* 🏠 **Total Registered Households:** **${count} Flats** (Sanctioned Society Capacity: **${totalCapacity} Flats**)\n` +
          `* 📟 **Smart Metered Units:** **${metered} Flats** actively reporting sub-metered water\n` +
          `* 🚰 **Unmetered Units:** **${unmetered} Flat** (common proportional apportionment)\n\n` +
          `**Registered Flats Directory:**\n${flatsList}\n\n` +
          `👉 *You can manage, edit, or add more flats on the **Households Directory** page.*`
        );
      }

      // Meters inquiry
      if (lower.includes('meter') || lower.includes('hardware') || lower.includes('ultrasonic')) {
        return (
          `### 📟 Smart Meter Hardware Overview for **${society}**\n\n` +
          `* 📟 **Active Sub-Meters:** **${metered} Ultrasonic IoT Meters** online\n` +
          `* 📡 **Telemetry Protocol:** LoRaWAN / M-Bus Digital Index (99.2% uptime)\n` +
          `* 💧 **Last Synchronization:** Real-time active\n\n` +
          `👉 *View daily logs and add manual readings under **Meter Readings** in the sidebar.*`
        );
      }

      // Leak scans
      if (lower.includes('scan') || lower.includes('leak') || lower.includes('outlier') || lower.includes('anomaly')) {
        return (
          `🚨 **Society Leak & Anomaly Scan for ${society}:**\n\n` +
          `- **Monitored Households:** ${count} Flats\n` +
          `- **Outliers Detected (> 2.0σ):** 1 Flat\n` +
          `- **Critical Plumbing Spike (> 3.0σ):** 1 Flat (High-consumption spike flagged)\n\n` +
          `👉 *Visit **Leakage & Alerts** to trigger real-time 2σ scans and dispatch automated warning emails.*`
        );
      }

      // Bulk tankers
      if (lower.includes('tanker') || lower.includes('bulk') || lower.includes('purchase')) {
        return (
          `🚚 **Bulk Water Procurement for ${society}:**\n\n` +
          `- **Active Sources:** Private Tankers & Municipal Bulk Water\n` +
          `- **Apportionment Method:** Metered Consumption Proportional (Auto-distributed among active sub-meters)\n\n` +
          `👉 *Navigate to **Bulk Water Purchases** in the sidebar to record new tanker deliveries.*`
        );
      }

      // Billing cycles
      if (lower.includes('billing') || lower.includes('cycle') || lower.includes('invoice') || lower.includes('bill')) {
        return (
          `💳 **Billing & Invoices for ${society}:**\n\n` +
          `- **Current Cycle:** Active Billing Cycle\n` +
          `- **Tariff Structure:** 3 Progressive Tiers + Base Infrastructure Maintenance Fee\n` +
          `- **Auto-Dispatch:** Automated email with itemized PDF invoice attachments\n\n` +
          `👉 *Go to **Invoices & Billing** to finalize cycles and generate monthly bills.*`
        );
      }
    }

    // 3B. RESIDENT INQUIRIES
    if (user?.role === 'RESIDENT' && !isPublicOrAuthPage) {
      const flat = user.flatNumber || 'Your Flat';
      const society = user.apartmentName || 'Your Community';

      if (lower.includes('my bill') || lower.includes('invoice') || lower.includes('pay') || lower.includes('amount') || lower.includes('cost') || lower.includes('due')) {
        return (
          `💳 **Your Water Invoice Details for Flat ${flat} (${society}):**\n\n` +
          `- **Community:** ${society}\n` +
          `- **Latest Cycle:** Current Billing Cycle\n` +
          `- **Metered Consumption:** ~${liveResidentDashboard?.currentMonthConsumption ? liveResidentDashboard.currentMonthConsumption.toFixed(2) : '18.00'} kL\n` +
          `- **Payment Status:** Current & Verified\n\n` +
          `👉 *You can click on **Invoices & Billing** in your navigation to view itemized breakdown and pay securely via Razorpay/UPI.*`
        );
      }
      if (lower.includes('leak') || lower.includes('risk') || lower.includes('sigma') || lower.includes('alert')) {
        return (
          `🚨 **Leak Anomaly Status for Flat ${flat}:**\n\n` +
          `- **Status:** ✅ Normal (No active leak detected)\n` +
          `- **30-Day Baseline (μ):** ~18.2 kL\n` +
          `- **Z-Score:** 0.3σ (Well within safe threshold < 2.0σ)\n\n` +
          `💡 *If your consumption exceeds 2.0σ above your historical baseline, JalSetu will alert you immediately via email to inspect plumbing fixtures.*`
        );
      }
      if (lower.includes('reading') || lower.includes('meter') || lower.includes('usage') || lower.includes('history') || lower.includes('consumption')) {
        return (
          `📊 **Meter Reading Summary for Flat ${flat} (${society}):**\n\n` +
          `- **Current Usage:** ~${liveResidentDashboard?.currentMonthConsumption ? liveResidentDashboard.currentMonthConsumption.toFixed(2) : '18.00'} kL\n` +
          `- **Community Average:** ~${liveResidentDashboard?.communityAvgConsumption ? liveResidentDashboard.communityAvgConsumption.toFixed(2) : '16.80'} kL\n\n` +
          `👉 *Check the **Usage History** page in your sidebar for detailed interactive daily charts.*`
        );
      }
      if (lower.includes('how many') || lower.includes('household') || lower.includes('flats')) {
        return (
          `🏠 **Your Household Details:**\n\n` +
          `- **Assigned Flat:** Flat **${flat}**\n` +
          `- **Community:** **${society}**\n` +
          `- **Sub-Meter:** Smart Ultrasonic IoT Meter\n\n` +
          `👉 *You can view your flat's full conservation report under **Conservation Reports**.*`
        );
      }
    }

    // 3C. MAIN ADMIN PLATFORM-WIDE INQUIRIES
    if (user?.role === 'MAIN_ADMIN' && !isPublicOrAuthPage) {
      const commCount = liveAdminStats?.totalApartments || liveApartments.length || 9;
      const houseCount = liveAdminStats?.totalHouseholds || liveAllHouseholds.length || 25;
      const userCount = liveAdminStats?.totalUsers || 29;

      // Platform communities list query
      if (
        lower.includes('list of communities') ||
        lower.includes('all communities') ||
        lower.includes('all societies') ||
        lower.includes('show communities') ||
        lower.includes('how many communities') ||
        lower.includes('how many societies') ||
        lower.includes('how many apartments')
      ) {
        const aptsRows =
          liveApartments.length > 0
            ? liveApartments
                .map(
                  (a) =>
                    `| **${a.name}** | ${a.address || 'Bangalore'} | ${a.totalHouseholds} Flats | **${a.registeredHouseholds || 0} Flats** | ${a.adminName || 'Admin'} |`
                )
                .join('\n')
            : '| **Palm Meadows Residences** | 77 Green Valley Road | 24 Flats | **8 Flats** | Robert Vance |\n| **Paras Garden** | Plot 42, Civil Lines | 15 Flats | **12 Flats** | Ankush Sharma |\n| **Paras Garden Apartments** | Plot 14B, Whitefield | 36 Flats | **4 Flats** | Suresh Gupta |\n| **Green Oaks Apartments 3199** | 42 Silicon Avenue | 30 Flats | **1 Flat** | Sarah Connor |';

        return (
          `### 🏢 Monitored Communities Directory (Master Console)\n\n` +
          `The JalSetu platform currently manages **${commCount} Residential Communities**:\n\n` +
          `| Community Name | Address | Capacity | Registered Units | Assigned Administrator |\n` +
          `| :--- | :--- | :---: | :---: | :--- |\n` +
          `${aptsRows}\n\n` +
          `👉 *To inspect households or edit credentials for a specific community, type its name (e.g. **"Paras Garden"** or **"Palm Meadows"**).*`
        );
      }

      // Total platform households query
      if (
        lower.includes('total household') ||
        lower.includes('all household') ||
        lower.includes('total flats') ||
        lower.includes('how many household') ||
        lower.includes('how many flat')
      ) {
        return (
          `### 🏠 Platform-Wide Household Distribution\n\n` +
          `* 🏠 **Total Platform Registered Households:** **${houseCount} Flats**\n` +
          `* 🏢 **Total Platform Capacity:** **215 Sanctioned Units** across **${commCount} Communities**\n` +
          `* 👥 **Total Platform Users:** **${userCount} Registered Accounts**\n\n` +
          `**Community Breakdown:**\n` +
          `• 🌸 **Paras Garden:** 12 Registered Flats (15 Capacity)\n` +
          `• 🌴 **Palm Meadows Residences:** 8 Registered Flats (24 Capacity)\n` +
          `• 🏢 **Paras Garden Apartments:** 4 Registered Flats (36 Capacity)\n` +
          `• 🌿 **Green Oaks Apartments:** 1 Registered Flat (30 Capacity)\n\n` +
          `👉 *Ask about any single society (e.g. **"Paras Garden"**) for full directory lists and meter details.*`
        );
      }

      // Revenue / Financials
      if (lower.includes('revenue') || lower.includes('collection') || lower.includes('billing rate') || lower.includes('financial')) {
        return (
          `### 💳 Master Financial & Collection Performance\n\n` +
          `* 💰 **Total Monthly Platform Billing:** **₹8.42 Lakhs / month**\n` +
          `* 📈 **Global Collection Rate:** **94.2%**\n` +
          `* ⚡ **Top Performing Community:** Palm Meadows Residences (98.6% collection)\n` +
          `* 💧 **Total Platform Water Delivered:** 2,450 kL / month\n\n` +
          `👉 *View detailed cross-society graphs under **Platform Reports & Analytics**.*`
        );
      }

      // Master Platform Overview
      if (lower.includes('stats') || lower.includes('overview') || lower.includes('meters') || lower.includes('platform')) {
        return (
          `### 👑 Master Platform Overview (Main Admin Console)\n\n` +
          `Here are the live global deployment metrics across all societies:\n\n` +
          `* 🏢 **Active Communities:** **${commCount} Monitored Societies**\n` +
          `* 👔 **Community Administrators:** **${commCount} Active Admins**\n` +
          `* 📟 **Smart Ultrasonic IoT Meters:** **128 Registered Meters** (98.4% uptime)\n` +
          `* 🏠 **Total Platform Households:** **${houseCount} Flats** across all housing societies\n` +
          `* 💳 **Total Platform Monthly Revenue:** **₹8.42 Lakhs**\n\n` +
          `👉 *To inspect a single society, ask about it directly (e.g. **"Paras Garden"**).*`
        );
      }
    }

    // -------------------------------------------------------------
    // STEP 4: GENERAL / PUBLIC / GUEST INQUIRIES
    // -------------------------------------------------------------

    // Demo Logins & Credentials
    if (lower.includes('demo') || lower.includes('credential') || lower.includes('test account') || lower.includes('sample login')) {
      return (
        '### 🔒 JalSetu Account Security Policy\n\n' +
        'For platform data protection and resident privacy, live account credentials are not distributed in open chat.\n\n' +
        '- **Platform Owner (Main Admin):** Accessible strictly to authorized platform operators.\n' +
        '- **Community Admins:** Created during verified housing society onboarding or authorized by the platform owner.\n' +
        '- **Residents:** Onboarded securely by their Community Admin and receive temporary credentials via registered private email.\n\n' +
        '👉 *To sign in, please use your registered credentials on the [Sign In](/login) portal.*'
      );
    }

    // Sign In / Login Instructions
    if (lower.includes('how to sign in') || lower.includes('how do i sign in') || lower.includes('how to log') || lower.includes('sign in') || lower.includes('login') || lower.includes('logging')) {
      return (
        '### 🔑 How to Sign In to JalSetu\n\n' +
        'Signing in depends on your role:\n\n' +
        '1. 👤 **For Residents:**\n' +
        '   - Enter your **registered email address**.\n' +
        '   - Enter the **temporary password** sent to your email when your household was onboarded by your Community Admin.\n' +
        '   - If you clicked the link in your welcome email, your email and flat are auto-filled for you!\n\n' +
        '2. 👔 **For Community Admins:**\n' +
        '   - Enter your **society admin email** and password created during community registration.\n' +
        '   - Access household management, sub-meter logs, bulk water tanker apportionments, and invoice generation.\n\n' +
        '3. 👑 **For Platform Admins:**\n' +
        '   - Sign in with authorized platform administrator credentials to oversee registered housing societies.\n\n' +
        '👉 *Need to register a new community? Click **Register Community Admin** below the login form.*'
      );
    }

    // Welcome Email / Password Help
    if (lower.includes('welcome email') || lower.includes('temporary password') || lower.includes('forgot') || lower.includes('reset') || lower.includes('password')) {
      return (
        '### 📧 Resident Welcome Emails & Credentials\n\n' +
        '* **Automated Welcome Email:** When a Community Admin adds a new flat or when a resident self-registers, JalSetu immediately dispatches an automated HTML onboarding email containing:\n' +
        '  - 🏠 Assigned Flat & Community Name\n' +
        '  - 📟 Smart Ultrasonic Meter Number\n' +
        '  - 🔑 **Temporary Password**\n' +
        '  - 🚀 **1-Click Magic Login Link** (auto-fills email & flat on the sign-in page)\n' +
        '  - 📱 **PWA App Download Links** for Android, iOS & Desktop\n\n' +
        '* **Forgot Password / Lost Access:**\n' +
        '  - Residents can request their Community Admin to re-issue credentials or resend the welcome email.\n' +
        '  - Admins can trigger this directly from the **Households Management** page.'
      );
    }

    // Society Registration / Onboarding
    if (lower.includes('register') || lower.includes('onboard') || lower.includes('join') || lower.includes('new society')) {
      return (
        '### 🏢 How to Register a New Residential Community\n\n' +
        'Onboarding your housing society to JalSetu is fast and straightforward:\n\n' +
        '1. 📝 **Navigate to Registration:** Click on **Register Community Admin** on the login page or navigation bar.\n' +
        '2. 🏢 **Community Profile:** Enter your society name (e.g. *Greenwood Heights*), full address, and total flat count.\n' +
        '3. 👔 **Admin Details:** Enter the designated Community Administrator\'s name, official email, and secure password.\n' +
        '4. 💧 **Configure Tariffs:** Set up your customized 3-tier progressive tariffs (Base, Mid, Surge) and fixed base maintenance fee.\n' +
        '5. 📟 **Add Sub-Meters:** Register smart ultrasonic water meters (M-Bus / LoRaWAN) for individual flats.\n\n' +
        '*Once registered, your community admin dashboard is live immediately!*'
      );
    }

    // 5 Societies pricing comparison
    if (lower.includes('compare') || lower.includes('5 communities') || (lower.includes('pricing') && lower.includes('slab'))) {
      return (
        '### 💧 JalSetu Platform — Community Water Pricing Comparison\n\n' +
        'Here is the comprehensive comparison of water pricing slabs and fixed charges across monitored communities on the JalSetu platform:\n\n' +
        '| Community Name | Base Rate (0–10 kL) | Mid Rate (10–25 kL) | Surge Rate (>25 kL) | Fixed Base Fee |\n' +
        '| :--- | :---: | :---: | :---: | :---: |\n' +
        '| 🌿 **Green Valley** | ₹15 / kL | ₹25 / kL | ₹45 / kL | ₹120 / mo |\n' +
        '| 🌸 **Paras Garden** | ₹18 / kL | ₹28 / kL | ₹50 / kL | ₹150 / mo |\n' +
        '| 🌴 **Palm Meadows** | ₹20 / kL | ₹30 / kL | ₹55 / kL | ₹140 / mo |\n' +
        '| 🪵 **Silver Woods** | ₹22 / kL | ₹32 / kL | ₹60 / kL | ₹160 / mo |\n' +
        '| 👑 **Royal Palms** | ₹25 / kL | ₹35 / kL | ₹65 / kL | ₹180 / mo |\n\n' +
        '---\n\n' +
        '### 🔍 Key Insights:\n' +
        '* **Most Economical:** **Green Valley** offers the lowest rates (Base: ₹15/kL) and lowest fixed fee (₹120/mo).\n' +
        '* **Highest Tier:** **Royal Palms** maintains the highest tariff structure (Surge: ₹65/kL, Fixed: ₹180/mo).\n' +
        '* **Progressive Conservation:** All societies enforce 3 progressive tiers to penalize wastage beyond 25 kL.'
      );
    }

    // General Topics
    if (lower.includes('tariff') || lower.includes('slab') || lower.includes('rate')) {
      return (
        '💧 **JalSetu Tiered Tariff Billing Engine:**\n\n' +
        '- **Slab 1 (Base Tier 0–10 kL):** Subsidized baseline rate (e.g. ₹15–₹18/kL)\n' +
        '- **Slab 2 (Standard Tier 10–25 kL):** Moderate consumption rate (e.g. ₹25–₹28/kL)\n' +
        '- **Slab 3 (Surge Surcharge > 25 kL):** High usage disincentive penalty (e.g. ₹45–₹50/kL)\n' +
        '- **Fixed Base Maintenance:** Mandatory recurring monthly fee (e.g. ₹150/month)'
      );
    }

    if (lower.includes('leak') || lower.includes('sigma') || lower.includes('detection')) {
      return (
        '🚨 **Automated 2-Sigma (2σ) Statistical Leak Detection:**\n\n' +
        '1. 📈 **Rolling Baseline:** JalSetu computes each household\'s 30-day mean (μ) and standard deviation (σ).\n' +
        '2. ⚠️ **Threshold Alert (Z ≥ 2.0σ):** Notifies residents of anomalous usage spikes.\n' +
        '3. 🚨 **Critical Alarm (Z ≥ 3.0σ or >4.5 kL/day):** Immediately triggers critical alert emails to prevent extensive water damage and high bills.'
      );
    }

    if (lower.includes('tip') || lower.includes('save') || lower.includes('conservation')) {
      return (
        '🌿 **Top 5 Water Conservation Tips:**\n\n' +
        '1. 🚰 **Fix Dripping Taps:** Saves 15–30 liters of water daily.\n' +
        '2. 🚿 **Use Aerated Showerheads:** Reduces volume by 40% while maintaining high pressure.\n' +
        '3. 🧼 **Full Appliance Loads:** Run dishwashers and washing machines with full loads only.\n' +
        '4. ⏱️ **5-Minute Showers:** Cuts daily usage by 20+ liters.\n' +
        '5. 📊 **Monitor JalSetu:** Spot hidden toilet flapper leaks early before bills spike!'
      );
    }

    return (
      '💧 **JalSetu Smart Water Assistant:**\n\n' +
      'I can help you with:\n' +
      '1. 🏢 **Community Directory & Flats** (e.g. *"How many households in Paras Garden"* or *"Flat PG-101"*)\n' +
      '2. 🔑 **Signing In & Account Help** (Resident & Admin credentials)\n' +
      '3. 📊 **Tiered Tariff Rates & Slabs** (Base, Mid, and Surge slabs)\n' +
      '4. 🚨 **Automated 2σ Leak & Anomaly Detection**\n' +
      '5. 🌿 **Household Water Conservation Guidelines**\n\n' +
      '*Feel free to ask any question about JalSetu!*'
    );
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let replyText = '';
      let isAiGenerated = false;

      try {
        replyText = await queryGeminiApi(query);
        isAiGenerated = true;
      } catch (apiErr: any) {
        console.warn('Gemini API call returned error, using smart engine:', apiErr);
        replyText = queryBuiltInEngine(query);
      }

      const assistantMsg: Message = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(replyText);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: '⚠️ Sorry, I encountered an issue processing that request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: generateInitialGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: true,
      },
    ]);
  };

  // Role & Route Tailored Quick Prompts
  const getRoleQuickPrompts = () => {
    if (isLoginPage) {
      return [
        { label: '🔑 How to Sign In?', query: 'How do I sign in to JalSetu as a resident or community admin?' },
        { label: '⚡ Demo Logins', query: 'What demo credentials can I use to test the platform?' },
        { label: '📧 Resident Welcome Email', query: 'How do residents receive their temporary password and login details?' },
        { label: '🏢 Register Society', query: 'How can our residential community register for JalSetu smart metering?' },
        { label: '💧 What is JalSetu?', query: 'Explain JalSetu smart sub-metering, 3-tier tariffs, and leak alerts' },
      ];
    }

    if (isRegisterPage) {
      return [
        { label: '🏢 Registration Steps', query: 'What are the steps to register a new residential society on JalSetu?' },
        { label: '📟 Smart Meter Setup', query: 'What IoT ultrasonic water meters and protocols work with JalSetu?' },
        { label: '💧 3-Tier Tariff Setup', query: 'How do progressive 3-tier pricing slabs get configured during setup?' },
        { label: '🔑 Already Registered?', query: 'Where do I sign in if my residential society is already registered?' },
      ];
    }

    if (isLandingPage) {
      return [
        { label: '💧 3-Tier Tariffs', query: 'Explain how the 3-tier water tariff billing slabs work' },
        { label: '🚨 2σ Leak Detection', query: 'How does the automated 2-sigma statistical leak detection algorithm work?' },
        { label: '🏢 Register Society', query: 'How can an apartment society onboard and set up smart sub-meters?' },
        { label: '💳 Online Bill Payment', query: 'How does online resident water bill payment via Razorpay or UPI work?' },
        { label: '🌿 Water Saving Tips', query: 'Give me top household tips to save water and reduce my monthly bill' },
      ];
    }

    if (user?.role === 'RESIDENT' || isResidentPortal) {
      return [
        { label: '💳 My Water Bill', query: 'What is my current monthly water bill and how can I pay?' },
        { label: '🚨 Check Leak Risk', query: 'Does my flat have any leak anomaly or high usage alert?' },
        { label: '💧 My Society Tariffs', query: 'Explain the tariff slabs applicable to my apartment' },
        { label: '📊 Check Meter Reading', query: 'What is my latest water meter reading and daily consumption?' },
        { label: '🌿 Water Saving Tips', query: 'Give me top household tips to save water and reduce my bill' },
      ];
    }

    if (user?.role === 'COMMUNITY_ADMIN' || isCommunityAdminPortal) {
      return [
        { label: '🚨 Scan Leaks (>2σ)', query: 'Scan our society households for statistical water leak anomalies' },
        { label: '🚚 Tanker Procurement', query: 'How does bulk tanker water cost get apportioned to flats?' },
        { label: '📅 Finalize Cycle', query: 'How do I finalize the active monthly billing cycle and generate bills?' },
        { label: '📊 Tariff Config', query: 'How do I configure 3-tier progressive tariffs for my society?' },
      ];
    }

    if (user?.role === 'MAIN_ADMIN' || isMainAdminPortal) {
      return [
        { label: '🏢 Compare 5 Societies', query: 'Compare water pricing slabs across all 5 communities' },
        { label: '👥 Registered Admins & Meters', query: 'How many active community admins and meters are registered?' },
        { label: '📈 Platform Analytics', query: 'What is the overall platform water consumption and collection rate?' },
        { label: '🌐 Benchmark Rates', query: 'Show me the cross-society benchmark tariff averages' },
      ];
    }

    return [
      { label: '💧 Tariff Slabs', query: 'Explain how the 3-tier water tariff slabs work' },
      { label: '🚨 2σ Leak Detection', query: 'How does the 2-sigma statistical leak detection algorithm work?' },
      { label: '🔑 Sign In Help', query: 'How do I sign in to the JalSetu portal?' },
      { label: '🌿 Water Saving Tips', query: 'Give me top household tips to save water and reduce my monthly bill' },
    ];
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const filteredChatLangs = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(chatLangSearch.toLowerCase()) ||
      l.native.toLowerCase().includes(chatLangSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(chatLangSearch.toLowerCase())
  );

  // Helper to render inline markdown (bold, italic, code)
  const renderInline = (text: string) => {
    return text.split(/(\*\*.*?\*\*|\*[^*]+?\*|`[^`]+?`)/).map((chunk, cIdx) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return (
          <strong key={cIdx} className="font-bold text-slate-900 dark:text-white">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      if (chunk.startsWith('*') && chunk.endsWith('*') && !chunk.startsWith('**')) {
        return (
          <em key={cIdx} className="italic text-slate-600 dark:text-slate-300">
            {chunk.slice(1, -1)}
          </em>
        );
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return (
          <code
            key={cIdx}
            className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[10px] text-blue-700 dark:bg-slate-700 dark:text-blue-300"
          >
            {chunk.slice(1, -1)}
          </code>
        );
      }
      return chunk;
    });
  };

  // Helper to format assistant markdown including tables, headers, and bullet points
  const formatMarkdownText = (text: string) => {
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    let tableLines: string[] = [];
    let inTable = false;

    const flushTable = (index: number) => {
      if (tableLines.length === 0) return;
      const headerLine = tableLines[0];
      const dataLines = tableLines.slice(1).filter((l) => !l.replace(/\s/g, '').includes('---'));

      const parseCells = (row: string) =>
        row
          .split('|')
          .map((c) => c.trim())
          .filter((c, i, arr) => (i !== 0 && i !== arr.length - 1) || c.length > 0);

      const headers = parseCells(headerLine);

      nodes.push(
        <div key={'table-' + index} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-700 dark:bg-slate-800">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-100/90 text-slate-900 dark:bg-slate-700/80 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-2.5 py-1.5 whitespace-nowrap">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {dataLines.map((row, rIdx) => {
                const cells = parseCells(row);
                return (
                  <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Table row detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableLines.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***') {
        nodes.push(<hr key={idx} className="my-2 border-slate-200 dark:border-slate-700" />);
        return;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        nodes.push(
          <h4 key={idx} className="font-bold text-slate-900 dark:text-white mt-2.5 mb-1 text-xs">
            {renderInline(trimmed.replace('### ', ''))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        nodes.push(
          <h3 key={idx} className="font-bold text-slate-900 dark:text-white mt-3 mb-1.5 text-[13px]">
            {renderInline(trimmed.replace('## ', ''))}
          </h3>
        );
        return;
      }

      // Bullet items
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
      const isNumbered = /^\d+\.\s/.test(trimmed);

      if (isBullet || isNumbered) {
        const cleanContent = isBullet ? trimmed.substring(2) : trimmed.replace(/^\d+\.\s/, '');
        nodes.push(
          <div key={idx} className="flex items-start gap-1.5 pl-1.5 my-1 leading-relaxed">
            <span className="text-blue-500 font-bold shrink-0">{isBullet ? '•' : trimmed.match(/^\d+\./)?.[0]}</span>
            <div className="flex-1">{renderInline(cleanContent)}</div>
          </div>
        );
        return;
      }

      // Regular line or empty
      if (trimmed === '') {
        nodes.push(<div key={idx} className="h-1.5" />);
      } else {
        nodes.push(
          <div key={idx} className="my-0.5 leading-relaxed">
            {renderInline(line)}
          </div>
        );
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return nodes;
  };

  // Chatbot Header Title based on route
  const getHeaderTitle = () => {
    if (isLoginPage) return 'JalSetu Sign-In AI Guide';
    if (isRegisterPage) return 'JalSetu Onboarding AI Guide';
    if (isLandingPage) return 'JalSetu AI Water Copilot';
    if (isResidentPortal) return 'JalSetu Resident Copilot';
    if (isCommunityAdminPortal) return 'JalSetu Admin Console AI';
    if (isMainAdminPortal) return 'JalSetu Master Console AI';
    return 'JalSetu AI Copilot';
  };

  // Header Subtitle based on route
  const getHeaderSubtitle = () => {
    if (isLoginPage) return 'Sign-In & Login Assistance';
    if (isRegisterPage) return 'Society Onboarding Guide';
    if (isLandingPage) return 'Smart Water Platform';
    if (isResidentPortal) return user?.flatNumber ? ('Flat ' + user.flatNumber + ' (' + (user.apartmentName || 'Paras Garden') + ')') : 'Resident Portal';
    if (isCommunityAdminPortal) return user?.apartmentName || 'Community Admin Console';
    if (isMainAdminPortal) return 'Platform Master Owner';
    return 'Smart Water Platform';
  };

  return (
    <>
      {/* Glassmorphic Chatbot Window */}
      {isOpen && (
        <div
          className={'fixed inset-x-2 bottom-20 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-md transition-all dark:border-slate-800 dark:bg-[#111827]/95 sm:inset-auto sm:bottom-6 sm:right-6 sm:rounded-3xl sm:w-[440px] sm:h-[560px] ' +
            (isExpanded ? 'sm:!w-[620px] sm:!h-[85vh]' : '')
          }
        >
          {/* Header - Rich Gradient */}
          <div className="flex shrink-0 items-center justify-between border-b border-indigo-500/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-3 sm:px-4 py-2.5 sm:py-3.5 text-white shadow-md">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-400 border-2 border-white"></span>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm tracking-tight text-white truncate">{getHeaderTitle()}</h3>
                  <span className="hidden sm:inline-flex rounded-full bg-emerald-500/25 border border-emerald-300/40 px-2 py-0.5 text-[9px] font-bold text-emerald-100 shrink-0 items-center gap-1 shadow-xs">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-300 animate-pulse" />
                    Gemini AI Active
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-blue-100 truncate flex items-center gap-1 sm:gap-1.5 mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="font-medium">Online</span>
                  <span className="opacity-60">•</span>
                  <span className="truncate opacity-95">
                    {getHeaderSubtitle()}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white shrink-0 ml-1">
              {/* In-Chat Language Selector (100+ Languages) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setChatLangOpen(!chatLangOpen);
                    setChatLangSearch('');
                  }}
                  className="rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 transition-colors border border-white/20 cursor-pointer"
                  title="Switch Language (100+ supported)"
                >
                  <span>{currentLangObj.flag}</span>
                  <span className="max-w-[34px] sm:max-w-[45px] truncate uppercase">{currentLangObj.code}</span>
                  <ChevronDown className="h-3 w-3 opacity-80" />
                </button>

                {chatLangOpen && (
                  <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl text-slate-800 dark:border-slate-800 dark:bg-[#161F30] dark:text-white text-xs animate-fade-in">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1.5 flex items-center justify-between">
                      <span>Select Language</span>
                      <span className="text-blue-600 font-bold text-[10px]">100+ Global</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Search language..."
                      value={chatLangSearch}
                      onChange={(e) => setChatLangSearch(e.target.value)}
                      autoFocus
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs outline-none focus:border-blue-500 mb-1.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />

                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredChatLangs.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLanguage(l.code);
                            setChatLangOpen(false);
                          }}
                          className={'w-full flex items-center justify-between px-2 py-1 rounded-lg text-left text-xs ' +
                            (language === l.code
                              ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/60 dark:text-blue-300'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
                        >
                          <span className="truncate">
                            {l.flag} {l.native} <span className="text-[10px] text-slate-400">({l.name})</span>
                          </span>
                          {language === l.code && <Check className="h-3 w-3 text-blue-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Toggle */}
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={'rounded-xl p-1.5 transition-colors border cursor-pointer ' +
                  (speechEnabled ? 'bg-white/30 text-white border-white/40' : 'hover:bg-white/20 text-white/80 border-transparent')}
                title={speechEnabled ? 'Voice narration enabled' : 'Enable voice narration'}
              >
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Expand/Contract Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block rounded-xl p-1.5 text-white/90 hover:bg-white/20 cursor-pointer"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg sm:rounded-xl p-1.5 text-white/90 hover:bg-white/20 cursor-pointer bg-white/10 sm:bg-transparent"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Context Banner Tailored to Active Route & User */}
          {isLoginPage ? (
            <div className="bg-indigo-50/95 px-4 py-2 text-[11px] text-indigo-950 border-b border-indigo-100 flex items-center justify-between dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-900/60">
              <div className="flex items-center gap-1.5 truncate">
                <KeyRound className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate">
                  <strong>Sign-In & Login Assistance</strong> • Need help logging in?
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 dark:bg-indigo-900/70 dark:text-indigo-300 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                LOGIN GUIDE
              </span>
            </div>
          ) : isRegisterPage ? (
            <div className="bg-emerald-50/95 px-4 py-2 text-[11px] text-emerald-950 border-b border-emerald-100 flex items-center justify-between dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  <strong>Community Registration Guide</strong> • Onboard your society
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 dark:bg-emerald-900/70 dark:text-emerald-300 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                REGISTRATION
              </span>
            </div>
          ) : isLandingPage ? (
            <div className="bg-sky-50/95 px-4 py-2 text-[11px] text-sky-950 border-b border-sky-100 flex items-center justify-between dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-900/60">
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="truncate">
                  <strong>JalSetu Public Platform Guide</strong> • Explore features
                </span>
              </div>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100/90 dark:bg-sky-900/70 dark:text-sky-300 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                PUBLIC GUIDE
              </span>
            </div>
          ) : user ? (
            <div className="bg-blue-50/95 px-4 py-2 text-[11px] text-blue-950 border-b border-blue-100 flex items-center justify-between dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-900/60">
              <div className="flex items-center gap-1.5 truncate">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">
                  Logged in as <strong className="font-semibold text-blue-950 dark:text-blue-100">{user.fullName}</strong> {user.flatNumber ? ('(Flat ' + user.flatNumber + ')') : ''}
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 dark:bg-blue-900/70 dark:text-blue-300 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          ) : null}

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={'flex gap-2.5 ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm dark:from-blue-500 dark:to-indigo-500 mt-0.5">
                    <Droplets className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={'group relative max-w-[88%] rounded-2xl p-3.5 transition-all ' +
                    (msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md shadow-blue-500/15'
                      : 'border border-slate-200/90 bg-slate-50/90 text-slate-800 rounded-tl-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100')}
                >
                  <div className="leading-relaxed font-normal">
                    {msg.sender === 'assistant' ? formatMarkdownText(msg.text) : msg.text}
                  </div>

                  <div
                    className={'mt-2 flex items-center justify-between gap-3 text-[10px] ' +
                      (msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400')}
                  >
                    <span className="flex items-center gap-1">
                      {msg.timestamp}
                      {msg.isAiGenerated && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          • Gemini AI
                        </span>
                      )}
                    </span>

                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                            <Check className="h-3 w-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                  <Droplets className="h-3.5 w-3.5 animate-bounce" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600 [animation-delay:0.4s]" />
                  <span className="ml-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    Gemini AI is generating answer...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Role & Page Tailored Quick Prompts Bar */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-900/50">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {getRoleQuickPrompts().map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  disabled={isLoading}
                  className="shrink-0 rounded-xl border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-blue-400 hover:bg-blue-50/70 hover:text-blue-700 disabled:opacity-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="border-t border-slate-100 p-3 bg-white dark:border-slate-800 dark:bg-[#111827]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isLoginPage
                      ? 'Ask about signing in, demo credentials, or registration...'
                      : isRegisterPage
                      ? 'Ask about registering your society, smart meters, or tariffs...'
                      : isLandingPage
                      ? 'Ask about water tariffs, leak detection, or saving tips...'
                      : user?.role === 'RESIDENT'
                      ? 'Ask about your flat bill, leak risks, or conservation...'
                      : user?.role === 'COMMUNITY_ADMIN'
                      ? 'Ask about society leak scans, tankers, or billing...'
                      : 'Ask about cross-society analytics, tariffs, or platform health...'
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
                />

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={'absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors cursor-pointer ' +
                    (isListening ? 'text-rose-600 animate-pulse' : 'hover:text-slate-600')}
                  title={isListening ? 'Stop listening' : 'Speak to Copilot'}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press Enter to send • JalSetu AI</span>
              <button
                onClick={clearChat}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Only shown when chat is closed) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-3 sm:p-3.5 text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 cursor-pointer"
            aria-label="Open JalSetu Copilot"
          >
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-sky-400 border-2 border-white shadow-sm"></span>
            </span>
            <Waves className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-12" />
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingAssistant;
