/*!
 * (c) 2016 ExpBytes Software
 * Licensed under the MIT license. See LICENSE file in the project root for full license information.
 */

'use strict';

var glob = require('glob');
var path = require('path');
var slug = require('slug');
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({

  constructor: function() {

    // call the super constructor
    yeoman.Base.apply(this, arguments);

  },

  prompting: function() {

    var done = this.async();

    this.prompt([
      {
        name: 'name',
        message: 'What\'s the name of your new application?',
        default: this.appname
      },
      {
        name: 'desc',
        message: 'What\'s the description of yout new application?',
        default: 'Some application called '+ this.appname
      }
    ], function(answers) {

      this.longName = answers.name;
      this.slugName = slug(this.longName);
      this.desc = answers.desc;

      done();

    }.bind(this))

  },

  configuring: function() {
    this.log('Saving configuration ...');
    this.config.save();
  },

  writing: function() {
    this.log('Writing to: ' + this.destinationRoot() + ' ...');

    var templateOptions = {
      longName: this.longName,
      desc: this.desc,
      slugName: this.slugName
    };

    this.fs.copy(
      this.templatePath('__bowerrc'),
      this.destinationPath('.bowerrc')
    );

    this.fs.copy(
      this.templatePath('__gitignore'),
      this.destinationPath('.gitignore')
    );

    this.fs.copyTpl(
      this.templatePath('_bower.json'),
      this.destinationPath('bower.json'),
      templateOptions
    );

    this.fs.copyTpl(
      this.templatePath('_gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      templateOptions
    );

    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      templateOptions
    );

    this._processDirectory('src/', templateOptions);
  },

  install: function() {

    this.log('Installing dependencies ...');

    this.installDependencies();
  },

  _processDirectory: function(sourceDir, templateOptions) {
    var files = glob.sync('**', {
      cwd: this.templatePath(sourceDir),
      dot: true,
      nodir: true
    });

    for (var i = 0, c = files.length; i < c; i++) {
      var f = sourceDir + files[i];
      var src = this.templatePath(f);
      var dest = this.destinationPath(path.join(path.dirname(f),
          path.basename(f).replace(/^_/, '')));

      if (path.basename(f).indexOf('_') == 0) {
        this.fs.copyTpl(
          src,
          dest,
          templateOptions
        );
      } else {
        this.fs.copy(
          src,
          dest
        );
      }
    }
  }

});
