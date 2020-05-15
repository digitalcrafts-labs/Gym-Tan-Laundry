'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users',[
      {
      username: 'sally98',
      email: 'sally98@gmail.com',
      password:'HASH-HERE',
      bio: 'Im a huge fan of rock music. Love making playlists for the beach'
    },
    {
      username: 'johnny89',
      email: 'johnny89@yahoo.com',
      password: 'HASH-HERE',
      bio: 'I like long walks on the beach, and a killer Tan-playlist'
    },
    {
      username: 'sar97',
      email: 'sara97@aol.com',
      password: 'HASH-HERE',
      bio: 'You guys dont even know'
    }
  ])
    
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
  },

  down: (queryInterface, Sequelize) => {


    return queryInterface.bulkDelete('Users', null, {});
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
