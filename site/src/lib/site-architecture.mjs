import coverage from '../data/catalogue-coverage.json' with { type: 'json' };
import baseline from '../../../docs/qa/catalogue-route-baseline.json' with { type: 'json' };

export const PRODUCT_GROUPS = [
  { slug: 'cups-bowls', title: 'Cups & Bowls', route: '/products/cups-bowls/', description: 'Paper cups and bowls for beverages, prepared food, takeaway service and branded foodservice programs.' },
  { slug: 'food-boxes-containers', title: 'Food Boxes & Containers', route: '/products/food-boxes-containers/', description: 'Paper food boxes for meals, sandwiches, sushi, salads, burgers, wraps, pizza slices and fried food.' },
  { slug: 'foodservice-supplies', title: 'Foodservice Supplies', route: '/products/foodservice-supplies/', description: 'Paper straws, disposable cutlery and paper plates for distributors, restaurant groups and private-label programs.' },
  { slug: 'bagasse', title: 'Bagasse Tableware', route: '/products/bagasse/', description: 'Bagasse plates, bowls, trays and hinged food boxes from the Corncomp catalogue.' },
];

export const PRODUCT_CATEGORIES = [
  { group: 'cups-bowls', slug: 'paper-cups', title: 'Paper Cups', description: 'Paper cups and matching accessories for wholesale beverage service, custom printing and private-label supply.' },
  { group: 'cups-bowls', slug: 'salad-bowls', title: 'Salad Bowls', description: 'Kraft and white paper bowls with matching paper, PLA, PP and PET lid options.' },
  { group: 'cups-bowls', slug: 'soup-cups', title: 'Soup Cups', description: 'Paper soup cups and matching lids in multiple sizes for hot food and takeaway service.' },
  { group: 'cups-bowls', slug: 'ice-cream-cups', title: 'Ice Cream Cups', description: 'Paper ice cream cups in six catalogue sizes for dessert shops, distributors and custom programs.' },
  { group: 'food-boxes-containers', slug: 'paper-food-boxes', title: 'Paper Food Boxes', description: 'Meal boxes, food pails and handled paper containers for prepared food and takeaway programs.' },
  { group: 'food-boxes-containers', slug: 'sandwich-boxes', title: 'Sandwich Boxes', description: 'Kraft sandwich boxes with clear windows for chilled displays and takeaway counters.' },
  { group: 'food-boxes-containers', slug: 'sushi-boxes', title: 'Sushi Boxes', description: 'Paper sushi boxes with PLA windows in multiple catalogue sizes.' },
  { group: 'food-boxes-containers', slug: 'salad-boxes', title: 'Salad Boxes', description: 'Kraft paper salad boxes with a clear window for fresh food display.' },
  { group: 'food-boxes-containers', slug: 'burger-boxes', title: 'Burger Boxes', description: 'Kraft burger boxes in five catalogue sizes for fast-food and takeaway service.' },
  { group: 'food-boxes-containers', slug: 'wrap-boxes', title: 'Wrap Boxes & Sleeves', description: 'Wrap boxes and open sleeves for burritos, wraps and handheld meals.' },
  { group: 'food-boxes-containers', slug: 'pizza-slice-boxes', title: 'Pizza Slice Boxes', description: 'Triangle kraft boxes with a clear window for individual pizza slices.' },
  { group: 'food-boxes-containers', slug: 'cone-fry-packaging', title: 'Cone & Fry Packaging', description: 'Paper cones and closed-top fry cups for fries, snacks and street-food service.' },
  { group: 'foodservice-supplies', slug: 'paper-straws', title: 'Paper Straws', description: 'Paper straws in standard and custom formats, including wrapped, printed and multiple-diameter options.' },
  { group: 'foodservice-supplies', slug: 'disposable-cutlery', title: 'Disposable Cutlery', description: 'Wooden and CPLA forks, knives and spoons for foodservice supply programs.' },
  { group: 'foodservice-supplies', slug: 'paper-plates', title: 'Paper Plates', description: 'Round and oval paper plates in multiple catalogue sizes.' },
  { group: 'food-boxes-containers', slug: 'paper-trays', title: 'Paper Trays', description: 'Kraft food trays, divided trays and hot dog trays.' },
  { group: 'food-boxes-containers', slug: 'square-food-boxes', title: 'Square Food Boxes', description: 'Kraft and white food pails with plain, PP-handle and wire-handle options.' },
  { group: 'food-boxes-containers', slug: 'round-food-boxes', title: 'Round Food Boxes', description: 'Round-base kraft and white food boxes and doner boxes.' },
  { group: 'food-boxes-containers', slug: 'menu-boxes', title: 'Menu Boxes', description: 'Kraft and white cardboard menu boxes in catalogue sizes.' },
  { group: 'foodservice-supplies', slug: 'paper-bags', title: 'Paper Bags', description: 'Kraft and white paper bags, with and without handles.' },
  { group: 'foodservice-supplies', slug: 'compostable-waste-bags', title: 'Compostable Waste Bags', description: 'The waste bag format listed in the Corncomp catalogue; confirm material documentation for your market.' },
  { group: 'bagasse', slug: 'bagasse-plates', title: 'Bagasse Plates', description: 'White, natural and compartmented round bagasse plates.' },
  { group: 'bagasse', slug: 'bagasse-bowls', title: 'Bagasse Bowls', description: 'Natural, white and shallow round bagasse bowls.' },
  { group: 'bagasse', slug: 'bagasse-trays', title: 'Bagasse Trays & Square Plates', description: 'Rectangular meal trays and square bagasse plates.' },
  { group: 'bagasse', slug: 'bagasse-clamshells', title: 'Bagasse Clamshell Boxes', description: 'Single-compartment and three-compartment hinged bagasse food boxes.' },
].map((category) => ({ ...category, route: `/products/${category.group}/${category.slug}/` }));

