// Ctrl+Maj+P > Deno: Initialize Workspace Configuration

import { sleep } from "https://deno.land/x/sleep/mod.ts";

let all_html = "";
let url = "";
let nombre_de_page = 0;
const regex_nombre_de_page = /(\d+)<\/span><a href="[^"]+" class="s-pagination-item s-pagination-next s-pagination-button s-pagination-separator">Suivant<svg xmlns="[^"]+" width="\d+" height="\d+" viewBox="[^"]+" focusable="false" aria-hidden="true">/gm;
const regex_info_disque = /<h2 class="a-size-mini a-spacing-none a-color-base s-line-clamp-2"><a class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal" href="[^"]+"><span class="a-size-medium a-color-base a-text-normal">([^<]+)<\/span>(?:[^>]+>){20,40}([\d,]+)\s€<\/span><span [^-]+-hidden="true"><span class="a-price-whole">/gm;

async function get_page(url: string): Promise<string> {
  try {
    const textResponse = await fetch(url);
    const textData = await textResponse.text();
    console.log(url);
    return textData;
  }
  catch (error) {
    console.log(error);
    Deno.exit(1);
  }
}

url = "https://www.amazon.fr/s?k=disque+dur&page=1&i=computers&rh=n%3A17414958031%2Cp_n_size_browse-bin%3A10857260031%7C10857261031%7C10857262031%7C10857263031%7C10857264031%7C10857265031%2Cp_72%3A437874031&dc&__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3TNDOEROAM537&qid=1644101747&rnid=437872031&sprefix=disque+dur%2Ccomputers%2C65&ref=sr_nr_p_72_2";
all_html += await get_page(url);
const result = regex_nombre_de_page.exec(all_html);
if (result != undefined){
  nombre_de_page = parseInt(result[1]);
}else{
    console.log(all_html);
    console.log('regex_nombre_de_page undefined');
    Deno.exit(1);
}

for (let _count = 2; _count <= nombre_de_page; _count++) {
  const url = `https://www.amazon.fr/s?k=disque+dur&page=${_count}&i=computers&rh=n%3A17414958031%2Cp_n_size_browse-bin%3A10857260031%7C10857261031%7C10857262031%7C10857263031%7C10857264031%7C10857265031%2Cp_72%3A437874031&dc&__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3TNDOEROAM537&qid=1644101747&rnid=437872031&sprefix=disque+dur%2Ccomputers%2C65&ref=sr_nr_p_72_2`
  await sleep(20); // Pause anti-ban
  all_html += await get_page(url);
}

const infoS_disque = all_html.matchAll(regex_info_disque);
const infos = [];

if (infoS_disque != undefined){
  for (const info_disque of infoS_disque) {
    const nom: string = info_disque[1];
    const res = /([\d,\.]+)\s?T[ob]\W/gmi.exec(nom);
    let taille = 0;
    if (res != undefined){
      taille = parseFloat(res[1]) ;
    }else{
        continue;
    }
    const prix: number = parseFloat(info_disque[2]) ;
    const euros_par_to = parseFloat((prix / taille).toPrecision(4));

    const index = infos.findIndex(object => object[1] === [euros_par_to, nom + "\t", taille, prix][1]);
    // https://bobbyhadz.com/blog/javascript-array-push-if-not-exist
    if (index === -1) {
      infos.push([euros_par_to, nom, taille, prix]);
    }
    // console.log(`euros_par_to:${euros_par_to} Nom: ${nom} To: ${taille} Prix: ${prix}`);
  }
}else{
    console.log('regex_info_disque undefined');
}

infos.sort((n1,n2) => {
  if (n1[0] > n2[0]) {
      return -1;
  }else if (n1[0] < n2[0]) {
      return 1;
  }else{
    return 0;
  }
});

console.table(infos); // Output: Index - €/To - Nom - Taille - Prix
