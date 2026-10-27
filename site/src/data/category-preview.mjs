import { categoryForProduct } from '../lib/site-architecture.mjs';

export const CATEGORY_PREVIEWS = {
  'salad-bowls': { title: 'Salad Bowls', subtitle: 'Start with the right base.', intro: 'Kraft and white paper bowls, with a separate range of matching lid options. Explore the bowl first, then complete your specification.', primary: 'Bowl ranges', accessory: 'Lid options', sections: [['bowls', 'Two finishes. Your choice.', 'Open a product to compare catalogue sizes and item references.']] },
  'soup-cups': { title: 'Soup Cups', subtitle: 'Choose the cup. Complete the set.', intro: 'Compare kraft, cardboard and bagasse soup cup series, then review the lid options separately.', primary: 'Cup series', accessory: 'Lid options', sections: [['cups', 'Choose your soup cup', 'Compare the cup series and open a product for catalogue sizes.']] },
  'ice-cream-cups': { title: 'Ice Cream Cups', subtitle: 'A format for your dessert.', intro: 'Explore kraft and cardboard dessert cups. Review each series for catalogue sizes, then confirm any lid requirements.', primary: 'Cup series', accessory: 'Lid options', sections: [['cups', 'Choose your dessert cup', 'Two paper cup series, with their own catalogue options.']] },
  'paper-cups': { title: 'Paper Cups', subtitle: 'Start with the wall format.', intro: 'Explore single-wall, double-wall and ripple-wall cups. Compare the formats first, then review lids and sleeves for your chosen cup.', primary: 'Cup formats', accessory: 'Lids & sleeves', sections: [['single-wall', 'Single-wall cups', 'Compare the white cardboard, kraft and bagasse series.'], ['double-wall', 'Double-wall cups', 'Explore white cardboard and natural kraft formats.'], ['ripple', 'Ripple-wall cups', 'Compare horizontal and vertical styles in kraft and white cardboard.']] },
};

export function previewSections(category, inventory) {
  const config = CATEGORY_PREVIEWS[category];
  const products = inventory.filter((item) => item.type === 'product' && categoryForProduct(item.slug)?.slug === category);
  const accessories = products.filter((item) => /lid|sleeve/.test(item.slug));
  const cups = products.filter((item) => !/lid|sleeve/.test(item.slug));
  if (category === 'salad-bowls') cups.sort((a, b) => (a.slug === 'kraft-paper-bowl' ? -1 : b.slug === 'kraft-paper-bowl' ? 1 : 0));
  return [
    ...config.sections.map(([id, title, intro]) => ({ id, title, intro, products: category === 'paper-cups' ? cups.filter((item) => item.slug.startsWith(id)) : cups })),
    { id: 'accessories', title: config.accessory, intro: 'Review the available components. Confirm the selected cup-and-lid fit before ordering.', products: accessories },
  ];
}
