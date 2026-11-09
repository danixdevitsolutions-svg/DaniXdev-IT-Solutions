import { translations, type Dictionary, type Lang } from './i18n'
export type { Lang } from './i18n'

type MutableDeep<T> = T extends readonly (infer Item)[]
  ? MutableDeep<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: MutableDeep<T[Key]> }
    : T

type MutableDictionary = MutableDeep<Dictionary>
type PricingPlan = MutableDictionary['pricing']['plans'][number] & { id: string }
export type EditableDictionary = Omit<MutableDictionary, 'services' | 'pricing'> & {
  services: Omit<MutableDictionary['services'], 'items'> & {
    items: (MutableDictionary['services']['items'][number] & { id: string; enabled: boolean })[]
  }
  pricing: Omit<MutableDictionary['pricing'], 'plans'> & {
    plans: PricingPlan[]
  }
}
export type ImageAsset = { url: string; storagePath: string | null }
export type LocalizedText = Record<Lang, string>

export type TeamMember = {
  id: string
  name: LocalizedText
  role: LocalizedText
  sub: LocalizedText
  image: ImageAsset | null
}

export type ServicePoster = {
  id: string
  title: LocalizedText
  image: ImageAsset | null
  enabled: boolean
}

export type BlogPost = {
  id: string
  slug: string
  title: LocalizedText
  summary: LocalizedText
  body: LocalizedText
  image: ImageAsset | null
  published: boolean
  updatedAt: number
}

export type AboutCard = {
  id: string
  icon: 'eye' | 'target' | 'sparkles'
  title: LocalizedText
  text: LocalizedText
  image: ImageAsset | null
}

export type HomeService = {
  id: string
  title: LocalizedText
  text: LocalizedText
  enabled: boolean
  image: ImageAsset | null
}

export type PageKey = 'about' | 'services' | 'team' | 'pricing' | 'contact'

export type SiteContent = {
  translations: Record<Lang, EditableDictionary>
  brand: {
    name: string
    descriptor: string
    phoneDisplay: string
    phoneIntl: string
    email: string
    serviceArea: LocalizedText
    logo: ImageAsset | null
  }
  pageIntros: Record<PageKey, { title: LocalizedText; description: LocalizedText }>
  pageCta: {
    title: LocalizedText
    description: LocalizedText
    contactLabel: LocalizedText
    pricingLabel: LocalizedText
  }
  servicePageHeading: {
    eyebrow: LocalizedText
    title: LocalizedText
    subtitle: LocalizedText
  }
  aboutCards: AboutCard[]
  homeServices: HomeService[]
  pricingPlanImages: Record<string, ImageAsset | null>
  heroImage: ImageAsset | null
  founderMessage: {
    enabled: boolean
    heading: LocalizedText
    paragraphs: Record<Lang, string[]>
    image: ImageAsset | null
  }
  teamMembers: TeamMember[]
  servicePosters: ServicePoster[]
  posts: BlogPost[]
}

function mutableCopy<T>(value: T): MutableDeep<T> {
  return JSON.parse(JSON.stringify(value)) as MutableDeep<T>
}

