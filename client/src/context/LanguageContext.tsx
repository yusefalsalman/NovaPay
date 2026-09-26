import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations = {
  // Brand & Top Navigation
  brandName: { en: 'NovaPay', ar: 'نوفا باي' },
  live: { en: 'LIVE', ar: 'مباشر' },
  refreshLedger: { en: 'Refresh Ledger', ar: 'تحديث السجل' },
  ledgerIntelligence: { en: 'Ledger Intelligence', ar: 'المستشار الذكي' },
  signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },
  userPlaceholder: { en: 'NovaPay User', ar: 'مستخدم نوفا باي' },
  switchLang: { en: 'العربية', ar: 'English' },

  // Virtual Card
  activeLedger: { en: 'ACTIVE LEDGER', ar: 'سجل نشط' },
  availableBalance: { en: 'AVAILABLE BALANCE', ar: 'الرصيد المتاح' },
  accountNumber: { en: 'Account Number', ar: 'رقم الحساب' },
  copyAccount: { en: 'Copy account number', ar: 'نسخ رقم الحساب' },

  // Quick Action Deck
  transfer: { en: 'Transfer', ar: 'تحويل أموال' },
  instantP2P: { en: 'Instant P2P', ar: 'فوري ومباشر' },
  deposit: { en: 'Deposit', ar: 'شحن رصيد' },
  cardGateway: { en: 'Card Gateway', ar: 'بطاقة بنكية' },
  statement: { en: 'Statement', ar: 'كشف حساب' },
  vectorPdf: { en: 'Vector PDF', ar: 'تقرير PDF' },
  analytics: { en: 'Analytics', ar: 'التحليلات' },
  riskVelocity: { en: 'Risk & Velocity', ar: 'حركة السيولة' },

  // Trust Badges
  doubleEntryBadge: { en: 'Double-Entry', ar: 'قيد محاسبي مزدوج' },
  doubleEntryDesc: { en: 'Strict Debit/Credit Pairing', ar: 'تطابق صارم بين الدائن والمدين' },
  concurrencySafe: { en: 'Concurrency Safe', ar: 'آمن بالتزامن' },
  concurrencySafeDesc: { en: 'PostgreSQL Isolation', ar: 'عزل المعاملات عبر PostgreSQL' },
  stripeIdempotent: { en: 'Stripe Idempotent', ar: 'دفع غير قابل للتكرار' },
  stripeIdempotentDesc: { en: 'Zero Double-Spend', ar: 'حماية كاملة من الخصم المزدوج' },

  // Analytics Chart
  balanceDynamics: { en: 'Balance & Cash Flow Dynamics', ar: 'حركة الرصيد والتدفقات النقدية' },
  realTimeCurve: { en: 'Real-time ledger curve', ar: 'منحنى السجل المالي اللحظي' },
  credits: { en: 'Credits', ar: 'إيداعات' },
  debits: { en: 'Debits', ar: 'سحوبات' },
  balanceAfter: { en: 'Balance After', ar: 'الرصيد بعد المعاملة' },

  // Ledger Table
  immutableLedger: { en: 'Immutable Ledger Activity', ar: 'سجل العمليات المالي الموثق' },
  verifiableAudit: { en: 'Live verifiable audit entries for your account', ar: 'قيود محاسبية مثبتة وقابلة للتحقق الفوري' },
  all: { en: 'All', ar: 'الكل' },
  type: { en: 'Type', ar: 'النوع' },
  descriptionRef: { en: 'Description / Reference', ar: 'الوصف / المرجع' },
  amount: { en: 'Amount', ar: 'المبلغ' },
  date: { en: 'Date', ar: 'التاريخ' },
  status: { en: 'Status', ar: 'الحالة' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  stripeDeposit: { en: 'Stripe Deposit', ar: 'إيداع سترايب' },
  p2pTransfer: { en: 'P2P Transfer', ar: 'تحويل فوري' },
  receivedFunds: { en: 'Received Funds', ar: 'استلام أموال' },
  sentFunds: { en: 'Sent Funds', ar: 'إرسال أموال' },
  copyRefId: { en: 'Copy reference ID', ar: 'نسخ رقم المرجع' },
  noTransactions: { en: 'No transactions found', ar: 'لا توجد معاملات مسجلة' },
  noTransactionsDesc: { en: 'Make a Stripe deposit or send funds to start your ledger.', ar: 'قم بإجراء إيداع أو إرسال أموال لبدء السجل المالي.' },
  queryingLedger: { en: 'Querying Ledger Entries...', ar: 'جاري استرجاع قيود السجل المالي...' },
  page: { en: 'Page', ar: 'صفحة' },
  of: { en: 'of', ar: 'من' },
  entries: { en: 'entries', ar: 'معاملة' },

  // Transfer Modal
  instantTransferModal: { en: 'Instant P2P Transfer', ar: 'تحويل فوري بين الحسابات' },
  concurrencySubtitle: { en: 'Concurrency-safe Double-Entry Settlement', ar: 'تسوية فورية بالقيد المزدوج الآمن' },
  recipientIdentifier: { en: 'Recipient Identifier', ar: 'معرف المستلم' },
  recipientPlaceholder: { en: 'Account Number (NP-2026-...) or Email', ar: 'رقم الحساب (NP-2026-...) أو البريد' },
  amountCurrency: { en: 'Amount', ar: 'المبلغ' },
  balanceLabel: { en: 'Balance:', ar: 'الرصيد المتاح:' },
  maxBtn: { en: 'MAX', ar: 'الكل' },
  referenceNote: { en: 'Reference Note (Optional)', ar: 'ملاحظة مرجعية (اختياري)' },
  notePlaceholder: { en: 'e.g. Dinner share, rent, coffee', ar: 'مثال: حصة العشاء، الإيجار، قهوة' },
  debitPreview: { en: 'Debit:', ar: 'خصم (مدين):' },
  creditPreview: { en: 'Credit:', ar: 'إضافة (دائن):' },
  confirmAndSend: { en: 'Confirm & Send Funds', ar: 'تأكيد وإرسال الأموال' },
  settlingLedger: { en: 'Settling Ledger...', ar: 'جاري قيد المعاملة...' },
  transferSucceeded: { en: 'Transfer Succeeded!', ar: 'تم التحويل بنجاح!' },
  sentLabel: { en: 'Sent', ar: 'تم إرسال' },
  toLabel: { en: 'to', ar: 'إلى' },
  transactionRefLabel: { en: 'Transaction Ref:', ar: 'مرجع المعاملة:' },
  newBalanceLabel: { en: 'New Balance:', ar: 'الرصيد الجديد:' },
  ledgerStatusLabel: { en: 'Ledger Status:', ar: 'حالة السجل:' },
  doubleEntryBalanced: { en: 'Double-Entry Immutably Balanced', ar: 'متوازن بالقيد المزدوج وموثق' },
  doneBtn: { en: 'Done', ar: 'تم' },

  // Deposit Modal
  stripeModalTitle: { en: 'Stripe Sandbox Top-Up', ar: 'شحن الرصيد التجريبي (Stripe)' },
  stripeModalSubtitle: { en: 'Card Payment Rail & Idempotent Webhook', ar: 'بوابة بطاقات الدفع وخطافات ويب مؤمنة' },
  depositAmount: { en: 'Deposit Amount', ar: 'مبلغ الإيداع' },
  stripeSecurityTitle: { en: 'Stripe Sandbox Security:', ar: 'أمان بوابة Stripe:' },
  stripeSecurityText: { en: 'Card numbers are tokenized in Stripe iframe elements. Raw card data never touches NovaPay servers.', ar: 'يتم تشفير وتوليد رموز البطاقات بأمان عبر Stripe مباشرة ولا تُحفظ في خوادمنا.' },
  proceedCheckout: { en: 'Proceed to Card Checkout', ar: 'المتابعة لتأكيد البطاقة' },
  creatingPaymentIntent: { en: 'Creating PaymentIntent...', ar: 'جاري تجهيز أمر الدفع...' },
  lockedDepositLabel: { en: 'Locked Deposit:', ar: 'المبلغ المطلوب إيداعه:' },
  cardInfoTestLabel: { en: 'Card Information (Test Mode)', ar: 'بيانات البطاقة (الوضع التجريبي)' },
  testCardBadge: { en: '4242 Card', ar: 'بطاقة 4242' },
  backBtn: { en: 'Back', ar: 'رجوع' },
  authorizeBtn: { en: 'Authorize', ar: 'تأكيد ودفع' },
  confirmingWithStripe: { en: 'Confirming with Stripe...', ar: 'جاري المعالجة مع Stripe...' },
  depositSucceeded: { en: 'Deposit Succeeded!', ar: 'تمت إضافة الرصيد بنجاح!' },
  addedToWallet: { en: 'Added', ar: 'تمت إضافة' },
  toYourWallet: { en: 'to your wallet.', ar: 'إلى محفظتك.' },
  ledgerCreditedWebhook: { en: 'Ledger Credited via Stripe Webhook Event', ar: 'تم قيد الرصيد عبر حدث Stripe Webhook الموثق' },
  returnToDashboard: { en: 'Return to Dashboard', ar: 'العودة للوحة التحكم' },

  // Statement Modal
  statementTitle: { en: 'Account Statement', ar: 'كشف الحساب الرسمي' },
  statementSubtitle: { en: 'QuestPDF Vector Document Engine', ar: 'محرك تقارير QuestPDF عالي الدقة' },
  quickTimeframes: { en: 'Quick Timeframes', ar: 'فترات جاهزة' },
  last30Days: { en: 'Last 30 Days', ar: 'آخر 30 يوماً' },
  last60Days: { en: 'Last 60 Days', ar: 'آخر 60 يوماً' },
  last90Days: { en: 'Last 90 Days', ar: 'آخر 90 يوماً' },
  fromDate: { en: 'From Date', ar: 'من تاريخ' },
  toDate: { en: 'To Date', ar: 'إلى تاريخ' },
  reportIncludes: { en: 'Report Includes:', ar: 'يتضمن الكشف:' },
  openingClosingBal: { en: '• Opening Balance & Closing Balance', ar: '• الرصيد الافتتاحي والرصيد الختامي' },
  totalCreditsDebits: { en: '• Total Credits (Inflow) & Total Debits (Outflow)', ar: '• إجمالي المقبوضات (إيداع) والمدفوعات (سحب)' },
  itemizedAudit: { en: '• Itemized Double-Entry audit table with reference IDs', ar: '• جدول مفصل بالقيود المزدوجة وأرقام المراجع' },
  downloadStatementBtn: { en: 'Download PDF Statement', ar: 'تحميل كشف الحساب PDF' },
  compilingPdf: { en: 'Compiling PDF Document...', ar: 'جاري إنشاء مستند PDF...' },
  downloadSuccess: { en: 'Downloaded Successfully!', ar: 'تم التحميل بنجاح!' },

  // AI Advisor Drawer
  advisorTitle: { en: 'NovaPay Ledger Intelligence', ar: 'المستشار المالي الذكي لـ NovaPay' },
  advisorSubtitle: { en: 'Autonomous Financial Analytics', ar: 'تحليلات مالية ومؤشرات سيولة متقدمة' },
  totalFundedLabel: { en: 'Total Funded', ar: 'إجمالي المقبوضات' },
  totalTransferredLabel: { en: 'Total Transferred', ar: 'إجمالي التحويلات' },
  diagnosticsTitle: { en: 'Financial Health Diagnostics', ar: 'تشخيص الصحة والسيولة المالية' },
  cashFlowVelocity: { en: 'Cash Flow Velocity', ar: 'معدل دوران السيولة' },
  cashFlowText: { 
    en: 'Your wallet has processed {count} immutable ledger events. Net capital retention is currently at {pct}%.', 
    ar: 'قامت محفظتك بمعالجة {count} قيد مالي موثق. نسبة استبقاء رأس المال الحالية هي {pct}%.' 
  },
  reserveRecommendation: { en: 'Reserve Recommendation', ar: 'توصية الاحتياطي النقدي' },
  reserveText: { 
    en: 'Maintaining at least $50.00 prevents transfer rejections during high-frequency P2P settlement cycles.', 
    ar: 'يُنصح بالاحتفاظ برصيد لا يقل عن $50.00 لتفادي رفض المعاملات أثناء فترات التحويل المتزامنة.' 
  },
  ledgerIntegrity: { en: 'Ledger Integrity', ar: 'تكامل وسلامة السجل المالي' },
  ledgerIntegrityText: { 
    en: 'All transaction journal entries strictly satisfy the Double-Entry balance invariant. Zero detected discrepancies.', 
    ar: 'جميع القيود في دفتر اليومية متطابقة تماماً مع معادلة القيد المزدوج. لا توجد أي فروقات حسابية.' 
  },
  advisorReply: { en: 'Advisor Reply:', ar: 'رد المستشار:' },
  advisorQueryPlaceholder: { en: 'Query ledger velocity, cash flow, reserve limits...', ar: 'اسأل عن حركة السيولة، معدل الصرف، أو الاحتياطي...' },

  // Auth Screen
  authHeadline: { en: 'Enterprise FinTech Digital Wallet & Ledger Engine', ar: 'محفظة مالية رقمية ومحرك قيود محاسبية موثوق' },
  signInTab: { en: 'Sign In', ar: 'تسجيل الدخول' },
  createAccountTab: { en: 'Create Account', ar: 'إنشاء حساب جديد' },
  fullNameLabel: { en: 'Full Name', ar: 'الاسم الكامل' },
  emailLabel: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  passwordLabel: { en: 'Password', ar: 'كلمة المرور' },
  signInBtn: { en: 'Sign In to Wallet', ar: 'الدخول إلى المحفظة' },
  createAccountBtn: { en: 'Create Wallet & Ledger', ar: 'إنشاء المحفظة والسجل' },
  authenticatingBtn: { en: 'Authenticating...', ar: 'جاري التحقق...' },
  authSecurityNote: { en: 'PostgreSQL Double-Entry • Concurrency Safe', ar: 'نظام قيد مزدوج عبر PostgreSQL • آمن بالتزامن' },
};

export type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Language;
  isRtl: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('novapay_lang');
    return saved === 'ar' || saved === 'en' ? saved : 'ar';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('novapay_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLangState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const item = translations[key];
    if (!item) return key as string;
    let text = item[lang] || item.en;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isRtl: lang === 'ar',
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
