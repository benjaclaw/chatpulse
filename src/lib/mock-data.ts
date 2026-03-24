// Mock data for ChatPulse dashboard pages

export const mockKnowledgeItems = [
  {
    id: "k1",
    title: "Returpolicy",
    content:
      "Vi tilbyr 30 dagers åpent kjøp på alle produkter. Produktet må være ubrukt og i originalemballasje. Kontakt kundeservice for å starte en retur.",
    category: "Returer",
    created_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "k2",
    title: "Fraktalternativer",
    content:
      "Vi tilbyr standard frakt (3-5 virkedager) og ekspress frakt (1-2 virkedager). Fri frakt på bestillinger over 500 kr.",
    category: "Frakt",
    created_at: "2026-03-19T14:30:00Z",
  },
  {
    id: "k3",
    title: "Åpningstider",
    content:
      "Kundeservice er tilgjengelig mandag til fredag kl. 08:00-16:00. Chat-boten vår er tilgjengelig 24/7.",
    category: "Generelt",
    created_at: "2026-03-18T09:15:00Z",
  },
  {
    id: "k4",
    title: "Betalingsmetoder",
    content:
      "Vi aksepterer Visa, Mastercard, Vipps og faktura via Klarna. Alle betalinger er sikret med SSL-kryptering.",
    category: "Betaling",
    created_at: "2026-03-17T11:45:00Z",
  },
  {
    id: "k5",
    title: "Garanti",
    content:
      "Alle produkter har minimum 2 års garanti i henhold til norsk forbrukerkjøpslov. Utvidet garanti kan kjøpes for utvalgte produkter.",
    category: "Garanti",
    created_at: "2026-03-16T08:00:00Z",
  },
];

export const mockChatbotConfig = {
  id: "cb1",
  workspace_id: "ws1",
  name: "Kundeservice Bot",
  prompt:
    "Du er en hjelpsom kundeserviceassistent for vår bedrift. Svar alltid på norsk. Vær vennlig og profesjonell.",
  welcome_message: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
  fallback_response:
    "Beklager, jeg fant ikke svaret på det. Vil du snakke med en av våre medarbeidere?",
  widget_styling: {
    primary_color: "#6366f1",
    position: "right" as "left" | "right",
  },
};

export const mockConversations = [
  {
    id: "c1",
    visitor_id: "visitor_a3f2",
    started_at: "2026-03-24T09:12:00Z",
    message_count: 6,
    messages: [
      {
        id: "m1",
        role: "assistant" as const,
        content: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
        created_at: "2026-03-24T09:12:00Z",
      },
      {
        id: "m2",
        role: "user" as const,
        content: "Hei! Jeg lurer på returpolicyen deres.",
        created_at: "2026-03-24T09:12:30Z",
      },
      {
        id: "m3",
        role: "assistant" as const,
        content:
          "Vi tilbyr 30 dagers åpent kjøp på alle produkter. Produktet må være ubrukt og i originalemballasje. Kontakt kundeservice for å starte en retur.",
        created_at: "2026-03-24T09:12:45Z",
      },
      {
        id: "m4",
        role: "user" as const,
        content: "Hva med frakt ved retur?",
        created_at: "2026-03-24T09:13:10Z",
      },
      {
        id: "m5",
        role: "assistant" as const,
        content:
          "Ved retur dekker vi fraktkostnadene dersom produktet er defekt. For angre-rett returer betaler kunden returfrakt.",
        created_at: "2026-03-24T09:13:25Z",
      },
      {
        id: "m6",
        role: "user" as const,
        content: "Ok, takk for hjelpen!",
        created_at: "2026-03-24T09:13:45Z",
      },
    ],
  },
  {
    id: "c2",
    visitor_id: "visitor_b7e1",
    started_at: "2026-03-23T14:05:00Z",
    message_count: 4,
    messages: [
      {
        id: "m7",
        role: "assistant" as const,
        content: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
        created_at: "2026-03-23T14:05:00Z",
      },
      {
        id: "m8",
        role: "user" as const,
        content: "Hvilke betalingsmetoder har dere?",
        created_at: "2026-03-23T14:05:20Z",
      },
      {
        id: "m9",
        role: "assistant" as const,
        content:
          "Vi aksepterer Visa, Mastercard, Vipps og faktura via Klarna. Alle betalinger er sikret med SSL-kryptering.",
        created_at: "2026-03-23T14:05:35Z",
      },
      {
        id: "m10",
        role: "user" as const,
        content: "Perfekt, takk!",
        created_at: "2026-03-23T14:06:00Z",
      },
    ],
  },
  {
    id: "c3",
    visitor_id: "visitor_c4d9",
    started_at: "2026-03-22T11:30:00Z",
    message_count: 3,
    messages: [
      {
        id: "m11",
        role: "assistant" as const,
        content: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
        created_at: "2026-03-22T11:30:00Z",
      },
      {
        id: "m12",
        role: "user" as const,
        content: "Kan dere levere til Svalbard?",
        created_at: "2026-03-22T11:30:15Z",
      },
      {
        id: "m13",
        role: "assistant" as const,
        content:
          "Beklager, jeg fant ikke svaret på det. Vil du snakke med en av våre medarbeidere?",
        created_at: "2026-03-22T11:30:30Z",
      },
    ],
  },
  {
    id: "c4",
    visitor_id: "visitor_d2a8",
    started_at: "2026-03-21T16:45:00Z",
    message_count: 5,
    messages: [
      {
        id: "m14",
        role: "assistant" as const,
        content: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
        created_at: "2026-03-21T16:45:00Z",
      },
      {
        id: "m15",
        role: "user" as const,
        content: "Hva er åpningstidene deres?",
        created_at: "2026-03-21T16:45:10Z",
      },
      {
        id: "m16",
        role: "assistant" as const,
        content:
          "Kundeservice er tilgjengelig mandag til fredag kl. 08:00-16:00. Chat-boten vår er tilgjengelig 24/7.",
        created_at: "2026-03-21T16:45:25Z",
      },
      {
        id: "m17",
        role: "user" as const,
        content: "Har dere helgeåpent?",
        created_at: "2026-03-21T16:45:40Z",
      },
      {
        id: "m18",
        role: "assistant" as const,
        content:
          "Nei, kundeservice holder stengt i helger og på helligdager. Men chat-boten vår er alltid tilgjengelig!",
        created_at: "2026-03-21T16:45:55Z",
      },
    ],
  },
  {
    id: "c5",
    visitor_id: "visitor_e9f3",
    started_at: "2026-03-20T10:20:00Z",
    message_count: 4,
    messages: [
      {
        id: "m19",
        role: "assistant" as const,
        content: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
        created_at: "2026-03-20T10:20:00Z",
      },
      {
        id: "m20",
        role: "user" as const,
        content: "Hei, kan jeg endre bestillingen min etter at den er lagt inn?",
        created_at: "2026-03-20T10:20:15Z",
      },
      {
        id: "m21",
        role: "assistant" as const,
        content:
          "Ja, du kan endre bestillingen din inntil den er sendt fra vårt lager. Gå til \"Mine bestillinger\" eller kontakt kundeservice for hjelp.",
        created_at: "2026-03-20T10:20:30Z",
      },
      {
        id: "m22",
        role: "user" as const,
        content: "Supert, takk for info!",
        created_at: "2026-03-20T10:20:50Z",
      },
    ],
  },
];

