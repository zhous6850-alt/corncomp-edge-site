import { mediaFor } from '../lib/visual-media.mjs';

const CORNCOMP = 'Ningbo Corncomp Tech Co., Ltd.';

export const COMPANY_CERTIFICATES = [
  {
    key: 'iso-9001', group: 'company',
    title: { en: 'ISO 9001:2015', fr: 'ISO 9001:2015', es: 'ISO 9001:2015', ar: 'ISO 9001:2015' },
    holder: CORNCOMP, certificateNumber: '01526Q60104R001',
    standard: 'ISO 9001:2015',
    scope: {
      en: 'Quality management system for R&D and manufacturing of the food-grade paper and lid products listed on the certificate (export only).',
      fr: 'Système de management de la qualité pour la R&D et la fabrication des produits alimentaires en papier et des couvercles énumérés sur le certificat (exportation uniquement).',
      es: 'Sistema de gestión de calidad para I+D y fabricación de los productos de papel alimentario y tapas indicados en el certificado (solo exportación).',
      ar: 'نظام إدارة الجودة للبحث والتطوير وتصنيع المنتجات الورقية الغذائية والأغطية المدرجة في الشهادة (للتصدير فقط).',
    },
    validUntil: '2029-04-27', imageKey: 'certificate:iso',
  },
  {
    key: 'fsc-coc', group: 'company',
    title: { en: 'FSC Chain of Custody', fr: 'Chaîne de contrôle FSC', es: 'Cadena de custodia FSC', ar: 'سلسلة الحيازة FSC' },
    holder: CORNCOMP, certificateNumber: 'RINA-COC-001953',
    standard: 'FSC-STD-40-004 V3-1; FSC-STD-50-001',
    scope: {
      en: 'Chain of Custody for the paper wrapping and paper foodservice product groups listed on the certificate; individual item claims require supporting sales documents.',
      fr: 'Chaîne de contrôle pour les groupes de papiers d’emballage et de produits de restauration en papier figurant sur le certificat ; les allégations par article nécessitent des documents de vente justificatifs.',
      es: 'Cadena de custodia para los grupos de papel de envolver y productos de papel para restauración indicados en el certificado; las declaraciones por artículo requieren documentos de venta.',
      ar: 'سلسلة الحيازة لمجموعات ورق التغليف والمنتجات الورقية لخدمات الطعام المدرجة في الشهادة؛ وتتطلب المطالبات الخاصة بكل صنف مستندات بيع داعمة.',
    },
    validUntil: '2027-09-08', imageKey: 'certificate:fsc',
  },
  {
    key: 'bpi-straws', group: 'company',
    title: { en: 'BPI Product Certificate', fr: 'Certificat de produit BPI', es: 'Certificado de producto BPI', ar: 'شهادة منتج BPI' },
    holder: CORNCOMP, certificateNumber: '10529571-1',
    standard: 'ASTM D6400',
    scope: {
      en: 'Printed paper straws with maximum grammage 352 g/m²; this certificate does not cover every Corncomp product.',
      fr: 'Pailles en papier imprimées d’un grammage maximal de 352 g/m² ; ce certificat ne couvre pas tous les produits Corncomp.',
      es: 'Pajitas de papel impresas con gramaje máximo de 352 g/m²; este certificado no cubre todos los productos Corncomp.',
      ar: 'ماصات ورقية مطبوعة بوزن أقصى 352 g/m²؛ ولا تشمل هذه الشهادة جميع منتجات كورنكومب.',
    },
    validUntil: '2027-09-30', imageKey: 'certificate:bpi',
  },
  {
    key: 'brcgs-packaging', group: 'company',
    title: { en: 'BRCGS Packaging Materials', fr: 'BRCGS Matériaux d’emballage', es: 'BRCGS Materiales de embalaje', ar: 'BRCGS لمواد التغليف' },
    holder: CORNCOMP, certificateNumber: 'CN24/00006923',
    standard: 'BRCGS Global Standard for Packaging Materials, Issue 7',
    scope: {
      en: 'Site processes for the paper food-contact packaging and PET lids listed on the certificate; achieved Grade B.',
      fr: 'Procédés du site pour les emballages en papier destinés au contact alimentaire et les couvercles PET énumérés sur le certificat ; grade B obtenu.',
      es: 'Procesos de la planta para los envases de papel de contacto alimentario y tapas PET indicados en el certificado; grado B obtenido.',
      ar: 'عمليات المنشأة الخاصة بالتغليف الورقي الملامس للأغذية وأغطية PET المدرجة في الشهادة؛ بدرجة B.',
    },
    validUntil: '2027-08-05', imageKey: 'certificate:brcgs',
  },
];

