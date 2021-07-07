'use strict';

const multishopActionsService = require('./permissions/actions');
const sectionsBuilderService = require('./permissions/sections-builder');
const engineService = require('./permissions/engine');

module.exports = {
  actions: multishopActionsService,
  sectionsBuilder: sectionsBuilderService,
  engine: engineService,
};
