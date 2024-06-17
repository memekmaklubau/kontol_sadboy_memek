const http = require('http');
const fs = require("fs)
const url = require('url');
const { spawn } = require('child_process');

let runningProcesses = [];

const server = http.createServer((req, res) => {
  const queryObject = url.parse(req.url, true).query;

  if (req.url.startsWith('/api') && queryObject.command) {
    const commandString = queryObject.command.split('+').join(' ');

    if (commandString === 'refresh') {
      runningProcesses.forEach(proc => {
        proc.kill();
      });
      runningProcesses = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Successfully Refreshing Server' }));
      return;
    }

    const child = spawn('sh', ['-c', commandString]);

    runningProcesses.push(child);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Executing: ${commandString}` }));

    child.on('close', (code) => {
      runningProcesses = runningProcesses.filter(proc => proc.pid !== child.pid);
    });

    child.on('error', (err) => {
      console.error(`Failed to start process: ${err.message}`);
    });

  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid request' }));
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})

