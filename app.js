const { MongoClient } = require("mongodb");

async function run() {


  //EXPRESS JS FOR SERVER API
  //Whenever yo create a expressJS serverAPI for an especific object
  //you need to:
  //1. Start the express server with a port
  //2. Define the data function to create the specific object you want to store
  //3. Define the data array for the objects post
  //4. Create routes and handlers for the API (GET ALL, GET ID, POST, PUT)
  //5. Store the posts into MongoDB as it follows
  
  // Import the express module
  const express=require('express');
  // Create an instance of the express application
  const app=express();
  // Specify a port number for the server
  const port=5000;
  // Start the server and listen to the port
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


  // Define the data function for creating a blog post
  function createPost(id, title, content, author) {
    console.log(`Cree posteo: ${title}`)
    return {
      id: id,
      title: title,
      content: content,
      author: author,
    };
  }

  // // Define the data array for the blog posts
  // const posts = [
  //   createPost(1, 'Hello World', 'This is my first blog post', 'Alice'),
  //   createPost(2, 'Express JS', 'This is a blog post about Express JS', 'Bob'),
  //   createPost(3, 'RESTful API', 'This is a blog post about RESTful API', 'Charlie'),
  // ];
  
  // Create a route and a handler for GET /posts
  app.get('/posts', async (req, res) => {
    try {
      // Call getPosts() and wait for it to resolve
      const posts = await getPosts();
      // Send the posts array as a JSON response
      res.status(200).json(posts);
    } catch (error) {
      // If there's an error, send an error response
      console.error(`Error fetching posts: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create a route and a handler for GET /posts/:id
  app.get('/posts/:id', async (req, res) => {
    try{
      // Get the id parameter from the request
      const id = req.params.id;

      // Find the post with the given id in the posts array
      // const posts = await getPosts();
      // const post = posts.find((p) => p.id == id);
      const post = await getPostById(id);

      // If the post exists, send it as a JSON response
      if (post) {
        res.json(post);
      } else {
        // If the post does not exist, send a 404 status code and a message
        res.status(404).send('Post not found');
      }
    } catch (error){
      // If there's an error, send an error response
      console.error(`Error fetching posts: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create a route and a handler for POST /posts
  app.post('/posts', (req, res) => {
    // To handle the request body, we need to use a middleware called express.json
    // This middleware parses the request body as JSON and adds it to the req object
    app.use(express.json());

    // Get the data from the request body
    const data = req.body;

    // Validate the data
    if (data.title && data.content && data.author) {
      // If the data is valid, create a new post object with a new id
      const newId = posts.length + 1;
      const newPost = new Post(newId, data.title, data.content, data.author);

      // Add the new post to the posts array
      posts.push(newPost);

      // Send a 201 status code and the new post as a JSON response
      res.status(201).json(newPost);
    } else {
      // If the data is invalid, send a 400 status code and a message
      res.status(400).send('Invalid data');
    }
  });
  // Create a route and a handler for PUT /posts/:id
  app.put('/posts/:id', (req, res) => {
    // To handle the request body, we need to use the express.json middleware
    app.use(express.json());

    // Get the id parameter from the request
    const id = req.params.id;

    // Get the data from the request body
    const data = req.body;

    // Validate the data
    if (data.title && data.content && data.author) {
      // If the data is valid, find the post with the given id in the posts array
      const post = posts.find((p) => p.id == id);

      // If the post exists, update its properties with the data
      if (post) {
        post.title = data.title;
        post.content = data.content;
        post.author = data.author;

        // Send a 200 status code and the updated post as a JSON response
        res.status(200).json(post);
      } else {
        // If the post does not exist, send a 404 status code and a message
        res.status(404).send('Post not found');
      }
    } else {
      res.status(400).send('Invalid data'); 
    }
  });



  // TODO:
  // Replace the placeholder connection string below with your
  // Altas cluster specifics. Be sure it includes
  // a valid username and password! Note that in a production environment,
  // you do not want to store your password in plain-text here.
  const uri =
    "mongodb+srv://teoramites:Lalocapo1.@customers.dm758jh.mongodb.net/?retryWrites=true&w=majority&appName=Customers";

  // The MongoClient is the object that references the connection to our
  // datastore (Atlas, for example)
  const client = new MongoClient(uri);

  // The connect() method does not attempt a connection; instead it instructs
  // the driver to connect using the settings provided when a connection
  // is required.
  await client.connect();

  // Provide the name of the database and collection you want to use.
  // If the database and/or collection do not exist, the driver and Atlas
  // will create them automatically when you first write data.
  const dbName = "myDatabase";
  const collectionName = "posts";

  // Create references to the database and collection in order to run
  // operations on them.
  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  // Insert posts into MongoDB
  // try {
  //   const insertManyResult = await collection.insertMany(posts);
  //   console.log(`${insertManyResult.insertedCount} documents successfully inserted.\n`);
  // } catch (err) {
  //   console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
  // }

  //Get ALL post from MongoDB
  async function getPosts(){
    try {
      const cursor = await collection.find();
      const posteos = []
      console.log('Posts to be returned:')
      console.log();
      await cursor.forEach(post => {
        console.log(`${post.id} is ${post.title} and the content is ${post.content} and the author of the content is ${post.author}.`);
        let p = createPost(post.id, post.title, post.content, post.author)
        posteos.push(p)
      });
      console.log();
      return posteos;
    } catch (err) {
      console.error(`Something went wrong trying to find the documents: ${err}\n`);
    }
  };

  //Get post by id
  async function getPostById(id){
    const findOneQuery = { id: parseInt(id) };
    console.log('findOneQuery:', findOneQuery);
    try {
      const findOneResult = await collection.findOne(findOneQuery);
      if (findOneResult === null) {
          console.log("Couldn't find any recipes with the id provided.\n");
          return {};
        } else {
          console.log(`Post with the id provided :\n${JSON.stringify(findOneResult)}\n`);
          return createPost(findOneResult.id, findOneResult.title, findOneResult.content, findOneResult.author)
        }
    } catch (err) {
      console.error(`Something went wrong trying to find the documents: ${err}\n`);
      return {};
    }

  }


  // /*
  //  *  *** INSERT DOCUMENTS ***
  //  *
  //  * You can insert individual documents using collection.insert().
  //  * In this example, we're going to create four documents and then
  //  * insert them all in one call with collection.insertMany().
  //  */

  // const recipes = [
  //   {
  //     name: "elotes",
  //     ingredients: [
  //       "corn",
  //       "mayonnaise",
  //       "cotija cheese",
  //       "sour cream",
  //       "lime",
  //     ],
  //     prepTimeInMinutes: 35,
  //   },
  //   {
  //     name: "loco moco",
  //     ingredients: [
  //       "ground beef",
  //       "butter",
  //       "onion",
  //       "egg",
  //       "bread bun",
  //       "mushrooms",
  //     ],
  //     prepTimeInMinutes: 54,
  //   },
  //   {
  //     name: "patatas bravas",
  //     ingredients: [
  //       "potato",
  //       "tomato",
  //       "olive oil",
  //       "onion",
  //       "garlic",
  //       "paprika",
  //     ],
  //     prepTimeInMinutes: 80,
  //   },
  //   {
  //     name: "fried rice",
  //     ingredients: [
  //       "rice",
  //       "soy sauce",
  //       "egg",
  //       "onion",
  //       "pea",
  //       "carrot",
  //       "sesame oil",
  //     ],
  //     prepTimeInMinutes: 40,
  //   },
  // ];

  // try {
  //   const insertManyResult = await collection.insertMany(recipes);
  //   console.log(`${insertManyResult.insertedCount} documents successfully inserted.\n`);
  // } catch (err) {
  //   console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
  // }

  // const oneRecipe = {
  //   name: 'Asado',
  //   ingredients: [
  //     "chorizo",
  //     "morcilla",
  //     "matambrito de cerdo",
  //     'costillar',
  //     "vacio"
  //   ],
  //   prepTimeInMinutes: 90,
  // };
  // try{
  //   const insertOneResult = await collection.insert(oneRecipe)
  //   console.log(`${oneRecipe.name} successfully inserted.\n`);
  // } catch (err) {
  //   console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
  // }

  // /*
  //  * *** FIND DOCUMENTS ***
  //  *
  //  * Now that we have data in Atlas, we can read it. To retrieve all of
  //  * the data in a collection, we call Find() with an empty filter.
  //  * The Builders class is very helpful when building complex
  //  * filters, and is used here to show its most basic use.
  //  */

  // const findQuery = { prepTimeInMinutes: { $lt: 45 } };

  // try {
  //   const cursor = await collection.find(findQuery).sort({ name: 1 });
  //   await cursor.forEach(recipe => {
  //     console.log(`${recipe.name} has ${recipe.ingredients.length} ingredients and takes ${recipe.prepTimeInMinutes} minutes to make.`);
  //   });
  //   // add a linebreak
  //   console.log();
  // } catch (err) {
  //   console.error(`Something went wrong trying to find the documents: ${err}\n`);
  // }

  // // We can also find a single document. Let's find the first document
  // // that has the string "potato" in the ingredients list.
  // const findOneQuery = { ingredients: "potato" };

  // try {
  //   const findOneResult = await collection.findOne(findOneQuery);
  //   if (findOneResult === null) {
  //     console.log("Couldn't find any recipes that contain 'potato' as an ingredient.\n");
  //   } else {
  //     console.log(`Found a recipe with 'potato' as an ingredient:\n${JSON.stringify(findOneResult)}\n`);
  //   }
  // } catch (err) {
  //   console.error(`Something went wrong trying to find one document: ${err}\n`);
  // }

  // /*
  //  * *** UPDATE A DOCUMENT ***
  //  *
  //  * You can update a single document or multiple documents in a single call.
  //  *
  //  * Here we update the PrepTimeInMinutes value on the document we
  //  * just found.
  //  */
  // const updateDoc = { $set: { prepTimeInMinutes: 72 } };

  // // The following updateOptions document specifies that we want the *updated*
  // // document to be returned. By default, we get the document as it was *before*
  // // the update.
  // const updateOptions = { returnOriginal: false };

  // try {
  //   const updateResult = await collection.findOneAndUpdate(
  //     findOneQuery,
  //     updateDoc,
  //     updateOptions,
  //   );
  //   console.log(`Here is the updated document:\n${JSON.stringify(updateResult.value)}\n`);
  // } catch (err) {
  //   console.error(`Something went wrong trying to update one document: ${err}\n`);
  // }

  // /*      *** DELETE DOCUMENTS ***
  //  *
  //  *      As with other CRUD methods, you can delete a single document
  //  *      or all documents that match a specified filter. To delete all
  //  *      of the documents in a collection, pass an empty filter to
  //  *      the DeleteMany() method. In this example, we'll delete two of
  //  *      the recipes.
  //  */


  // const deleteQuery = { name: { $in: ["elotes", "fried rice"] } };
  // try {
  //   const deleteResult = await collection.deleteMany(deleteQuery);
  //   console.log(`Deleted ${deleteResult.deletedCount} documents\n`);
  // } catch (err) {
  //   console.error(`Something went wrong trying to delete documents: ${err}\n`);
  // }

  // // Make sure to call close() on your client to perform cleanup operations
  // await client.close();
}
run().catch(console.dir);
