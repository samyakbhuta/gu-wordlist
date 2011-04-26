var fs = require('fs');
var mongoose = require('mongoose');
var wordModel = require("./words").wordModel;
config = JSON.parse(fs.readFileSync('./config.json'));
mongoose.connect("mongodb://localhost/db");
var currentWordListFileName = config && config.wordListFileName || "gu.wl";
var currentWordListFilePath = config && config.wordListFilePath || "../";


fs.readFile(currentWordListFilePath+currentWordListFileName,"utf8", function (err,buffer){
	if (err!==null){
		console.log('exec error '+ err);
	}
	resultWordList= buffer.toString("utf8",0,buffer.length);
	resultWordListArray= resultWordList.split("\n");
	for(i=0;i<resultWordListArray.length-1;i++){
		var aWordInstance = new wordModel();
		aWordInstance.source  = "Original:Kartik Mistry";
		aWordInstance.wordText = resultWordListArray[i];
		aWordInstance.timestamp  =+ new Date();
		//console.log(aWordInstance);
		aWordInstance.save(function(err){
			if (err==null){
				//console.log("Saved");
			}else {
				console.log("Couldn't save " + err);
			}
		});
	}
});


