const covers = {
 'bpi-vs-fsc-certification':'blog-bpi-fsc',
 'pla-vs-bagasse-vs-fsc-paper':'blog-packaging-materials',
 'eu-single-use-plastics-directive-explained':'blog-eu-packaging',
 'us-state-plastic-packaging-laws-explained':'blog-us-packaging',
};
export function blogCoverPath(post) {
 if(post.slug==='how-to-verify-supplier-sustainability-certifications')return '/media/about/corncomp-certificate-preview.svg';
 return covers[post.slug] ? '/media/about/'+covers[post.slug]+'.webp' : post.featuredMedia?.localPath;
}
