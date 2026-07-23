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
      play: 'Play',
      closeVideo: 'Close video',
      player: {
        pause: 'Pause',
        mute: 'Mute',
        unmute: 'Unmute',
        fullscreen: 'Fullscreen',
        seek: 'Seek',
      },
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
        'And yes: I’m obsessed with the first 30 seconds of every video.',
        'You’ll never chase me for an update: I check in at every stage and reply within one working day, every time.',
      ],
      highlights: ['5 yrs in sales', 'Replies within a day', 'Retention-first edits'],
      portraitAlt: 'Damian Kaczor, Talking Head Video Editor',
    },
    faq: {
      badge: 'Questions',
      title: 'Frequently asked **questions**.',
      // Answers are a single string (one line) or an array (checkmark bullets).
      // [[...]] marks an inline link that smooth-scrolls to the booking panel.
      items: [
        {
          q: 'Can you match my editing style?',
          a: [
            'Yes. Send me a reference link and I’ll tell you straight.',
            'There are hundreds of styles out there, and new ones every month, so I always confirm against a real example first.',
          ],
        },
        {
          q: 'How do we work together?',
          a: [
            'DM me on social media to start the process.',
            'Not sure yet? [[Book a call]] and we’ll talk it through.',
          ],
        },
        {
          q: 'How quickly can you deliver?',
          a: [
            'Depends on the length and complexity of the edit.',
            'You get a concrete deadline before work starts, and I keep it.',
          ],
        },
        {
          q: 'Do you edit both long-form and Shorts?',
          a: 'Yes.',
        },
        {
          q: 'What does a typical project look like?',
          a: [
            'We agree to work together and you send me your files.',
            'I confirm everything arrived and the edit begins.',
            'You get updates at every stage until final delivery.',
          ],
        },
        {
          q: 'How much does it cost?',
          a: [
            'Depends on the length and complexity of the edit, quoted upfront.',
            'Long-form: 50% deposit before work commences.',
            'Shorts/Reels: watermarked until full payment is received.',
          ],
        },
        {
          q: 'How many revisions?',
          a: 'Up to 3 rounds of revisions.',
        },
      ],
      cta: 'Still have questions? [[Let’s talk]].',
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
        heading: 'Let’s Talk**.**',
        lead: 'No pressure. Just a conversation about your content and whether I can help.',
        pills: ['Up to 1 hr', 'Google Meet', 'Free'],
        bullets: [
          'A quick introduction and a look at what you’re building.',
          'An honest conversation about your current content and goals.',
          'A clear idea of whether we’re a good fit.',
          'One practical tip you can apply straight away, whether we work together or not.',
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
        'Mocne początki, dynamiczne tempo i historia poprowadzona tak, by widz został z Tobą do samego końca.',
      ctaPrimary: 'Zobacz moje prace',
      ctaSecondary: 'Odezwij się',
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Montaż, który buduje emocje i **zatrzymuje uwagę**',
      // Podtytuł zawsze łamany po myślniku.
      subtitleLine1: 'Każda sekunda ma znaczenie –',
      subtitleLine2: 'od mocnego otwarcia po satysfakcjonujące zakończenie',
      play: 'Odtwórz',
      closeVideo: 'Zamknij film',
      player: {
        pause: 'Pauza',
        mute: 'Wycisz',
        unmute: 'Włącz dźwięk',
        fullscreen: 'Pełny ekran',
        seek: 'Przewiń',
      },
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
          description: 'Napisy, które kierują uwagę widza na to, co najważniejsze',
        },
        {
          title: 'Od surówki do gotowca',
          description: 'Od surowych nagrań do filmu, który przyciąga uwagę i angażuje widza',
        },
      ],
    },
    beforeAfter: {
      badge: 'Surówka vs. gotowiec',
      // Nagłówek zawsze w dwóch liniach: pierwsza jasna, druga żółta.
      titleLine1: 'Ty dostarczasz materiał.',
      titleLine2: 'Ja nadaję mu rytm i charakter',
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
        'Przez pięć lat zajmowałem się sprzedażą. Codziennie nowi klienci, nowe obiekty i jedna brutalna zasada: tracisz czyjąś uwagę na moment, a sprzedaż przepada. Bez drugiej szansy, bez powtórek.',
        'Potem odkryłem, że montaż to ta sama gra. Widz, który decyduje, czy oglądać dalej, to klient, który decyduje, czy dalej słuchać. Dlatego swoją wiedzę i doświadczenie z klientem przekładam na styl edytowania video. Dokładnie tak, jak kiedyś prowadziłem rozmowy handlowe: mocne otwarcie, równy rytm, żadnego spadku energii, każdy punkt ma trafić.',
        'Takie doświadczenie robi dla oglądalności więcej niż jakikolwiek plugin. Nie dekoruję materiału. Sprzedaję Twój przekaz, cięcie po cięciu.',
        'I tak: mam obsesję na punkcie pierwszych 30 sekund każdego filmu.',
        'Komunikacja bez domysłów – otrzymujesz aktualizacje na każdym etapie, a na wiadomości odpowiadam w ciągu jednego dnia roboczego.',
      ],
      highlights: ['5 lat w sprzedaży', 'Odpowiedź w dobę', 'Montaż pod retencję'],
      portraitAlt: 'Damian Kaczor, montażysta talking headów',
    },
    faq: {
      badge: 'Pytania',
      title: 'Najczęstsze **pytania**.',
      // Odpowiedź to pojedynczy tekst (jedna linia) lub tablica (punkty z ptaszkiem).
      // [[...]] oznacza link, który płynnie przewija do panelu rezerwacji.
      items: [
        {
          q: 'Dopasujesz się do mojego stylu montażu?',
          a: [
            'Tak. Podeślij mi link z przykładem, a powiem Ci wprost.',
            'Styli są setki i co miesiąc pojawiają się nowe, więc zawsze najpierw potwierdzam wszystko na konkretnym materiale.',
          ],
        },
        {
          q: 'Jak wygląda współpraca?',
          a: [
            'Napisz do mnie na social mediach i ruszamy.',
            'Jeszcze nie wiesz? [[Umów rozmowę]] i wszystko omówimy.',
          ],
        },
        {
          q: 'Jak szybko dostanę gotowy materiał?',
          a: [
            'To zależy od długości i złożoności montażu.',
            'Konkretny termin dostajesz przed startem i go dotrzymuję.',
          ],
        },
        {
          q: 'Montujesz zarówno długie formy, jak i Shorty?',
          a: 'Tak.',
        },
        {
          q: 'Jak wygląda typowy projekt?',
          a: [
            'Ustalamy współpracę i wysyłasz mi swoje pliki.',
            'Potwierdzam, że wszystko dotarło, i zaczynam montaż.',
            'Dostajesz update’y na każdym etapie aż do finalnej wersji.',
          ],
        },
        {
          q: 'Ile to kosztuje?',
          a: [
            'Zależy od długości i złożoności montażu, wycena z góry.',
            'Długie formy: 50% zaliczki przed rozpoczęciem pracy.',
            'Shorty/Reelsy: znak wodny do czasu pełnej płatności.',
          ],
        },
        {
          q: 'Ile poprawek?',
          a: 'Do 3 rund poprawek.',
        },
      ],
      cta: 'Masz jeszcze pytania? [[Porozmawiajmy]].',
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
        heading: 'Porozmawiajmy**.**',
        lead: 'Bez presji. Po prostu rozmowa o Twoich treściach i o tym, czy mogę pomóc.',
        pills: ['Do 1 godz.', 'Google Meet', 'Bezpłatnie'],
        bullets: [
          'Krótkie przedstawienie i spojrzenie na to, co budujesz.',
          'Szczera rozmowa o Twoich obecnych treściach i celach.',
          'Jasność co do tego, czy do siebie pasujemy.',
          'Jedna praktyczna wskazówka, którą wdrożysz od ręki, niezależnie od tego, czy zaczniemy współpracę.',
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
