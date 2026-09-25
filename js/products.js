// ============================================
// PRIMO NUTRITION - PRODUCT DATABASE
// Images renamed to 1.png ... 23.png
// ============================================

// ⚠️ IMPORTANT: change IMAGE_PATH if your folder differs.
// Examples:
//   - images in same folder as products.js → "1.png"
//   - images in /uploads next to index.html → "uploads/1.png"
//   - images in /js next to index.html     → "js/1.png"
const IMAGE_PATH = "";  // ← set the folder prefix here (e.g. "js/" or "uploads/")

const productsDB = [
    // ============ EGGS ============
    { id: 1,  nameFr: "PrimoEggs - Blancs d'Œufs Liquides 500ml",  nameAr: "بريمو إيغز - بياض البيض السائل 500 مل", price: 39,     oldPrice: 44,     category: "oeufs",      icon: "fa-egg",          image: IMAGE_PATH + "13.png", badge: "promo", rating: 4.9, stock: 100, unit: "500 mL",    protein: "50g protéine",          description: "Blancs d'œufs liquides 100% purs - 50g de protéines par bouteille" },
    { id: 2,  nameFr: "PrimoEggs - Blancs d'Œufs Liquides 1L",     nameAr: "بريمو إيغز - بياض البيض السائل 1 لتر",   price: 69,     oldPrice: 75,     category: "oeufs",      icon: "fa-egg",          image: IMAGE_PATH + "12.png", badge: "promo", rating: 4.9, stock: 80,  unit: "1 L",       protein: "100g protéine",         description: "Blancs d'œufs liquides 100% purs - 100g de protéines par bouteille" },
    { id: 3,  nameFr: "PrimoEggs - Œufs Bio (12 œufs)",            nameAr: "بريمو إيغز - بيض عضوي (12 بيضة)",        price: 42,     oldPrice: 46.80,  category: "oeufs",      icon: "fa-egg",          image: IMAGE_PATH + "14.png", badge: "promo", rating: 4.8, stock: 60,  unit: "12 œufs",   protein: "72g protéine / pack",   description: "Œufs bio frais de la ferme - 6g de protéines par œuf" },

    // ============ BARS ============
    { id: 4,  nameFr: "PrimoBar - Barre Noix de Cajou & Coco",     nameAr: "بريمو بار - بالكاجو وجوز الهند",        price: 8.20,   oldPrice: 14.60,  category: "barres",     icon: "fa-cookie-bite",  image: IMAGE_PATH + "1.png",  badge: "promo", rating: 4.8, stock: 200, unit: "60g",       protein: "12g protéine",          description: "Barre protéinée moelleuse - Zéro sucre" },
    { id: 5,  nameFr: "PrimoBar - Pack de 6 Barres",               nameAr: "بريمو بار - عبوة 6 ألواح",               price: 49.20,  oldPrice: 87.60,  category: "barres",     icon: "fa-cookie-bite",  image: IMAGE_PATH + "2.png",  badge: "promo", rating: 4.8, stock: 40,  unit: "6 × 60g",   protein: "72g protéine / pack",   description: "Pack économique de 6 barres - Économisez 44%" },

    // ============ COOKIES ============
    { id: 6,  nameFr: "PrimoCookies - Pépites de Chocolat",        nameAr: "بريمو كوكيز - شوكولاتة شيبس",           price: 23.52,  oldPrice: 29.80,  category: "biscuits",   icon: "fa-cookie",       image: IMAGE_PATH + "8.png",  badge: "promo", rating: 4.7, stock: 90,  unit: "125g",      protein: "20g protéine / pack",   description: "Cookies moelleux aux vraies pépites - Zéro sucre" },
    { id: 7,  nameFr: "PrimoCookies - Avoine Zéro Sucre",          nameAr: "بريمو كوكيز - الشوفان بدون سكر",        price: 22.30,  oldPrice: null,   category: "biscuits",   icon: "fa-cookie",       image: IMAGE_PATH + "9.png",  badge: null,    rating: 4.6, stock: 80,  unit: "150g",      protein: "High Fiber",            description: "Cookies d'avoine fins et croustillants" },

    // ============ DATES ============
    { id: 8,  nameFr: "PrimoDates - Dattes Deglet Nour Premium",   nameAr: "بريمو داتس - تمر دقلة نور فاخر",        price: 49.20,  oldPrice: 65.50,  category: "dattes",     icon: "fa-seedling",     image: IMAGE_PATH + "10.png", badge: "promo", rating: 4.9, stock: 70,  unit: "500g",      protein: "Source d'énergie",      description: "Dattes Deglet Nour premium - Moelleuses, sucrées naturellement" },

    // ============ NUTS ============
    { id: 9,  nameFr: "PrimoNuts - Mélange de Noix Grillées",      nameAr: "بريمو نتس - خليط المكسرات المحمصة",     price: 55.15,  oldPrice: 69.80,  category: "noix",       icon: "fa-tree",         image: IMAGE_PATH + "18.png", badge: "promo", rating: 4.8, stock: 55,  unit: "250g",      protein: "High Protein",          description: "Mélange 6 ingrédients - Légèrement salé" },

    // ============ OATS ============
    { id: 10, nameFr: "PrimoOats - Flocons d'Avoine Rapides",      nameAr: "بريمو أوتس - رقائق الشوفان",            price: 25.00,  oldPrice: 29.98,  category: "avoine",     icon: "fa-wheat-awn",    image: IMAGE_PATH + "19.png", badge: "promo", rating: 4.7, stock: 75,  unit: "500g",      protein: "High Fiber",            description: "Flocons d'avoine complets riches en fibres" },

    // ============ PANCAKES ============
    { id: 11, nameFr: "PrimoPancakes - Mix Protéiné",              nameAr: "بريمو بانكيكس - خليط البانكيك",         price: 65.00,  oldPrice: 79.90,  category: "pancakes",   icon: "fa-bread-slice",  image: IMAGE_PATH + "21.png", badge: "promo", rating: 4.8, stock: 50,  unit: "250g",      protein: "103g protéine / pack",  description: "Mix à pancakes protéinés - Sans gluten" },

    // ============ RICE ============
    { id: 12, nameFr: "PrimoRice - Riz Basmati Premium",           nameAr: "بريمو رايس - أرز بسمتي فاخر",           price: 35.20,  oldPrice: 49.80,  category: "riz",        icon: "fa-bowl-rice",    image: IMAGE_PATH + "22.png", badge: "promo", rating: 4.7, stock: 65,  unit: "500g",      protein: "Source de glucides",    description: "Riz basmati long grain léger et aromatique" },

    // ============ LEMON ============
    { id: 13, nameFr: "PrimoLemon - Jus de Citron 100%",           nameAr: "بريمو ليمون - عصير الليمون 100%",       price: 18.30,  oldPrice: 26.40,  category: "jus",        icon: "fa-lemon",        image: IMAGE_PATH + "15.png", badge: "promo", rating: 4.8, stock: 90,  unit: "200 mL",    protein: "100% naturel",          description: "Jus de citron 100% naturel - Poissons et salades" },

    // ============ BUTTERS ============
    { id: 14, nameFr: "PrimoButter - Amande & Miel",               nameAr: "بريمو بتر - زبدة اللوز والعسل",         price: 94.40,  oldPrice: 139.00, category: "beurres",    icon: "fa-jar",          image: IMAGE_PATH + "3.png",  badge: "promo", rating: 4.9, stock: 40,  unit: "420g",      protein: "84g protéine / pot",    description: "Beurre d'amande crémeux au miel" },
    { id: 15, nameFr: "PrimoButter - Noisette Chocolat au Lait",   nameAr: "بريمو بتر - زبدة البندق بالشوكولاتة",   price: 129.00, oldPrice: 189.50, category: "beurres",    icon: "fa-jar",          image: IMAGE_PATH + "4.png",  badge: "promo", rating: 4.9, stock: 35,  unit: "405g",      protein: "67g protéine / pot",    description: "Beurre de noisette et chocolat au lait" },
    { id: 16, nameFr: "PrimoButter - Beurre de Cacahuète",         nameAr: "بريمو بتر - زبدة الفول السوداني",       price: 37.30,  oldPrice: 53.20,  category: "beurres",    icon: "fa-jar",          image: IMAGE_PATH + "5.png",  badge: "promo", rating: 4.9, stock: 60,  unit: "405g",      protein: "120g protéine / pot",   description: "Beurre de cacahuète crémeux - 100% naturel" },
    { id: 17, nameFr: "PrimoButter - Cacahuète & Miel",            nameAr: "بريمو بتر - زبدة الفول السوداني والعسل", price: 39.30,  oldPrice: 55.40,  category: "beurres",    icon: "fa-jar",          image: IMAGE_PATH + "6.png",  badge: "promo", rating: 4.8, stock: 50,  unit: "420g",      protein: "120g protéine / pot",   description: "Beurre de cacahuète au miel" },
    { id: 18, nameFr: "PrimoButter - Pistache",                    nameAr: "بريمو بتر - زبدة الفستق",               price: 199.00, oldPrice: 249.00, category: "beurres",    icon: "fa-jar",          image: IMAGE_PATH + "7.png",  badge: "promo", rating: 4.9, stock: 25,  unit: "405g",      protein: "81g protéine / pot",    description: "Beurre de pistache crémeux" },

    // ============ SUPPLEMENTS ============
    { id: 19, nameFr: "PrimoMix - Protéine Whey + Créatine (Pack 30)", nameAr: "بريمو ميكس - بروتين واي + كرياتين", price: 598.80, oldPrice: 747.00, category: "supplements", icon: "fa-blender",     image: IMAGE_PATH + "17.png", badge: "promo", rating: 4.9, stock: 20,  unit: "30 × 60g",  protein: "40g protéine / bouteille", description: "Pack de 30 bouteilles - 6 saveurs" },
    { id: 20, nameFr: "PrimoMagnesium - 120 Capsules",             nameAr: "بريمو مغنيزيوم - 120 كبسولة",            price: 269,    oldPrice: 309,    category: "supplements", icon: "fa-capsules",    image: IMAGE_PATH + "16.png", badge: "promo", rating: 4.8, stock: 45,  unit: "120 caps",  protein: "Minéral essentiel",     description: "Magnésium haute absorption" },
    { id: 21, nameFr: "PrimoZinc - 120 Capsules",                  nameAr: "بريمو زنك - 120 كبسولة",                 price: 249,    oldPrice: 286,    category: "supplements", icon: "fa-capsules",    image: IMAGE_PATH + "23.png", badge: "promo", rating: 4.7, stock: 50,  unit: "120 caps",  protein: "50mg par capsule",      description: "Zinc 50mg - Immunité & peau" },
    { id: 22, nameFr: "PrimoD3+K2 - 120 Capsules",                 nameAr: "بريمو D3+K2 - 120 كبسولة",               price: 289,    oldPrice: 332,    category: "supplements", icon: "fa-capsules",    image: IMAGE_PATH + "11.png", badge: "promo", rating: 4.8, stock: 40,  unit: "120 caps",  protein: "Vitamines essentielles", description: "Vitamine D3 + K2 - Os & immunité" },
    { id: 23, nameFr: "PrimoOmega-3 - Huile de Poisson 1000mg",    nameAr: "بريمو أوميغا 3 - زيت السمك",            price: 209,    oldPrice: 240,    category: "supplements", icon: "fa-fish",        image: IMAGE_PATH + "20.png", badge: "promo", rating: 4.8, stock: 55,  unit: "120 softgels", protein: "1000mg huile de poisson", description: "Oméga-3 1000mg - Cœur, cerveau, yeux" }
];

