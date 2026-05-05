import slug_lib from 'slugify';

slug_lib.extend({ 'æ': 'ae', 'œ': 'oe' }); // Ensure French compatibility

export const generateSlug = (text: string) => {
  return slug_lib(text, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    locale: 'fr', // French locale is best for handling accents/diacritics
    trim: true,
  });
};
