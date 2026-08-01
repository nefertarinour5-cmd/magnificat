import { db } from "@/lib/db";
import { hashPassword } from "@/lib/security";

const RDC_CITIES = [
  "Kinshasa",
  "Bukavu",
  "Goma",
  "Lubumbashi",
  "Kisangani",
  "Mbuji-Mayi",
  "Kolwezi",
  "Matadi",
  "Bunia",
  "Uvira",
  "Butembo",
  "Kananga",
];

const SUBJECTS = [
  "Mathématiques",
  "Physique-Chimie",
  "Informatique",
  "Langues",
  "Sciences",
  "Histoire-Géographie",
  "Économie",
  "Philosophie",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Début du seed TeachHire RDC...");

  // 1. Compte administrateur
  const adminEmail = "admin@teachhire-rdc.com";
  const existingAdmin = await db.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPassword = await hashPassword("Admin@2025!");
    const adminUser = await db.user.create({
      data: {
        email: adminEmail,
        name: "Administration TeachHire",
        passwordHash: adminPassword,
        role: "ADMIN",
        phone: "0853000674",
        whatsapp: "+243853000674",
        isActive: true,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin créé: ${adminEmail} / Admin@2025!`);
    console.log(`   (ID: ${adminUser.id})`);
  } else {
    console.log("ℹ️  Admin existe déjà");
  }

  // 2. Enseignants de démonstration (avec comptes utilisateurs)
  const demoTeachers = [
    {
      fullName: "Albert Kalemba",
      email: "albert.kalemba@teachhire-rdc.com",
      password: "Enseignant@2025!",
      specialty: "Mathématicien",
      level: "Secondaire" as const,
      subject: "Mathématiques",
      experienceYears: 8,
      city: "Goma",
      commune: "Katindo",
      phone: "0853000674",
      whatsapp: "+243853000674",
      hourlyRate: 18,
      publicRate: 18,
      availability: "Flexible" as const,
      bio: "Pédagogie méthodique, exercices gradués et préparation aux examens d'État. J'accompagne les élèves du secondaire vers l'excellence en mathématiques par une approche progressive et individualisée.",
      methods: ["Cours théorique", "Exercices pratiques", "Préparation examens"],
      languages: ["Français", "Swahili"],
      rating: 4.9,
      reviewsCount: 12,
    },
    {
      fullName: "Claire Mukendi",
      email: "claire.mukendi@teachhire-rdc.com",
      password: "Enseignant@2025!",
      specialty: "Lettre / langue",
      level: "Universitaire" as const,
      subject: "Langues",
      experienceYears: 12,
      city: "Kinshasa",
      commune: "Ngaliema",
      phone: "0853000674",
      whatsapp: "+243853000674",
      hourlyRate: 25,
      publicRate: 25,
      availability: "Week-end" as const,
      bio: "Rédaction académique, expression orale et français professionnel. Formatrice expérimentée pour étudiants universitaires et professionnels cherchant à parfaire leur communication.",
      methods: ["Atelier d'écriture", "Pratique orale", "Correction académique"],
      languages: ["Français", "Anglais", "Lingala"],
      rating: 4.8,
      reviewsCount: 18,
    },
    {
      fullName: "Jean-Paul Bahati",
      email: "jean.bahati@teachhire-rdc.com",
      password: "Enseignant@2025!",
      specialty: "Scientifique",
      level: "Secondaire" as const,
      subject: "Physique-Chimie",
      experienceYears: 6,
      city: "Bukavu",
      commune: "Ibanda",
      phone: "0853000674",
      whatsapp: "+243853000674",
      hourlyRate: 20,
      publicRate: 20,
      availability: "En semaine" as const,
      bio: "Explications simples, schémas explicatifs, résolution d'exercices et suivi régulier. Ma méthode privilégie la compréhension intuitive des concepts scientifiques.",
      methods: ["Schémas visuels", "TP à domicile", "Suivi continu"],
      languages: ["Français", "Swahili"],
      rating: 4.7,
      reviewsCount: 9,
    },
    {
      fullName: "Esther Ngoie",
      email: "esther.ngoie@teachhire-rdc.com",
      password: "Enseignant@2025!",
      specialty: "Scientifique",
      level: "Universitaire" as const,
      subject: "Informatique",
      experienceYears: 7,
      city: "Lubumbashi",
      commune: "Lubumbashi",
      phone: "0853000674",
      whatsapp: "+243853000674",
      hourlyRate: 30,
      publicRate: 30,
      availability: "Flexible" as const,
      bio: "Programmation Python, Java, développement web. Accompagnement de projets académiques et professionnels avec une approche projet-centrée.",
      methods: ["Projets pratiques", "Pair programming", "Code review"],
      languages: ["Français", "Anglais"],
      rating: 5.0,
      reviewsCount: 14,
    },
    {
      fullName: "Patrick Kasereka",
      email: "patrick.kasereka@teachhire-rdc.com",
      password: "Enseignant@2025!",
      specialty: "Scientifique",
      level: "Secondaire" as const,
      subject: "Sciences",
      experienceYears: 10,
      city: "Kisangani",
      commune: "Makiso",
      phone: "0853000674",
      whatsapp: "+243853000674",
      hourlyRate: 16,
      publicRate: 16,
      availability: "Flexible" as const,
      bio: "SVT, biologie et géologie. Approche expérimentale avec manipulations simples à domicile pour ancrer la compréhension des phénomènes naturels.",
      methods: ["Manipulations", "Schémas biologiques", "Quiz réguliers"],
      languages: ["Français", "Lingala"],
      rating: 4.6,
      reviewsCount: 8,
    },
    {
      fullName: "Sarah Ilunga",
      email: "sarah.ilunga@teachhire-rdc.com",
      password: "Enseignant@2025!",
      specialty: "Lettre / langue",
      level: "Secondaire" as const,
      subject: "Langues",
      experienceYears: 5,
      city: "Mbuji-Mayi",
      commune: "Diulu",
      phone: "0853000674",
      whatsapp: "+243853000674",
      hourlyRate: 15,
      publicRate: 15,
      availability: "Week-end" as const,
      bio: "Anglais et anglais commercial. Cours interactifs basés sur la conversation et la mise en situation professionnelle pour progresser rapidement.",
      methods: ["Conversation", "Mises en situation", "Multimédia"],
      languages: ["Français", "Anglais", "Tshiluba"],
      rating: 4.8,
      reviewsCount: 11,
    },
  ];

  for (const t of demoTeachers) {
    const existing = await db.user.findUnique({ where: { email: t.email } });
    if (existing) {
      console.log(`ℹ️  Enseignant existe déjà: ${t.email}`);
      continue;
    }

    const passwordHash = await hashPassword(t.password);
    const user = await db.user.create({
      data: {
        email: t.email,
        name: t.fullName,
        passwordHash,
        role: "TEACHER",
        phone: t.phone,
        whatsapp: t.whatsapp,
        isActive: true,
        emailVerified: new Date(),
        teacher: {
          create: {
            slug: `${slugify(t.fullName)}-${Math.random()
              .toString(36)
              .slice(2, 6)}`,
            fullName: t.fullName,
            specialty: t.specialty,
            level: t.level,
            subject: t.subject,
            experienceYears: t.experienceYears,
            city: t.city,
            commune: t.commune,
            phone: t.phone,
            whatsapp: t.whatsapp,
            hourlyRate: t.hourlyRate,
            publicRate: t.publicRate,
            availability: t.availability,
            bio: t.bio,
            methods: JSON.stringify(t.methods),
            languages: JSON.stringify(t.languages),
            rating: t.rating,
            reviewsCount: t.reviewsCount,
            isVerified: true,
            isPublished: true,
            internalCredits: Math.floor(Math.random() * 50) + 10,
            isFeatured: t.rating >= 4.9,
          },
        },
      },
      include: { teacher: true },
    });

    console.log(`✅ Enseignant créé: ${t.fullName} (${t.email})`);
  }

  // 3. Compte parent de démonstration
  const parentEmail = "parent.demo@teachhire-rdc.com";
  const existingParent = await db.user.findUnique({
    where: { email: parentEmail },
  });

  if (!existingParent) {
    const passwordHash = await hashPassword("Parent@2025!");
    await db.user.create({
      data: {
        email: parentEmail,
        name: "Marie Nabintu",
        passwordHash,
        role: "PARENT",
        phone: "0853000674",
        whatsapp: "+243853000674",
        isActive: true,
        emailVerified: new Date(),
        parent: {
          create: {
            fullName: "Marie Nabintu",
            phone: "0853000674",
            whatsapp: "+243853000674",
            city: "Bukavu",
            address: "Ibanda, avenue de la Paix, n°42",
            need: "Soutien en mathématiques pour mon fils en 4e secondaire",
          },
        },
      },
    });
    console.log(`✅ Parent démo créé: ${parentEmail} / Parent@2025!`);
  }

  // 4. Paramètres globaux
  const settings = [
    { id: "site_name", value: "TeachHire RDC" },
    { id: "support_phone", value: "0853 000 674" },
    { id: "support_whatsapp", value: "+243853000674" },
    { id: "default_currency", value: "USD" },
    { id: "min_password_length", value: "8" },
  ];

  for (const s of settings) {
    await db.setting.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log("✅ Paramètres globaux configurés");

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("\n📋 Comptes de démonstration :");
  console.log("   Admin    : admin@teachhire-rdc.com / Admin@2025!");
  console.log("   Enseignant: albert.kalemba@teachhire-rdc.com / Enseignant@2025!");
  console.log("   Parent   : parent.demo@teachhire-rdc.com / Parent@2025!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