// Categories
const categoriesDB = [
    { id: "oeufs",       icon: "fa-egg",          labelFr: "Œufs & Blancs d'Œufs", labelAr: "البيض وبياض البيض" },
    { id: "barres",      icon: "fa-cookie-bite",  labelFr: "Barres Protéinées",    labelAr: "ألواح البروتين" },
    { id: "biscuits",    icon: "fa-cookie",       labelFr: "Cookies",              labelAr: "الكوكيز" },
    { id: "dattes",      icon: "fa-seedling",     labelFr: "Dattes",               labelAr: "التمر" },
    { id: "noix",        icon: "fa-tree",         labelFr: "Noix & Mélanges",      labelAr: "المكسرات" },
    { id: "avoine",      icon: "fa-wheat-awn",    labelFr: "Avoine",               labelAr: "الشوفان" },
    { id: "pancakes",    icon: "fa-bread-slice",  labelFr: "Pancakes",             labelAr: "البانكيك" },
    { id: "riz",         icon: "fa-bowl-rice",    labelFr: "Riz",                  labelAr: "الأرز" },
    { id: "jus",         icon: "fa-lemon",        labelFr: "Jus",                  labelAr: "العصائر" },
    { id: "beurres",     icon: "fa-jar",          labelFr: "Beurres de Noix",      labelAr: "زبدة المكسرات" },
    { id: "supplements", icon: "fa-capsules",     labelFr: "Compléments",          labelAr: "المكملات" }
];

window.productsDB = productsDB;
window.categoriesDB = categoriesDB;