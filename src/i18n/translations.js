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
      badge: 'Raw vs. Cut',
      title: 'Same footage. **Different result**.',
      subtitle: 'Drag the handle and watch raw footage turn into a video people finish.',
      raw: 'Raw',
      edited: 'Edited',
      items: [
        {
          title: 'Color & framing',
          description: 'Flat raw footage graded and reframed into a cinematic look.',
        },
        {
          title: 'Pacing & graphics',
          description: 'Dead air removed, key points reinforced with motion graphics.',
        },
        {
          title: 'Sound & emphasis',
          description: 'Fillers cut, key lines punched up with sound design and zooms.',
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
        'For five years I sold face-to-face. New clients every day, new objections, and one brutal rule: lose someone’s attention for a moment and the deal is gone. No second chances, no replays.',
        'Then I found out editing is the same game. A viewer deciding whether to keep watching is a client deciding whether to keep listening — so I cut talking head videos the way I used to pitch: open strong, hold the rhythm, never let the energy dip, land every point.',
        'That background does more for retention than any plugin ever will. I don’t decorate footage — I sell your message, cut by cut.',
        'And yes: I’m obsessive about the first 30 seconds of every video.',
      ],
      highlights: ['5 yrs in sales', 'Talking head focus', 'Retention-first edits'],
    },
    contact: {
      badge: 'Contact',
      title: 'Let’s make your videos **impossible to click away** from.',
      subtitle: 'One email is enough. Tell me about your channel — I’ll take it from there.',
      cta: 'Work With Me',
      note: 'No forms, no calls until you want one. Just an email.',
      followX: 'X (Twitter)',
      followYouTube: 'YouTube',
    },
    footer: {
      rights: '© 2026 Damian Kaczor',
      signoff: 'Built for retention.',
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
      badge: 'Surówka vs. gotowiec',
      title: 'To samo nagranie. **Zupełnie inny efekt**.',
      subtitle: 'Przesuń suwak i zobacz, jak surowy materiał zamienia się w film, który ludzie oglądają do końca.',
      raw: 'Surowe',
      edited: 'Po montażu',
      items: [
        {
          title: 'Kolor i kadr',
          description: 'Płaski, surowy materiał po gradingu i przekadrowaniu wygląda filmowo.',
        },
        {
          title: 'Tempo i grafiki',
          description: 'Bez martwych momentów, kluczowe wątki wzmocnione animowanymi grafikami.',
        },
        {
          title: 'Dźwięk i akcenty',
          description: 'Bez wypełniaczy, kluczowe zdania podbite sound designem i zoomami.',
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
        'Przez pięć lat sprzedawałem twarzą w twarz. Codziennie nowi klienci, nowe obiekcje i jedna brutalna zasada: tracisz czyjąś uwagę na moment — i po sprzedaży. Bez drugiej szansy, bez powtórek.',
        'Potem odkryłem, że montaż to ta sama gra. Widz, który decyduje, czy oglądać dalej, to klient, który decyduje, czy dalej słuchać. Dlatego tnę talking heady tak, jak kiedyś prowadziłem rozmowy handlowe: mocne otwarcie, równy rytm, żadnego spadku energii, każdy punkt ma trafić.',
        'Takie doświadczenie robi dla retencji więcej niż jakikolwiek plugin. Nie dekoruję materiału — sprzedaję Twój przekaz, cięcie po cięciu.',
        'I tak: mam obsesję na punkcie pierwszych 30 sekund każdego filmu.',
      ],
      highlights: ['5 lat w sprzedaży', 'Specjalizacja: talking heady', 'Montaż pod retencję'],
    },
    contact: {
      badge: 'Kontakt',
      title: 'Zróbmy filmy, od których **nie da się oderwać**.',
      subtitle: 'Wystarczy jeden mail. Opowiedz mi o swoim kanale — resztą zajmę się ja.',
      cta: 'Współpracujmy',
      note: 'Żadnych formularzy ani rozmów, dopóki sam ich nie zechcesz. Wystarczy mail.',
      followX: 'X (Twitter)',
      followYouTube: 'YouTube',
    },
    footer: {
      rights: '© 2026 Damian Kaczor',
      signoff: 'Zmontowane pod retencję.',
    },
  },
}