export const SUPPLY_CHAIN_DOCUMENTS = [
  {
    key: 'din-resin-7w0517', group: 'supplyChain',
    title: { en: 'DIN CERTCO material registration', fr: 'Enregistrement de matériau DIN CERTCO', es: 'Registro de material DIN CERTCO', ar: 'تسجيل مادة DIN CERTCO' },
    holder: 'Hangzhou POLYFUL Advanced Material Co., Ltd.', certificateNumber: '7W0517',
    standard: 'DIN EN 13432:2000-12',
    scope: {
      en: 'Biodegradable modified resin registered as compostable material; not a certification of Corncomp paper straws.',
      fr: 'Résine modifiée biodégradable enregistrée comme matériau compostable ; ce document ne certifie pas les pailles en papier Corncomp.',
      es: 'Resina modificada biodegradable registrada como material compostable; no certifica las pajitas de papel Corncomp.',
      ar: 'راتنج معدل قابل للتحلل الحيوي مسجل كمادة قابلة للتسميد؛ ولا يمثل شهادة لماصات كورنكومب الورقية.',
    },
    validUntil: '2028-01-31', imageKey: null,
    documentUrl: '/documents/certificates/din-straw-material-7w0517.pdf',
  },
  {
    key: 'din-kraft-container-7p1802', group: 'supplyChain',
    title: { en: 'DIN CERTCO kraft food container', fr: 'Contenant alimentaire kraft DIN CERTCO', es: 'Envase alimentario kraft DIN CERTCO', ar: 'حاوية طعام من ورق الكرافت DIN CERTCO' },
    holder: 'Ningbo Millionpack Co., Ltd.', certificateNumber: '7P1802',
    standard: 'DIN EN 13432:2000-12; ASTM D6400:2023-03',
    scope: {
      en: 'Natural Kraft Paper Food Container specification in the certificate annex; not every Corncomp food box.',
      fr: 'Spécification du contenant alimentaire en papier kraft naturel figurant dans l’annexe du certificat ; pas toutes les boîtes alimentaires Corncomp.',
      es: 'Especificación del envase alimentario de papel kraft natural del anexo del certificado; no todas las cajas alimentarias Corncomp.',
      ar: 'مواصفة حاوية الطعام المصنوعة من ورق الكرافت الطبيعي الواردة في ملحق الشهادة؛ ولا تشمل جميع علب الطعام من كورنكومب.',
    },
    validUntil: '2028-10-31', imageKey: null,
    documentUrl: '/documents/certificates/din-kraft-food-container-7p1802.pdf',
  },
];

const localized = (record, language) => ({
  key: record.key,
  title: record.title[language],
  holder: record.holder,
  certificateNumber: record.certificateNumber,
  standard: record.standard,
  scope: record.scope[language],
  validUntil: record.validUntil,
  image: record.imageKey ? mediaFor(record.imageKey, language) : null,
  ...(record.documentUrl ? { documentUrl: record.documentUrl } : {}),
});

export const companyCertificates = (language = 'en') => COMPANY_CERTIFICATES.map((record) => localized(record, language));
export const supplyChainDocuments = (language = 'en') => SUPPLY_CHAIN_DOCUMENTS.map((record) => localized(record, language));
