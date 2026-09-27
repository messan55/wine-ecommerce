import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const wines = [
  {
    slug: "bellecour-brut",
    name: "Maison Bellecour Brut",
    region: "Champagne",
    appellation: "Champagne",
    cepage: "Chardonnay, Pinot Noir, Pinot Meunier",
    millesime: null,
    formatLabel: "75 cl",
    color: "effervescent",
    tastingNote:
      "Pomme, brioche et une fine amertume en finale. La bulle est crémeuse sans être lourde. Apéritif, ou toute la table si le plat n’écrase pas le vin.",
    priceCents: 4600,
    stock: 28,
    position: 1,
  },
  {
    slug: "chateau-larmont-2018",
    name: "Château Larmont",
    region: "Bordeaux",
    appellation: "Saint-Émilion",
    cepage: "Merlot, Cabernet Franc",
    millesime: 2018,
    formatLabel: "75 cl",
    color: "rouge",
    tastingNote:
      "Cassis mûr, cèdre et une pointe de cacao. Les tanins sont soyeux, déjà à table, avec une finale qui tient sur l’entrecôte. Un Saint-Émilion droit, sans maquillage.",
    priceCents: 5400,
    stock: 18,
    position: 2,
  },
  {
    slug: "riveclaire-sancerre-2023",
    name: "Domaine Riveclaire",
    region: "Loire",
    appellation: "Sancerre",
    cepage: "Sauvignon Blanc",
    millesime: 2023,
    formatLabel: "75 cl",
    color: "blanc",
    tastingNote:
      "Buis, citron vert et pierre à fusil. Tendu, salin, il demande un chèvre frais ou des huîtres, pas une sauce. Servir vers 10 °C, pas plus froid.",
    priceCents: 2300,
    stock: 36,
    position: 3,
  },
  {
    slug: "coteaux-roses-tavel-2023",
    name: "Cave des Coteaux Roses",
    region: "Rhône",
    appellation: "Tavel",
    cepage: "Grenache, Cinsault",
    millesime: 2023,
    formatLabel: "75 cl",
    color: "rose",
    tastingNote:
      "Fraise des bois, zeste et une mâche qu’on ne trouve pas dans les rosés pâles. À boire frais, pas glacé. Grillades, aïoli, ou rien du tout.",
    priceCents: 1700,
    stock: 40,
    position: 4,
  },
  {
    slug: "clos-brumeux-gevrey-2020",
    name: "Domaine du Clos Brumeux",
    region: "Bourgogne",
    appellation: "Gevrey-Chambertin",
    cepage: "Pinot Noir",
    millesime: 2020,
    formatLabel: "150 cl",
    color: "rouge",
    tastingNote:
      "Cerise noire, sous-bois et une touche de violette. En magnum, le vin se tient plus longtemps : servez-le sur un plat qui dure, ou gardez-le. Encore jeune, déjà élégant.",
    priceCents: 14800,
    stock: 4,
    position: 5,
  },
  {
    slug: "collines-dor-riesling-2022",
    name: "Clos des Collines d’Or",
    region: "Alsace",
    appellation: "Alsace",
    cepage: "Riesling",
    millesime: 2022,
    formatLabel: "75 cl",
    color: "blanc",
    tastingNote:
      "Citron, tilleul et une minéralité crayeuse. Sec, précis, sans sucre résiduel pour arrondir les angles. Superbe sur un sandre ou une choucroute de la mer.",
    priceCents: 2700,
    stock: 20,
    position: 6,
  },
  {
    slug: "pierres-hautes-chateauneuf-2021",
    name: "Domaine des Pierres Hautes",
    region: "Rhône",
    appellation: "Châteauneuf-du-Pape",
    cepage: "Grenache, Syrah, Mourvèdre",
    millesime: 2021,
    formatLabel: "75 cl",
    color: "rouge",
    tastingNote:
      "Garrigue, griotte et poivre blanc. Chaud sans lourdeur : le grenache porte le vin, la syrah le tient. Un gigot, ou simplement un soir où l’on a faim.",
    priceCents: 4400,
    stock: 14,
    position: 7,
  },
  {
    slug: "pierres-blondes-vouvray-2021",
    name: "Clos des Pierres Blondes",
    region: "Loire",
    appellation: "Vouvray",
    cepage: "Chenin Blanc",
    millesime: 2021,
    formatLabel: "75 cl",
    color: "blanc",
    tastingNote:
      "Coing, fleur blanche et cette amertume noble du chenin sec. La tension tient jusqu’au bout. Un poisson au beurre blanc lui va, un comté vieux aussi.",
    priceCents: 2100,
    stock: 22,
    position: 8,
  },
  {
    slug: "les-graves-lentes-2020",
    name: "Les Graves Lentes",
    region: "Bordeaux",
    appellation: "Pessac-Léognan",
    cepage: "Cabernet Sauvignon, Merlot",
    millesime: 2020,
    formatLabel: "75 cl",
    color: "rouge",
    tastingNote:
      "Fumée légère, cassis et graphite. À carafer une heure : le cabernet se déplie, le merlot arrondit. Le Bordeaux de la semaine, quand on veut quelque chose de net.",
    priceCents: 2900,
    stock: 24,
    position: 9,
  },
  {
    slug: "sentier-gewurztraminer-2022",
    name: "Domaine du Sentier",
    region: "Alsace",
    appellation: "Alsace",
    cepage: "Gewurztraminer",
    millesime: 2022,
    formatLabel: "75 cl",
    color: "blanc",
    tastingNote:
      "Litchi, rose et épices douces. Le vin est tendre, pas liquoreux : il reste à table à côté d’un munster ou d’une volaille aux épices. Ne le servez pas trop froid.",
    priceCents: 2400,
    stock: 16,
    position: 10,
  },
  {
    slug: "hautes-cotes-beaune-2022",
    name: "Maison des Hautes Côtes",
    region: "Bourgogne",
    appellation: "Hautes-Côtes de Beaune",
    cepage: "Pinot Noir",
    millesime: 2022,
    formatLabel: "75 cl",
    color: "rouge",
    tastingNote:
      "Framboise, terre fraîche, tanins fins. Pas un grand cru, et il ne le prétend pas : c’est le pinot qu’on ouvre un mardi, frais, sans cérémonie.",
    priceCents: 2600,
    stock: 30,
    position: 11,
  },
  {
    slug: "moulin-clair-cremant",
    name: "Domaine du Moulin Clair",
    region: "Loire",
    appellation: "Crémant de Loire",
    cepage: "Chenin Blanc, Chardonnay",
    millesime: null,
    formatLabel: "37,5 cl",
    color: "effervescent",
    tastingNote:
      "Poire, fleur d’acacia, bulle vive. Le demi-format pour un verre à deux, ou pour commencer avant une bouteille plus sérieuse. Festif sans se prendre au sérieux.",
    priceCents: 1100,
    stock: 32,
    position: 12,
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL est absent.");
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (const wine of wines) {
      await prisma.wine.upsert({
        where: { slug: wine.slug },
        update: wine,
        create: wine,
      });
    }
    console.log(`${wines.length} bouteilles en cave.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
