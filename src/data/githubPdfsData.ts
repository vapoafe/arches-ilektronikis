export interface GitHubPdfItem {
  id: string;
  fileName: string;
  title: string;
  chapterId: 1 | 2 | 4 | 5 | 8 | 0; // 0 for lab / general
  folder: string;
  relativeUrl: string;
  description: string;
  topics: string[];
  fileSize: string;
  pages: number;
  lastUpdated: string;
}

export interface PdfFolderCategory {
  id: string;
  name: string;
  chapterId?: 1 | 2 | 4 | 5 | 8 | 0;
  folderPath: string;
  description: string;
}

export const pdfFolders: PdfFolderCategory[] = [
  {
    id: 'kefalaio-1',
    name: 'Κεφάλαιο 1: Στοιχεία Θεωρίας Στερεού Σώματος',
    chapterId: 1,
    folderPath: 'public/slides/kefalaio-1/',
    description: 'Διαφάνειες τάξης για ενεργειακές ζώνες, ημιαγωγούς Si/Ge, προσμίξεις N/P και NTC/LDR.'
  },
  {
    id: 'kefalaio-2',
    name: 'Κεφάλαιο 2: Κρυσταλλοδίοδοι & Ειδικές Δίοδοι',
    chapterId: 2,
    folderPath: 'public/slides/kefalaio-2/',
    description: 'Διαφάνειες για την επαφή P-N, καμπύλη I-V, δίοδο Zener, LED, Schottky και ανόρθωση.'
  },
  {
    id: 'kefalaio-4',
    name: 'Κεφάλαιο 4: Στοιχεία Ελέγχου Ισχύος (Θυρίστορ)',
    chapterId: 4,
    folderPath: 'public/slides/kefalaio-4/',
    description: 'Διαφάνειες για SCR, DIAC, TRIAC, γωνία έναυσης και κυκλώματα ροοστάτη Dimmer.'
  },
  {
    id: 'kefalaio-5',
    name: 'Κεφάλαιο 5: Διπολικά Τρανζίστορ (BJT)',
    chapterId: 5,
    folderPath: 'public/slides/kefalaio-5/',
    description: 'Διαφάνειες για τρανζίστορ NPN/PNP, συνδεσμολογία CE, ευθεία φόρτου και σημείο Q.'
  },
  {
    id: 'kefalaio-8',
    name: 'Κεφάλαιο 8: Ψηφιακά Ηλεκτρονικά & Πύλες',
    chapterId: 8,
    folderPath: 'public/slides/kefalaio-8/',
    description: 'Διαφάνειες για δυαδικό σύστημα, λογικές πύλες AND, OR, NOT, NAND, NOR, XOR και σειρά 74xx.'
  },
  {
    id: 'ergastirio',
    name: 'Εργαστηριακές Ασκήσεις & Φύλλα Έργου',
    chapterId: 0,
    folderPath: 'public/slides/ergastirio/',
    description: 'Εργαστηριακοί οδηγοί, φύλλα μετρήσεων με πολύμετρο/παλμογράφο και πειραματικές διατάξεις.'
  }
];

