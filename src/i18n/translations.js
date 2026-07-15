// Every user-facing string on the site lives here.
// Keyed by section; components pull strings via useLanguage().t('section.key').

export const translations = {
  en: {
    nav: {
      name: 'Damian Kaczor',
      work: 'Work',
      results: 'Results',
      testimonials: 'Testimonials',
      about: 'About',
      contact: 'Contact',
      cta: 'Work With Me',
    },
    splash: {
      role: 'Video Editor',
      title1: 'Talking head content that ',
      titleAccent: 'keeps people watching',
      title2: '.',
      subtitle: 'Long-form YouTube editing for creators who take their channel seriously.',
      scroll: 'Scroll',
    },
    hero: {
      badge: 'Long-form YouTube specialist',
      title1: 'Editing that makes viewers ',
      titleAccent: 'stay until the end',
      title2: '.',
      subtitle:
        'I edit talking-head videos for YouTube creators — pacing, story, retention. You film, I make it impossible to click away.',
      ctaPrimary: 'Work With Me',
      ctaSecondary: 'See my work',
    },
    portfolio: {
      badge: 'Portfolio',
      title1: 'Work that ',
      titleAccent: 'performs',
      title2: ', not just looks good.',
      subtitle: 'A selection of edits built around one goal: keeping viewers on the video.',
      anchor: {
        tag: 'Featured · Long-form',
        title: 'Anchor piece — full talking-head episode',
        description:
          'A complete long-form edit: hook, pacing, b-roll, sound design and retention-driven structure from the first second to the last.',
        duration: '18:42',
      },
      cards: [
        {
          title: 'Hook & retention',
          description: 'First 30 seconds engineered so nobody clicks away.',
        },
        {
          title: 'Caption design',
          description: 'Captions that guide the eye and reinforce every key line.',
        },
        {
          title: 'Raw-to-cut',
          description: 'From an unedited take to a tight, watchable story.',
        },
      ],
    },
    beforeAfter: {
      badge: 'Before / After',
      title1: 'Same footage. ',
      titleAccent: 'Different result',
      title2: '.',
      subtitle: 'Drag the slider to see what a proper edit does to raw footage.',
      before: 'Before',
      after: 'After',
      items: [
        {
          title: 'Color & framing',
          description: 'Flat raw footage graded and reframed into a cinematic look.',
        },
        {
          title: 'Pacing & graphics',
          description: 'Dead air removed, key points reinforced with motion graphics.',
        },
      ],
    },
    testimonials: {
      badge: 'Testimonials',
      title1: 'Creators who ',
      titleAccent: 'stopped worrying',
      title2: ' about editing.',
      subtitle: 'What it feels like to hand off your footage and get back a better video.',
      items: [
        {
          quote:
            'Retention on my videos jumped noticeably after the first month. I just film and forget — the edit comes back better than I imagined it.',
          name: 'Placeholder Name',
          role: 'YouTube creator · 120k subs',
        },
        {
          quote:
            'The first editor I worked with who actually thinks about the viewer, not just the cuts. My videos finally feel professional.',
          name: 'Placeholder Name',
          role: 'Business channel',
        },
        {
          quote:
            'Fast, reliable, zero micromanaging needed. He caught story beats in my raw footage that I didn’t even know were there.',
          name: 'Placeholder Name',
          role: 'Educational content',
        },
      ],
    },
    about: {
      badge: 'About',
      title1: 'Hi, I’m ',
      titleAccent: 'Damian',
      title2: '.',
      paragraphs: [
        'I’m a freelance video editor specializing in talking-head content for long-form YouTube. My job is simple to describe and hard to do: keep people watching.',
        'Every edit I deliver is built around retention — pacing, story structure, visual emphasis and sound. Not effects for the sake of effects, but decisions that keep the viewer on the video.',
        'If you’re a creator who’d rather film than fight with a timeline, we’ll get along.',
      ],
      stats: [
        { value: '150+', label: 'videos edited' },
        { value: '4 yrs', label: 'of editing' },
        { value: '48h', label: 'typical turnaround' },
      ],
    },
    contact: {
      badge: 'Contact',
      title1: 'Let’s make your next video your ',
      titleAccent: 'best one',
      title2: '.',
      subtitle:
        'Tell me about your channel and what you need. I reply within 24 hours — usually much faster.',
      emailLabel: 'Email me at',
      cta: 'Work With Me',
      note: 'No forms, no calls until you want one. Just an email.',
    },
    footer: {
      rights: '© 2026 Damian Kaczor. All rights reserved.',
      tagline: 'Talking head editing for long-form YouTube.',
      backToTop: 'Back to top',
    },
  },

  pl: {
    nav: {
      name: 'Damian Kaczor',
      work: 'Portfolio',
      results: 'Efekty',
      testimonials: 'Opinie',
      about: 'O mnie',
      contact: 'Kontakt',
      cta: 'Współpracujmy',
    },
    splash: {
      role: 'Montażysta wideo',
      title1: 'Talking heady, od których ',
      titleAccent: 'nie da się oderwać',
      title2: '.',
      subtitle: 'Montaż długich form na YouTube dla twórców, którzy traktują swój kanał poważnie.',
      scroll: 'Przewiń',
    },
    hero: {
      badge: 'Specjalizacja: długie formy na YouTube',
      title1: 'Montaż, przez który widzowie ',
      titleAccent: 'zostają do końca',
      title2: '.',
      subtitle:
        'Montuję talking heady dla twórców na YouTube — tempo, historia, retencja. Ty nagrywasz, ja sprawiam, że nie da się kliknąć „dalej”.',
      ctaPrimary: 'Współpracujmy',
      ctaSecondary: 'Zobacz moje prace',
    },
    portfolio: {
      badge: 'Portfolio',
      title1: 'Montaż, który ',
      titleAccent: 'działa',
      title2: ', a nie tylko dobrze wygląda.',
      subtitle: 'Wybrane realizacje z jednym celem: utrzymać widza przy ekranie.',
      anchor: {
        tag: 'Wyróżnione · Długa forma',
        title: 'Pełny odcinek talking head',
        description:
          'Kompletny montaż długiej formy: hook, tempo, b-roll, sound design i struktura zbudowana pod retencję — od pierwszej sekundy do ostatniej.',
        duration: '18:42',
      },
      cards: [
        {
          title: 'Hook i retencja',
          description: 'Pierwsze 30 sekund zaprojektowane tak, żeby nikt nie uciekł.',
        },
        {
          title: 'Design napisów',
          description: 'Napisy, które prowadzą wzrok i wzmacniają każde kluczowe zdanie.',
        },
        {
          title: 'Od surówki do gotowca',
          description: 'Z nieobrobionego nagrania do zwartej, wciągającej historii.',
        },
      ],
    },
    beforeAfter: {
      badge: 'Przed / Po',
      title1: 'To samo nagranie. ',
      titleAccent: 'Zupełnie inny efekt',
      title2: '.',
      subtitle: 'Przesuń suwak i zobacz, co porządny montaż robi z surowym materiałem.',
      before: 'Przed',
      after: 'Po',
      items: [
        {
          title: 'Kolor i kadr',
          description: 'Płaski, surowy materiał po gradingu i przekadrowaniu wygląda filmowo.',
        },
        {
          title: 'Tempo i grafiki',
          description: 'Bez martwych momentów, kluczowe wątki wzmocnione animowanymi grafikami.',
        },
      ],
    },
    testimonials: {
      badge: 'Opinie',
      title1: 'Twórcy, którzy ',
      titleAccent: 'przestali martwić się',
      title2: ' montażem.',
      subtitle: 'Tak to wygląda, gdy oddajesz nagranie i dostajesz z powrotem lepszy film.',
      items: [
        {
          quote:
            'Retencja na moich filmach zauważalnie wzrosła już po pierwszym miesiącu. Ja tylko nagrywam — montaż wraca lepszy, niż go sobie wyobrażałem.',
          name: 'Imię i nazwisko',
          role: 'Twórca na YouTube · 120 tys. subów',
        },
        {
          quote:
            'Pierwszy montażysta, z którym pracowałem, który naprawdę myśli o widzu, a nie tylko o cięciach. Moje filmy w końcu wyglądają profesjonalnie.',
          name: 'Imię i nazwisko',
          role: 'Kanał biznesowy',
        },
        {
          quote:
            'Szybko, solidnie, bez pilnowania. Wyłapał w moim materiale momenty, o których sam nie miałem pojęcia.',
          name: 'Imię i nazwisko',
          role: 'Treści edukacyjne',
        },
      ],
    },
    about: {
      badge: 'O mnie',
      title1: 'Cześć, jestem ',
      titleAccent: 'Damian',
      title2: '.',
      paragraphs: [
        'Jestem freelancerem i montuję talking heady — długie formy na YouTube. Moja praca brzmi prosto, a jest trudna: sprawić, żeby ludzie oglądali dalej.',
        'Każdy montaż buduję pod retencję — tempo, strukturę historii, akcenty wizualne i dźwięk. Żadnych efektów dla samych efektów. Tylko decyzje, które trzymają widza przy filmie.',
        'Jeśli wolisz nagrywać, zamiast walczyć z osią czasu — dogadamy się.',
      ],
      stats: [
        { value: '150+', label: 'zmontowanych filmów' },
        { value: '4 lata', label: 'doświadczenia' },
        { value: '48h', label: 'typowy czas realizacji' },
      ],
    },
    contact: {
      badge: 'Kontakt',
      title1: 'Zróbmy z Twojego następnego filmu Twój ',
      titleAccent: 'najlepszy',
      title2: '.',
      subtitle:
        'Opowiedz mi o swoim kanale i czego potrzebujesz. Odpisuję w ciągu 24 godzin — zwykle dużo szybciej.',
      emailLabel: 'Napisz do mnie',
      cta: 'Współpracujmy',
      note: 'Żadnych formularzy ani rozmów, dopóki sam ich nie zechcesz. Wystarczy mail.',
    },
    footer: {
      rights: '© 2026 Damian Kaczor. Wszelkie prawa zastrzeżone.',
      tagline: 'Montaż talking headów — długie formy na YouTube.',
      backToTop: 'Do góry',
    },
  },
}
