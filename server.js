// all Express logic
const express = require("express");
const expressGraphQL = require("express-graphql"); //glue layer b/n express & GraphQL
const schema = require("./schema/schema");

const app = express();

app.use(
  // use GraphQL as middleware
  "/graphql",
  expressGraphQL({
    schema,
    //tell the Express app that any request asking for "/graphql" we want graphql to handle
    graphiql: true // dev tool allowing us to make queries against our dev server
  })
);

app.listen(4000, () => {
  console.log("Listening");
});
