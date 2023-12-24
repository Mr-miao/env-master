import ace from 'ace-builds';

import modeBatchfileUrl from 'ace-builds/src-noconflict/mode-batchfile?url';
ace.config.setModuleUrl('ace/mode/batchfile', modeBatchfileUrl);

import themeGithubUrl from 'ace-builds/src-noconflict/theme-github?url';
ace.config.setModuleUrl('ace/theme/github', themeGithubUrl);

import 'ace-builds/src-noconflict/ext-language_tools';
ace.require("ace/ext/language_tools");
