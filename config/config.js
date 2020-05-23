require('dotenv').config();

module.exports = 
{
  development: {
    /* username: "postgres",
    password: "postgres", */
    use_env_variable: "LOCAL_DB",
    dialect: "postgres",
    operatorsAliases: false
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false
  },
  production: {
   use_env_variable: "DATABASE_URL",
   dialect: "postgres"
  }
}
