export const officialResources = {
  en: {
    language: "English",
    flag: "🇺🇸",
    resources: [
      {
        name: "Core Rulebook (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/17072/need-games/category/43538/fabula-ultima-ttjrpg",
        type: "pdf",
        description:
          "The complete digital rulebook with all core rules and mechanics.",
      },
      {
        name: "Core Rulebook (Physical - US)",
        url: "https://studio2publishing.com/collections/fabula-ultima",
        type: "physical",
        description:
          "Physical copy available through Studio2Publishing (US distributor).",
      },
      {
        name: "Core Rulebook (Physical - UK)",
        url: "https://modiphius.net/collections/fabula-ultima",
        type: "physical",
        description:
          "Physical copy available through Modiphius (UK distributor).",
      },
      {
        name: "Press Start Tutorial (Free PDF)",
        url: "https://www.drivethrurpg.com/en/product/411240/fabula-ultima-ttjrpg-press-start",
        type: "free",
        description:
          "Free introductory scenario for 4-5 players to learn the system.",
      },
      {
        name: "Official Website",
        url: "https://www.needgames.it/fabula-ultima-en",
        type: "website",
        description: "Official English website with news and updates.",
      },
    ],
  },
  it: {
    language: "Italiano",
    flag: "🇮🇹",
    resources: [
      {
        name: "Manuale Base (PDF & Fisico)",
        url: "https://www.needgames.it/categoria-prodotto/fabula-ultima/",
        type: "both",
        description:
          "Manuale completo disponibile in formato digitale e fisico.",
      },
      {
        name: "Premi Start Tutorial (PDF Gratuito)",
        url: "https://www.needgames.it/prodotto/premi-start-fabula-ultima-quickstart-pdf/",
        type: "free",
        description: "Scenario introduttivo gratuito per 4-5 giocatori.",
      },
      {
        name: "Sito Ufficiale",
        url: "https://www.needgames.it/giochi/fabula-ultima/",
        type: "website",
        description: "Sito ufficiale italiano con notizie e aggiornamenti.",
      },
    ],
  },
  fr: {
    language: "Français",
    flag: "🇫🇷",
    resources: [
      {
        name: "Livre de Règles (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/26836/don-t-panic-games/category/48615/fabula-ultima",
        type: "pdf",
        description: "Livre de règles complet en format numérique.",
      },
      {
        name: "Livre de Règles (Physique)",
        url: "https://www.dontpanicgames.com/fr/nos-jeux/?_sfm_licence=fabulaultima",
        type: "physical",
        description: "Copie physique disponible via Don't Panic Games.",
      },
      {
        name: "Appuyez sur Start Tutorial (PDF Gratuit)",
        url: "https://www.drivethrurpg.com/en/product/473233/fabula-ultima-appuyez-sur-start",
        type: "free",
        description:
          "Scénario d'introduction gratuit pour apprendre le système.",
      },
    ],
  },
  de: {
    language: "Deutsch",
    flag: "🇩🇪",
    resources: [
      {
        name: "Grundregelwerk (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/3444/ulisses-spiele/category/50444/fabula-ultima",
        type: "pdf",
        description: "Vollständiges digitales Regelwerk.",
      },
      {
        name: "Grundregelwerk (Physisch)",
        url: "https://www.f-shop.de/fabula-ultima/",
        type: "physical",
        description: "Physische Kopie über F-Shop erhältlich.",
      },
    ],
  },
  pl: {
    language: "Polski",
    flag: "🇵🇱",
    resources: [
      {
        name: "Podstawowa Książka Zasad (PDF)",
        url: "https://www.drivethrurpg.com/en/publisher/14087/black-monk-games/category/47458/fabula-ultima",
        type: "pdf",
        description: "Kompletna cyfrowa książka zasad.",
      },
      {
        name: "Podstawowa Książka Zasad (Fizyczna)",
        url: "https://blackmonk.pl/92-fabula-ultima",
        type: "physical",
        description: "Fizyczna kopia dostępna przez Black Monk Games.",
      },
      {
        name: "Starter Tutorial (PDF)",
        url: "https://blackmonk.pl/black-monk-games/1907-pdf-fabula-ultima-starter.html",
        type: "free",
        description: "Wprowadzający scenariusz do nauki systemu.",
      },
    ],
  },
  "pt-BR": {
    language: "Português (Brasil)",
    flag: "🇧🇷",
    resources: [
      {
        name: "Livro Básico (Em Breve)",
        url: "https://site.jamboeditora.com.br/fabula-ultima/",
        type: "coming_soon",
        description:
          "Em desenvolvimento pela Jambo Editora. Cadastre-se para receber atualizações.",
      },
    ],
  },
};

// Homebrew content that respects the third-party license
export const homebrewContent = [
  {
    name: "Community Character Sheets",
    author: "FU Community",
    url: "https://github.com/fultimator/fultimator",
    type: "tools",
    description:
      "Enhanced character sheets and digital tools for managing your Fabula Ultima campaigns.",
    license: "Third Party License 1.0",
  },
  {
    name: "Extended Adversary Collection",
    author: "Community Contributors",
    url: "#",
    type: "content",
    description:
      "Community-created adversaries following official design guidelines.",
    license: "Third Party License 1.0",
  },
  {
    name: "Custom Spell & Ritual Compendium",
    author: "Various Authors",
    url: "#",
    type: "content",
    description:
      "Player-created spells and rituals balanced for official play.",
    license: "Third Party License 1.0",
  },
  {
    name: "Alternative Class Options",
    author: "Community Designers",
    url: "#",
    type: "content",
    description: "Balanced class variants and new advancement options.",
    license: "Third Party License 1.0",
  },
];
