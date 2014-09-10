'use strict';
var SERVER_PORT = 9000;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};
var ngrok = require('ngrok');

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        concurrent: {
            watch: ['watch:livereload', 'watch:stylus']
        },
        watch: {
            options: {
                nospawn: true
            },
            stylus: {
                files: [
                    '<%= yeoman.app %>/assets/css/**/*.styl'
                ],
                tasks: ['stylus:dev','autoprefixer:main']
            }
        },
        browserSync: {
            server: {
                bsFiles: {
                    src : [
                        '<%= yeoman.app %>/*.html',
                        '{.tmp,<%= yeoman.app %>}/assets/css/{,*/}*.css',
                        '{.tmp,<%= yeoman.app %>}/assets/js/{,*/}*.js',
                        '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.app %>/assets/js/templates/*.{ejs,mustache,hbs}'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: ['.tmp', yeomanConfig.app]
                    },
                    injectChanges: true
                }
            }
        },
        connect: {
            options: {
                port: grunt.option('port') || SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            app: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            },
            test: {
                path: 'http://localhost:<%= connect.test.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/assets/js/{,*/}*.js',
                '!<%= yeoman.app %>/assets/js/vendor/*'
            ]
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%= yeoman.app %>/assets/js',
                    optimize: 'none',
                    paths: {
                        'templates': '../../../.tmp/assets/js/templates',
                        'jquery': '../../../<%= yeoman.app %>/bower_components/jquery/dist/jquery',
                        'underscore': '../../../<%= yeoman.app %>/bower_components/lodash/dist/lodash',
                        'backbone': '../../../<%= yeoman.app %>/bower_components/backbone/backbone'
                    },
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/assets/css/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/assets/css/main.css': [
                        '.tmp/assets/css/{,*/}*.css',
                        '<%= yeoman.app %>/assets/css/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
//                    processScripts: ['text/template'],
//                    removeComments: true,
//                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'assets/i/{,*/}*.{webp,gif,svg}',
                        'assets/fonts/{,*/}*.*',
                        'assets/vendor/{,*/}*.*',
                    ]
                }]
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/assets/js/app.js'
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/assets/js/{,*/}*.js',
                        '<%= yeoman.dist %>/assets/css/{,*/}*.css',
                        '<%= yeoman.dist %>/assets/i/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '/assets/fonts/{,*/}*.*',
                    ]
                }
            }
        },

        stylus: {
            dev: {
                options: {
                    compress: false
                },
                files: {
                    '.tmp/assets/css/main.css': 'app/assets/css/main.styl'
                }
            }
        },
        autoprefixer: {
            main: {
                src: '.tmp/assets/css/main.css',
                dest: '.tmp/assets/css/main.css'
            }
        }
    });

    grunt.registerTask('serve-web', 'Run ngork proxy', function () {
        var port = grunt.config.get('connect.options.port');

        grunt.task.run('connect:app:keepalive');

        ngrok.connect(port, function (err, url) {
            if (err !== null) {
                grunt.fail.fatal(err);
            }

            console.log('Public url: ' + url);
        });
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:server', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'stylus:dev',
            'autoprefixer:main',
            'browserSync:server',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'stylus:dev',
        'autoprefixer:main',
        'useminPrepare',
        'requirejs',
        'imagemin',
        'htmlmin',
        'concat',
        'cssmin',
        'uglify',
        'copy',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'stylus:dev',
        'autoprefixer:main',
        'jshint',
        'build'
    ]);
};
