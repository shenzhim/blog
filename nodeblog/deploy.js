require('shelljs/global');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(script) {
	console.log(`<=======script: ${script}=======>`)
}

// build
var buildScript = 'npm run build';
log(buildScript);
exec(buildScript);

// copy wx.txt to dist
exec('cp ./public/MP_verify_tjeBVjCbW6jU8XJW.txt ./public/dist/');

// tar xzvf ./nodeblog.tar.gz
var tarScript = 'tar czvf ./nodeblog.tar.gz ../nodeblog';
log(tarScript);
exec(tarScript);

rl.question('请输入用户名: ', (user) => {
	rl.question('请输入服务器ip: ', (ip) => {
		rl.question('请输入路径: ', (path) => {
			var scpScript = `sudo scp ./nodeblog.tar.gz ${user}@${ip}:${path}`;
			log(scpScript);

			exec(scpScript);
			rl.close();
		});
	});	
});

