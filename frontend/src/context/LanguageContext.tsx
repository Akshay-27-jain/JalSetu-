import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LanguageItem {
  code: string;
  name: string;
  native: string;
  flag: string;
  googleCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  // Primary Indian Regional & National Languages
  { code: 'EN', name: 'English', native: 'English', flag: '🇬🇧', googleCode: 'en' },
  { code: 'HI', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', googleCode: 'hi' },
  { code: 'MR', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', googleCode: 'mr' },
  { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', googleCode: 'gu' },
  { code: 'TA', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', googleCode: 'ta' },
  { code: 'TE', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', googleCode: 'te' },
  { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', googleCode: 'kn' },
  { code: 'BN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', googleCode: 'bn' },
  { code: 'ML', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', googleCode: 'ml' },
  { code: 'PA', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', googleCode: 'pa' },
  { code: 'OR', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳', googleCode: 'or' },
  { code: 'AS', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳', googleCode: 'as' },
  { code: 'UR', name: 'Urdu', native: 'اردو', flag: '🇮🇳', googleCode: 'ur' },
  { code: 'SA', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🇮🇳', googleCode: 'sa' },
  { code: 'NE', name: 'Nepali', native: 'नेपाली', flag: '🇳🇵', googleCode: 'ne' },
  { code: 'SD', name: 'Sindhi', native: 'سنڌي', flag: '🇵🇰', googleCode: 'sd' },

  // Major Global Languages
  { code: 'ES', name: 'Spanish', native: 'Español', flag: '🇪🇸', googleCode: 'es' },
  { code: 'FR', name: 'French', native: 'Français', flag: '🇫🇷', googleCode: 'fr' },
  { code: 'DE', name: 'German', native: 'Deutsch', flag: '🇩🇪', googleCode: 'de' },
  { code: 'IT', name: 'Italian', native: 'Italiano', flag: '🇮🇹', googleCode: 'it' },
  { code: 'PT', name: 'Portuguese', native: 'Português', flag: '🇵🇹', googleCode: 'pt' },
  { code: 'RU', name: 'Russian', native: 'Русский', flag: '🇷🇺', googleCode: 'ru' },
  { code: 'ZH_CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳', googleCode: 'zh-CN' },
  { code: 'ZH_TW', name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼', googleCode: 'zh-TW' },
  { code: 'JA', name: 'Japanese', native: '日本語', flag: '🇯🇵', googleCode: 'ja' },
  { code: 'KO', name: 'Korean', native: '한국어', flag: '🇰🇷', googleCode: 'ko' },
  { code: 'AR', name: 'Arabic', native: 'العربية', flag: '🇸🇦', googleCode: 'ar' },
  { code: 'TR', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', googleCode: 'tr' },
  { code: 'NL', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', googleCode: 'nl' },
  { code: 'PL', name: 'Polish', native: 'Polski', flag: '🇵🇱', googleCode: 'pl' },
  { code: 'SV', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', googleCode: 'sv' },
  { code: 'NO', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴', googleCode: 'no' },
  { code: 'DA', name: 'Danish', native: 'Dansk', flag: '🇩🇰', googleCode: 'da' },
  { code: 'FI', name: 'Finnish', native: 'Suomi', flag: '🇫🇮', googleCode: 'fi' },
  { code: 'EL', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', googleCode: 'el' },
  { code: 'HE', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', googleCode: 'iw' },
  { code: 'ID', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', googleCode: 'id' },
  { code: 'MS', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', googleCode: 'ms' },
  { code: 'TH', name: 'Thai', native: 'ไทย', flag: '🇹🇭', googleCode: 'th' },
  { code: 'VI', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', googleCode: 'vi' },
  { code: 'TL', name: 'Filipino (Tagalog)', native: 'Filipino', flag: '🇵🇭', googleCode: 'tl' },
  { code: 'UK', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', googleCode: 'uk' },
  { code: 'CS', name: 'Czech', native: 'Čeština', flag: '🇨🇿', googleCode: 'cs' },
  { code: 'HU', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺', googleCode: 'hu' },
  { code: 'RO', name: 'Romanian', native: 'Română', flag: '🇷🇴', googleCode: 'ro' },
  { code: 'BG', name: 'Bulgarian', native: 'Български', flag: '🇧🇬', googleCode: 'bg' },
  { code: 'HR', name: 'Croatian', native: 'Hrvatski', flag: '🇭🇷', googleCode: 'hr' },
  { code: 'SR', name: 'Serbian', native: 'Српски', flag: '🇷🇸', googleCode: 'sr' },
  { code: 'SK', name: 'Slovak', native: 'Slovenčina', flag: '🇸🇰', googleCode: 'sk' },
  { code: 'SL', name: 'Slovenian', native: 'Slovenščina', flag: '🇸🇮', googleCode: 'sl' },
  { code: 'LT', name: 'Lithuanian', native: 'Lietuvių', flag: '🇱🇹', googleCode: 'lt' },
  { code: 'LV', name: 'Latvian', native: 'Latviešu', flag: '🇱🇻', googleCode: 'lv' },
  { code: 'ET', name: 'Estonian', native: 'Eesti', flag: '🇪🇪', googleCode: 'et' },
  { code: 'FA', name: 'Persian (Farsi)', native: 'فارسی', flag: '🇮🇷', googleCode: 'fa' },
  { code: 'PS', name: 'Pashto', native: 'پښتو', flag: '🇦🇫', googleCode: 'ps' },
  { code: 'SW', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', googleCode: 'sw' },
  { code: 'AM', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', googleCode: 'am' },
  { code: 'YO', name: 'Yoruba', native: 'Èdè Yorùbá', flag: '🇳🇬', googleCode: 'yo' },
  { code: 'ZU', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', googleCode: 'zu' },
  { code: 'AF', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', googleCode: 'af' },
  { code: 'SI', name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰', googleCode: 'si' },
  { code: 'MY', name: 'Burmese (Myanmar)', native: 'မြန်မာစာ', flag: '🇲🇲', googleCode: 'my' },
  { code: 'KM', name: 'Khmer', native: 'ភាសាខ្មែរ', flag: '🇰🇭', googleCode: 'km' },
  { code: 'LO', name: 'Lao', native: 'ພາສາລາວ', flag: '🇱🇦', googleCode: 'lo' },
  { code: 'MN', name: 'Mongolian', native: 'Монгол', flag: '🇲🇳', googleCode: 'mn' },
  { code: 'KK', name: 'Kazakh', native: 'Қазақ тілі', flag: '🇰🇿', googleCode: 'kk' },
  { code: 'UZ', name: 'Uzbek', native: 'Oʻzbekcha', flag: '🇺🇿', googleCode: 'uz' },
  { code: 'AZ', name: 'Azerbaijani', native: 'Azərbaycan dili', flag: '🇦🇿', googleCode: 'az' },
  { code: 'KA', name: 'Georgian', native: 'ქართული', flag: '🇬🇪', googleCode: 'ka' },
  { code: 'HY', name: 'Armenian', native: 'Հայերեն', flag: '🇦🇲', googleCode: 'hy' },
  { code: 'SQ', name: 'Albanian', native: 'Shqip', flag: '🇦🇱', googleCode: 'sq' },
  { code: 'BS', name: 'Bosnian', native: 'Bosanski', flag: '🇧🇦', googleCode: 'bs' },
  { code: 'MK', name: 'Macedonian', native: 'Македонски', flag: '🇲🇰', googleCode: 'mk' },
  { code: 'BE', name: 'Belarusian', native: 'Беларуская', flag: '🇧🇾', googleCode: 'be' },
  { code: 'GA', name: 'Irish', native: 'Gaeilge', flag: '🇮🇪', googleCode: 'ga' },
  { code: 'CY', name: 'Welsh', native: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', googleCode: 'cy' },
  { code: 'GD', name: 'Scottish Gaelic', native: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', googleCode: 'gd' },
  { code: 'EU', name: 'Basque', native: 'Euskara', flag: '🇪🇸', googleCode: 'eu' },
  { code: 'CA', name: 'Catalan', native: 'Català', flag: '🇪🇸', googleCode: 'ca' },
  { code: 'GL', name: 'Galician', native: 'Galego', flag: '🇪🇸', googleCode: 'gl' },
  { code: 'IS', name: 'Icelandic', native: 'Íslenska', flag: '🇮🇸', googleCode: 'is' },
  { code: 'MT', name: 'Maltese', native: 'Malti', flag: '🇲🇹', googleCode: 'mt' },
  { code: 'LB', name: 'Luxembourgish', native: 'Lëtzebuergesch', flag: '🇱🇺', googleCode: 'lb' },
  { code: 'EO', name: 'Esperanto', native: 'Esperanto', flag: '🌐', googleCode: 'eo' },
  { code: 'LA', name: 'Latin', native: 'Latina', flag: '🏛️', googleCode: 'la' },
  { code: 'YI', name: 'Yiddish', native: 'ייִדיש', flag: '✡️', googleCode: 'yi' },
  { code: 'HAW', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi', flag: '🌺', googleCode: 'haw' },
  { code: 'SM', name: 'Samoan', native: 'Gagana Sāmoa', flag: '🇼🇸', googleCode: 'sm' },
  { code: 'MI', name: 'Maori', native: 'Te Reo Māori', flag: '🇳🇿', googleCode: 'mi' },
  { code: 'JV', name: 'Javanese', native: 'Basa Jawa', flag: '🇮🇩', googleCode: 'jw' },
  { code: 'SU', name: 'Sundanese', native: 'Basa Sunda', flag: '🇮🇩', googleCode: 'su' },
  { code: 'CEB', name: 'Cebuano', native: 'Sinugboanon', flag: '🇵🇭', googleCode: 'ceb' },
  { code: 'MG', name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬', googleCode: 'mg' },
  { code: 'SO', name: 'Somali', native: 'Soomaaliga', flag: '🇸🇴', googleCode: 'so' },
  { code: 'HA', name: 'Hausa', native: 'Harshen Hausa', flag: '🇳🇬', googleCode: 'ha' },
  { code: 'IG', name: 'Igbo', native: 'Asụsụ Igbo', flag: '🇳🇬', googleCode: 'ig' },
  { code: 'SN', name: 'Shona', native: 'chiShona', flag: '🇿🇼', googleCode: 'sn' },
  { code: 'ST', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸', googleCode: 'st' },
  { code: 'XH', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', googleCode: 'xh' },
  { code: 'HT', name: 'Haitian Creole', native: 'Kreyòl Ayisyen', flag: '🇭🇹', googleCode: 'ht' },
  { code: 'CO', name: 'Corsican', native: 'Corsu', flag: '🇫🇷', googleCode: 'co' },
  { code: 'FY', name: 'Frisian', native: 'Frysk', flag: '🇳🇱', googleCode: 'fy' },
  { code: 'HMN', name: 'Hmong', native: 'Hmoob', flag: '🌏', googleCode: 'hmn' },
  { code: 'KU', name: 'Kurdish', native: 'Kurdî', flag: '🇹🇯', googleCode: 'ku' },
  { code: 'TG', name: 'Tajik', native: 'Тоҷикӣ', flag: '🇹🇯', googleCode: 'tg' },
  { code: 'TT', name: 'Tatar', native: 'Татар теле', flag: '🇷🇺', googleCode: 'tt' },
  { code: 'TK', name: 'Turkmen', native: 'Türkmençe', flag: '🇹🇲', googleCode: 'tk' },
  { code: 'UG', name: 'Uyghur', native: 'ئۇيغۇرچە', flag: '🇨🇳', googleCode: 'ug' },
  { code: 'RW', name: 'Kinyarwanda', native: 'Ikinyarwanda', flag: '🇷🇼', googleCode: 'rw' },
  { code: 'NY', name: 'Chichewa', native: 'Chinyanja', flag: '🇲🇼', googleCode: 'ny' },
];

export type LanguageCode = string;

const CORE_TRANSLATIONS: Record<string, Record<string, string>> = {
  EN: {
    dashboard: 'Dashboard',
    activityOverview: 'Activity Overview',
    consumptionTrends: 'Consumption Trends',
    top6Flats: 'Top 6 Flats Stats',
    householdsDirectory: 'Households Directory',
    meterReadings: 'Meter Readings',
    singleReadingEntry: 'Single Reading Entry',
    bulkCsvUpload: 'Bulk CSV Upload',
    invoicesBilling: 'Invoices & Billing',
    bulkPurchases: 'Bulk Water Purchases',
    leakageAlerts: 'Leakage & Alerts',
    apportionmentReports: 'Apportionment Reports',
    tariffSlabs: 'Tariff Slabs & Pricing',
    announcements: 'Community Notices',
    profileSettings: 'Profile & Settings',
    signOut: 'Sign Out',
    totalHouseholds: 'Total Households',
    currentMonthUsage: 'Current Month Usage',
    activeAlerts: 'Active Alerts',
    avgDailyUsage: 'Avg Daily Usage',
    recentUsageLogs: 'Recent Usage Logs',
    allRightsReserved: 'JalSetu Smart Water Management',
    waterMonitoringPortal: 'Water Usage & Meter Operations',
    selectBillingMonth: 'Select Billing Month',
    activeCycle: 'Active Cycle',
    jumpCurrentMonth: 'Current Month (Aug 2026)',
    communityManagementPanel: 'Community Management Panel',
    residentWaterPortal: 'Resident Water Portal',
    platformOwnerConsole: 'Platform Owner Management Console',
    waterSavingTips: 'Water Saving Tips',
    myInvoices: 'My Invoices',
    usageHistory: 'Usage History',
    overuseAlerts: 'Overuse & Leak Alerts',
    conservationReports: 'Conservation Reports',
    supportDesk: 'Support Desk & Concerns',
    supportConcerns: 'Support & Concerns',
    myProfile: 'My Profile',
    dailyWaterActivity: 'Daily Water Activity',
    monthlyTrendChart: 'Monthly Trend Chart',
    slabConsumption: 'Slab Consumption',
    platformActivity: 'Platform Activity',
    globalCommunities: 'Global Communities',
    overallStatistics: 'Overall Statistics',
    adminsDirectory: 'Admins Directory',
    analyticsLogs: 'Analytics & Logs',
    adminProfile: 'Admin Profile',
    waterManagementForCommunities: 'Smart Water Management for Smarter Communities',
    registerCommunity: 'Register Community',
    signIn: 'Sign In',
    realTimeWaterTracking: 'Real-Time Water Tracking',
    fairAndAutoApportionment: 'Fair & Automated Apportionment',
    multiTenantArchitecture: 'Multi-Tenant Architecture',
    welcomeBack: 'Welcome Back',
    personalUsageMonitoring: 'Personal Usage Monitoring & Consumption Analytics',
    welcomeHome: 'Welcome home',
    refresh: 'Refresh',
    payViewBills: 'Pay & View Bills',
    totalVolumeConsumed: 'Total volume consumed',
    lastReading: 'Last Meter Reading',
    communityBenchmark: 'Community Benchmark',
    loggedOn: 'Logged on',
    noLogsYet: 'No logs yet',
    aboveCommunityAvg: '⚠️ Above community average',
    belowCommunityAvg: '🌟 Below community average',
    unreadNotices: 'unread notices',
    noActiveAlerts: 'No active alerts',
    overviewTrends: 'Overview & Trends',
    peerBenchmarking: 'Peer Benchmarking & Efficiency',
    invoicesBillingHistory: 'Invoices & Billing History',
    waterConsumptionTrendKl: 'Water Consumption Trend (kL)',
    dailyMeteredUsage: 'Daily metered usage over recent recorded dates',
    viewFullHistory: 'View Full History',
    currentBillingCycle: 'Current Billing Cycle',
    tier1SubsidizedAllowance: 'Tier 1 Subsidized Allowance:',
    baseMaintenanceFee: 'Base Maintenance Fee:',
    estimatedMeteredWater: 'Estimated Metered Water:',
    estimatedMonthBill: 'Estimated Month Bill:',
    allPriorSettled: 'All prior monthly invoices are fully settled!',
    unpaidBill: 'Unpaid Bill:',
    dueOn: 'Due on',
    payNow: 'Pay Now',
    liveDirectory: 'LIVE DIRECTORY',
    adminDesk: 'Admin Desk',
    support: 'Support',
    logWaterReading: '+ Log Water Reading',
    addResidentFlat: '+ Add Resident / Flat',
    allCommunity: 'All Community',
    personUnits: 'Person Units',
    lPersonDay: 'L/Person/Day',
    conservationScore: 'Conservation Score',
    dailyPerPerson: 'Daily Per Person',
    myConsumption: 'My Consumption',
    grade: 'Grade',
    peerBenchmarkingCommunity: 'Peer Benchmarking & Community Comparison',
    noUsageLogsAvailable: 'No usage logs available',
    logFirstReading: 'Log your first meter reading to start tracking trends.',
    done: 'Done',
    myWaterInvoices: 'My Water Invoices & Payments',
    invoicesSubtitle: 'Review monthly metered consumption bills, tiered slab calculations, and pay securely via Razorpay.',
    refreshInvoices: 'Refresh Invoices',
    allCaughtUp: 'All Caught Up!',
    noPendingDues: 'You have no pending water utility dues. Thank you for your prompt payments!',
    communityTariffSlabs: 'Community Tariff Slabs Transparency',
    baseFee: 'BASE FEE',
    fixedConnectionFee: 'Fixed connection fee',
    tier1: 'TIER 1 (0-10 KL)',
    essentialBaseUsage: 'Essential base usage',
    tier2: 'TIER 2 (10-25 KL)',
    standardUsageSlab: 'Standard usage slab',
    tier3: 'TIER 3 (>25 KL)',
    highConsumptionSurcharge: 'High consumption surcharge',
  },
  KN: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    activityOverview: 'ಚಟುವಟಿಕೆ ಅವಲೋಕನ',
    consumptionTrends: 'ಬಳಕೆಯ ಪ್ರವೃತ್ತಿಗಳು',
    top6Flats: 'ಉನ್ನತ 6 ಫ್ಲಾಟ್‌ಗಳ ಅಂಕಿಅಂಶ',
    householdsDirectory: 'ಮನೆಗಳ ಡೈರೆಕ್ಟರಿ',
    meterReadings: 'ಮೀಟರ್ ರೀಡಿಂಗ್‌ಗಳು',
    singleReadingEntry: 'ಏಕ ಮೀಟರ್ ರೀಡಿಂಗ್ ದಾಖಲೆ',
    bulkCsvUpload: 'ಬಲ್ಕ್ CSV ಅಪ್‌ಲೋಡ್',
    invoicesBilling: 'ಇನ್‌ವಾಯ್ಸ್‌ಗಳು & ಬಿಲ್ಲಿಂಗ್',
    bulkPurchases: 'ಬಲ್ಕ್ ನೀರಿನ ಖರೀದಿ',
    leakageAlerts: 'ಸೋರಿಕೆ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು',
    apportionmentReports: 'ನೀರಿನ ವಿತರಣಾ ವರದಿಗಳು',
    tariffSlabs: 'ಸುಂಕದ ದರಗಳು & ಬೆಲೆ',
    announcements: 'ಸಮುದಾಯ ಪ್ರಕಟಣೆಗಳು',
    profileSettings: 'ಪ್ರೊಫೈಲ್ & ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    signOut: 'ಸೈನ್ ಔಟ್',
    totalHouseholds: 'ಒಟ್ಟು ನೋಂದಾಯಿತ ಮನೆಗಳು',
    currentMonthUsage: 'ಪ್ರಸ್ತುತ ತಿಂಗಳ ನೀರಿನ ಬಳಕೆ',
    activeAlerts: 'ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು',
    avgDailyUsage: 'ಸರಾಸರಿ ದೈನಂದಿನ ಬಳಕೆ',
    recentUsageLogs: 'ಇತ್ತೀಚಿನ ರೀಡಿಂಗ್ ಲಾಗ್‌ಗಳು',
    allRightsReserved: 'ಜಲಸೇತು — ಸ್ಮಾರ್ಟ್ ವಾಟರ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್',
    waterMonitoringPortal: 'ನೀರಿನ ಬಳಕೆ ಮೇಲ್ವಿಚಾರಣೆ & ಬಿಲ್ಲಿಂಗ್ ಪೋರ್ಟಲ್',
    selectBillingMonth: 'ಬಿಲ್ಲಿಂಗ್ ತಿಂಗಳು ಆಯ್ಕೆಮಾಡಿ',
    activeCycle: 'ಸಕ್ರಿಯ ಚಕ್ರ',
    jumpCurrentMonth: 'ಪ್ರಸ್ತುತ ತಿಂಗಳು (ಆಗಸ್ಟ್ 2026)',
    communityManagementPanel: 'ಸಮುದಾಯ ನಿರ್ವಹಣಾ ಫಲಕ',
    residentWaterPortal: 'ನಿವಾಸಿ ನೀರಿನ ಪೋರ್ಟಲ್',
    platformOwnerConsole: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಮಾಲೀಕರ ನಿರ್ವಹಣಾ ಕನ್ಸೋಲ್',
    waterSavingTips: 'ನೀರು ಉಳಿಸುವ ಸಲಹೆಗಳು',
    myInvoices: 'ನನ್ನ ಬಿಲ್‌ಗಳು',
    usageHistory: 'ಬಳಕೆಯ ಇತಿಹಾಸ',
    overuseAlerts: 'ಅಧಿಕ ಬಳಕೆ & ಸೋರಿಕೆ ಎಚ್ಚರಿಕೆಗಳು',
    conservationReports: 'ಸಂರಕ್ಷಣಾ ವರದಿಗಳು',
    supportDesk: 'ಬೆಂಬಲ & ಕಾಳಜಿಗಳು',
    supportConcerns: 'ಬೆಂಬಲ & ಸಹಾಯ',
    myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    dailyWaterActivity: 'ದೈನಂದಿನ ನೀರಿನ ಚಟುವಟಿಕೆ',
    monthlyTrendChart: 'ಮಾಸಿಕ ಪ್ರವೃತ್ತಿ ಚಾರ್ಟ್',
    slabConsumption: 'ಸ್ಲ್ಯಾಬ್ ಬಳಕೆ',
    platformActivity: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಚಟುವಟಿಕೆ',
    globalCommunities: 'ಜಾಗತಿಕ ಸಮುದಾಯಗಳು',
    overallStatistics: 'ಒಟ್ಟಾರೆ ಅಂಕಿಅಂಶಗಳು',
    adminsDirectory: 'ನಿರ್ವಾಹಕರ ಡೈರೆಕ್ಟರಿ',
    analyticsLogs: 'ವಿಶ್ಲೇಷಣೆ & ಲಾಗ್‌ಗಳು',
    adminProfile: 'ನಿರ್ವಾಹಕ ಪ್ರೊಫೈಲ್',
    waterManagementForCommunities: 'ಸ್ಮಾರ್ಟ್ ಸಮುದಾಯಗಳಿಗಾಗಿ ಚುರುಕಾದ ನೀರಿನ ನಿರ್ವಹಣೆ',
    registerCommunity: 'ಸಮುದಾಯವನ್ನು ನೋಂದಾಯಿಸಿ',
    signIn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ',
    realTimeWaterTracking: 'ನೈಜ-ಸಮಯದ ನೀರಿನ ಟ್ರ್ಯಾಕಿಂಗ್',
    fairAndAutoApportionment: 'ನ್ಯಾಯಯುತ & ಸ್ವಯಂಚಾಲಿತ ಹಂಚಿಕೆ',
    multiTenantArchitecture: 'ಬಹು-ಬಾಡಿಗೆದಾರರ ವ್ಯವಸ್ಥೆ',
    welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ',
    personalUsageMonitoring: 'ವೈಯಕ್ತಿಕ ನೀರಿನ ಬಳಕೆ ಮೇಲ್ವಿಚಾರಣೆ & ಬಳಕೆ ವಿಶ್ಲೇಷಣೆ',
    welcomeHome: 'ಸ್ವಾಗತ',
    refresh: 'ರಿಫ್ರೆಶ್',
    payViewBills: 'ಬಿಲ್‌ಗಳನ್ನು ಪಾವತಿಸಿ & ವೀಕ್ಷಿಸಿ',
    totalVolumeConsumed: 'ಒಟ್ಟು ಬಳಕೆಯಾದ ನೀರಿನ ಪ್ರಮಾಣ',
    lastReading: 'ಕೊನೆಯ ಮೀಟರ್ ರೀಡಿಂಗ್',
    communityBenchmark: 'ಸಮುದಾಯದ ಸರಾಸರಿ ಮಾನದಂಡ',
    loggedOn: 'ದಾಖಲಿಸಲಾಗಿದೆ',
    noLogsYet: 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ',
    aboveCommunityAvg: '⚠️ ಸಮುದಾಯದ ಸರಾಸರಿಗಿಂತ ಹೆಚ್ಚು',
    belowCommunityAvg: '🌟 ಸಮುದಾಯದ ಸರಾಸರಿಗಿಂತ ಕಡಿಮೆ',
    unreadNotices: 'ಓದದ ಸೂಚನೆಗಳು',
    noActiveAlerts: 'ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ',
    overviewTrends: 'ಅವಲೋಕನ & ಪ್ರವೃತ್ತಿಗಳು',
    peerBenchmarking: 'ಸಹವರ್ತಿ ಹೋಲಿಕೆ & ದಕ್ಷತೆ',
    invoicesBillingHistory: 'ಇನ್‌ವಾಯ್ಸ್‌ಗಳು & ಬಿಲ್ಲಿಂಗ್ ಇತಿಹಾಸ',
    waterConsumptionTrendKl: 'ನೀರಿನ ಬಳಕೆಯ ಪ್ರವೃತ್ತಿ (kL)',
    dailyMeteredUsage: 'ಇತ್ತೀಚಿನ ದಿನಾಂಕಗಳ ದೈನಂದಿನ ಮೀಟರ್ ಬಳಕೆ',
    viewFullHistory: 'ಸಂಪೂರ್ಣ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ',
    currentBillingCycle: 'ಪ್ರಸ್ತುತ ಬಿಲ್ಲಿಂಗ್ ಚಕ್ರ',
    tier1SubsidizedAllowance: 'ಹಂತ 1 ರಿಯಾಯಿತಿ ಮಿತಿ:',
    baseMaintenanceFee: 'ಮೂಲ ನಿರ್ವಹಣಾ ಶುಲ್ಕ:',
    estimatedMeteredWater: 'ಅಂದಾಜು ಮೀಟರ್ ನೀರಿನ ಶುಲ್ಕ:',
    estimatedMonthBill: 'ಅಂದಾಜು ಮಾಸಿಕ ಬಿಲ್:',
    allPriorSettled: 'ಹಿಂದಿನ ಎಲ್ಲಾ ಮಾಸಿಕ ಇನ್‌ವಾಯ್ಸ್‌ಗಳನ್ನು ಪಾವತಿಸಲಾಗಿದೆ!',
    unpaidBill: 'ಪಾವತಿಸದ ಬಿಲ್:',
    dueOn: 'ಅಂತಿಮ ದಿನಾಂಕ:',
    payNow: 'ಈಗ ಪಾವತಿಸಿ',
    liveDirectory: 'ಲೈವ್ ಡೈರೆಕ್ಟರಿ',
    adminDesk: 'ನಿರ್ವಾಹಕ ಡೆಸ್ಕ್',
    support: 'ಬೆಂಬಲ',
    logWaterReading: '+ ಮೀಟರ್ ರೀಡಿಂಗ್ ದಾಖಲಿಸಿ',
    addResidentFlat: '+ ನಿವಾಸಿ / ಫ್ಲಾಟ್ ಸೇರಿಸಿ',
    allCommunity: 'ಎಲ್ಲಾ ಸಮುದಾಯ',
    personUnits: 'ವ್ಯಕ್ತಿಗಳ ಘಟಕಗಳು',
    lPersonDay: 'ಲೀ/ವ್ಯಕ್ತಿ/ದಿನ',
    conservationScore: 'ಸಂರಕ್ಷಣಾ ಸ್ಕೋರ್',
    dailyPerPerson: 'ದೈನಂದಿನ ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ',
    myConsumption: 'ನನ್ನ ಬಳಕೆ',
    grade: 'ಶ್ರೇಣಿ',
    peerBenchmarkingCommunity: 'ಸಹವರ್ತಿ ಹೋಲಿಕೆ ಮತ್ತು ಸಮುದಾಯ ಹೋಲಿಕೆ',
    logFirstReading: 'ಪ್ರವೃತ್ತಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಿಮ್ಮ ಮೊದಲ ಮೀಟರ್ ರೀಡಿಂಗ್ ದಾಖಲಿಸಿ.',
    done: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    myWaterInvoices: 'ನನ್ನ ನೀರಿನ ಇನ್‌ವಾಯ್ಸ್‌ಗಳು ಮತ್ತು ಪಾವತಿಗಳು',
    invoicesSubtitle: 'ಮಾಸಿಕ ನೀರಿನ ಮೀಟರ್ ಬಿಲ್‌ಗಳು, ಹಂತಗಳ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ರೇಜರ್‌ಪೇ ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಪಾವತಿಸಿ.',
    refreshInvoices: 'ಇನ್‌ವಾಯ್ಸ್‌ಗಳನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ',
    allCaughtUp: 'ಎಲ್ಲಾ ಬಿಲ್‌ಗಳು ಪಾವತಿಸಲಾಗಿದೆ!',
    noPendingDues: 'ನಿಮಗೆ ಯಾವುದೇ ಬಾಕಿ ನೀರಿನ ಬಿಲ್‌ಗಳಿಲ್ಲ. ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!',
    communityTariffSlabs: 'ಸಮುದಾಯದ ಸುಂಕದ ಹಂತಗಳ ಪಾರದರ್ಶಕತೆ',
    baseFee: 'ಮೂಲ ಶುಲ್ಕ',
    fixedConnectionFee: 'ಸ್ಥಿರ ಸಂಪರ್ಕ ಶುಲ್ಕ',
    tier1: 'ಹಂತ 1 (0-10 KL)',
    essentialBaseUsage: 'ಅಗತ್ಯ ಮೂಲ ಬಳಕೆ',
    tier2: 'ಹಂತ 2 (10-25 KL)',
    standardUsageSlab: 'ಪ್ರಮಾಣಿತ ಬಳಕೆಯ ಹಂತ',
    tier3: 'ಹಂತ 3 (>25 KL)',
    highConsumptionSurcharge: 'ಹೆಚ್ಚಿನ ಬಳಕೆಯ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ',
  },
  HI: {
    dashboard: 'डैशबोर्ड',
    activityOverview: 'गतिविधि विवरण',
    consumptionTrends: 'खपत के रुझान',
    top6Flats: 'शीर्ष 6 फ्लैट आंकड़े',
    householdsDirectory: 'निवासी और फ्लैट डायरेक्टरी',
    meterReadings: 'मीटर रीडिंग दर्ज करें',
    singleReadingEntry: 'एकल मीटर रीडिंग',
    bulkCsvUpload: 'बल्क CSV अपलोड',
    invoicesBilling: 'चालान और बिलिंग',
    bulkPurchases: 'थोक जल खरीद',
    leakageAlerts: 'जल रिसाव और अलर्ट',
    apportionmentReports: 'जल आवंटन रिपोर्ट',
    tariffSlabs: 'जल दर स्लैब और मूल्य निर्धारण',
    announcements: 'सोसायटी सूचनाएं',
    profileSettings: 'मेरी प्रोफ़ाइल और सेटिंग्स',
    signOut: 'लॉग आउट करें',
    totalHouseholds: 'कुल पंजीकृत फ्लैट',
    currentMonthUsage: 'चालू माह की जल खपत',
    activeAlerts: 'सक्रिय चेतावनियाँ',
    avgDailyUsage: 'औसत दैनिक उपयोग',
    recentUsageLogs: 'हाल ही में दर्ज रीडिंग',
    allRightsReserved: 'जलसेतु स्मार्ट जल प्रबंधन',
    waterMonitoringPortal: 'सोसायटी जल प्रबंधन एवं मीटर निगरानी',
    selectBillingMonth: 'बिलिंग माह चुनें',
    activeCycle: 'सक्रिय चक्र',
    jumpCurrentMonth: 'वर्तमान माह (अगस्त 2026)',
    communityManagementPanel: 'सोसायटी जल प्रबंधन पैनल',
    residentWaterPortal: 'निवासी जल पोर्टल',
    platformOwnerConsole: 'प्लेटफ़ॉर्म स्वामी प्रबंधन कंसोल',
    waterSavingTips: 'जल बचत के उपाय',
    myInvoices: 'मेरे बिल',
    usageHistory: 'खपत का इतिहास',
    overuseAlerts: 'अत्यधिक खपत और रिसाव चेतावनी',
    conservationReports: 'संरक्षण रिपोर्ट',
    supportDesk: 'सहायता केंद्र और चिंताएं',
    supportConcerns: 'सहायता एवं सहायता',
    myProfile: 'मेरी प्रोफ़ाइल',
    dailyWaterActivity: 'दैनिक जल गतिविधि',
    monthlyTrendChart: 'मासिक रुझान चार्ट',
    slabConsumption: 'स्लैब खपत',
    platformActivity: 'प्लेटफ़ॉर्म गतिविधि',
    globalCommunities: 'समग्र सोसायटियां',
    overallStatistics: 'कुल आंकड़े',
    adminsDirectory: 'प्रशासक डायरेक्टरी',
    analyticsLogs: 'एनालिटिक्स एवं लॉग्स',
    adminProfile: 'प्रशासक प्रोफ़ाइल',
    waterManagementForCommunities: 'स्मार्ट सोसायटियों के लिए स्मार्ट जल प्रबंधन',
    registerCommunity: 'सोसायटी रजिस्टर करें',
    signIn: 'लॉग इन करें',
    realTimeWaterTracking: 'रियल-टाइम जल निगरानी',
    fairAndAutoApportionment: 'सटीक और पारदर्शी आवंटन',
    multiTenantArchitecture: 'मल्टी-टेनेंट सुरक्षा',
    welcomeBack: 'वापसी पर स्वागत है',
    personalUsageMonitoring: 'व्यक्तिगत जल उपयोग निगरानी एवं खपत विश्लेषण',
    welcomeHome: 'स्वागत है',
    refresh: 'रिफ्रेश',
    payViewBills: 'बिल देखें और भुगतान करें',
    totalVolumeConsumed: 'कुल खपत मात्रा',
    lastReading: 'अंतिम मीटर रीडिंग',
    communityBenchmark: 'सोसायटी औसत बेंचमार्क',
    loggedOn: 'दर्ज किया गया',
    noLogsYet: 'अभी तक कोई रिकॉर्ड नहीं',
    aboveCommunityAvg: '⚠️ सोसायटी औसत से अधिक',
    belowCommunityAvg: '🌟 सोसायटी औसत से कम',
    unreadNotices: 'अपठित सूचनाएं',
    noActiveAlerts: 'कोई सक्रिय चेतावनी नहीं',
    overviewTrends: 'अवलोकन एवं रुझान',
    peerBenchmarking: 'साथी बेंचमार्किंग एवं दक्षता',
    invoicesBillingHistory: 'चालान एवं बिलिंग इतिहास',
    waterConsumptionTrendKl: 'जल खपत का रुझान (kL)',
    dailyMeteredUsage: 'हाल ही में दर्ज तिथियों में दैनिक मीटर उपयोग',
    viewFullHistory: 'पूरा इतिहास देखें',
    currentBillingCycle: 'वर्तमान बिलिंग चक्र',
    tier1SubsidizedAllowance: 'टियर 1 रियायती सीमा:',
    baseMaintenanceFee: 'मूल रखरखाव शुल्क:',
    estimatedMeteredWater: 'अनुमानित मीटर युक्त जल शुल्क:',
    estimatedMonthBill: 'माह का अनुमानित बिल:',
    allPriorSettled: 'पिछले सभी मासिक चालानों का पूर्ण भुगतान हो चुका है!',
    unpaidBill: 'बकाया बिल:',
    dueOn: 'अंतिम तिथि:',
    payNow: 'अभी भुगतान करें',
    liveDirectory: 'लाइव डायरेक्टरी',
    adminDesk: 'प्रशासक डेस्क',
    support: 'सहायता',
    logWaterReading: '+ मीटर रीडिंग दर्ज करें',
    addResidentFlat: '+ निवासी / फ्लैट जोड़ें',
    allCommunity: 'समग्र सोसायटी',
    personUnits: 'व्यक्ति यूनिट्स',
    lPersonDay: 'लीटर/व्यक्ति/दिन',
    conservationScore: 'संरक्षण स्कोर',
    dailyPerPerson: 'प्रति व्यक्ति दैनिक',
    myConsumption: 'मेरी खपत',
    grade: 'ग्रेड',
    peerBenchmarkingCommunity: 'साथी बेंचमार्किंग एवं सोसायटी तुलना',
    logFirstReading: 'ट्रेंड्स देखने के लिए अपनी पहली मीटर रीडिंग दर्ज करें।',
    done: 'पूर्ण',
    myWaterInvoices: 'मेरे पानी के चालान और भुगतान',
    invoicesSubtitle: 'मासिक मीटर खपत बिल, स्तरीय स्लैब गणना देखें और रेज़रपे के माध्यम से सुरक्षित भुगतान करें।',
    refreshInvoices: 'चालान रीफ्रेश करें',
    allCaughtUp: 'सभी बिल चुकता!',
    noPendingDues: 'आपका कोई बकाया पानी का बिल नहीं है। समय पर भुगतान के लिए धन्यवाद!',
    communityTariffSlabs: 'सोसायटी जल टैरिफ स्लैब पारदर्शिता',
    baseFee: 'मूल शुल्क',
    fixedConnectionFee: 'निश्चित कनेक्शन शुल्क',
    tier1: 'टियर 1 (0-10 KL)',
    essentialBaseUsage: 'आवश्यक आधारभूत उपयोग',
    tier2: 'टियर 2 (10-25 KL)',
    standardUsageSlab: 'मानक उपयोग स्लैब',
    tier3: 'टियर 3 (>25 KL)',
    highConsumptionSurcharge: 'उच्च खपत अधिभार',
  },
  MR: {
    dashboard: 'डॅशबोर्ड',
    activityOverview: 'कार्यकलाप आढावा',
    consumptionTrends: 'वापर ट्रेंड्स',
    top6Flats: 'शीर्ष ६ फ्लॅट्स',
    householdsDirectory: 'घरांची निर्देशिका',
    meterReadings: 'मीटर वाचन',
    singleReadingEntry: 'एकल मीटर नोंद',
    bulkCsvUpload: 'बल्क CSV अपलोड',
    invoicesBilling: 'पावती व बिलिंग',
    bulkPurchases: 'पाण्याची ठोक खरेदी',
    leakageAlerts: 'गळती व सतर्कता',
    apportionmentReports: 'पाणी वाटप अहवाल',
    tariffSlabs: 'दर रचना व किंमती',
    announcements: 'सोसायटीच्या सूचना',
    profileSettings: 'प्रोफाइल व सेटिंग्ज',
    signOut: 'बाहेर पडा',
    totalHouseholds: 'एकूण नोंदणीकृत घरे',
    currentMonthUsage: 'चालू महिन्याचा पाणी वापर',
    activeAlerts: 'सक्रिय सूचना',
    avgDailyUsage: 'सरासरी दैनिक वापर',
    recentUsageLogs: 'नुकतीच नोंदवलेली वाचने',
    allRightsReserved: 'जलसेतू — स्मार्ट जल व्यवस्थापन',
    waterMonitoringPortal: 'पाणी वापर व मीटर निरीक्षण',
    selectBillingMonth: 'बिलिंग महिना निवडा',
    activeCycle: 'ಸಕ್ರಿಯ ಬಿಲ್ಲಿಂಗ್ ಚಕ್ರ',
    jumpCurrentMonth: 'चालू महिना (ऑगस्ट २०२६)',
    communityManagementPanel: 'सोसायटी व्यवस्थापन पॅनेल',
    residentWaterPortal: 'रहिवासी जल पोर्टल',
    platformOwnerConsole: 'प्लॅटफॉर्म मालक कन्सोल',
    waterSavingTips: 'पाणी बचतीच्या टिप्स',
    myInvoices: 'माझी बिले',
    usageHistory: 'वापराचा इतिहास',
    overuseAlerts: 'जास्त वापर व गळती सूचना',
    conservationReports: 'संवर्धन अहवाल',
    supportDesk: 'मदत व तक्रारी',
    supportConcerns: 'मदत व आधार',
    myProfile: 'माझे प्रोफाइल',
    personalUsageMonitoring: 'वैयक्तिक पाणी वापर निरीक्षण आणि वापर विश्लेषण',
    welcomeHome: 'स्वागत आहे',
    refresh: 'रिफ्रेश',
    payViewBills: 'बिले भरा आणि पहा',
    totalVolumeConsumed: 'एकूण वापरलेले पाणी',
    lastReading: 'शेवटचे मीटर रीडिंग',
    communityBenchmark: 'सोसायटी सरासरी मानक',
    loggedOn: 'नोंदणी तारीख',
    noLogsYet: 'अजून नोंदी नाहीत',
    aboveCommunityAvg: '⚠️ सोसायटी सरासरीपेक्षा जास्त',
    belowCommunityAvg: '🌟 सोसायटी सरासरीपेक्षा कमी',
    unreadNotices: 'न वाचलेल्या सूचना',
    noActiveAlerts: 'कोणत्याही सक्रिय सूचना नाहीत',
    overviewTrends: 'आढावा व ट्रेंड्स',
    peerBenchmarking: 'तुलना आणि कार्यक्षमता',
    invoicesBillingHistory: 'बिले व इतिहास',
    waterConsumptionTrendKl: 'पाणी वापर ट्रेंड (kL)',
    dailyMeteredUsage: 'दैनंदिन मीटर वापर',
    viewFullHistory: 'पूर्ण इतिहास पहा',
    currentBillingCycle: 'चालू बिलिंग चक्र',
    tier1SubsidizedAllowance: 'टियर १ सवलत मर्यादा:',
    baseMaintenanceFee: 'मूलभूत देखभाल शुल्क:',
    estimatedMeteredWater: 'अंदाजे मीटर पाणी शुल्क:',
    estimatedMonthBill: 'अंदाजे मासिक बिल:',
    allPriorSettled: 'मागील सर्व बिले पूर्णपणे भरली आहेत!',
    unpaidBill: 'थकबाकी बिल:',
    dueOn: 'अंतिम तारीख:',
    payNow: 'आता भरा',
    liveDirectory: 'थेट निर्देशिका',
    adminDesk: 'प्रशासक डेस्क',
    support: 'मदत',
    logWaterReading: '+ मीटर नोंदवा',
    addResidentFlat: '+ रहिवासी जोडा',
    allCommunity: 'सर्व सोसायटी',
    personUnits: 'व्यक्ती युनिट्स',
    lPersonDay: 'लीटर/व्यक्ती/दिवस',
    conservationScore: 'संवर्धन स्कोअर',
    dailyPerPerson: 'दरडोई दैनिक वापर',
    myConsumption: 'माझा वापर',
    grade: 'श्रेणी',
    peerBenchmarkingCommunity: 'सोसायटी तुलना व सहकाऱ्यांशी तुलना',
    done: 'पूर्ण',
  },
  NE: {
    dashboard: 'ड्यासबोर्ड',
    activityOverview: 'गतिविधि अवलोकन',
    consumptionTrends: 'खपत प्रवृत्ति',
    top6Flats: 'शीर्ष ६ फ्ल्याट विवरण',
    householdsDirectory: 'फ्ल्याट निर्देशिका',
    meterReadings: 'मिटर रिडिङ',
    singleReadingEntry: 'एकल मिटर प्रविष्टि',
    bulkCsvUpload: 'बल्क CSV अपलोड',
    invoicesBilling: 'बीजक र बिलिङ',
    bulkPurchases: 'थोक पानी खरिद',
    leakageAlerts: 'चुहावट र चेतावनी',
    apportionmentReports: 'पानी वितरण प्रतिवेदन',
    tariffSlabs: 'शुल्क दर स्ल्याब',
    announcements: 'सूचनाहरू',
    profileSettings: 'प्रोफाइल र सेटिङ',
    signOut: 'साइन आउट',
    totalHouseholds: 'कुल दर्ता फ्ल्याट',
    currentMonthUsage: 'चालू महिनाको पानी खपत',
    activeAlerts: 'सक्रिय चेतावनी',
    avgDailyUsage: 'औसत दैनिक उपयोग',
    recentUsageLogs: 'हालैका रिडिङहरू',
    allRightsReserved: 'जलसेतु — स्मार्ट पानी व्यवस्थापन',
    waterMonitoringPortal: 'पानी अनुगमन र बिलिङ पोर्टल',
    selectBillingMonth: 'बिलिङ महिना छान्नुहोस्',
    activeCycle: 'सक्रिय चक्र',
    jumpCurrentMonth: 'वर्तमान महिना (अगस्ट २०२६)',
    communityManagementPanel: 'समुदाय व्यवस्थापन प्यानल',
    residentWaterPortal: 'बासिन्दा पानी पोर्टल',
    platformOwnerConsole: 'प्लेटफर्म मालिक कन्सोल',
    waterSavingTips: 'पानी बचतका उपायहरू',
    myInvoices: 'मेरो बिलहरू',
    usageHistory: 'खपत इतिहास',
    overuseAlerts: 'अत्यधिक प्रयोग र चुहावट चेतावनी',
    conservationReports: 'संरक्षण प्रतिवेदन',
    supportDesk: 'सहयोग डेस्क र गुनासो',
    supportConcerns: 'सहयोग र समर्थन',
    myProfile: 'मेरो प्रोफाइल',
    personalUsageMonitoring: 'व्यक्तिगत पानी प्रयोग अनुगमन र खपत विश्लेषण',
    welcomeHome: 'स्वागत छ',
    refresh: 'रिफ्रेस',
    payViewBills: 'बिल भुक्तानी र हेर्नुहोस्',
    totalVolumeConsumed: 'कुल खपत परिमाण',
    lastReading: 'अन्तिम मिटर रिडिङ',
    communityBenchmark: 'समुदाय औसत मानक',
    loggedOn: 'दर्ज मिति',
    noLogsYet: 'कुनै रेकर्ड छैन',
    aboveCommunityAvg: '⚠️ समुदाय औसत भन्दा बढी',
    belowCommunityAvg: '🌟 समुदाय औसत भन्दा कम',
    unreadNotices: 'नपढिएका सूचनाहरू',
    noActiveAlerts: 'कुनै सक्रिय चेतावनी छैन',
    overviewTrends: 'अवलोकन र प्रवृत्ति',
    peerBenchmarking: 'सहकर्मी तुलना र दक्षता',
    invoicesBillingHistory: 'बीजक र बिलिङ इतिहास',
    waterConsumptionTrendKl: 'पानी खपत प्रवृत्ति (kL)',
    dailyMeteredUsage: 'दैनिक मिटर गरिएको प्रयोग',
    viewFullHistory: 'पूर्ण इतिहास हेर्नुहोस्',
    currentBillingCycle: 'वर्तमान बिलिङ चक्र',
    tier1SubsidizedAllowance: 'तह १ सहुलियत सीमा:',
    baseMaintenanceFee: 'आधारभूत मर्मत शुल्क:',
    estimatedMeteredWater: 'अनुमानित मिटर पानी शुल्क:',
    estimatedMonthBill: 'अनुमानित महिनाको बिल:',
    allPriorSettled: 'अघिल्ला सबै मासिक बिलहरू चुक्ता गरिएका छन्!',
    unpaidBill: 'बाँकी बिल:',
    dueOn: 'अन्तिम मिति:',
    payNow: 'अहिले तिर्नुहोस्',
    liveDirectory: 'प्रत्यक्ष निर्देशिका',
    adminDesk: 'प्रशासक डेस्क',
    support: 'सहयोग',
    logWaterReading: '+ मिटर रिडिङ दर्ता गर्नुहोस्',
    addResidentFlat: '+ बासिन्दा थप्नुहोस्',
    allCommunity: 'सबै समुदाय',
    personUnits: 'व्यक्ति एकाइहरू',
    lPersonDay: 'लि/व्यक्ति/दिन',
    conservationScore: 'संरक्षण स्कोर',
    dailyPerPerson: 'प्रति व्यक्ति दैनिक',
    myConsumption: 'मेरो खपत',
    grade: 'ग्रेड',
    peerBenchmarkingCommunity: 'समुदाय र सहकर्मी तुलना',
    done: 'सम्पन्न',
  },
  TA: {
    dashboard: 'முகப்பு பலகை',
    activityOverview: 'செயல்பாட்டு கண்ணோட்டம்',
    consumptionTrends: 'பயன்பாட்டு போக்குகள்',
    top6Flats: 'முதல் 6 வீடுகள்',
    householdsDirectory: 'குடியிருப்போர் பட்டியல்',
    meterReadings: 'மீட்டர் அளவீடுகள்',
    singleReadingEntry: 'ஒற்றை அளவீடு பதிவு',
    bulkCsvUpload: 'மொத்த CSV பதிவேற்றம்',
    invoicesBilling: 'ரசீதுகள் மற்றும் பில்லிங்',
    bulkPurchases: 'மொத்த நீர் கொள்முதல்',
    leakageAlerts: 'கசிவு எச்சரிக்கைகள்',
    apportionmentReports: 'நீர் பகிர்வு அறிக்கைகள்',
    tariffSlabs: 'கட்டண அடுக்குகள்',
    announcements: 'அறிவிப்புகள்',
    profileSettings: 'சுயவிவர அமைப்புகள்',
    signOut: 'வெளியேறு',
    waterSavingTips: 'நீர் சேமிப்பு குறிப்புகள்',
    myInvoices: 'எனது பில்கள்',
    usageHistory: 'பயன்பாட்டு வரலாறு',
    personalUsageMonitoring: 'தனிப்பட்ட நீர் பயன்பாட்டு கண்காணிப்பு',
    welcomeHome: 'வரவேற்கிறோம்',
    refresh: 'புதுப்பி',
    payViewBills: 'பில்களை செலுத்தி காண்க',
    totalVolumeConsumed: 'மொத்த நீர் பயன்பாடு',
    lastReading: 'கடைசி மீட்டர் அளவீடு',
    communityBenchmark: 'சமூக சராசரி',
    aboveCommunityAvg: '⚠️ சராசரியை விட அதிகம்',
    belowCommunityAvg: '🌟 சராசரியை விட குறைவு',
    overviewTrends: 'கண்ணோட்டம் & போக்குகள்',
    currentBillingCycle: 'தற்போதைய பில்லிங் சுழற்சி',
    done: 'முடிந்தது',
  },
  TE: {
    dashboard: 'డాష్‌బోర్డ్',
    activityOverview: 'కార్యకలాపాల అవలోకనం',
    consumptionTrends: 'వినియోగ ధోరణులు',
    top6Flats: 'టాప్ 6 ఫ్లాట్లు',
    householdsDirectory: 'నివాసాల డైరెక్టరీ',
    meterReadings: 'మీటర్ రీడింగ్‌లు',
    singleReadingEntry: 'సింగిల్ రీడింగ్ నమోదు',
    bulkCsvUpload: 'బల్క్ CSV అప్‌లోడ్',
    invoicesBilling: 'ఇన్‌వాయిస్‌లు & బిల్లింగ్',
    bulkPurchases: 'బల్క్ నీటి కొనుగోలు',
    leakageAlerts: 'లీకేజీ హెచ్చరికలు',
    apportionmentReports: 'నీటి కేటాయింపు నివేదికలు',
    tariffSlabs: 'టారిఫ్ స్లాబ్‌లు',
    announcements: 'ప్రకటనలు',
    profileSettings: 'ప్రొఫైల్ సెట్టింగ్‌లు',
    signOut: 'సైన్ అవుట్',
    waterSavingTips: 'నీటి పొదుపు చిట్కాలు',
    myInvoices: 'నా బిల్లులు',
    usageHistory: 'వినియోగ చరిత్ర',
    personalUsageMonitoring: 'వ్యక్తిగత నీటి వినియోగ పర్యవేక్షణ',
    welcomeHome: 'స్వాగతం',
    refresh: 'రిఫ్రెష్',
    payViewBills: 'బిల్లులు చెల్లించండి & చూడండి',
    totalVolumeConsumed: 'మొత్తం వినియోగం',
    lastReading: 'చివరి మీటర్ రీడింగ్',
    communityBenchmark: 'సమాజ సగటు ప్రమాణం',
    aboveCommunityAvg: '⚠️ సగటు కంటే ఎక్కువ',
    belowCommunityAvg: '🌟 సగటు కంటే తక్కువ',
    overviewTrends: 'అవలోకనం & ధోరణులు',
    currentBillingCycle: 'ప్రస్తుత బిల్లింగ్ చక్రం',
    done: 'పూర్తయింది',
  },
  GU: {
    dashboard: 'ડેશબોર્ડ',
    activityOverview: 'પ્રવૃત્તિ વિહંગાવલોકન',
    consumptionTrends: 'વપરાશ વલણો',
    top6Flats: 'ટોપ ૬ ફ્લેટ્સ',
    householdsDirectory: 'રહેવાસી ડિરેક્ટરી',
    meterReadings: 'મીટર રીડિંગ્સ',
    singleReadingEntry: 'એકલ મીટર રીડિંગ',
    bulkCsvUpload: 'બલ્ક CSV અપલોડ',
    invoicesBilling: 'ઇન્વૉઇસેસ અને બિલિંગ',
    bulkPurchases: 'જથ્થાબંધ પાણી ખરીદી',
    leakageAlerts: 'લીકેજ ચેતવણીઓ',
    apportionmentReports: 'પાણી ફાળવણી અહેવાલ',
    tariffSlabs: 'ટેરિફ સ્લેબ્સ',
    announcements: 'જાહેરાતો',
    profileSettings: 'પ્રોફાઇલ અને સેટિંગ્સ',
    signOut: 'સાઇન આઉટ',
    waterSavingTips: 'પાણી બચાવવા માટેની ટિપ્સ',
    myInvoices: 'મારા બિલો',
    usageHistory: 'વપરાશ ઇતિહાસ',
    personalUsageMonitoring: 'વ્યક્તિગત પાણી વપરાશ મોનિટરિંગ',
    welcomeHome: 'સ્વાગત છે',
    refresh: 'રીફ્રેશ',
    payViewBills: 'બિલ ભરો અને જુઓ',
    totalVolumeConsumed: 'કુલ વપરાશ',
    lastReading: 'છેલ્લું મીટર રીડિંગ',
    communityBenchmark: 'સોસાયટી સરેરાશ',
    aboveCommunityAvg: '⚠️ સરેરાશ કરતાં વધુ',
    belowCommunityAvg: '🌟 સરેરાશ કરતાં ઓછું',
    overviewTrends: 'વિહંગાવલોકન અને વલણો',
    currentBillingCycle: 'હાલનું બિલિંગ ચક્ર',
    done: 'પૂર્ણ',
  },
  BN: {
    dashboard: 'ড্যাশবোর্ড',
    activityOverview: 'কার্যকলাপ সংক্ষিপ্ত বিবরণ',
    consumptionTrends: 'ব্যবহারের প্রবণতা',
    top6Flats: 'শীর্ষ ৬টি ফ্ল্যাট',
    householdsDirectory: 'বাসিন্দাদের তালিকা',
    meterReadings: 'মিটার রিডিং',
    singleReadingEntry: 'একক মিটার রিডিং',
    bulkCsvUpload: 'বাল্ক CSV আপলোড',
    invoicesBilling: 'চালান ও বিলিং',
    bulkPurchases: 'বাল্ক জল ক্রয়',
    leakageAlerts: 'লিকেজ সতর্কতা',
    apportionmentReports: 'জল বণ্টন রিপোর্ট',
    tariffSlabs: 'ট্যারিফ স্ল্যাব',
    announcements: 'বিজ্ঞপ্তি',
    profileSettings: 'প্রোফাইল ও সেটিংস',
    signOut: 'সাইন আউট',
    waterSavingTips: 'জল সংরক্ষণের পরামর্শ',
    myInvoices: 'আমার বিল',
    usageHistory: 'ব্যবহারের ইতিহাস',
    personalUsageMonitoring: 'ব্যক্তিগত জল ব্যবহার পর্যবেক্ষণ',
    welcomeHome: 'স্বাগতম',
    refresh: 'রিফ্রেশ',
    payViewBills: 'বিল দিন ও দেখুন',
    totalVolumeConsumed: 'মোট জল খরচ',
    lastReading: 'শেষ মিটার রিডিং',
    communityBenchmark: 'সোসাইটি গড় মানদণ্ড',
    aboveCommunityAvg: '⚠️ গড়ের চেয়ে বেশি',
    belowCommunityAvg: '🌟 গড়ের চেয়ে কম',
    overviewTrends: 'সংক্ষিপ্ত বিবরণ ও প্রবণতা',
    currentBillingCycle: 'বর্তমান বিলিং চক্র',
    done: 'সম্পন্ন',
  },
  ES: {
    dashboard: 'Panel de Control',
    activityOverview: 'Resumen de Actividad',
    consumptionTrends: 'Tendencias de Consumo',
    top6Flats: 'Top 6 Departamentos',
    householdsDirectory: 'Directorio de Hogares',
    meterReadings: 'Lecturas de Medidores',
    singleReadingEntry: 'Registro Individual',
    bulkCsvUpload: 'Carga Masiva CSV',
    invoicesBilling: 'Facturas y Cobros',
    bulkPurchases: 'Compras de Agua a Granel',
    leakageAlerts: 'Alertas de Fugas',
    apportionmentReports: 'Reportes de Distribución',
    tariffSlabs: 'Tarifas y Precios',
    announcements: 'Avisos de la Comunidad',
    profileSettings: 'Perfil y Configuración',
    signOut: 'Cerrar Sesión',
    waterSavingTips: 'Consejos de Ahorro de Agua',
    myInvoices: 'Mis Facturas',
    usageHistory: 'Historial de Consumo',
    personalUsageMonitoring: 'Monitoreo de Uso Personal y Análisis de Consumo',
    welcomeHome: 'Bienvenido',
    refresh: 'Actualizar',
    payViewBills: 'Pagar y Ver Facturas',
    totalVolumeConsumed: 'Volumen total consumido',
    lastReading: 'Última Lectura del Medidor',
    communityBenchmark: 'Promedio de la Comunidad',
    loggedOn: 'Registrado el',
    noLogsYet: 'Sin registros aún',
    aboveCommunityAvg: '⚠️ Por encima del promedio',
    belowCommunityAvg: '🌟 Por debajo del promedio',
    unreadNotices: 'avisos no leídos',
    noActiveAlerts: 'Sin alertas activas',
    overviewTrends: 'Resumen y Tendencias',
    peerBenchmarking: 'Comparación con Vecinos y Eficiencia',
    invoicesBillingHistory: 'Facturas e Historial de Cobros',
    waterConsumptionTrendKl: 'Tendencia de Consumo de Agua (kL)',
    dailyMeteredUsage: 'Uso medido diario en fechas recientes',
    viewFullHistory: 'Ver Historial Completo',
    currentBillingCycle: 'Ciclo de Facturación Actual',
    tier1SubsidizedAllowance: 'Límite Subsidiado Nivel 1:',
    baseMaintenanceFee: 'Tarifa Base de Mantenimiento:',
    estimatedMeteredWater: 'Agua Medida Estimada:',
    estimatedMonthBill: 'Factura Mensual Estimada:',
    allPriorSettled: '¡Todas las facturas anteriores están totalmente liquidadas!',
    unpaidBill: 'Factura Pendiente:',
    dueOn: 'Vence el:',
    payNow: 'Pagar Ahora',
    liveDirectory: 'DIRECTORIO EN VIVO',
    adminDesk: 'Mesa de Administración',
    support: 'Soporte',
    logWaterReading: '+ Registrar Lectura de Agua',
    addResidentFlat: '+ Agregar Residente / Depto',
    allCommunity: 'Toda la Comunidad',
    personUnits: 'Unidades de Personas',
    lPersonDay: 'L/Persona/Día',
    conservationScore: 'Puntuación de Ahorro',
    dailyPerPerson: 'Diario Por Persona',
    myConsumption: 'Mi Consumo',
    grade: 'Grado',
    peerBenchmarkingCommunity: 'Comparación con Vecinos y Comunidad',
    done: 'Hecho',
  },
  FR: {
    dashboard: 'Tableau de Bord',
    activityOverview: 'Aperçu des Activités',
    consumptionTrends: 'Tendances de Consommation',
    top6Flats: 'Top 6 Appartements',
    householdsDirectory: 'Répertoire des Résidents',
    meterReadings: 'Relevés de Compteurs',
    singleReadingEntry: 'Saisie Individuelle',
    bulkCsvUpload: 'Import CSV Groupé',
    invoicesBilling: 'Factures et Facturation',
    bulkPurchases: 'Achats d’Eau en Vrac',
    leakageAlerts: 'Alertes de Fuites',
    apportionmentReports: 'Rapports de Répartition',
    tariffSlabs: 'Grille Tarifaire',
    announcements: 'Annonces Communautaires',
    profileSettings: 'Profil et Paramètres',
    signOut: 'Déconnexion',
    waterSavingTips: 'Conseils pour Économiser l’Eau',
    myInvoices: 'Mes Factures',
    usageHistory: 'Historique de Consommation',
    personalUsageMonitoring: 'Suivi de la Consommation Personnelle et Analyses',
    welcomeHome: 'Bienvenue',
    refresh: 'Actualiser',
    payViewBills: 'Payer et Voir Factures',
    totalVolumeConsumed: 'Volume total consommé',
    lastReading: 'Dernier Relevé de Compteur',
    communityBenchmark: 'Moyenne de la Résidence',
    aboveCommunityAvg: '⚠️ Supérieur à la moyenne',
    belowCommunityAvg: '🌟 Inférieur à la moyenne',
    overviewTrends: 'Aperçu et Tendances',
    currentBillingCycle: 'Cycle de Facturation Actuel',
    done: 'Terminé',
  },
  DE: {
    dashboard: 'Dashboard',
    activityOverview: 'Aktivitätsübersicht',
    consumptionTrends: 'Verbrauchstrends',
    top6Flats: 'Top 6 Wohnungen',
    householdsDirectory: 'Haushaltsverzeichnis',
    meterReadings: 'Zählerstände',
    singleReadingEntry: 'Einzelablesung erfassen',
    bulkCsvUpload: 'CSV-Massen-Upload',
    invoicesBilling: 'Rechnungen & Abrechnung',
    bulkPurchases: 'Wassergroßeinkäufe',
    leakageAlerts: 'Leckagewarnungen',
    apportionmentReports: 'Aufteilungsberichte',
    tariffSlabs: 'Tarifstaffeln & Preise',
    announcements: 'Mitteilungen',
    profileSettings: 'Profil & Einstellungen',
    signOut: 'Abmelden',
    waterSavingTips: 'Wasserspartipps',
    myInvoices: 'Meine Rechnungen',
    usageHistory: 'Verbrauchshistorie',
    personalUsageMonitoring: 'Persönliche Wasserverbrauchsüberwachung',
    welcomeHome: 'Willkommen',
    refresh: 'Aktualisieren',
    payViewBills: 'Rechnungen zahlen & ansehen',
    totalVolumeConsumed: 'Gesamtverbrauch',
    lastReading: 'Letzter Zählerstand',
    communityBenchmark: 'Gemeinschaftsdurchschnitt',
    aboveCommunityAvg: '⚠️ Über dem Durchschnitt',
    belowCommunityAvg: '🌟 Unter dem Durchschnitt',
    overviewTrends: 'Übersicht & Trends',
    currentBillingCycle: 'Aktueller Abrechnungszyklus',
    done: 'Erledigt',
  },
  AR: {
    dashboard: 'لوحة التحكم',
    activityOverview: 'نظرة عامة على النشاط',
    consumptionTrends: 'اتجاهات الاستهلاك',
    top6Flats: 'أعلى 6 شقق استهلاكاً',
    householdsDirectory: 'دليل الشقق والمقيمين',
    meterReadings: 'قراءات العدادات',
    singleReadingEntry: 'إدخال قراءة فردية',
    bulkCsvUpload: 'تحميل ملف CSV مجمع',
    invoicesBilling: 'الفواتير والمدفوعات',
    bulkPurchases: 'شراء المياه بالجملة',
    leakageAlerts: 'تنبيهات التسريب',
    apportionmentReports: 'تقارير توزيع المياه',
    tariffSlabs: 'شرائح التعرفة والأسعار',
    announcements: 'إعلانات المجتمع',
    profileSettings: 'الملف الشخصي والإعدادات',
    signOut: 'تسجيل الخروج',
    waterSavingTips: 'نصائح لتوفير المياه',
    myInvoices: 'فواتيري',
    usageHistory: 'سجل الاستهلاك',
    personalUsageMonitoring: 'مراقبة الاستهلاك الشخصي وتحليلات المياه',
    welcomeHome: 'أهلاً بك',
    refresh: 'تحديث',
    payViewBills: 'دفع وعرض الفواتير',
    totalVolumeConsumed: 'إجمالي الكمية المستهلكة',
    lastReading: 'آخر قراءة للعداد',
    communityBenchmark: 'المعدل المتوسط للمجتمع',
    aboveCommunityAvg: '⚠️ أعلى من المتوسط',
    belowCommunityAvg: '🌟 أقل من المتوسط',
    overviewTrends: 'نظرة عامة والاتجاهات',
    currentBillingCycle: 'دورة الفوترة الحالية',
    done: 'تم',
  },
  ZH_CN: {
    dashboard: '仪表板',
    activityOverview: '活动概览',
    consumptionTrends: '用水趋势',
    top6Flats: '前6户用水统计',
    householdsDirectory: '住户名录',
    meterReadings: '水表读数',
    singleReadingEntry: '单户抄表录入',
    bulkCsvUpload: '批量CSV上传',
    invoicesBilling: '账单与收费',
    bulkPurchases: '大宗水采购',
    leakageAlerts: '漏水与预警',
    apportionmentReports: '分摊报告',
    tariffSlabs: '阶梯水价与费率',
    announcements: '社区通知',
    profileSettings: '个人资料与设置',
    signOut: '退出登录',
    waterSavingTips: '节水贴士',
    myInvoices: '我的水费账单',
    usageHistory: '用水历史',
    personalUsageMonitoring: '个人用水监测与分析',
    welcomeHome: '欢迎回家',
    refresh: '刷新',
    payViewBills: '支付与查看账单',
    totalVolumeConsumed: '总用水量',
    lastReading: '最新水表读数',
    communityBenchmark: '社区平均标准',
    aboveCommunityAvg: '⚠️ 高于社区平均',
    belowCommunityAvg: '🌟 低于社区平均',
    overviewTrends: '概览与趋势',
    currentBillingCycle: '当前账单周期',
    done: '已完成',
  },
};

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, defaultText?: string) => string;
  translateDynamicText: (text: string, targetLang?: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: () => {},
  t: (key, defaultText) => defaultText || key,
  translateDynamicText: async (t) => t,
});

const setTranslateCookie = (googleCode: string) => {
  const domain = window.location.hostname;
  const cookieValue = googleCode === 'en' ? '/en/en' : `/en/${googleCode}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;
  if (domain && domain !== 'localhost') {
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain};`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
  }
};

const triggerGoogleTranslateCombo = (targetGoogleCode: string): boolean => {
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    if (select.value !== targetGoogleCode) {
      select.value = targetGoogleCode;
      select.dispatchEvent(new Event('change'));
    }
    return true;
  }
  return false;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('app_language') || 'EN';
  });

  // Initialize headless Google Translate Engine
  useEffect(() => {
    // 1. Ensure hidden translate element exists
    let elem = document.getElementById('google_translate_element');
    if (!elem) {
      elem = document.createElement('div');
      elem.id = 'google_translate_element';
      elem.style.display = 'none';
      elem.style.position = 'absolute';
      elem.style.top = '-9999px';
      elem.style.left = '-9999px';
      elem.style.width = '1px';
      elem.style.height = '1px';
      elem.style.overflow = 'hidden';
      document.body.appendChild(elem);
    }

    // 2. Setup initialization callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
            layout: window.google.translate.TranslateElement?.InlineLayout?.SIMPLE,
          },
          'google_translate_element'
        );

        // Once initialized, if language is not EN, trigger combo
        const savedLang = localStorage.getItem('app_language') || 'EN';
        if (savedLang !== 'EN') {
          const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === savedLang);
          const targetGoogleCode = langObj?.googleCode || 'en';
          setTranslateCookie(targetGoogleCode);
          setTimeout(() => {
            triggerGoogleTranslateCombo(targetGoogleCode);
          }, 300);
        }
      }
    };

    // 3. Inject Google Translate script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }

    // 4. Periodic background sanitizer to prevent any Google top-banner or tooltip popups
    const sanitizerInterval = setInterval(() => {
      if (document.body && (document.body.style.top !== '0px' || document.body.style.position !== 'static')) {
        document.body.style.top = '0px';
        document.body.style.position = 'static';
      }
      const banners = document.querySelectorAll('.goog-te-banner-frame, #goog-gt-tt, #goog-gt-vt, .goog-te-balloon-frame');
      banners.forEach((b) => {
        (b as HTMLElement).style.display = 'none';
        (b as HTMLElement).style.visibility = 'hidden';
        (b as HTMLElement).style.pointerEvents = 'none';
      });
    }, 600);

    return () => {
      clearInterval(sanitizerInterval);
    };
  }, []);

  // Sync translation when language changes or loads
  useEffect(() => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    const targetGoogleCode = langObj?.googleCode || 'en';

    setTranslateCookie(targetGoogleCode);

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerGoogleTranslateCombo(targetGoogleCode) || attempts > 25) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    const targetGoogleCode = langObj?.googleCode || 'en';

    setTranslateCookie(targetGoogleCode);

    if (!triggerGoogleTranslateCombo(targetGoogleCode)) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (triggerGoogleTranslateCombo(targetGoogleCode) || attempts > 25) {
          clearInterval(interval);
        }
      }, 150);
    }
  };

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const dict = CORE_TRANSLATIONS[language] || CORE_TRANSLATIONS.EN;
      
      // 1. Direct key match
      if (dict && dict[key]) {
        return dict[key];
      }

      // 2. Reverse lookup by defaultText or key in English dictionary
      if (defaultText) {
        const enEntry = Object.entries(CORE_TRANSLATIONS.EN).find(
          ([, val]) => val.toLowerCase() === defaultText.toLowerCase() || val.toLowerCase() === key.toLowerCase()
        );
        if (enEntry && dict[enEntry[0]]) {
          return dict[enEntry[0]];
        }
      }

      const keyEntry = Object.entries(CORE_TRANSLATIONS.EN).find(
        ([, val]) => val.toLowerCase() === key.toLowerCase()
      );
      if (keyEntry && dict[keyEntry[0]]) {
        return dict[keyEntry[0]];
      }

      // 3. Smart dynamic pattern translation
      const textToResolve = defaultText || key;

      // Welcome home pattern
      if (textToResolve.startsWith('Welcome home, Flat ') || textToResolve.startsWith('Welcome home')) {
        const suffix = textToResolve.replace(/^Welcome home,?\s*/i, '');
        const welcomeText = dict['welcomeHome'] || 'Welcome home';
        return suffix ? `${welcomeText}, ${suffix}` : welcomeText;
      }

      // Logged on pattern
      if (textToResolve.startsWith('Logged on ')) {
        const suffix = textToResolve.replace(/^Logged on /i, '');
        const loggedText = dict['loggedOn'] || 'Logged on';
        return `${loggedText} ${suffix}`;
      }

      // Due on pattern
      if (textToResolve.startsWith('Due on ')) {
        const suffix = textToResolve.replace(/^Due on /i, '');
        const dueText = dict['dueOn'] || 'Due on';
        return `${dueText} ${suffix}`;
      }

      // Unread notices pattern
      if (/\b\d+\s+unread notices\b/i.test(textToResolve)) {
        const count = textToResolve.match(/\d+/)?.[0] || '1';
        const noticeText = dict['unreadNotices'] || 'unread notices';
        return `${count} ${noticeText}`;
      }

      // Above/Below community average
      if (textToResolve.includes('Above community average')) {
        return dict['aboveCommunityAvg'] || textToResolve;
      }
      if (textToResolve.includes('Below community average')) {
        return dict['belowCommunityAvg'] || textToResolve;
      }

      // Water-Saving Tips (X Done)
      if (/Water-Saving Tips\s*\(\d+\s*Done\)/i.test(textToResolve)) {
        const count = textToResolve.match(/\d+/)?.[0] || '0';
        const tipText = dict['waterSavingTips'] || 'Water-Saving Tips';
        const doneText = dict['done'] || 'Done';
        return `${tipText} (${count} ${doneText})`;
      }

      // Invoices & Billing History (X)
      if (/Invoices & Billing History\s*\(\d+\)/i.test(textToResolve)) {
        const count = textToResolve.match(/\d+/)?.[0] || '0';
        const invText = dict['invoicesBillingHistory'] || 'Invoices & Billing History';
        return `${invText} (${count})`;
      }

      return CORE_TRANSLATIONS.EN?.[key] || defaultText || key;
    },
    [language]
  );

  const translateDynamicText = async (text: string, targetLang: string = language): Promise<string> => {
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateDynamicText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

