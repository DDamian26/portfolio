// Every user-facing string on the site lives here.
// Keyed by section; components pull strings via useLanguage().t('section.key').
//
// Highlighted words: wrap a segment in **double asterisks** and render the
// string through <AccentText>, the marked segment gets the accent color.
// This keeps the highlight position independent per language.

export const translations = {
  en: {
    meta: {
      title: 'Damian Kaczor | Talking Head Video Editor',
      description:
        'Freelance video editor specializing in talking head content for long-form YouTube. Retention-first edits that keep viewers watching.',
    },
    nav: {
      name: 'Damian Kaczor',
      langLabel: 'Language',
      work: 'Portfolio',
      results: 'Results',
      testimonials: 'Testimonials',
      about: 'About',
      faq: 'FAQ',
      contact: 'Contact',
      cta: 'Work With Me',
    },
    splash: {
      name: 'Damian Kaczor',
      // Slogan options, pick one and set it as `slogan` below:
      // 1. "Talking head videos that keep people watching."
      // 2. "Edits that make viewers stay, minute after minute."
      // 3. "Your words. My cut. Their full attention."
      slogan: 'Talking head videos that keep people watching.',
      scroll: 'scroll',
    },
    hero: {
      badge: 'Talking Head Specialist',
      // Fixed two-line headline: line 1 renders off-white, line 2 yellow.
      titleLine1: 'Talking head edits that',
      titleLine2: 'grow your channel.',
      subtitle:
        'Hooks that land, pacing that never drags, and story structure that carries viewers past the first 30 seconds and keeps them all the way to the end screen.',
      ctaPrimary: 'See My Work',
      ctaSecondary: 'Get In Touch',
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Work that **performs**, not just looks good.',
      // Controlled two-line subheadline, split at the colon.
      subtitleLine1: 'A selection of edits built around one goal:',
      subtitleLine2: 'keeping viewers on the video.',
      anchor: {
        tag: 'Featured · Long-form',
        title: 'Full-length talking head episode',
        description:
          'Hook, pacing, b-roll and sound design engineered for retention, from the first second to the last.',
      },
      cards: [
        {
          title: 'Hook & Retention',
          description: 'The first 5 seconds, engineered so nobody clicks away.',
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
      // Fixed two-line headline: line 1 off-white, line 2 yellow.
      titleLine1: 'Raw in.',
      titleLine2: 'Retention out.',
      subtitle: 'Drag the handle. Press play. Same footage, before and after the edit.',
      raw: 'Raw',
      edited: 'Edited',
      play: 'Play',
      pause: 'Pause',
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
            'Retention on my videos jumped noticeably after the first month. I just film and forget. The edit comes back better than I imagined it.',
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
        'Then I found out editing is the same game. A viewer deciding whether to keep watching is a client deciding whether to keep listening, so I cut talking head videos the way I used to pitch: open strong, hold the rhythm, never let the energy dip, land every point.',
        'That background does more for retention than any plugin ever will. I don’t decorate footage. I sell your message, cut by cut.',
        'And yes: I’m obsessive about the first 30 seconds of every video.',
        'You’ll never chase me for an update: I check in at every stage and reply within one working day, every time.',
      ],
      highlights: ['5 yrs in sales', 'Replies within a day', 'Retention-first edits'],
    },
    faq: {
      badge: 'Questions',
      title: 'Frequently asked **questions**.',
      // [[...]] marks an inline link that smooth-scrolls to Contact.
      items: [
        {
          q: 'What kind of videos do you edit?',
          a: 'I edit Talking Head style long-form and short-form videos. They are retention focused: pacing, hooks, cuts, captions.',
        },
        {
          q: 'What software do you use?',
          a: 'DaVinci Resolve Studio.',
        },
        {
          q: 'How does the process look?',
          a: 'You send me the raw footage and brand assets (colour codes, logos, fonts if applicable). I will download it, start the editing process and keep you updated with completed stages, such as rough cut, colour grade, sound design, animation stages etc.',
        },
        {
          q: 'How fast is the turnaround?',
          a: 'Depends on video length and complexity. This will be quoted upfront per project, deadlines agreed before work starts and kept.',
        },
        {
          q: 'Can you clip short form from long form?',
          a: 'Yes.',
        },
        {
          q: 'What does it cost?',
          a: 'Project-based pricing depends on length and complexity. [[Get in touch]] with details and you’ll get a clear quote, no obligation.',
        },
      ],
    },
    contact: {
      badge: 'Contact',
      title: 'Let’s make your videos **impossible to click away** from.',
      subtitle: 'One message is enough. Tell me about your channel and I’ll take it from there.',
      cta: 'Work With Me',
      note: 'No forms, no pressure. Reach out however suits you.',
      followX: 'X (Twitter)',
      followInstagram: 'Instagram',
      booking: {
        heading: 'Book a call**.**',
        lead: "A quick call to see if we’re a good fit — and give you something worth keeping, either way.",
        pills: ['Up to 1 hr', 'Google Meet', 'Free'],
        bullets: [
          'Quick intros, and what you can expect from me.',
          "What you’re trying to build, and where it’s stuck.",
          "An honest read on whether we’re a fit, both ways.",
          "You leave with at least one thing worth doing, even if we don’t work together.",
        ],
        hostName: 'Damian Kaczor',
        hostRole: 'Talking Head Video Editor',
      },
    },
    links: {
      // The Work With Me CTAs open this profile in a new tab.
      workWithMe: 'https://x.com/DamianEditsVid',
    },
    footer: {
      rights: '© 2026 Damian Kaczor',
      signoff: 'Built for retention.',
    },
  },

  pl: {
    meta: {
      title: 'Damian Kaczor | Montaż talking headów',
      description:
        'Montażysta wideo specjalizujący się w talking headach, czyli długich formach na YouTube. Montaż pod retencję, który trzyma widza przy ekranie.',
    },
    nav: {
      name: 'Damian Kaczor',
      langLabel: 'Język',
      work: 'Portfolio',
      results: 'Efekty',
      testimonials: 'Opinie',
      about: 'O mnie',
      faq: 'FAQ',
      contact: 'Kontakt',
      cta: 'Współpracujmy',
    },
    splash: {
      name: 'Damian Kaczor',
      // Opcje sloganu, wybierz jedną i ustaw jako `slogan` poniżej:
      // 1. „Talking heady, które trzymają widza do końca."
      // 2. „Montaż, przez który widzowie zostają, minuta po minucie."
      // 3. „Twoje słowa. Mój montaż. Ich pełna uwaga."
      slogan: 'Talking heady, które trzymają widza do końca.',
      scroll: 'przewiń',
    },
    hero: {
      badge: 'Specjalista od talking headów',
      // Nagłówek zawsze w dwóch liniach: pierwsza jasna, druga żółta.
      titleLine1: 'Montaż talking headów, który',
      titleLine2: 'rozwija Twój kanał.',
      subtitle:
        'Hooki, które siadają, tempo bez dłużyzn i struktura historii, która przeprowadza widza przez pierwsze 30 sekund i trzyma go aż do planszy końcowej.',
      ctaPrimary: 'Zobacz moje prace',
      ctaSecondary: 'Odezwij się',
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Montaż, który **działa**, a nie tylko dobrze wygląda.',
      // Podtytuł zawsze łamany po dwukropku.
      subtitleLine1: 'Wybrane realizacje z jednym celem:',
      subtitleLine2: 'utrzymać widza przy ekranie.',
      anchor: {
        tag: 'Wyróżnione · Długa forma',
        title: 'Pełny odcinek talking head',
        description:
          'Hook, tempo, b-roll i sound design zaprojektowane pod retencję, od pierwszej do ostatniej sekundy.',
      },
      cards: [
        {
          title: 'Hook i retencja',
          description: 'Pierwsze 5 sekund zaprojektowane tak, żeby nikt nie uciekł.',
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
      // Nagłówek zawsze w dwóch liniach: pierwsza jasna, druga żółta.
      titleLine1: 'Wchodzi surówka.',
      titleLine2: 'Wychodzi retencja.',
      subtitle: 'Przeciągnij suwak. Wciśnij play. To samo nagranie, przed i po montażu.',
      raw: 'Surowe',
      edited: 'Po montażu',
      play: 'Odtwórz',
      pause: 'Zatrzymaj',
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
            'Retencja na moich filmach zauważalnie wzrosła już po pierwszym miesiącu. Ja tylko nagrywam. Montaż wraca lepszy, niż go sobie wyobrażałem.',
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
        'Przez pięć lat sprzedawałem twarzą w twarz. Codziennie nowi klienci, nowe obiekcje i jedna brutalna zasada: tracisz czyjąś uwagę na moment, a sprzedaż przepada. Bez drugiej szansy, bez powtórek.',
        'Potem odkryłem, że montaż to ta sama gra. Widz, który decyduje, czy oglądać dalej, to klient, który decyduje, czy dalej słuchać. Dlatego tnę talking heady tak, jak kiedyś prowadziłem rozmowy handlowe: mocne otwarcie, równy rytm, żadnego spadku energii, każdy punkt ma trafić.',
        'Takie doświadczenie robi dla retencji więcej niż jakikolwiek plugin. Nie dekoruję materiału. Sprzedaję Twój przekaz, cięcie po cięciu.',
        'I tak: mam obsesję na punkcie pierwszych 30 sekund każdego filmu.',
        'Nie musisz dopytywać o postępy: odzywam się na każdym etapie i odpisuję w ciągu jednego dnia roboczego, za każdym razem.',
      ],
      highlights: ['5 lat w sprzedaży', 'Odpowiedź w dobę', 'Montaż pod retencję'],
    },
    faq: {
      badge: 'Pytania',
      title: 'Najczęstsze **pytania**.',
      // [[...]] oznacza link, który płynnie przewija do sekcji Kontakt.
      items: [
        {
          q: 'Jakie filmy montujesz?',
          a: 'Montuję talking heady: długie i krótkie formy. Wszystko pod retencję, czyli tempo, hooki, cięcia, napisy.',
        },
        {
          q: 'W czym montujesz?',
          a: 'DaVinci Resolve Studio.',
        },
        {
          q: 'Jak wygląda proces?',
          a: 'Wysyłasz mi surowy materiał i elementy marki (kody kolorów, logo, fonty, jeśli są). Pobieram wszystko, zabieram się za montaż i na bieżąco informuję Cię o ukończonych etapach: wstępny montaż, korekcja koloru, sound design, animacje itd.',
        },
        {
          q: 'Jak szybko dostanę gotowy film?',
          a: 'To zależy od długości i złożoności materiału. Wycenę dostajesz z góry dla każdego projektu, a terminy ustalamy przed startem i ich pilnuję.',
        },
        {
          q: 'Zrobisz shorty z długiej formy?',
          a: 'Tak.',
        },
        {
          q: 'Ile to kosztuje?',
          a: 'Wycena zależy od długości i złożoności projektu. [[Napisz do mnie]] z konkretami, a dostaniesz jasną wycenę, bez zobowiązań.',
        },
      ],
    },
    contact: {
      badge: 'Kontakt',
      title: 'Zróbmy filmy, od których **nie da się oderwać**.',
      subtitle: 'Wystarczy jedna wiadomość. Opowiedz mi o swoim kanale, a resztą zajmę się ja.',
      cta: 'Współpracujmy',
      note: 'Żadnych formularzy, zero presji. Odezwij się tak, jak Ci wygodnie.',
      followX: 'X (Twitter)',
      followInstagram: 'Instagram',
      booking: {
        heading: 'Umów rozmowę**.**',
        lead: 'Krótka rozmowa — żeby sprawdzić, czy to ma sens, i żebyś wyszedł z czymś konkretnym niezależnie od decyzji.',
        pills: ['Do 1 godz.', 'Google Meet', 'Bezpłatnie'],
        bullets: [
          'Krótkie przedstawienie i czego możesz się po mnie spodziewać.',
          'Co chcesz zbudować i co Cię blokuje.',
          'Uczciwa ocena dopasowania — z obu stron.',
          'Wychodzisz z przynajmniej jednym krokiem do zrobienia, nawet jeśli nie zdecydujemy się na współpracę.',
        ],
        hostName: 'Damian Kaczor',
        hostRole: 'Montażysta talking headów',
      },
    },
    links: {
      // CTA „Współpracujmy" otwiera ten profil w nowej karcie.
      workWithMe: 'https://www.instagram.com/damian.montuje/?hl=en',
    },
    footer: {
      rights: '© 2026 Damian Kaczor',
      signoff: 'Zmontowane pod retencję.',
    },
  },
}
