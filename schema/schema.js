// tell GraphQL what the data looks like

const graphql = require("graphql");
const axios = require('axios')
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType, // our custom type; above type is used
      resolve(parentValue, args) { // parentValue returns the user object; resolve returns a ref to another piece of data like company in this case
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(res => res.data)
      }
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: { // query for a user first
      //the field for when we make queries with GraphiQL
      type: UserType, // the root query asks for the above defined UserType
      args: { id: { type: GraphQLString } }, //the arg we must specify when we make queries with GraphiQL
      resolve(parentValue, args) { //resolve auto handles Promises
        //fetch data from 3rd party API
        return axios.get(`http://localhost:3000/users/${args.id}`) // args.id will be provided to the query when the query is made
          .then(resp => resp.data)
      }
    },
    company: { // query for a company first
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data)
      }
    }
  }
});

module.exports = new GraphQLSchema({
  //GraphQLSchema Instance exported for use by other parts in our app
  query: RootQuery
});
