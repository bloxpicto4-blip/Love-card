import { SiteConfig, ThemePreset } from '../types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic_blush',
    name: 'وردي وبيج كلاسيكي',
    bgCanvas: '#FBF6F0',
    bgSecondary: '#F6EBE1',
    bgSurface: '#FFFDF9',
    accentColor: '#C85372',
    accentSoft: '#F7DBE3',
    textPrimary: '#3E242C',
    textMuted: '#785963',
  },
  {
    id: 'dreamy_rose',
    name: 'زهري حالم',
    bgCanvas: '#FDF4F6',
    bgSecondary: '#F9E4EA',
    bgSurface: '#FFFFFF',
    accentColor: '#B83B5E',
    accentSoft: '#F9D6E0',
    textPrimary: '#381B24',
    textMuted: '#744D59',
  },
  {
    id: 'warm_linen',
    name: 'بيج دافئ وورق عتيق',
    bgCanvas: '#F7F1E8',
    bgSecondary: '#EFE4D6',
    bgSurface: '#FCF9F4',
    accentColor: '#A84B5C',
    accentSoft: '#EED6D9',
    textPrimary: '#3A2823',
    textMuted: '#6E5A53',
  },
  {
    id: 'lavender_mist',
    name: 'لافندر رومانسي',
    bgCanvas: '#F8F5FA',
    bgSecondary: '#EFE9F5',
    bgSurface: '#FEFCFF',
    accentColor: '#8B4A7C',
    accentSoft: '#ECDDF0',
    textPrimary: '#2F1F33',
    textMuted: '#68556E',
  },
];

