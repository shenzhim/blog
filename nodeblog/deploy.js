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

// tar
var tarScript = 'tar czvf ./nodeblog.tar.gz ../nodeblog';
log(tarScript);
exec(tarScript);

rl.question('请输入用户名: ', (user) => {
	rl.question('请输入服务器ip: ', (ip) => {
		var scpScript = `sudo scp ./nodeblog.tar.gz ${user}@${ip}:/home/shenzm/nodeblog/blog/`;
		log(scpScript);

		exec(scpScript);
		rl.close();
	});	
});

