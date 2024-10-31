fx_version 'cerulean'

game 'gta5'

author 'JACK'

description 'Thermite minigame match3 style'

version '1.0.0'

lua54 'yes'

License 'GPL4.0'

client_scripts {
	'client.lua'
}

ui_page 'html/index.html'

files {
	'html/index.html',
	'html/styles/*.css',
	'html/js/*.js',
	'html/assets/*.*',
}

escrow_ignore {
	'**/**'
}