export function createDefaultSiteContent(): SiteContent {
  const memberPhotos: Record<string, ImageAsset | null> = {
    founder: { url: '/images/daniyal-burfat.jpg', storagePath: null },
    ali: { url: '/images/ali-haider.png', storagePath: null },
    adeel: { url: '/images/adeel-ahmed.png', storagePath: null },
    shahnoor: { url: '/images/shahnoor-baloch.jpeg', storagePath: null },
  }
  const memberIds = ['founder', 'ali', 'adeel', 'shahnoor']
  const serviceItemIds = [
    'website-development',
    'mobile-app-development',
    'ui-ux-design',
    'software-development',
    'digital-marketing-seo',
    'ads-management',
    'cloud-it-support',
    'cyber-security',
  ]
  const membersByLanguage = {
    en: translations.en.team.members,
    ur: translations.ur.team.members,
  }
  const planIds = ['starter', 'business', 'enterprise']
  const posterFiles = [
    ['website-development', 'Website Development', '/services/website-development.jpeg'],
    ['wordpress-development', 'WordPress Website Development', '/services/wordpress-development.jpeg'],
    ['mobile-app-development', 'Mobile App Development', '/services/mobile-app-development.jpeg'],
    ['software-desktop-apps', 'Software & Desktop Applications', '/services/software-desktop-apps.jpeg'],
    ['school-management-system', 'School Management System', '/services/school-management-system.jpeg'],
    ['seo-services', 'SEO Services', '/services/seo-services.jpeg'],
    ['paid-ads-management', 'Paid Ads Management', '/services/paid-ads-management.jpeg'],
    ['social-media-management', 'Social Media Management', '/services/social-media-management.jpeg'],
    ['graphic-design', 'Graphic Design', '/services/graphic-design.jpeg'],
    ['video-editing', 'Video Editing', '/services/video-editing.jpeg'],
    ['domain-hosting-setup', 'Domain, Hosting & Website Setup', '/services/domain-hosting-setup.jpeg'],
  ] as const

  return {
    translations: {
      en: {
        ...mutableCopy(translations.en),
        services: {
          ...mutableCopy(translations.en.services),
          items: translations.en.services.items.map((service, index) => ({
            ...service,
            id: serviceItemIds[index] ?? `service-${index + 1}`,
            enabled: true,
          })),
        },
        pricing: {
          ...mutableCopy(translations.en.pricing),
          plans: mutableCopy(translations.en.pricing.plans).map((plan, index) => ({
            ...plan,
            id: planIds[index] ?? `plan-${index + 1}`,
          })),
        },
      },
      ur: {
        ...mutableCopy(translations.ur),
        services: {
          ...mutableCopy(translations.ur.services),
          items: translations.ur.services.items.map((service, index) => ({
            ...service,
            id: serviceItemIds[index] ?? `service-${index + 1}`,
            enabled: true,
          })),
        },
        pricing: {
          ...mutableCopy(translations.ur.pricing),
          plans: mutableCopy(translations.ur.pricing.plans).map((plan, index) => ({
            ...plan,
            id: planIds[index] ?? `plan-${index + 1}`,
          })),
        },
      },
    },
    brand: {
      name: 'DaniXdev',
      descriptor: 'IT SOLUTIONS',
      phoneDisplay: '0328 1121958',
      phoneIntl: '923281121958',
      email: 'danixdevworkstation@gmail.com',
      serviceArea: { en: 'All over Pakistan', ur: 'پورا پاکستان' },
      logo: { url: '/images/logo-mark.png', storagePath: null },
    },
    pageIntros: {
      about: {
        title: { en: 'About Us', ur: 'ہمارے بارے میں' },
        description: {
          en: 'A Pakistan-based technology company, serving businesses and individuals across the country since 2023.',
          ur: 'پاکستان کی ایک ٹیکنالوجی کمپنی جو 2023 سے ملک بھر میں کاروبار اور افراد کو خدمات فراہم کر رہی ہے۔',
        },
      },
      services: {
        title: { en: 'Our Services', ur: 'ہماری سروسز' },
        description: {
          en: 'End-to-end IT and digital solutions built to help your business grow, innovate and stay secure.',
          ur: 'آپ کے کاروبار کی ترقی، جدت اور حفاظت کے لیے مکمل آئی ٹی اور ڈیجیٹل حل۔',
        },
      },
      team: {
        title: { en: 'Meet Our Team', ur: 'ہماری ٹیم سے ملیں' },
        description: {
          en: 'The experienced professionals behind every project we deliver.',
          ur: 'ہر پروجیکٹ کے پیچھے تجربہ کار ماہرین۔',
        },
      },
      pricing: {
        title: { en: 'Pricing Packages', ur: 'قیمتوں کے پیکجز' },
        description: {
          en: 'Transparent, cost-effective plans for startups, growing businesses and enterprises.',
          ur: 'اسٹارٹ اپس اور کاروبار کے لیے واضح اور مناسب قیمتوں کے پیکجز۔',
        },
      },
      contact: {
        title: { en: 'Contact Us', ur: 'رابطہ کریں' },
        description: {
          en: 'Tell us about your project. We usually respond within a few hours.',
          ur: 'اپنے پروجیکٹ کے بارے میں بتائیں، ہم چند گھنٹوں میں جواب دیتے ہیں۔',
        },
      },
    },
    pageCta: {
      title: {
        en: 'Ready to start your next project?',
        ur: 'اپنا اگلا پروجیکٹ شروع کرنے کے لیے تیار ہیں؟',
      },
      description: {
        en: 'Let’s build something reliable, secure and future-ready together.',
        ur: 'آئیے مل کر قابلِ اعتماد، محفوظ اور مستقبل کے لیے تیار حل بنائیں۔',
      },
      contactLabel: { en: 'Get a Free Quote', ur: 'مفت کوٹ حاصل کریں' },
      pricingLabel: { en: 'View Pricing', ur: 'قیمتیں دیکھیں' },
    },
    servicePageHeading: {
      eyebrow: { en: 'Our Services', ur: 'ہماری سروسز' },
      title: { en: 'Explore Our Service Packages', ur: 'سروس پیکجز دیکھیں' },
      subtitle: {
        en: 'View the service details and packages, or message us on WhatsApp.',
        ur: 'سروس کی تفصیلات اور پیکجز دیکھیں یا واٹس ایپ پر پیغام بھیجیں۔',
      },
    },
    aboutCards: [
      {
        id: 'vision',
        icon: 'eye',
        title: { en: translations.en.about.visionTitle, ur: translations.ur.about.visionTitle },
        text: { en: translations.en.about.vision, ur: translations.ur.about.vision },
        image: null,
      },
      {
        id: 'mission',
        icon: 'target',
        title: { en: translations.en.about.missionTitle, ur: translations.ur.about.missionTitle },
        text: { en: translations.en.about.mission, ur: translations.ur.about.mission },
        image: null,
      },
    ],
    homeServices: translations.en.services.items.map((service, index) => ({
      id: serviceItemIds[index] ?? `service-${index + 1}`,
      title: { en: service.title, ur: translations.ur.services.items[index]?.title ?? service.title },
      text: { en: service.text, ur: translations.ur.services.items[index]?.text ?? service.text },
      enabled: true,
      image: null,
    })),
    pricingPlanImages: { starter: null, business: null, enterprise: null },
    heroImage: { url: '/images/logo-square.jpg', storagePath: null },
    founderMessage: {
      enabled: true,
      heading: { en: 'Founder and CEO Message', ur: 'بانی اور سی ای او کا پیغام' },
      paragraphs: {
        en: [
          'Hello, my name is Daniyal Burfat, and I am from Balochistan.',
          'I started this IT company in 2023, initially working on local projects. As the work grew, so did the company. Alhamdulillah, today we have over 100 trusted and happy clients.',
          'Below are my dear friends, who are very close to my heart and supported me in building this company.',
          'Thank you, my friends!',
        ],
        ur: [
          'میرا نام دانیال برفت ہے اور میرا تعلق بلوچستان سے ہے۔',
          'میں نے یہ آئی ٹی کمپنی 2023 میں شروع کی۔ ابتدا میں مقامی پروجیکٹس پر کام کیا، پھر کام بڑھتا گیا۔ الحمدللہ، آج ہمارے 100 سے زیادہ قابلِ اعتماد اور خوش کلائنٹس ہیں۔',
          'نیچے میرے عزیز دوست ہیں جنہوں نے اس کمپنی کو بنانے میں میرا ساتھ دیا۔',
          'میرے تمام دوستوں کا شکریہ!',
        ],
      },
      image: memberPhotos.founder,
    },
    teamMembers: memberIds.map((id, index) => ({
      id,
      name: {
        en: membersByLanguage.en[index].name,
        ur: membersByLanguage.ur[index].name,
      },
      role: {
        en: membersByLanguage.en[index].role,
        ur: membersByLanguage.ur[index].role,
      },
      sub: {
        en: membersByLanguage.en[index].sub,
        ur: membersByLanguage.ur[index].sub,
      },
      image: memberPhotos[id],
    })),
    servicePosters: posterFiles.map(([id, title, url]) => ({
      id,
      title: { en: title, ur: title },
      image: { url, storagePath: null },
      enabled: true,
    })),
    posts: [],
  }
}

