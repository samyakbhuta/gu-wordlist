var fs = require('fs');
var util = require('util');
var express = require("express");
var exec = require("child_process").exec;
config = JSON.parse(fs.readFileSync('./config.json'));

/*
 *	URL'nation
 *  ----------
 *	
 *	NOTE: .FORMAT specifies format. Could be .json, .xml or .html.
 *	
 *	http://example.org:1234/wl/LX.FORMAT
 *		Will give the Xth line, means word located at the line no. X.
 *
 *	http://example.org:1234/wl/LX,LY.FORMAT
 *		Will give two seperate words. Word at the Xth line and word at Yth line.
 *		One can have any number of such line specified.
 *
 *	http://example.org:1234/wl/LX-LY.FORMAT
 *		Will give the word Xth line to Yth line.
 *		If erroneously X is greater then Y, values will be swapped.
 *
 *	http://example.org:1234/wl/dump.FORMAT
 *		Will dump entire word list in F format.
 *
 *	http://example.org:1234/s/startWith/અ.FORMAT
 *		Will give all words starting with અ.
 *
 *	http://example.org:1234/s/endWith/અ.FORMAT
 *		Will give all words ending with અ.
 *
 *	http://example.org:1234/s/contains/અ.FORMAT
 *		Will give all words containing with અ.
 *
 *	http://example.org:1234/s/regex/someRegEx.FORMAT
 *		Will give all words which match the someRegEx.
 *
 *	http://example.org:1234/s/total.FORMAT
 * 		Will give all words which match the someRegEx
 *
 *	http://example.org:1234/exec/commandString.FORMAT
 * 		A very powerful(and dangerous !) feature, which will allow user to directly enter command to work upon the wordlist.
 */

// TODO: Gzipping compression using content negotiation
// TODO: Code refactoring, write middleware for common scenarios.
// TODO: Code for the exceptional scenarios and error condition.
// TODO: Security tests, 1)injection attacks
// TODO: Should output in UTF-8, Chrome, FF not detecting
// TODO: Generalized command line text box, with security precautions.See http://example.org:1234/exec/commandString.FORMAT
// TODO: By default the reply should be JSON.
// TODO: Support for http://example.org:1234/s/total.FORMAT
// TODO: Support for http://example.org:1234/wl/LX,LY.FORMAT
// TODO: Authentication and user list in database.
// TODO: Create a MongoDB from the worldlist file. So that word can be unqiuely mapped to the ids and not line no. for lateral reference. Line number for a given number changes over time as wordlist goes through changes.
// TODO: Should be able to request application/json request body. Guess bodyParser middleware for connect/express.js will come handy.
/*
 * Default host and port ! This should be ideally specified using command line or config.json file.
 * Default are here just in the case nothing is supplied.
 */

var HOST = config && config.host || "localhost";
var PORT = config && config.port || 1234;
var currentWordListFileName = config && config.wordListFileName || "gu-small.wl";
var currentWordListFilePath = config && config.wordListFilePath || "./";

var httpServer = express.createServer();

httpServer.configure(function(){
	httpServer.use(express.logger());
});
var httpServer = express.createServer();
httpServer.configure("development",function(){
	httpServer.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	httpServer.use(express.static(__dirname + '/public'));
});
httpServer.configure("production",function(){
	httpServer.use(express.errorHandler());
	httpServer.use(express.static(__dirname + '/public', { maxAge: oneYear }));
});

httpServer.get("/wl/dump.:format",function(req,res){
	fs.readFile(currentWordListFilePath+currentWordListFileName,"utf8", function (err,buffer){
		if (err!==null){
			console.log('exec error '+ err);
		}
		resultWordList= buffer.toString("utf8",0,buffer.length);
		resultWordListArray= resultWordList.split("\n");
		//TODO : BUG : Splitting is generating extra array member at last. Use split properly or slice the array.			
		switch(req.params.format){
		 case 'xml':
			res.write("<words>","utf8");
			for(i=0;i<resultWordListArray.length;i++){
				res.write("<word>"+resultWordListArray[i]+"</word>","utf8");
			}
			res.end("</words>","utf8");
		 case 'html':
			res.write("<div>","utf8");
			for(i=0;i<resultWordListArray.length;i++){
				res.write("<p>"+resultWordListArray[i]+"</p>","utf8");
			}
			res.end("</div>","utf8");
		 case 'json':
		 default :
			//TODO : BUG : Should send .json response when no format is specified.				
			res.end(JSON.stringify(resultWordListArray),"utf8");
		}
	})
});	

