'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    bio: DataTypes.TEXT
  }, {
    timestamps: false
  });
  Users.associate = function(models) {
    Users.hasMany(models.Playlists)
    // associations can be defined here
  };
  return Users;
};