export function mergeSiteContent(value: unknown): SiteContent {
  const defaults = createDefaultSiteContent()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  const saved = value as Partial<SiteContent>
  return {
    ...defaults,
    ...saved,
    translations: {
      en: { ...defaults.translations.en, ...saved.translations?.en },
      ur: { ...defaults.translations.ur, ...saved.translations?.ur },
    },
    brand: { ...defaults.brand, ...saved.brand },
    pageIntros: {
      ...defaults.pageIntros,
      ...saved.pageIntros,
    },
    pageCta: { ...defaults.pageCta, ...saved.pageCta },
    servicePageHeading: { ...defaults.servicePageHeading, ...saved.servicePageHeading     },
    aboutCards: Array.isArray(saved.aboutCards) ? saved.aboutCards : defaults.aboutCards,
    homeServices: Array.isArray(saved.homeServices) ? saved.homeServices : defaults.homeServices,
    pricingPlanImages: saved.pricingPlanImages && typeof saved.pricingPlanImages === 'object'
      ? { ...defaults.pricingPlanImages, ...saved.pricingPlanImages }
      : defaults.pricingPlanImages,
    founderMessage: {
      ...defaults.founderMessage,
      ...saved.founderMessage,
      paragraphs: {
        ...defaults.founderMessage.paragraphs,
        ...saved.founderMessage?.paragraphs,
      },
    },
    teamMembers: Array.isArray(saved.teamMembers) ? saved.teamMembers : defaults.teamMembers,
    servicePosters: Array.isArray(saved.servicePosters) ? saved.servicePosters : defaults.servicePosters,
    posts: Array.isArray(saved.posts) ? saved.posts : defaults.posts,
  }
}
