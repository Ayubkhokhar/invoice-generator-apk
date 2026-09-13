const { spawn } = require('child_process');

const env = Object.assign({}, process.env, {
  JAVA_HOME: 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot',
  PATH: 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot\\bin;' + process.env.PATH
});

const args = ['platforms;android-36'];

console.log('Installing:', args);

const p = spawn('C:\\Android\\sdk\\cmdline-tools\\latest\\bin\\sdkmanager.bat', args, {
  env: env,
  shell: true
});

p.stdout.on('data', (d) => process.stdout.write(d));
p.stderr.on('data', (d) => process.stderr.write(d));

p.on('close', (code) => {
  console.log('Finished with code:', code);
});