export const mockQuestions = [
  {
    id: "q1",
    question: "Hva er returpolicyen?",
    count: 24,
    last_asked_at: "2026-03-24T09:12:30Z",
    answered: true,
  },
  {
    id: "q2",
    question: "Hvilke betalingsmetoder har dere?",
    count: 18,
    last_asked_at: "2026-03-23T14:05:20Z",
    answered: true,
  },
  {
    id: "q3",
    question: "Hva er leveringstiden?",
    count: 15,
    last_asked_at: "2026-03-22T16:00:00Z",
    answered: true,
  },
  {
    id: "q4",
    question: "Kan dere levere til Svalbard?",
    count: 7,
    last_asked_at: "2026-03-22T11:30:15Z",
    answered: false,
  },
  {
    id: "q5",
    question: "Har dere studentrabatt?",
    count: 12,
    last_asked_at: "2026-03-21T10:00:00Z",
    answered: false,
  },
  {
    id: "q6",
    question: "Hva er garantivilkårene?",
    count: 9,
    last_asked_at: "2026-03-20T14:30:00Z",
    answered: true,
  },
  {
    id: "q7",
    question: "Tilbyr dere montering?",
    count: 5,
    last_asked_at: "2026-03-19T09:00:00Z",
    answered: false,
  },
  {
    id: "q8",
    question: "Hva er åpningstidene?",
    count: 21,
    last_asked_at: "2026-03-21T16:45:10Z",
    answered: true,
  },
  {
    id: "q9",
    question: "Kan jeg endre bestillingen min?",
    count: 11,
    last_asked_at: "2026-03-23T08:15:00Z",
    answered: true,
  },
  {
    id: "q10",
    question: "Har dere prisgaranti?",
    count: 4,
    last_asked_at: "2026-03-18T12:00:00Z",
    answered: false,
  },
];

export const mockTeamMembers = [
  {
    id: "u1",
    name: "Ola Nordmann",
    email: "ola@chatpulse.no",
    role: "owner" as const,
    avatar_initials: "ON",
  },
  {
    id: "u2",
    name: "Kari Hansen",
    email: "kari@chatpulse.no",
    role: "admin" as const,
    avatar_initials: "KH",
  },
  {
    id: "u3",
    name: "Erik Johansen",
    email: "erik@chatpulse.no",
    role: "member" as const,
    avatar_initials: "EJ",
  },
];

export const mockDashboardStats = {
  totalConversations: 47,
  messagesToday: 12,
  unansweredQuestions: 3,
  teamMembers: 3,
  knowledgeArticles: 5,
};

export const mockRecentActivity = [
  {
    id: "a1",
    type: "conversation" as const,
    description: "Ny samtale startet av visitor_a3f2",
    time: "2026-03-24T09:12:00Z",
  },
  {
    id: "a2",
    type: "knowledge" as const,
    description: 'Artikkel "Returpolicy" ble oppdatert',
    time: "2026-03-24T08:30:00Z",
  },
  {
    id: "a3",
    type: "question" as const,
    description: 'Nytt ubesvart spørsmål: "Kan dere levere til Svalbard?"',
    time: "2026-03-22T11:30:15Z",
  },
  {
    id: "a4",
    type: "team" as const,
    description: "Erik Johansen ble lagt til i teamet",
    time: "2026-03-20T10:00:00Z",
  },
  {
    id: "a5",
    type: "conversation" as const,
    description: "Ny samtale startet av visitor_d2a8",
    time: "2026-03-21T16:45:00Z",
  },
];
