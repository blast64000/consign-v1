const axios = require('axios');
const mariadb = require('mariadb');
const fs = require("fs");
const { Console } = require('console');
const fsPromises = fs.promises;


const pool = mariadb.createPool({
  host: 'nedrug-scm-test.cuok2jrgipjs.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'DW#2022#drug',
  connectionLimit: 5
});


const isVailDrug = function (res) {
  if (res.data && (!res.data.statusCode)) {
    return true;
  } else {
    return false;
  }
}

//open 

const getHtml = async (itemSeq) => {
  try {

    let a = await axios.get(`https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=201804312`);;
    console.log(a.data);
    await fsPromises.writeFile("booksdd3.json", JSON.stringify(a.data), {encoding: "utf8",flag: "a",mode: 0o666});
    return -1;
    let c = {
      genericList: []
    };
    if (isVailDrug(a)) {
      console.log("is vaild generic")
      c.totalCount = b.totalCount;
      c.materialQntNum = b.paramNew.materialQntNum;
      c.entpManufName = b.paramNew.entpManufName;
      c.manufaNm = b.paramNew.manufaNm;l
      c.ingrKorName = b.paramNew.ingrKorName;
      c.itemSeq = b.paramNew.itemSeq;

      for (let x of b.genericList) {
        let d = {
          itemSeq: x.itemSeq,
          itemName: x.itemName,
          entpSeq: x.entpSeq,
          entpName: x.entpName,
          entpManufName: x.entpManufName,
          stdIngr: x.stdIngr,
          qntNum: x.qntNum,
          bundleCnt: x.bundleCnt,
          bundleItemSeq: x.bundleItemSeq,
          makeTyGb: x.makeTyGb
        }
        c.genericList.push(d);
      }
      console.log(c);
      return c;
    } else {
      console.log("is not vaild medicine");
      return 0;
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
}

const connectDB = async (list, query, type) => {
  let conn;
  try {
    conn = await pool.getConnection();


    if (type === "select") {
      const rows = await conn.query(query);
      for (let j of rows) {
        list.push(j);
      }
    } else if (type=="insert"){
      for (let xi of list){
        let sqlseq = `INSERT INTO innodb.bundle_set (itemSeq,itemName,entpSeq,entpName,entpManufName,stdIngr,qntNum,bundleCnt,bundleItemSeq,makeTyGb) VALUES ('${xi.itemSeq}','${xi.itemName}','${xi.entpSeq}','${xi.entpName}','${xi.entpManufName}','${xi.stdIngr}','${xi.qntNum}','${xi.bundleCnt}','${xi.bundleItemSeq}','${xi.makeTyGb}');`
        const rows = await conn.query(sqlseq);
      }
    }
  } catch (err) {
    await fsPromises.writeFile("errors.txt", JSON.stringify(err)+`\n`, {encoding: "utf8",flag: "a",mode: 0o666});
  } finally {
    if (conn)
      console.log("db conn end");
    conn.end();
  }
}

const Main = async (num) => {
  let workList = [];
  let codeList = [];
  let itemSeqArray = [];
  //initialize
  itemSeqArray.push({
    itemSeq: '123456789',
    itemName: '테스트아이템',
    entpSeq: '2022000444',
    entpName: '테스트제약',
    entpManufName: '테스트공장',
    stdIngr: '테스트물질',
    qntNum: '테스트그램',
    bundleCnt: '1',
    bundleItemSeq: '123456789',
    makeTyGb: '자사'
  })

  await connectDB(workList,`select code from innodb.medicine`,`select`);
  divArray(workList,codeList,4,num);
  for (let t of codeList) {
    await new Promise(r => setTimeout(r, 1000 * Math.random()));
    console.log(`TCODE : ${t.code}`);
    let bundleSet = await getHtml(t.code);
    if (bundleSet) {
      for (let ti of bundleSet.genericList) {
        if (itemSeqArray.find(o => o.itemSeq === ti.itemSeq)) {
          break;
        }
        else {
          await fsPromises.writeFile("books.txt", JSON.stringify(ti)+`\n`, {encoding: "utf8",flag: "a",mode: 0o666});
          itemSeqArray.push(ti);
        }
      }
    }
    else {
      continue;
    }
  }
  await connectDB(itemSeqArray,"","insert");
}

let divArray = function(inArray,outArray,MAX_NUM, t){
  for (let i=0; i<inArray.length ; i++){
    if(Math.floor(i%MAX_NUM)===t){
      outArray.push(inArray[i]);
    }
  }
}

getHtml('202202636');