export const PRODUCT_CATEGORY_BY_SLUG = {
  ...Object.fromEntries(coverage.map(x=>[x.productSlug,x.categorySlug])),
  'bamboo-paper-soup-cup': 'soup-cups',
  bendy: 'paper-straws',
  'pla-lid-for-coffee-cup-black': 'paper-cups',
  'frite-cone-black': 'cone-fry-packaging',
  'cardboard-lid': 'soup-cups',
  'cardboard-soup-cup': 'soup-cups',
  'corrugated-board-cup-sleeve-8-12-16-20oz': 'paper-cups',
  'cpla-cutlery': 'disposable-cutlery',
  'double-wall-white-cardboard-paper-cup': 'paper-cups',
  'frite-cone-kraft': 'cone-fry-packaging',
  'natural-kraft-hamburger-box': 'burger-boxes',
  'cardboard-open-wrap-cup': 'wrap-boxes',
  'kraft-square-food-bow-pp-handle': 'paper-food-boxes',
  'natural-kraft-closed-snack-cup': 'cone-fry-packaging',
  'kraft-colour-ice-cream-cup': 'ice-cream-cups',
  'natural-kraft-menu-box': 'paper-food-boxes',
  'kraft-paper-bowl': 'salad-bowls',
  'kraft-paper-box-pet-window': 'paper-food-boxes',
  'brown-triangle-box-pla-window': 'pizza-slice-boxes',
  'kraft-paper-salad-box-pla-window': 'salad-boxes',
  'natural-kraft-sandwich-box-pla-window': 'sandwich-boxes',
  'natural-kraft-lid': 'soup-cups',
  'natural-kraft-soup-cup': 'soup-cups',
  'oval-paper-plate': 'paper-plates',
  'white-cardboard-box-wire-handle': 'paper-food-boxes',
  'doner-box': 'paper-food-boxes',
  'paper-lid': 'salad-bowls',
  'black-white-cardboard-sushi-box-pla-window': 'sushi-boxes',
  'pet-lid': 'salad-bowls',
  'pla-lid': 'salad-bowls',
  'pla-lid-2': 'soup-cups',
  'pp-lid': 'salad-bowls',
  'ripple-natural-kraft-paper-cup-horizon-style': 'paper-cups',
  'ripple-natural-kraft-paper-cup-vertical-style': 'paper-cups',
  'round-paper-plate': 'paper-plates',
  'cardboard-wrap-box-pla-window': 'wrap-boxes',
  'sharp-edge': 'paper-straws',
  'single-wall-white-cardboard-paper-cup': 'paper-cups',
  'solid-colors-with-bamboo-fiber-wooden-fiber': 'paper-straws',
  'stripe-colors': 'paper-straws',
  'stripe-colors-2': 'paper-straws',
  'cardboard-bamboo-bowl': 'salad-bowls',
  'pla-lid-for-coffee-cup-white': 'paper-cups',
  'wooden-bamboo-cutlery': 'disposable-cutlery',
};
Object.assign(PRODUCT_CATEGORY_BY_SLUG, Object.fromEntries(coverage.map(x=>[x.productSlug,x.categorySlug])));

