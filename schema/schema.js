// tell GraphQL what the data looks like

const graphql = require("graphql");
const _ = require("lodash");
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const users = [
  // use hard coded data for now
  { id: "23", firstName: "Bill", age: 20 },
  { id: "47", firstName: "Samantha", age: 21 }
];

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType, // the root query asks for the above defined UserType
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        //grabs the data from the DB
        return _.find(users, { id: args.id }); // args.id will be provided to the query when the query is made
      }
    }
  }
});

module.exports = new GraphQLSchema({ //GraphQLSchema Instance exported for use by other parts in our app
  query: RootQuery
})
