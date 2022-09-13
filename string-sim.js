const xlsx = require( "xlsx" );
var ss = require("string-similarity");

var similarity = ss.compareTwoStrings("healed", "sealed");

var matches = ss.findBestMatch("healed", [
  "edward",
  "sealed",
  "theatre",
]);


const kpic = xlsx.readFile("kpic.xlsx" );
const ub = xlsx.readFile("ub.xlsx" );

// @breif 엑셀 파일의 첫번째 시트의 정보를 추출

const kpic_sheetName = kpic.SheetNames[0];          
const kpic_firstSheet = kpic.Sheets[kpic_sheetName];       

const ub_sheetName = ub.SheetNames[0];          
const ub_firstSheet = ub.Sheets[kpic_sheetName];      


const kpic_jsonData = xlsx.utils.sheet_to_json( kpic_firstSheet, { defval : "" } );
const ub_jsonData = xlsx.utils.sheet_to_json( ub_firstSheet, { defval : "" } );


console.log(kpic_jsonData[0]);
console.log(ub_jsonData[0]);

let kpic_name_array = kpic_jsonData.map(a => a["한글상품명"]);


let tx = 0;

for(let i of ub_jsonData){
  var matches  = ss.findBestMatch(i["제품"],kpic_name_array);
  
  matches.ratings = matches.ratings.sort(function (a,b){
    if(a.rating>b.rating){
      return -1;
    }

    if (a.rating < b.rating) {
      return 1;
    }
    return 0;
  })

  console.log(i["제품"]+" | "+matches.ratings[0].target+" | "+matches.ratings[0].rating);
  console.log(i["제품"]+" | "+matches.ratings[1].target+" | "+matches.ratings[1].rating);
  console.log(i["제품"]+" | "+matches.ratings[2].target+" | "+matches.ratings[2].rating);
  tx++;
  if(tx>100){
    break;
  }

}