export const DUPLICATE_PRODUCT_ALIASES = {
  'bol-en-carton-blanc-bambou': 'cardboard-bamboo-bowl',
  'couvercle-pla-pour-bol-a-salade': 'pla-lid',
  'couvercle-en-papier-pour-bol-a-salade': 'paper-lid',
  'couvercle-en-carton-pour-gobelet-a-soupe': 'cardboard-lid',
  'couvercle-kraft-naturel': 'natural-kraft-lid',
  'paille-en-papier-rayee': 'stripe-colors',
  'paille-en-papier-couleur-unie-avec-fibre-de-bambou': 'solid-colors-with-bamboo-fiber-wooden-fiber',
  'boite-a-sandwich-kraft-naturel-fenetre-pla': 'natural-kraft-sandwich-box-pla-window',
  'gobelet-en-papier-simple-paroi-carton-blanc': 'single-wall-white-cardboard-paper-cup',
  'couvercle-pla-pour-gobelet-a-cafe-blanc': 'pla-lid-for-coffee-cup-white',
  'assiette-en-papier-ronde': 'round-paper-plate',
  'gobelet-en-papier-paroi-ondulee-style-horizon-kraft-naturel': 'ripple-natural-kraft-paper-cup-horizon-style',
  'boite-a-hamburger-en-kraft-naturel': 'natural-kraft-hamburger-box',
  'couvercle-en-pla-pour-gobelet-a-soupe': 'pla-lid-2',
  'coupe-a-glace-kraft-coloree': 'kraft-colour-ice-cream-cup',
  'boite-menu-en-kraft-naturel': 'natural-kraft-menu-box',
  'bol-a-soupe-en-bagasse-papier-de-bambou': 'bamboo-paper-soup-cup',
  'couverts-en-cpla': 'cpla-cutlery',
  'boite-a-part-de-pizza-triangle-kraft-brun-avec-fenetre-en-pla': 'brown-triangle-box-pla-window',
  'boite-alimentaire-carree-avec-poignee-metallique-carton-blanc': 'white-cardboard-box-wire-handle',
  'gobelet-a-soupe-en-kraft-naturel': 'natural-kraft-soup-cup',
  'gobelet-a-snack-ferme-en-kraft-naturel': 'natural-kraft-closed-snack-cup',
  'couverts-en-bois-bambou': 'wooden-bamboo-cutlery',
  'boite-alimentaire-en-kraft-avec-poignee-en-pp': 'kraft-square-food-bow-pp-handle',
  'couvercle-en-pp-pour-bol-a-salade': 'pp-lid',
  'cone-a-frites-noir': 'frite-cone-black',
  'boite-a-salade-en-papier-kraft-avec-fenetre-pla': 'kraft-paper-salad-box-pla-window',
  'manchon-en-carton-ondule-pour-gobelet-8-12-16-20oz': 'corrugated-board-cup-sleeve-8-12-16-20oz',
  'paille-en-papier-bendy': 'bendy',
  'couvercle-en-pet-pour-bol-a-salade': 'pet-lid',
  'couvercle-de-gobelet-a-cafe-en-pla-noir': 'pla-lid-for-coffee-cup-black',
  'boite-a-wrap-en-carton-fenetre-en-pla': 'cardboard-wrap-box-pla-window',
  'paille-en-papier-sharp-edge': 'sharp-edge',
  'bol-en-papier-kraft-certifie-fsc': 'kraft-paper-bowl',
  'gobelet-a-soupe-en-carton-blanc': 'cardboard-soup-cup',
  'assiette-en-papier-ovale': 'oval-paper-plate',
  'gobelet-en-papier-double-paroi-carton-blanc': 'double-wall-white-cardboard-paper-cup',
  'support-ouvert-en-carton-pour-wrap': 'cardboard-open-wrap-cup',
};

export function categoryForProduct(slug) {
  const categorySlug = coverage.find(x=>x.productSlug===slug)?.categorySlug || PRODUCT_CATEGORY_BY_SLUG[slug];
  return PRODUCT_CATEGORIES.find((category) => category.slug === categorySlug);
}

export const PRODUCT_ROUTE_OVERRIDES = Object.fromEntries(baseline.products.map(x=>[x.slug,x.route]));

export function canonicalProductRoute(slug) {
  if (PRODUCT_ROUTE_OVERRIDES[slug]) return PRODUCT_ROUTE_OVERRIDES[slug];
  const category = categoryForProduct(slug);
  return category ? `${category.route}${slug}/` : null;
}

const PAGE_COPY = {
  products: {
    title: 'Paper Food Packaging for Wholesale & Custom Programs',
    description: 'Browse Corncomp paper cups, bowls, food boxes, paper straws, cutlery and paper plates for foodservice distribution and custom packaging programs.',
    intro: 'Find products by format, compare catalogue specifications and send the selected item with your inquiry. Corncomp supports wholesale supply, custom printing and private-label food packaging programs from its Ningbo manufacturing base.',
  },
  custom: {
    title: 'Custom Printed Food Packaging',
    description: 'Plan custom printed paper cups, straws and food packaging with artwork review, samples, production and export support from Corncomp.',
    intro: 'Start with the product format, size, quantity, print artwork, packing method and destination. Corncomp reviews the specification before confirming feasibility, price, sample requirements and production timing.',
  },
  applications: {
    title: 'Food Packaging by Application',
    description: 'Compare Corncomp packaging for takeaway, restaurant, fast-food, ice cream and dessert service.',
    intro: 'Different menus need different barrier, closure, display and transport choices. Use these application guides to narrow the product format, then confirm the final construction against your food, service temperature and delivery conditions.',
  },
  resources: {
    title: 'Food Packaging Resources',
    description: 'Practical guides for paper cup sizes, custom printing, certification review, materials and food packaging procurement.',
    intro: 'Use these guides to prepare specifications, compare options and ask better questions before requesting samples or quotations.',
  },
};

const standardSections = [
  { title: 'Built for B2B sourcing', text: 'Product pages show catalogue sizes, item references and matching components where the source data supports them. Final material, certification, packing, MOQ and lead time are confirmed for the selected order.' },
  { title: 'Custom and private-label support', text: 'Share the target product, quantity, artwork, packing and destination. Corncomp reviews the complete specification before production.' },
  { title: 'Verify the required documentation', text: 'Company certificates and test reports do not automatically apply to every SKU or construction. Ask which documents cover the item you plan to order.' },
];

const page = (route, kind, title, description, intro, sections = standardSections, links = [], details = {}) => ({ route, kind, title, description, intro, sections, links, ...details });

const link = (title, route, text) => ({ title, route, text });

// Presentation aliases reuse verified imagery without changing the content or routes.
const architectureMediaAliases = {
  '/custom-packaging/custom-paper-straws/': 'architecture:products/foodservice-supplies/paper-straws',
};

