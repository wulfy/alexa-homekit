module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    lambda_package: {
        default: {
        }
    },
  });
  
  grunt.loadNpmTasks('grunt-aws-lambda-package');
 
  grunt.registerTask('package', ['lambda_package']); 
};