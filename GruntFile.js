module.exports = function(grunt){
	grunt.initConfig({
		connect: {
			server:{
				options: {
					hostname:'localhost',
                    port: 9001,
                    keepalive: true,
                    open: true
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-connect');

    // Start web server
    grunt.registerTask('default', ['connect:server']);
}