export const mediaKeyForArchitecture = (page) => architectureMediaAliases[page.route] || `architecture:${page.route.replace(/^\/+|\/+$/g, '')}`;

export const ARCHITECTURE_PAGES = [
  page('/products/', 'products', PAGE_COPY.products.title, PAGE_COPY.products.description, PAGE_COPY.products.intro),
  ...PRODUCT_GROUPS.map((group) => page(group.route, 'product-group', group.title, group.description, group.description)),
  ...PRODUCT_CATEGORIES.map((category) => page(category.route, 'product-category', category.title, category.description, category.description)),
  page('/custom-packaging/', 'custom', PAGE_COPY.custom.title, PAGE_COPY.custom.description, PAGE_COPY.custom.intro, [
    { title: '1. Define the product', text: 'Confirm the format, catalogue size or target dimensions, food-contact construction and expected use before artwork begins.' },
    { title: '2. Review artwork and samples', text: 'Share editable artwork, print coverage, colors and brand controls. Sample type and approval steps depend on the project.' },
    { title: '3. Confirm production details', text: 'MOQ, unit packing, cartons, destination, documents and timing are reviewed together before the order is released.' },
  ], [link('Custom Printed Paper Cups', '/custom-packaging/custom-printed-paper-cups/', 'Plan cup construction, size, artwork and packing.'), link('Custom Paper Straws', '/custom-packaging/custom-paper-straws/', 'Plan diameter, length, print, wrapping and packing.')]),
  page('/custom-packaging/custom-printed-paper-cups/', 'custom', 'Custom Printed Paper Cups', 'Custom printed paper cups for wholesale, private-label and foodservice programs.', 'Choose the cup construction and size first, then share the quantity, artwork, print requirements, packing and destination for review.', [
    { title: 'Choose the cup construction', text: 'Start with single wall, double wall or ripple wall based on the drink, serving temperature and handling requirement.' },
    { title: 'Match cup and lid', text: 'Volume is not enough. Confirm rim diameter, height and the exact lid or accessory needed for the selected item.' },
    { title: 'Prepare print-ready inputs', text: 'Provide editable artwork, print coverage, color references and required legal marks. Production follows approved files and samples.' },
  ], [link('Browse Paper Cups', '/products/cups-bowls/paper-cups/', 'Compare existing cup and accessory formats.'), link('Paper Cup Sizes Guide', '/resources/guides/paper-cup-sizes/', 'Check the measurements that affect fit.')]),
  page('/custom-packaging/custom-paper-straws/', 'custom', 'Custom Paper Straws', 'Custom paper straws with print, color, size, wrapping and packing options.', 'Choose the diameter, length, color, artwork and wrapping format, then confirm the final specification and certification requirements before production.', [
    { title: 'Size for the drink', text: 'Confirm diameter and length against the beverage, lid opening, cup height and intended drinking experience.' },
    { title: 'Select the presentation', text: 'Choose color, stripe or print direction together with individual wrapping and outer packing requirements.' },
    { title: 'Verify the order scope', text: 'MOQ, ink, paper construction, packing, test reports and destination requirements are confirmed for the final specification.' },
  ], [link('Browse Paper Straws', '/products/foodservice-supplies/paper-straws/', 'Review existing paper straw formats.')]),
  page('/applications/', 'applications', PAGE_COPY.applications.title, PAGE_COPY.applications.description, PAGE_COPY.applications.intro, standardSections, [link('Takeaway & Delivery', '/applications/takeaway-packaging/', 'Plan for closure, transport and holding time.'), link('Restaurant & Foodservice', '/applications/restaurant-packaging/', 'Build ranges for service and multi-site supply.'), link('Fast Food', '/applications/fast-food-packaging/', 'Match boxes and sleeves to handheld meals.'), link('Ice Cream & Dessert', '/applications/ice-cream-dessert-packaging/', 'Select cups around portion and temperature.')]),
  page('/applications/takeaway-packaging/', 'application', 'Takeaway & Delivery Packaging', 'Paper food packaging for takeaway and delivery menus.', 'Compare packaging by food type, holding time, closure, leak resistance, presentation and transport conditions.', standardSections, [link('Paper Food Boxes', '/products/food-boxes-containers/paper-food-boxes/', 'Meal boxes and handled containers.'), link('Salad Bowls', '/products/cups-bowls/salad-bowls/', 'Bowls with matching lid choices.'), link('Soup Cups', '/products/cups-bowls/soup-cups/', 'Hot-food cups and matching lids.')]),
  page('/applications/restaurant-packaging/', 'application', 'Restaurant & Foodservice Packaging', 'Food packaging for restaurants, caterers, distributors and multi-site foodservice operators.', 'Build a consistent packaging range around menu formats, service temperature, packing speed, storage and delivery requirements.', standardSections, [link('Cups & Bowls', '/products/cups-bowls/', 'Beverage, soup, salad and dessert formats.'), link('Foodservice Supplies', '/products/foodservice-supplies/', 'Straws, cutlery and plates.')]),
  page('/applications/fast-food-packaging/', 'application', 'Fast Food Packaging', 'Paper packaging for burgers, fries, wraps, sandwiches and pizza slices.', 'Combine boxes, sleeves, cones and food cups around the menu instead of forcing every item into one container format.', standardSections, [link('Burger Boxes', '/products/food-boxes-containers/burger-boxes/', 'Kraft formats for burgers.'), link('Wrap Boxes & Sleeves', '/products/food-boxes-containers/wrap-boxes/', 'Open sleeves and windowed wrap boxes.'), link('Cone & Fry Packaging', '/products/food-boxes-containers/cone-fry-packaging/', 'Cones and snack cups for fried food.')]),
  page('/applications/ice-cream-dessert-packaging/', 'application', 'Ice Cream & Dessert Packaging', 'Paper ice cream cups and dessert packaging for wholesale and custom programs.', 'Start with serving size, temperature, topping space, lid needs and print coverage, then select a suitable cup and packing format.', standardSections, [link('Ice Cream Cups', '/products/cups-bowls/ice-cream-cups/', 'Compare current catalogue cup sizes.'), link('Custom Packaging', '/custom-packaging/', 'Prepare artwork and packing requirements.')]),
  page('/resources/', 'resources', PAGE_COPY.resources.title, PAGE_COPY.resources.description, PAGE_COPY.resources.intro, standardSections, [link('Paper Cup Sizes Guide', '/resources/guides/paper-cup-sizes/', 'Compare volume, dimensions and lid fit.'), link('Custom Printed Paper Cups Guide', '/resources/guides/custom-printed-paper-cups/', 'Prepare a complete custom cup brief.'), link('Food Packaging Certifications Guide', '/resources/guides/food-packaging-certifications/', 'Review certificate and report scope.')]),
  page('/resources/guides/paper-cup-sizes/', 'guide', 'Paper Cup Sizes Guide', 'Compare common paper cup sizes and the measurements buyers should confirm.', 'Cup volume alone does not define fit. Confirm the rim diameter, height, wall construction, lid compatibility, drink temperature and packing requirement.', [
    { title: 'Volume is only the starting point', text: 'Nominal ounces or millilitres help shortlist a cup, but dimensions can vary between constructions and suppliers.' },
    { title: 'Measure rim and height', text: 'Rim diameter affects lid fit. Height and base diameter affect dispensers, carton packing and service equipment.' },
    { title: 'Confirm wall construction', text: 'Single, double and ripple wall cups handle heat and branding differently. Match construction to the actual drink and service.' },
    { title: 'Treat lids as matched components', text: 'Do not assume every lid with the same nominal size fits. Confirm the exact cup and lid item combination.' },
  ], [link('Browse Paper Cups', '/products/cups-bowls/paper-cups/', 'Compare catalogue products and accessories.'), link('Request a Quote', '/contact/', 'Send the target size and quantity.')], {
    preparedBy: 'Corncomp',
    reviewedDate: '2026-09-23',
    reviewedLabel: '23 September 2026',
    table: {
      caption: 'Cup size specification checklist',
      headers: ['Check', 'Why it matters', 'What to send'],
      rows: [
        ['Nominal volume', 'Helps shortlist a cup, but does not define its dimensions.', 'Target volume in ml or oz.'],
        ['Rim diameter', 'Determines compatibility with the selected lid.', 'Top diameter and exact lid item.'],
        ['Height and base diameter', 'Affect dispensers, service equipment and carton packing.', 'Dimension drawing or approved sample.'],
        ['Wall construction', 'Changes heat handling, feel and printable surface.', 'Single, double or ripple wall plus drink temperature.'],
        ['Unit and carton packing', 'Affects storage, freight and handling.', 'Units per sleeve and carton, plus carton dimensions.'],
      ],
    },
    sourceIntro: 'These official resources cover food-contact requirements. Cup dimensions and lid fit still need to be confirmed against the selected item.',
    sources: [
      { title: 'European Commission: food contact materials legislation', url: 'https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/legislation_en' },
      { title: 'US FDA: packaging and food-contact substances', url: 'https://www.fda.gov/food/food-ingredients-packaging/packaging-food-contact-substances-fcs' },
    ],
  }),
  page('/resources/guides/custom-printed-paper-cups/', 'guide', 'Custom Printed Paper Cups Guide', 'Prepare artwork, size, quantity, sample and packing requirements for printed paper cup sourcing.', 'A useful quotation starts with a complete specification: cup type, size, quantity, print coverage, artwork format, packing and destination.', [
    { title: 'Write the sourcing brief', text: 'List the cup construction, size, quantity, drink use, matching lid, packing and destination before requesting price.' },
    { title: 'Prepare artwork correctly', text: 'Supply editable artwork and color references. Confirm print area, seam allowance and mandatory marks on the approved dieline.' },
    { title: 'Choose the right sample', text: 'A stock sample checks construction; a printed proof checks artwork; a production sample may require more time and cost.' },
    { title: 'Approve before production', text: 'Treat the final specification, artwork, sample, carton marks and documents as one approval package.' },
  ], [link('Custom Printed Paper Cups', '/custom-packaging/custom-printed-paper-cups/', 'Start a custom cup project.'), link('Paper Cups', '/products/cups-bowls/paper-cups/', 'Choose a base cup format.')], {
    preparedBy: 'Corncomp',
    reviewedDate: '2026-09-23',
    reviewedLabel: '23 September 2026',
    table: {
      caption: 'Custom print approval checklist',
      headers: ['Stage', 'Confirm', 'Approval record'],
      rows: [
        ['Product brief', 'Cup construction, size, drink use, lid, quantity, packing and destination.', 'Written sourcing specification.'],
        ['Artwork', 'Editable file, dieline, print area, seam allowance and color references.', 'Approved artwork revision.'],
        ['Sample', 'Stock sample, printed proof or production sample, chosen for the decision needed.', 'Signed or written sample approval.'],
        ['Market marks', 'Required food-contact, sorting or disposal marks for the destination market.', 'Compliance review before artwork release.'],
        ['Production release', 'Final product, artwork, packing, carton marks and documents.', 'One approved release package.'],
      ],
    },
    sourceIntro: 'Use the applicable rules for the destination market when preparing artwork and the release specification.',
    sources: [
      { title: 'EUR-Lex: Regulation (EU) 2025/40 on packaging and packaging waste', url: 'https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng' },
      { title: 'European Commission: food contact materials legislation', url: 'https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/legislation_en' },
      { title: 'US FDA: packaging and food-contact substances', url: 'https://www.fda.gov/food/food-ingredients-packaging/packaging-food-contact-substances-fcs' },
    ],
  }),
  page('/resources/guides/food-packaging-certifications/', 'guide', 'Food Packaging Certifications Guide', 'Understand how to review company certificates, food-contact reports and product-specific certification scope.', 'Check the certificate holder, standard, scope, expiry date and exact product construction. A company certificate is not automatic proof for every SKU.', [
    { title: 'Check the certificate holder', text: 'The legal entity and production site should match the supplier and factory relevant to your order.' },
    { title: 'Read the scope and expiry', text: 'Confirm the standard, covered activity or material, issuing body and current validity instead of relying on a logo.' },
    { title: 'Separate systems from products', text: 'Management-system certificates describe processes. Food-contact tests and compostability claims may apply only to specific materials or constructions.' },
    { title: 'Request item-level evidence', text: 'Name the exact SKU, material, coating, ink and destination regulation so the supplier can identify the applicable report.' },
  ], [link('Quality & Certifications', '/quality/', 'Review Corncomp’s verification approach.'), link('Contact Corncomp', '/contact/', 'Ask for documents for a selected item.')], {
    preparedBy: 'Corncomp',
    reviewedDate: '2026-09-23',
    reviewedLabel: '23 September 2026',
    table: {
      caption: 'Certificate review checklist',
      headers: ['Check', 'Question', 'Evidence'],
      rows: [
        ['Holder and site', 'Does the legal entity and factory match the order?', 'Certificate holder and site address.'],
        ['Standard and status', 'Is the correct standard current?', 'Certificate number, issue or expiry date, and status.'],
        ['Scope', 'Does the activity, material or product fall within scope?', 'Scope statement and annexes.'],
        ['Item match', 'Does the evidence cover the exact SKU, material, coating and ink?', 'Product listing or applicable report.'],
        ['Independent verification', 'Can the status be checked in the issuer or official directory?', 'Direct database record.'],
      ],
    },
    sourceIntro: 'Check the certificate or product record in the official directory, then match its holder, site and scope to the item you plan to buy.',
    sources: [
      { title: 'FSC certificate and licence search', url: 'https://search.fsc.org/' },
      { title: 'BPI certified product catalogue', url: 'https://products.bpiworld.org/' },
      { title: 'BRCGS Directory', url: 'https://directory.brcgs.com/' },
      { title: 'European Commission: food contact materials legislation', url: 'https://food.ec.europa.eu/food-safety/chemical-safety/food-contact-materials/legislation_en' },
      { title: 'US FDA: packaging and food-contact substances', url: 'https://www.fda.gov/food/food-ingredients-packaging/packaging-food-contact-substances-fcs' },
    ],
  }),
  page('/about/', 'trust', 'About Corncomp', 'Learn about Corncomp, its Ningbo manufacturing base and export food packaging programs.', 'Corncomp develops and supplies paper food packaging for distributors, restaurant groups and custom programs, with production and export support based in Ningbo, China.', [
    { title: 'Foodservice focus', text: 'The catalogue covers paper cups, bowls, food boxes, paper straws, cutlery and paper plates.' },
    { title: 'Manufacturing base', text: 'Corncomp states an 8,000 m² manufacturing base, including a 6,800 m² GMP-standard dust-free workshop and 60 production lines.' },
    { title: 'Specification-led export support', text: 'Product, artwork, packing, destination and document requirements are reviewed together for wholesale and private-label programs.' },
  ], [link('Factory & Manufacturing', '/about/factory/', 'Review facility and production context.'), link('Quality & Certifications', '/quality/', 'Understand document scope and verification.')]),
  page('/about/factory/', 'trust', 'Factory & Manufacturing', 'See Corncomp manufacturing capabilities, production workflow and quality-control responsibilities.', 'Review the factory, process and capacity evidence behind the products, then confirm the line, material and documentation relevant to your order.', [
    { title: '8,000 m² manufacturing base', text: 'The site presents an 8,000 m² base in Ningbo, including a 6,800 m² GMP-standard dust-free workshop.' },
    { title: '60 production lines', text: 'Production capacity spans paper straws and multiple paper food packaging formats. Capacity must still be confirmed for the selected item and timing.' },
    { title: '2.5 billion paper straws annually', text: 'This stated annual paper-straw capacity is a factory-level figure, not a promise for every size, print or delivery window.' },
    { title: 'Production release controls', text: 'Final specification, artwork, sample, packing and documentation are confirmed before mass production.' },
  ], [link('Browse Products', '/products/', 'Choose a catalogue item or product family.'), link('Request a Quote', '/contact/', 'Send quantity, destination and timing.')]),
  page('/quality/', 'trust', 'Quality & Certifications', 'Review Corncomp quality systems, company certificates and product-document verification guidance.', 'Use this page to identify available documentation and its scope. Confirm the exact certificate or test report needed for the selected item before ordering.', [
    { title: 'ISO 9001', text: 'A quality-management certificate addresses the certified organization and scope. Confirm holder, site, scope and validity.' },
    { title: 'FSC', text: 'FSC claims depend on certified supply-chain scope and the selected paper product. Confirm the applicable claim and documentation for the order.' },
    { title: 'BRC', text: 'Site or packaging certification does not automatically establish every product claim. Check the certified scope and current certificate.' },
    { title: 'Product-specific reports', text: 'Food-contact, material and compostability evidence should be matched to the exact material, coating, ink and intended market.' },
  ], [link('Certification Review Guide', '/resources/guides/food-packaging-certifications/', 'Learn how to read scope and product evidence.'), link('Request Documents', '/contact/', 'Name the exact item and target market.')]),
  page('/contact/', 'contact', 'Request a Quote', 'Send Corncomp your product, quantity, customization, sample and destination requirements.', 'Include the product or item number, quantity, artwork needs, packing, destination and required documents. The team will review the specification before quoting.'),
].map((page) => ({ ...page, contentKey: `architecture:${page.route.replace(/^\/+|\/+$/g, '')}` }));

