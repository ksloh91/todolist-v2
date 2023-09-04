//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { initializeApp } = require("firebase/app");

const app = express();

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect('mongodb+srv://keithksloh:Mimo0511$@cluster0.1nnskke.mongodb.net/todolistDB');

const itemsSchema = {
  name : String,
};

const Item = mongoose.model(
  'Item',
  itemsSchema
);  

const item1 = new Item({
   name:'Welcome to your todolist',
});

const item2 = new Item({
   name:'Hit the + button to add a new item.',
});

const item3 = new Item({
   name:'<--  hit this to delete an item.',
});

const defaultItems = [item1, item2, item3]; 

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);
   


app.get("/", function(req, res) {
  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItems;
      }
    })
    .then(items => {
      res.render("list", { listTitle: "Today", newListItems: items });
    })
    .catch(err => {
      console.error(err);
    });
});
  
app.get('/:customListName', async function(req, res) {
  const customListName = _.capitalize(req.params.customListName)  ;

  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      await list.save();
      res.redirect('/' + customListName);
    } else {
        res.render('list', { listTitle: foundList.name, newListItems: foundList.items })
    }
  } catch (err) {
    console.error('Error finding or creating list:', err);
    res.sendStatus(500); // Send an error response back to the client
  }
});





  // const list = new List({
  //   name: customListName,
  //   items: defaultItems
  // });

  // list.save();

;

app.post("/", async function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === 'Today') {
    await item.save();
    res.redirect('/');
  } else {
    try {
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.push(item);
        await foundList.save();
        res.redirect('/' + listName);
      } else {
        console.log('List not found');
        res.sendStatus(404); // Send a not found response back to the client
      }
    } catch (err) {
      console.error('Error finding or updating list:', err);
      res.sendStatus(500); // Send an error response back to the client
    }
  }
});



app.post("/delete", async function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    try {
      const deletedItem = await Item.findByIdAndRemove(checkedItemID);
      if (deletedItem) {
        console.log('Successfully deleted checked item');
        res.redirect('/');
      } else {
        console.log('Item not found');
        res.sendStatus(404); // Send a not found response back to the client
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      res.sendStatus(500); // Send an error response back to the client
    }
  } else {
    try {
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.pull({ _id: checkedItemID });
        await foundList.save();
        res.redirect('/' + listName);
      } else {
        console.log('List not found');
        res.sendStatus(404);
      }
    } catch (err) {
      console.error('Error deleting item from custom list:', err);
      res.sendStatus(500);
    }
  }
});


  

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