export const DEFAULT_CONFIG: SiteConfig = {
  partnerOne: 'آدم',
  partnerTwo: 'ليلى',
  heroTitle: 'كلّ ما في قلبي يبدأ بكِ وينتهي إليكِ',
  heroSubtitle: 'مساحة صغيرة من البيج والوردي، خبّأتُ فيها رسائلنا، ضحكاتنا، والوقت الذي يمرّ وأنا أحبّك أكثر.',
  password: 'love',
  passwordHint: 'كلمة الحب بالإنجليزية (love)',
  envelopeText: 'I LOVE my everything ❤️',
  envelopeNoteTitle: 'رسالة صغيرة قبل الدخول...',
  envelopeNoteBody:
    'هذا الظرف يحمل قطعة من قلبي وذكرياتنا التي لا تشيخ. أدخل كلمتنا السرية لتُفتح لك صفحات حكايتنا.',
  startDate: '2024-02-14T18:00',
  messages: [
    {
      id: 'msg-1',
      title: 'يوم عرفتُ أنكِ وطني',
      date: '14 فبراير 2024',
      body: 'لم أكن أؤمن بأن اللحظات العادية يمكن أن تصبح أبدية، حتى جلستِ أمامي في ذلك المساء الهادئ. منذ تلك الابتسامة الأولى، تغيّر إيقاع أيامي وصار لكل صباحٍ سببٌ جميل ليبدأ.',
      signature: 'بكلّ نبض، آدم',
    },
    {
      id: 'msg-2',
      title: 'تفاصيلكِ الصغيرة التي أحبها',
      date: '29 مارس 2024',
      body: 'أحبّ طريقتكِ في ترتيب الكلمات حين تفرحين، ونظرتكِ الدافئة حين يمرّ النسيم البارد. معكِ لا أحتاج إلى مناسبة كي أحتفل، فوجودكِ بجانبي هو أجمل الأعياد.',
      signature: 'دائماً معكِ',
    },
    {
      id: 'msg-3',
      title: 'تحت سماء الغروب',
      date: '18 يوليو 2024',
      body: 'في كلّ مرة نتمشّى معاً وتتشابك أيدينا، أشعر أن العالم يهدأ ليسمع حديثنا. شكراً لأنكِ الأمان الذي أعود إليه كلّما تعبت، والضحكة التي تضيء عتمة الأيام.',
      signature: 'حبيبكِ للأبد',
    },
    {
      id: 'msg-4',
      title: 'وعدٌ لكلّ الأعوام القادمة',
      date: '12 نوفمبر 2026',
      body: 'مهما مرّت الفصول وتبدّلت المواعيد، سيبقى اسمكِ أجمل ما كتبتُ في يومياتي. أعدكِ أن نحفظ هذه الذكريات ونضيف إليها ألف صفحة أخرى مليئة بالورد والحب.',
      signature: 'إلى الأبد ♥',
    },
  ],
  memories: [
    {
      id: 'mem-1',
      src: '/src/assets/images/memory_cafe_sunset_1794524192984.jpg',
      caption: 'قهوتنا الأولى ودفتر اليوميات الذي بدأنا فيه كتابة أحلامنا معاً',
      date: '14 فبراير 2024',
    },
    {
      id: 'mem-2',
      src: '/src/assets/images/memory_beach_walk_1794524193893.jpg',
      caption: 'مشيُنا عند الغروب على الشاطئ، حين تلوّنت السماء بلون الورد',
      date: '18 يوليو 2024',
    },
    {
      id: 'mem-3',
      src: '/src/assets/images/memory_bouquet_letters_1794524194148.jpg',
      caption: 'أزهار الربيع ورسائلنا المختومة بالشمع الأحمر في صباحٍ دافئ',
      date: '03 أكتوبر 2024',
    },
  ],
  tracks: [
    {
      id: 'trk-1',
      title: 'لحن لقائنا الأول (بيانو هادئ)',
      artist: 'معزوفة خاصة لقصتنا',
      coverSrc: '/src/assets/images/album_cover_romance_1794524193410.jpg',
      synthPreset: 'piano_waltz',
    },
    {
      id: 'trk-2',
      title: 'همسات القمر (صندوق الموسيقى)',
      artist: 'ذكريات المساء',
      coverSrc: '/src/assets/images/album_cover_moonlight_1794524194597.jpg',
      synthPreset: 'music_box',
    },
  ],
  finalLetter: {
    heading: 'رسالتي الأخيرة في هذه الصفحة، وبدايتي الدائمة معكِ',
    body: 'حين تصل عيناكِ إلى هذا السطر، تذكّري أن كلّ صورة هنا وكلّ كلمة كُتبت بمحبةٍ خالصة لا يغيّرها الزمن. لقد كنتِ وما زلتِ أجمل صدفة تحوّلت إلى عمرٍ كامل، ورفيقة الطريق التي تجعل الأشياء البسيطة تشعّ سحراً.\n\nأحبكِ في صمت الصباح، وفي صخب الأيام، وفي كلّ ثانيةٍ يعدّها هذا الموقع منذ لقائنا. لتبقَ هذه الصفحات شاهدةً على أن أجمل القصص هي التي تُعاش بصدق القلب.',
    signature: 'لكِ دائماً وأبداً ❤️',
    buttonText: 'Memories',
  },
  theme: {
    presetId: 'classic_blush',
    bgCanvas: '#FBF6F0',
    bgSecondary: '#F6EBE1',
    bgSurface: '#FFFDF9',
    accentColor: '#C85372',
    accentSoft: '#F7DBE3',
    textPrimary: '#3E242C',
    textMuted: '#785963',
    showDecorations: true,
  },
};

export const CONFIG_STORAGE_KEY = 'romantic_love_site_config_v1';
const PASSWORD_MIGRATED_KEY = 'romantic_love_pw_love_v1';

export function loadSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PASSWORD_MIGRATED_KEY, '1');
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    const needsLoveMigration = !localStorage.getItem(PASSWORD_MIGRATED_KEY);

    const merged: SiteConfig = {
      ...DEFAULT_CONFIG,
      ...parsed,
      ...(needsLoveMigration || parsed.password === '1402'
        ? {
            password: 'love',
            passwordHint: 'كلمة الحب بالإنجليزية (love)',
          }
        : {}),
      finalLetter: {
        ...DEFAULT_CONFIG.finalLetter,
        ...(parsed.finalLetter || {}),
      },
      theme: {
        ...DEFAULT_CONFIG.theme,
        ...(parsed.theme || {}),
      },
    };
    if (needsLoveMigration || parsed.password === '1402') {
      saveSiteConfig(merged);
      localStorage.setItem(PASSWORD_MIGRATED_KEY, '1');
    }
    return merged;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveSiteConfig(config: SiteConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save site config:', err);
  }
}