export const LEGACY_PAGE_REDIRECTS = {
  "/sitemap_index.xml": "/sitemap.xml",
  "/ar/product-category/أكواب-ورقية/": "/ar/%D8%A7%D9%84%D8%A3%D9%83%D9%88%D8%A7%D8%A8-%D8%A7%D9%84%D9%88%D8%B1%D9%82%D9%8A%D8%A9/",
  "/ar/product-category/أدوات-مائدة/": "/ar/%D8%A3%D8%AF%D9%88%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D8%A7%D8%A6%D8%AF%D8%A9-%D8%A3%D8%AD%D8%A7%D8%AF%D9%8A%D8%A9-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AE%D8%AF%D8%A7%D9%85/",
  "/fr/product-category/paille-en-papier/": "/fr/produits/fournitures-restauration/pailles-papier/",
  "/es/product-category/cubiertos/": "/es/productos/suministros-para-restauracion/cubiertos-desechables/",
  "/es/product-category/caja-de-menu-caja-de-comida-redonda/": "/es/productos/cajas-y-envases/",
  "/es/product-category/caja-de-ensalada/": "/es/productos/cajas-y-envases/cajas-para-ensaladas/",
  "/ar/product-category/علب-برغر-علب-راب-علب-ساندويتش-قطعة-بيت/": "/ar/%D8%B9%D9%84%D8%A8-%D9%88%D8%AD%D8%A7%D9%88%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%B7%D8%B9%D8%A7%D9%85/",
  "/ar/product-category/مصاصات-ورقية/": "/ar/%D8%A7%D9%84%D9%85%D8%B5%D8%A7%D8%B5%D8%A7%D8%AA-%D8%A7%D9%84%D9%88%D8%B1%D9%82%D9%8A%D8%A9/",
  "/كيفية-التحقق-من-صحة-شهادات-الاستدامة-ا/": "/ar/%D9%83%D9%8A%D9%81%D9%8A%D8%A9-%D8%A7%D9%84%D8%AA%D8%AD%D9%82%D9%82-%D9%85%D9%86-%D8%B5%D8%AD%D8%A9-%D8%B4%D9%87%D8%A7%D8%AF%D8%A7%D8%AA-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AF%D8%A7%D9%85%D8%A9-%D8%A7/",
  "/como-verificar-que-las-certificaciones-de-sostenibilidad-de-un-proveedor-de-envases-son-autenticas/": "/es/como-verificar-que-las-certificaciones-de-sostenibilidad-de-un-proveedor-de-envases-son-autenticas/",
  "/es/product-category/vaso-cuenco-para-sopa/": "/es/productos/vasos-y-cuencos/vasos-para-sopa/",
  "/es/leyes-estatales-eeuu-empaques-plasticos/": "/es/leyes-estatales-de-ee-uu-sobre-envases-de-plastico/",
  "/ar/product-category/أكواب-أوعية-ورقية-للحساء/": "/ar/%D8%A3%D9%83%D9%88%D8%A7%D8%A8-%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D8%A1/",
  "/quest-ce-que-la-certification-bpi-en-quoi-elle-differe-de-la-certification-fsc/": "/fr/quest-ce-que-la-certification-bpi-en-quoi-elle-differe-de-la-certification-fsc/",
  "/product-category/gobelet-en-papier/": "/fr/produits/gobelets-bols/gobelets-papier/",
  "/product-category/couverts/": "/fr/produits/fournitures-restauration/couverts-jetables/",
  "/es/product-category/cuenco-para-ensalada/": "/es/productos/vasos-y-cuencos/cuencos-para-ensaladas/",
  "/product-category/boite-a-salade/": "/fr/produits/boites-contenants-alimentaires/boites-salades/",
  "/ar/product-category/علب-الوجبات-علب-طعام-دائرية/": "/ar/%D8%B9%D9%84%D8%A8-%D9%88%D8%AD%D8%A7%D9%88%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%B7%D8%B9%D8%A7%D9%85/",
  "/es/product-category/pajitas-de-papel/": "/es/productos/suministros-para-restauracion/pajitas-de-papel/",
  "/directiva-europea-sobre-plasticos-de-un-solo-uso-que-significa-para-los-compradores-de-envases/": "/es/directiva-europea-sobre-plasticos-de-un-solo-uso-que-significa-para-los-compradores-de-envases/",
  "/ما-هي-شهادة-bpi؟-وكيف-تختلف-عن-شهادة-fsc/": "/ar/%D9%85%D8%A7-%D9%87%D9%8A-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-bpi%D8%9F-%D9%88%D9%83%D9%8A%D9%81-%D8%AA%D8%AE%D8%AA%D9%84%D9%81-%D8%B9%D9%86-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-fsc/",
  "/ar/qwanin-tbyt-lblastyk-alwlayat-almthdt/": "/ar/%D9%82%D9%88%D8%A7%D9%86%D9%8A%D9%86-%D8%A7%D9%84%D8%B9%D8%A8%D9%88%D8%A7%D8%AA-%D8%A7%D9%84%D8%A8%D9%84%D8%A7%D8%B3%D8%AA%D9%8A%D9%83%D9%8A%D8%A9-%D9%81%D9%8A-%D8%A7%D9%84%D9%88%D9%84%D8%A7%D9%8A%D8%A7%D8%AA-%D8%A7%D9%84%D8%A3%D9%85%D8%B1%D9%8A%D9%83%D9%8A%D8%A9/",
  "/directive-europeenne-sur-les-plastiques-a-usage-unique-ce-quelle-signifie-pour-les-acheteurs-demballages/": "/fr/directive-europeenne-sur-les-plastiques-a-usage-unique-ce-quelle-signifie-pour-les-acheteurs-demballages/",
  "/ar/product-category/أوعية-ورقية-للسلطة/": "/ar/%D8%A3%D9%88%D8%B9%D9%8A%D8%A9-%D8%A7%D9%84%D8%B3%D9%84%D8%B7%D8%A9/",
  "/توجيه-الاتحاد-الأوروبي-بشأن-البلاستي/": "/ar/%D8%AA%D9%88%D8%AC%D9%8A%D9%87-%D8%A7%D9%84%D8%A7%D8%AA%D8%AD%D8%A7%D8%AF-%D8%A7%D9%84%D8%A3%D9%88%D8%B1%D9%88%D8%A8%D9%8A-%D8%A8%D8%B4%D8%A3%D9%86-%D8%A7%D9%84%D8%A8%D9%84%D8%A7%D8%B3%D8%AA%D9%8A/",
  "/product-category/gobelet-bol-a-soupe/": "/fr/produits/gobelets-bols/pots-soupe/",
  "/que-es-la-certificacion-bpi-en-que-se-diferencia-de-la-certificacion-fsc/": "/es/que-es-la-certificacion-bpi-en-que-se-diferencia-de-la-certificacion-fsc/",
  "/ar/product-category/علب-ورقية-للسلطة/": "/ar/%D8%B9%D9%84%D8%A8-%D8%A7%D9%84%D8%B3%D9%84%D8%B7%D8%A9/",
  "/product-category/sandwich-box/": "/products/food-boxes-containers/sandwich-boxes/",
  "/product-category/wrap-box/": "/products/food-boxes-containers/wrap-boxes/",
  "/product-category/hamburger-box/": "/products/food-boxes-containers/burger-boxes/",
  "/product-category/square-food-box/": "/products/food-boxes-containers/square-food-boxes/",
  "/product-category/round-food-box/": "/products/food-boxes-containers/round-food-boxes/",

  '/shop/': '/products/',
  '/contact-us/': '/contact/',
  '/about-us/': '/about/',
  '/factory-manufacturing/': '/about/factory/',
  '/food-packaging-manufacturer-china/': '/about/factory/',
  '/certifications/': '/quality/',
  '/b2b-buyer-oem-odm/': '/custom-packaging/',
  '/custom-paper-straws/': '/custom-packaging/custom-paper-straws/',
  '/compostable-straws/': '/products/foodservice-supplies/paper-straws/',
  '/biodegradable-straws/': '/products/foodservice-supplies/paper-straws/',
  '/product-category/paper-cup/': '/products/cups-bowls/paper-cups/',
  '/product-category/salad-bowl/': '/products/cups-bowls/salad-bowls/',
  '/product-category/soup-cup-bowl/': '/products/cups-bowls/soup-cups/',
  '/product-category/menu-box/': '/products/food-boxes-containers/paper-food-boxes/',
  '/product-category/salad-box/': '/products/food-boxes-containers/salad-boxes/',
  '/product-category/hamburger-box-wrap-box-sandwich-box-pizza-slice/': '/products/food-boxes-containers/',
  '/product-category/paper-straw/': '/products/foodservice-supplies/paper-straws/',
  '/product-category/cutlery/': '/products/foodservice-supplies/disposable-cutlery/',
  '/product-category/paper-plate/': '/products/foodservice-supplies/paper-plates/',
};
