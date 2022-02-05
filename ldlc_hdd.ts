// deno-lint-ignore-file no-inferrable-types

// Ctrl+Maj+P 
// > Deno: Initialize Workspace Configuration

let all_json: string = "";
let url: string = "";
let textData: string = "";
let nombre_de_page: number = 0;
const regex_nombre_de_page: RegExp = /data-page="\d+">(\d+)<\/a><\/li><li class="next">/gm;
const regex_info_disque = /name': '([^']+)',\s+'id': '\w+',\s+'price': '([^']+)',/gm;

try {
  url = "https://www.ldlc.com/informatique/pieces-informatique/disque-dur-interne/c4697/+fi1192-l1000.html";
  console.log(url);
  const textResponse = await fetch(url);
  textData = await textResponse.text();
  all_json += textData.split('dataLayer.push(')[1].split(');')[0];
}
catch (error) {
  console.log(error);
}

const result = regex_nombre_de_page.exec(textData);
if (result != undefined){
  nombre_de_page = parseInt(result[1]);
}

for (let _count = 2; _count <= nombre_de_page; _count++) {
  const url: string = `https://www.ldlc.com/informatique/pieces-informatique/disque-dur-interne/c4697/page${_count}/+fi1192-l1000.html`
  try {
    console.log(url);
    const textResponse = await fetch(url);
    textData = await textResponse.text();
    all_json += "\n"+textData.split('dataLayer.push({')[1].split('});')[0];
  }
  catch (error) {
    console.log(error);
  }
}


const infoS_disque = all_json.matchAll(regex_info_disque);
const infos = [];

if (infoS_disque != undefined){
  for (const info_disque of infoS_disque) {
    const nom: string = info_disque[1];
    const res = /(\d+)\sTo/gm.exec(nom);
    let taille: number = 0;
    if (res != undefined){
      taille = parseFloat(res[1]) ;
    }
    const prix: number = parseFloat(info_disque[2]) ;
    // console.log(`Nom: ${nom} To: ${taille} Prix:${prix}`);
    infos.push([Math.round(prix / taille), nom, taille, prix]);

  }
}

infos.sort((n1,n2) => {
  if (n1[0] > n2[0]) {
      return -1;
  }

  if (n1[0] < n2[0]) {
      return 1;
  }

  return 0;
});

console.table(infos); // Output: index - €/To - Nom - Taille - Prix