// tell GraphQL what the data looks like

const graphql = require("graphql");
const axios = require('axios')
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

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
      //the field for when we make queries with GraphiQL
      type: UserType, // the root query asks for the above defined UserType
      args: { id: { type: GraphQLString } }, //the arg we specify for when we make queries with GraphiQL
      resolve(parentValue, args) { //resolve auto handles Promises
        //fetch data from 3rd party API
        return axios.get(`http://localhost:3000/users/${args.id}`) // args.id will be provided to the query when the query is made
          .then(resp => resp.data)
      }
    }
  }
});

module.exports = new GraphQLSchema({
  //GraphQLSchema Instance exported for use by other parts in our app
  query: RootQuery
});
