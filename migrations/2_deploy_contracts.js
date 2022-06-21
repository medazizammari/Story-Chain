var Storychain = artifacts.require("./Storychain.sol");

module.exports = function (deployer) {
  deployer.deploy(Storychain);
};
