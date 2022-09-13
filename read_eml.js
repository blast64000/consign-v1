const  EmlParser = require('eml-parser');
const  fs = require('fs');


new EmlParser(fs.createReadStream('test.eml'))
.parseEml()
.then(result  => {
	// properties in result object:
	// {
	//	"attachments": [],
	//	"headers": {},
	//	"headerLines": [],
	//	"html": "",
	//	"text": "",
	//	"textAsHtml": "",
	//	"subject": "",
	//	"references": "",
	//	"date": "",
	//	"to": {},
	//	"from": {},
	//	"cc": {},
	//	"messageId": "",
	//	"inReplyTo": ""
	// }
	console.log(result);
})
.catch(err  => {
	console.log(err);
})