export const initialGitHubPdfs: GitHubPdfItem[] = [
  {
    id: 'pdf-kef1-diafaneies',
    fileName: 'diafaneies-kef1-stereou-somatos.pdf',
    title: 'Κεφάλαιο 1: Στοιχεία Θεωρίας Στερεού Σώματος - Διαφάνειες Παράδοσης',
    chapterId: 1,
    folder: 'public/slides/kefalaio-1/',
    relativeUrl: 'https://vapoafe.github.io/arches-ilektronikis/slides/kefalaio-1/diafaneies-kef1-stereou-somatos.pdf',
    description: 'Πλήρεις διαφάνειες διδασκαλίας για τη δομή του ατόμου, τα 4 ηλεκτρόνια σθένους, το ενεργειακό χάσμα Eg, τη διάκριση αγωγών-μονωτών-ημιαγωγών και τις προσμίξεις τύπου N και P.',
    topics: ['Δομή Si/Ge', 'Ενεργειακές Ζώνες', 'Αγωγοί-Μονωτές', 'Δότες/Αποδέκτες', 'NTC & LDR'],
    fileSize: '1.4 MB',
    pages: 18,
    lastUpdated: 'Σεπτέμβριος 2026'
  },
  {
    id: 'pdf-kef2-diafaneies',
    fileName: 'diafaneies-kef2-krystallodioikoi.pdf',
    title: 'Κεφάλαιο 2: Κρυσταλλοδίοδοι & Ειδικές Δίοδοι - Διαφάνειες Παράδοσης',
    chapterId: 2,
    folder: 'public/slides/kefalaio-2/',
    relativeUrl: 'https://vapoafe.github.io/arches-ilektronikis/slides/kefalaio-2/diafaneies-kef2-krystallodioikoi.pdf',
    description: 'Διαφάνειες για τον σχηματισμό της επαφής P-N, την περιοχή απογύμνωσης, την ορθή/ανάστροφη πόλωση, την χαρακτηριστική I-V, τις διόδους Zener, LED, Schottky και την ανόρθωση.',
    topics: ['Επαφή P-N', 'Περιοχή Απογύμνωσης', 'Καμπύλη I-V', 'Δίοδος Zener', 'LED', 'Ανόρθωση'],
    fileSize: '2.1 MB',
    pages: 24,
    lastUpdated: 'Σεπτέμβριος 2026'
  },
  {
    id: 'pdf-kef4-diafaneies',
    fileName: 'diafaneies-kef4-thyristor-scr-triac.pdf',
    title: 'Κεφάλαιο 4: Στοιχεία Ελέγχου Ισχύος (Θυρίστορ SCR, DIAC, TRIAC)',
    chapterId: 4,
    folder: 'public/slides/kefalaio-4/',
    relativeUrl: 'https://vapoafe.github.io/arches-ilektronikis/slides/kefalaio-4/diafaneies-kef4-thyristor-scr-triac.pdf',
    description: 'Διαφάνειες για τα ημιαγώγιμα στοιχεία τεσσάρων στρωμάτων P-N-P-N, τη λειτουργία έναυσης της πύλης, τα ρεύματα εμπλοκής/συγκράτησης, τα στοιχεία DIAC/TRIAC και το κύκλωμα dimmer.',
    topics: ['Δομή P-N-P-N', 'Έναυση Πύλης SCR', 'Γωνία Έναυσης α', 'TRIAC & DIAC', 'Κύκλωμα Dimmer'],
    fileSize: '1.8 MB',
    pages: 20,
    lastUpdated: 'Σεπτέμβριος 2026'
  },
  {
    id: 'pdf-kef5-diafaneies',
    fileName: 'diafaneies-kef5-dipolika-tranzistor-bjt.pdf',
    title: 'Κεφάλαιο 5: Διπολικά Τρανζίστορ BJT - Διαφάνειες Παράδοσης',
    chapterId: 5,
    folder: 'public/slides/kefalaio-5/',
    relativeUrl: 'https://vapoafe.github.io/arches-ilektronikis/slides/kefalaio-5/diafaneies-kef5-dipolika-tranzistor-bjt.pdf',
    description: 'Διαφάνειες για τη δομή NPN και PNP, τα ρεύματα IE=IB+IC, την ενίσχυση β, τις περιοχές αποκοπής/ενεργού/κόρου, τη συνδεσμολογία κοινού εκπομπού CE και την ευθεία φόρτου συνεχούς.',
    topics: ['Τρανζίστορ NPN/PNP', 'Ενίσχυση β (hFE)', 'Συνδεσμολογία CE', 'Ευθεία Φόρτου', 'Σημείο Q'],
    fileSize: '2.5 MB',
    pages: 26,
    lastUpdated: 'Σεπτέμβριος 2026'
  },
  {
    id: 'pdf-kef8-diafaneies',
    fileName: 'diafaneies-kef8-psifiaka-logikes-pyles.pdf',
    title: 'Κεφάλαιο 8: Ψηφιακά Ηλεκτρονικά & Βασικές Λογικές Πύλες',
    chapterId: 8,
    folder: 'public/slides/kefalaio-8/',
    relativeUrl: 'https://vapoafe.github.io/arches-ilektronikis/slides/kefalaio-8/diafaneies-kef8-psifiaka-logikes-pyles.pdf',
    description: 'Διαφάνειες για τα ψηφιακά σήματα, το δυαδικό σύστημα (0 και 1), όλες τις λογικές πύλες (NOT, AND, OR, NAND, NOR, XOR, XNOR), πίνακες αληθείας και ολοκληρωμένα DIP-14 σειράς 74xx.',
    topics: ['Δυαδικό Σύστημα', 'Πύλες AND/OR/NOT', 'Καθολικές NAND/NOR', 'Πύλη XOR', 'Σειρά TTL 74xx'],
    fileSize: '2.2 MB',
    pages: 22,
    lastUpdated: 'Σεπτέμβριος 2026'
  },
  {
    id: 'pdf-ergastirio-askiseis',
    fileName: 'ergastiriakes-askiseis-arxes-ilektronikis.pdf',
    title: 'Εργαστηριακός Οδηγός: Φύλλα Έργου & Ασκήσεις Μετρήσεων',
    chapterId: 0,
    folder: 'public/slides/ergastirio/',
    relativeUrl: 'https://vapoafe.github.io/arches-ilektronikis/slides/ergastirio/ergastiriakes-askiseis-arxes-ilektronikis.pdf',
    description: 'Φύλλα έργου για πειραματικό έλεγχο διόδων με πολύμετρο, ανόρθωση με παλμογράφο, ρύθμιση ισχύος με SCR/TRIAC, πόλωση BJT και συναρμολόγηση λογικών πυλών σε breadboard.',
    topics: ['Κανόνες Ασφαλείας', 'Μέτρηση Διόδου', 'Παλμογράφος & AC', 'Breadboard & TTL 7400'],
    fileSize: '3.0 MB',
    pages: 32,
    lastUpdated: 'Σεπτέμβριος 2026'
  }
];
