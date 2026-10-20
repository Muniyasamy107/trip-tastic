// Authored assets only. This helper never accepts a visitor-controlled remote URL.
const editorial=/^\/media\/(valparai|coorg|nilgiris|kodai)-cinematic\.webp$/;
export function responsiveEditorial(src,sizes='100vw'){
 if(!editorial.test(src))return {};
 const base=src.slice(0,-5);
 return {srcSet:`${base}-640.webp 640w, ${base}-960.webp 960w, ${src} 1264w`,sizes};
}
