export type ChapterId = 1 | 2 | 4 | 5 | 8;

export interface Section {
  id: string;
  code: string;
  title: string;
  hours: number;
  summary: string;
  content: string[];
  keyTerms: { term: string; explanation: string }[];
  realWorldExample: {
    title: string;
    description: string;
    application: string;
  };
}

export interface Chapter {
  id: ChapterId;
  code: string;
  title: string;
  hours: number;
  subtitle: string;
  description: string;
  objectives: {
    knowledge: string[];
    skills: string[];
    abilities: string[];
  };
  textbookPages: string;
  sections: Section[];
}

export interface QuizQuestion {
  id: string;
  chapterId: ChapterId;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Εύκολο' | 'Μεσαίο' | 'Προχωρημένο';
  bookRef: string;
}

export interface DatasheetComponent {
  id: string;
  name: string;
  category: 'Δίοδοι' | 'Ειδικές Δίοδοι' | 'Θυρίστορ' | 'Τρανζίστορ' | 'Ψηφιακά Ολοκληρωμένα';
  chapterId: ChapterId;
  description: string;
  packageType: string;
  symbol: string;
  pinout: { pin: string; name: string; desc: string }[];
  specs: { parameter: string; symbol: string; value: string; meaning: string }[];
  practicalTip: string;
}

export interface GlossaryTerm {
  term: string;
  chapterId: ChapterId;
  definition: string;
  example: string;
}
