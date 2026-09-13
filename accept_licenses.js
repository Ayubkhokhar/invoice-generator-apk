const { spawn } = require('child_process');

const env = Object.assign({}, process.env, {
  JAVA_HOME: 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot',
  PATH: 'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.20.101-hotspot\\bin;' + process.env.PATH
});

const p = spawn('C:\\Android\\sdk\\cmdline-tools\\latest\\bin\\sdkmanager.bat', ['--licenses'], {
  env: env,
  shell: true
});

p.stdout.on('data', (d) => {
  const s = d.toString();
  process.stdout.write(s);
  if (s.includes('(y/N)?') || s.includes('?')) {
    p.stdin.write('y\n');
  }
});

p.stderr.on('data', (d) => process.stderr.write(d));

p.on('close', (code) => {
  console.log('Licenses process exited with code:', code);
});
