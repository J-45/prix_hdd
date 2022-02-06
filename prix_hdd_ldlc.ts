// Ctrl+Maj+P > Deno: Initialize Workspace Configuration

import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";

let all_json = "";
let url = "";
let textData = "";
let nombre_de_page = 0;
const regex_nombre_de_page = /data-page="\d+">(\d+)<\/a><\/li><li class="next">/gm;
const regex_info_disque = /name': '([^']+)',\s+'id': '\w+',\s+'price': '([^']+)',/gm;

async function get_page(url: string): Promise<string> {
  try {
    console.log(url);
    const textResponse = await fetch(url);
    textData = await textResponse.text();
    return textData.split('dataLayer.push(')[1].split(');')[0];
  }
  catch (error) {
    console.log(error);
    Deno.exit(1);
  }
}

url = "https://www.ldlc.com/-/-/-/c4697/+fi1192-l1000.html";
all_json += await get_page(url);

const result = regex_nombre_de_page.exec(textData);
if (result != undefined){
  nombre_de_page = parseInt(result[1]);
}else{
    console.log(all_json);
    console.log('regex_nombre_de_page undefined');
    Deno.exit(1);
}

for (let _count = 2; _count <= nombre_de_page; _count++) {
  await sleep(2);
  const url = `https://www.ldlc.com/-/-/-/c4697/page${_count}/+fi1192-l1000.html`
  all_json += await get_page(url);
}

const infoS_disque = all_json.matchAll(regex_info_disque);
const infos = [];

if (infoS_disque != undefined){
  for (const info_disque of infoS_disque) {
    const nom: string = info_disque[1];
    const res = /(\d+)\sTo/gm.exec(nom);
    let taille = 0;
    if (res != undefined){
      taille = parseFloat(res[1]) ;
    }else{
      continue;
    }
    const prix: number = parseFloat(info_disque[2]) ;
    const euros_par_to = parseFloat((prix / taille).toPrecision(4));
    infos.push([euros_par_to, nom, taille, prix]);
    // console.log(`Nom: ${nom} To: ${taille} Prix:${prix}`);
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

console.table(infos); // Output: index - €/To - Nom - Taille - Prix