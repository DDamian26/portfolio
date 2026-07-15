// Every user-facing string on the site lives here.
// Keyed by section; components pull strings via useLanguage().t('section.key').
//
// Highlighted words: wrap a segment in **double asterisks** and render the
// string through <AccentText> — the marked segment gets the accent color.
// This keeps the highlight position independent per language.

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
      name: 'Damian',
      // Slogan options — pick one and set it as `slogan` below:
      // 1. "Talking head videos that keep people watching."
      // 2. "Edits that make viewers stay — minute after minute."
      // 3. "Your words. My cut. Their full attention."
      slogan: 'Talking head videos that keep people watching.',
      scroll: 'scroll',
    },
    hero: {
      badge: 'Talking Head Specialist',
      titleLines: [
        'Talking head edits that **hold attention**.',
        'Attention that **grows your channel**.',
      ],
      subtitle:
        'Hooks that land, pacing that never drags, and story structure that carries viewers past the first 30 seconds — and keeps them to the end screen.',
      proofLabel: 'Watch a recent edit',
      ctaPrimary: 'See My Work',
      ctaSecondary: 'Get In Touch',
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Work that **performs**, not just looks good.',
      subtitle: 'A selection of edits built around one goal: keeping viewers on the video.',
      anchor: {
        tag: 'Featured · Long-form',
        title: 'Full-length talking head episode',
        description:
          'Hook, pacing, b-roll and sound design engineered for retention — from the first second to the last.',
      },
      cards: [
        {
          title: 'Hook & Retention',
          description: 'The first 30 seconds, engineered so nobody clicks away.',
        },
        {
          title: 'Caption Design',
          description: 'Captions that guide the eye and punch up every key line.',
        },
        {
          title: 'Raw-to-Cut',
          description: 'From an unedited take to a tight, watchable story.',
        },
      ],
    },
    beforeAfter: {
      badge: 'Before / After',
      title: 'Same footage. **Different result**.',
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
      title: 'Creators who **stopped worrying** about editing.',
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
      title: 'Hi, I’m **Damian**.',
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
      title: 'Let’s make your next video your **best one**.',
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
      name: 'Damian',
      // Opcje sloganu — wybierz jedną i ustaw jako `slogan` poniżej:
      // 1. „Talking heady, które trzymają widza do końca."
      // 2. „Montaż, przez który widzowie zostają — minuta po minucie."
      // 3. „Twoje słowa. Mój montaż. Ich pełna uwaga."
      slogan: 'Talking heady, które trzymają widza do końca.',
      scroll: 'przewiń',
    },
    hero: {
      badge: 'Specjalista od talking headów',
      titleLines: [
        'Montaż talking headów, który **trzyma uwagę**.',
        'Uwaga, która **buduje Twój kanał**.',
      ],
      subtitle:
        'Hooki, które siadają, tempo bez dłużyzn i struktura historii, która przeprowadza widza przez pierwsze 30 sekund — i trzyma go do planszy końcowej.',
      proofLabel: 'Zobacz świeży montaż',
      ctaPrimary: 'Zobacz moje prace',
      ctaSecondary: 'Odezwij się',
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Montaż, który **działa**, a nie tylko dobrze wygląda.',
      subtitle: 'Wybrane realizacje z jednym celem: utrzymać widza przy ekranie.',
      anchor: {
        tag: 'Wyróżnione · Długa forma',
        title: 'Pełny odcinek talking head',
        description:
          'Hook, tempo, b-roll i sound design zaprojektowane pod retencję — od pierwszej do ostatniej sekundy.',
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
          description: 'Z surowego nagrania do zwartej, wciągającej historii.',
        },
      ],
    },
    beforeAfter: {
      badge: 'Przed / Po',
      title: 'To samo nagranie. **Zupełnie inny efekt**.',
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
      title: 'Twórcy, którzy **przestali martwić się** montażem.',
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
      title: 'Cześć, jestem **Damian**.',
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
      title: 'Zróbmy z Twojego następnego filmu Twój **najlepszy**.',
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
