
Create directory `data`. It will store all our mongodb data.
```
$>mkdir data
```

Start the mongoDB server using command `mongod`.
```
$>mongod -dbpath ./data/
```


Prefereably on another terminal window, start up mongodb client with command `mongo`.
```
$>mongo
```

You should see a mongo client shell
```
MongoDB shell version: 1.4.4
url: test
connecting to: test
type "exit" to exit
type "help" for help
```

Type `use db`. Will get a reply `switched to db db`.
```
> use db
switched to db db
```

Type `words = db.words`. Will get a reply `db.words`.
```
> words = db.words
db.words
```

Let's see there are any records or not by typing `words.find();`. Woun't give you any results as there aren't any records yet. 
```
> words.find();
```

Congratulations ! with aforementioned steps MongoDB has been setup successfully. One can use `node moveToMongo.js` to start creating records from the gu.wl file.
Please note, depending upon the size of the file batch creation of records ( or documents as thet are called in mongoDB ) may take few minutes.