httpServer.get("/wl/L:id1(\d+)-L:id2(\d+).:format",function(req,res){
	/*
		Checking for the condition where id1 is greater than id2. Swapping the values if true.	
	*/	
	fromLine = parseInt(req.params.id1);
	toLine = parseInt(req.params.id2);
	if (fromLine > toLine ) {
		 //swapin the value
		 fromLine^=toLine;
		 toLine^=fromLine;
		 fromLine^=toLine;
	}
	var diff = toLine-fromLine+1;
	var commandString = "head -"+toLine+" "+currentWordListFilePath + currentWordListFileName +" | tail -"+diff; 
	childProcess= exec(commandString,function(err,stdout,stderr){
		resultWordList = stdout.trim();
		resultWordListArray= resultWordList.split("\n");
		//TODO : BUG : Splitting is generating extra array member at last. Use split dilligently or slice the array.			
		switch(req.params.format){
		 case 'xml':
			res.write("<words>","utf8");
			for(i=0;i<resultWordListArray.length;i++){
				res.write("<word>"+resultWordListArray[i]+"</word>","utf8");
			}
			res.end("</words>","utf8");
		 case 'html':
			res.write("<div>","utf8");
			for(i=0;i<resultWordListArray.length;i++){
				res.write("<p>"+resultWordListArray[i]+"</p>","utf8");
			}
			res.end("</div>","utf8");
		 case 'json':
		 default :
			//TODO : BUG : Should send .json response when no format is specified.
			res.end(JSON.stringify(resultWordListArray),"utf8");
		}
	});
});

// TODO : Need to come up with a better regex as we can have varibale no of comma seperated values here.
httpServer.get("/wl/L:id1(\d+),L:id2(\d+)",function(req,res){
	res.end(req.params.id1 +"," +req.params.id2);
});

httpServer.get("/wl/L:id1(\d+).:format",function(req,res){
	var commandString = "awk 'NR=="+req.params.id1+"{print;exit}' "+ currentWordListFilePath + currentWordListFileName;
	childProcess= exec(commandString,function(err,stdout,stderr){
		resultWord = stdout.trim();
		switch(req.params.format){	
			 case 'xml':
				res.end("<words><word>"+resultWord+"</word></words>","utf8");
			 case 'html':
				res.end("<div><p>"+resultWord+"</p></div>","utf8");
			 case 'json':
				res.end("['"+resultWord+"']","utf8");
			 default :
			}
		if (err!==null){
				console.log('exec error '+ err);	
	 	}
	});
});

httpServer.get("/s/contains/:token.:format",function(req,res){	
	var commandString = "grep \""+req.params.token+"\" "+currentWordListFilePath + currentWordListFileName+" -n | awk -F ':' '{print $1 \":\\\"\" $2\"\\\"\"}'";
	console.log(commandString);
	childProcess= exec(commandString,function(err,stdout,stderr){
		resultWordList = stdout.trim();
		resultWordListArray= resultWordList.split("\n");
		switch(req.params.format){
		 case 'xml':
			res.write("<words>","utf8");
			for(i=0;i<resultWordListArray.length;i++){
				res.write("<word>"+resultWordListArray[i]+"</word>","utf8");
			}
			res.end("</words>","utf8");
		 case 'html':
			res.write("<div>","utf8");
			for(i=0;i<resultWordListArray.length;i++){
				res.write("<p>"+resultWordListArray[i]+"</p>","utf8");
			}
			res.end("</div>","utf8");
		 case 'json':
		 default :
		//TODO : BUG : Should send .json response when no format is specified.
			res.end("["+resultWordListArray+"]","utf8");
		}
	});
});
httpServer.listen(PORT,HOST);
console.log("listening at http://" + HOST +":"+PORT);
