// tell GraphQL what the data looks like

const graphql = require("graphql");
const axios = require("axios");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType), // tells GraphQL multiple users will be associated with the company
      resolve(parentValue, args) {
        return axios //as alternative we can directly query a MongoDB with User.findById(args.id) etc.
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then(res => res.data);
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType, // our custom type; above type is used
      resolve(parentValue, args) {
        // parentValue returns the user object; resolve returns a ref to another piece of data like company in this case
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(res => res.data);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      // query for a user first
      //the field for when we make queries with GraphiQL
      type: UserType, // the root query asks for the above defined UserType
      args: { id: { type: GraphQLString } }, //the arg we must specify when we make queries with GraphiQL
      resolve(parentValue, args) {
        //resolve auto handles Promises
        //fetch data from 3rd party API
        return axios
          .get(`http://localhost:3000/users/${args.id}`) // args.id will be provided to the query when the query is made
          .then(resp => resp.data);
      }
    },
    company: {
      // query for a company first
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      // adds user to the users collection
      type: UserType, //returned type from resolve() --> not necessarily the same as what we work on
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) }, //required arg
        age: { type: new GraphQLNonNull(GraphQLInt) }, //required arg
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios.post('http://localhost:3000/users', {...args})
          .then(res => res.data)
      }
    },
    deleteUser: {
      // deletes user from the users collection
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        return axios.delete(`http://localhost:3000/users/${args.id}`)
          .then(res => res.data)
      }
    },
    editUser: {
      // edits user in the users collection
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args) //the id of the user will not be updated by the API!
          .then(res => res.data)
      }
    }
  }
});

module.exports = new GraphQLSchema({
  //GraphQLSchema Instance exported for use by other parts in our app
  query: RootQuery,
  mutation   //add the mutation Root Type to the GraphQL Schema --> appears in GraphiQL Docs
});
