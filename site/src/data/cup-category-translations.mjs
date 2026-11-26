import { CATEGORY_PREVIEWS } from './category-preview.mjs';

// Category-specific copy follows the English catalogue scope and section order.
const translations = {
  zh: {
    'salad-bowls': ['从合适的碗底开始。','比较标称容量 500–1500 mL 的牛皮纸和白纸沙拉碗，查看产品尺寸及纸、PLA、PP 和 PET 盖选项。',[['两种外观，由您选择。','打开产品页面，比较目录尺寸和货号。']]],
    'soup-cups': ['选择汤杯，配齐整套。','比较牛皮纸、卡纸和甘蔗浆汤杯系列，再单独查看盖子选项。',[['选择您的汤杯','比较汤杯系列，打开产品页面查看目录尺寸。']]],
    'ice-cream-cups': ['适合甜品的杯型。','查看牛皮纸和卡纸甜品杯。各系列的目录尺寸请分别查看，并确认是否需要盖子。',[['选择您的甜品杯','两种纸杯系列，各有相应的目录选项。']]],
    'paper-cups': ['先选择杯壁结构。','查看单层、双层和瓦楞纸杯。先比较杯型，再为选定纸杯查看盖子和杯套。',[['单层纸杯','比较白卡纸、牛皮纸和甘蔗浆系列。'],['双层纸杯','查看白卡纸和原色牛皮纸杯型。'],['瓦楞纸杯','比较牛皮纸和白卡纸的横纹、竖纹款式。']]],
    accessories: ['盖子选项','盖子与杯套','查看现有配件。下单前确认所选杯子与盖子的匹配情况。'],
  },
  fr: {
    'salad-bowls': ['Commencez par le bon bol.','Comparez les saladiers en papier kraft et blanc de capacité nominale de 500 à 1500 mL, leurs dimensions et les couvercles en papier, PLA, PP et PET.',[['Deux finitions, à vous de choisir.','Ouvrez une fiche produit pour comparer les dimensions et les références du catalogue.']]],
    'soup-cups': ['Choisissez le pot. Complétez l’ensemble.','Comparez les séries de pots à soupe en kraft, carton et bagasse, puis consultez séparément les couvercles.',[['Choisissez votre pot à soupe','Comparez les séries et ouvrez une fiche produit pour consulter les dimensions du catalogue.']]],
    'ice-cream-cups': ['Un format pour votre dessert.','Découvrez les pots à dessert en kraft et en carton. Consultez les dimensions de chaque série, puis confirmez vos besoins en couvercles.',[['Choisissez votre pot à dessert','Deux séries de pots en papier, chacune avec ses propres options au catalogue.']]],
    'paper-cups': ['Commencez par le type de paroi.','Découvrez les gobelets à simple paroi, double paroi et paroi ondulée. Comparez les formats, puis les couvercles et les manchons adaptés au gobelet choisi.',[['Gobelets à simple paroi','Comparez les séries en carton blanc, kraft et bagasse.'],['Gobelets à double paroi','Découvrez les formats en carton blanc et en kraft naturel.'],['Gobelets à paroi ondulée','Comparez les styles horizontaux et verticaux en kraft et en carton blanc.']]],
    accessories: ['Couvercles','Couvercles et manchons','Consultez les composants disponibles. Confirmez la compatibilité du gobelet et du couvercle avant de commander.'],
  },
  es: {
    'salad-bowls': ['Empiece por el bol adecuado.','Compare ensaladeras de papel kraft y blanco con capacidades nominales de 500–1500 mL, sus dimensiones y las opciones de tapa de papel, PLA, PP y PET.',[['Dos acabados. Usted elige.','Abra un producto para comparar tamaños y referencias del catálogo.']]],
    'soup-cups': ['Elija el vaso. Complete el conjunto.','Compare las series de vasos para sopa de kraft, cartón y bagazo; después consulte las tapas por separado.',[['Elija su vaso para sopa','Compare las series y abra un producto para consultar los tamaños del catálogo.']]],
    'ice-cream-cups': ['Un formato para su postre.','Explore los vasos para postres de kraft y cartón. Consulte los tamaños de cada serie y confirme si necesita tapas.',[['Elija su vaso para postres','Dos series de vasos de papel, cada una con sus propias opciones de catálogo.']]],
    'paper-cups': ['Empiece por el tipo de pared.','Explore vasos de pared simple, doble y ondulada. Compare primero los formatos y después las tapas y fundas para el vaso elegido.',[['Vasos de pared simple','Compare las series de cartón blanco, kraft y bagazo.'],['Vasos de doble pared','Explore los formatos de cartón blanco y kraft natural.'],['Vasos de pared ondulada','Compare los estilos horizontales y verticales de kraft y cartón blanco.']]],
    accessories: ['Opciones de tapa','Tapas y fundas','Revise los componentes disponibles. Confirme el ajuste del vaso y la tapa elegidos antes de hacer el pedido.'],
  },
  de: {
    'salad-bowls': ['Beginnen Sie mit der passenden Schale.','Vergleichen Sie Salatschalen aus Kraftpapier und weißem Papier mit Nennvolumen von 500–1500 mL, Artikelmaßen und Deckeln aus Papier, PLA, PP und PET.',[['Zwei Ausführungen. Ihre Wahl.','Öffnen Sie ein Produkt, um Kataloggrößen und Artikelnummern zu vergleichen.']]],
    'soup-cups': ['Becher wählen. Set vervollständigen.','Vergleichen Sie Suppenbecherserien aus Kraftpapier, Karton und Bagasse und prüfen Sie anschließend die Deckel separat.',[['Wählen Sie Ihren Suppenbecher','Vergleichen Sie die Serien und öffnen Sie ein Produkt für die Kataloggrößen.']]],
    'ice-cream-cups': ['Ein Format für Ihr Dessert.','Entdecken Sie Dessertbecher aus Kraftpapier und Karton. Prüfen Sie die Kataloggrößen jeder Serie und klären Sie den Deckelbedarf.',[['Wählen Sie Ihren Dessertbecher','Zwei Papierbecherserien mit jeweils eigenen Katalogoptionen.']]],
    'paper-cups': ['Beginnen Sie mit dem Wandaufbau.','Entdecken Sie einwandige, doppelwandige und geriffelte Becher. Vergleichen Sie zuerst die Formate und dann Deckel und Manschetten für Ihren gewählten Becher.',[['Einwandige Becher','Vergleichen Sie die Serien aus weißem Karton, Kraftpapier und Bagasse.'],['Doppelwandige Becher','Entdecken Sie Formate aus weißem Karton und naturfarbenem Kraftpapier.'],['Geriffelte Becher','Vergleichen Sie horizontale und vertikale Ausführungen aus Kraftpapier und weißem Karton.']]],
    accessories: ['Deckeloptionen','Deckel und Manschetten','Prüfen Sie die verfügbaren Komponenten. Bestätigen Sie vor der Bestellung die Passform von Becher und Deckel.'],
  },
  ar: {
    'salad-bowls': ['ابدأ بالوعاء المناسب.','قارن أوعية السلطة من ورق الكرافت والورق الأبيض بسعات اسمية من 500 إلى 1500 مل، مع أبعاد الأصناف وخيارات الأغطية الورقية وأغطية PLA وPP وPET.',[['تشطيبان، والاختيار لك.','افتح صفحة المنتج لمقارنة مقاسات الكتالوج وأرقام الأصناف.']]],
    'soup-cups': ['اختر الكوب وأكمل المجموعة.','قارن سلاسل أكواب الحساء من الكرافت والكرتون وتفل قصب السكر، ثم راجع خيارات الأغطية بشكل منفصل.',[['اختر كوب الحساء','قارن سلاسل الأكواب وافتح صفحة المنتج للاطلاع على مقاسات الكتالوج.']]],
    'ice-cream-cups': ['شكل مناسب للحلوى.','استعرض أكواب الحلوى من الكرافت والكرتون. راجع مقاسات كل سلسلة في الكتالوج، ثم أكد احتياجات الأغطية.',[['اختر كوب الحلوى','سلسلتان من الأكواب الورقية، ولكل منهما خياراتها في الكتالوج.']]],
    'paper-cups': ['ابدأ باختيار بنية الجدار.','استعرض الأكواب أحادية الجدار ومزدوجة الجدار والمموجة. قارن الأشكال أولاً، ثم راجع الأغطية والأكمام للكوب المختار.',[['أكواب أحادية الجدار','قارن سلاسل الكرتون الأبيض والكرافت وتفل قصب السكر.'],['أكواب مزدوجة الجدار','استعرض أشكال الكرتون الأبيض والكرافت الطبيعي.'],['أكواب مموجة','قارن التصاميم الأفقية والرأسية من الكرافت والكرتون الأبيض.']]],
    accessories: ['خيارات الأغطية','الأغطية والأكمام','راجع المكونات المتاحة. أكد توافق الكوب والغطاء المختارين قبل الطلب.'],
  },
};

export function cupCategoryCopy(category, language) {
  const source = CATEGORY_PREVIEWS[category];
  if (language === 'en') return { ...source, sections: Object.fromEntries(source.sections.map(([id, title, intro]) => [id, { title, intro }])) };
  const dictionary = translations[language];
  const [subtitle, intro, sections] = dictionary[category];
  return { subtitle, intro, sections: {
    ...Object.fromEntries(source.sections.map(([id], index) => [id, { title: sections[index][0], intro: sections[index][1] }])),
    accessories: { title: dictionary.accessories[category === 'paper-cups' ? 1 : 0], intro: dictionary.accessories[2] },
  } };
}

