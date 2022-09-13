const xlsx = require("xlsx");
const mysql = require('mysql');
const crd = require("./cred.json");

function parseUbistRaw(rawSheet) {
    return new Promise((resolve, reject) => {

        let keyList = Object.getOwnPropertyNames(rawSheet);
        let rowObj = {};
        let colObj = {};

        const regexDigit = /[0-9]/;
        const regexAlpha = /[A-Z]/;
        for (let ti of keyList) {
            let indexNum = ti.search(regexDigit);
            if (indexNum === -1) {
                continue;
            }
            else {
                //  Row Object making
                if (rowObj.hasOwnProperty(`${ti.substring(ti.search(regexDigit))}`)) {
                    rowObj[`${ti.substring(ti.search(regexDigit))}`].push(rawSheet[`${ti}`].v);
                } else {
                    rowObj[`${ti.substring(ti.search(regexDigit))}`] = [];
                    rowObj[`${ti.substring(ti.search(regexDigit))}`].push(rawSheet[`${ti}`].v);
                }
                //  col Object making            
                if (colObj.hasOwnProperty(`${ti.substring(0, ti.search(regexDigit))}`)) {
                    colObj[`${ti.substring(0, ti.search(regexDigit))}`].push(rawSheet[`${ti}`].v);
                } else {
                    colObj[`${ti.substring(0, ti.search(regexDigit))}`] = [];
                    colObj[`${ti.substring(0, ti.search(regexDigit))}`].push(rawSheet[`${ti}`].v);
                }


            }


        }
        resolve({ rowObj, colObj });
    });
}
let sortfunc = function (a, b) {
    if (a.length < b.length) {
        return -1;
    }

    else if (a.length === b.length) {
        for (let i = 0; i < a.length; i++) {
            if (a.charCodeAt(i) < b.charCodeAt(i)) {
                return -1;
            }
            else if (a.charCodeAt(i) === b.charCodeAt(i)) {
                continue;
            }
            else {
                return 1;
            }
        }
    }
    else {
        return 1;
    }
}

function readDBValue(rowObj) {
    return new Promise((resolve, reject) => {

        var connection = mysql.createConnection(crd);
        connection.connect();

        connection.query(`select * from drug_dev.ubist`, function (error, results, fields) {
            if (error) {
                connection.end();
                throw error;
            }

            else {
                let mydate = new Date(results[0].ubi_update_version);
                //console.log(`${mydate.getFullYear()}-${mydate.getMonth()}-${mydate.getDate()}`);
                let retArray = results;
                //console.log(a);

                resolve(retArray);

            }
            connection.end();
        });
    })
}

class UBIST {
    constructor(rowDP) {
        //PK
        this.version = rowDP.ubi_update_version
        this.prodCode = rowDP.ubi_prod_cd
        this.hospLevel = rowDP.ubi_hosp_lev

        //NOT NULL
        this.atcCode = rowDP.ubi_atc_cd
        this.atcDetail = rowDP.ubi_atc_detail
        this.brandName = rowDP.ubi_brand_nm
        this.prodName = rowDP.ubi_prod_nm
        this.seller = rowDP.ubi_seller
        this.manufacturer = rowDP.ubi_maker
        this.compName = rowDP.ubi_comp_nm
        this.compUnit = rowDP.ubi_comp_unit

        //NULL-ABLE
        this.sellCost = rowDP.ubi_sell_cost
        this.sellAmount = rowDP.ubi_sell_amt
    }
}

function compareList(rowObj) {
    return new Promise((resolve, reject) => {

        const matchList = ['ATC', 'ATC 상세', '브랜드', '제품', '판매사', '제조사', '성분', '성분용량', '약품코드', '종별'];
        //input Array Check
        for (let i = 0; i < matchList.length; i++) {
            if (matchList[i] !== rowObj["2"][i]) {
                reject("match error exit function")
            }
        }
        resolve(true);
    });

}

const insertUbistRow = function (rowObj,colObj, ubistArray) {
    return new Promise((resolve, reject) => {

        let date_stamp = new Date()
        var connection = mysql.createConnection(crd);
        connection.connect();

        // index 
        const regexYear = /[0-9]/;
        const unicodeSTring = "가나다라";

        console.log(unicodeSTring.charCodeAt(0));
        for(let ti of rowObj["2"]){
        }

        
        /*
                connection.query(query, function (error, results, fields) {
                    if (error) {
                        connection.end();
                        throw error;
                    }

                    else {
                        console.log(results);
                        console.log(fields);

                        resolve(results);

                    }
                    connection.end();
                });
                */

    })


}

let Main = async () => {

    try {
        const workbook = await xlsx.readFile("ubist_alpha.xlsx");
        rawSheet = workbook.Sheets.Sheet1;
        const { rowObj, colObj } = await parseUbistRaw(rawSheet);
        console.log(rowObj["2"]);

//        console.log(Object.getOwnPropertyNames(rowObj));
  //      console.log((rowObj["2"]));
    //    console.log((rowObj["1"]));



        const ubistArray = await readDBValue("ji");
        const vaildKey = await compareList(rowObj, ubistArray);
        const vaildinsert = await insertUbistRow(rowObj,colObj,ubistArray);

    } catch (err) {
        console.log(`========err!!============\n ${err}`);
    }
}

Main();