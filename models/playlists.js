'use strict';
module.exports = (sequelize, DataTypes) => {
  const Playlists = sequelize.define('Playlists', {
    playlistID: DataTypes.STRING,
    userID: DataTypes.INTEGER
  }, {});
  Playlists.associate = function(models) {
    Playlists.belongsTo(models.Users, {foreignKey: 'userID'})
    // associations can be defined here
  };
  return Playlists;
};