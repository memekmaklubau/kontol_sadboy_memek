const http = require('http');
const url = require('url');
const fs = require('fs');
const { spawn } = require('child_process');
const chalk = require('chalk');

let runningProcesses = [];

const server = http.createServer((req, res) => {
  const queryObject = url.parse(req.url, true).query;

  if (req.url.startsWith('/api') && queryObject.command) {
    const commandString = queryObject.command.split('+').join(' ');

    // Memeriksa jika perintah adalah "refresh"
    if (commandString === 'refresh') {
      // Menghentikan semua proses yang sedang berjalan
      runningProcesses.forEach(proc => {
        proc.kill();
      });
      runningProcesses = []; // Mengosongkan array proses yang berjalan
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Berhasil me-refresh server' }));
      return;
    }

    // Menjalankan perintah lain dengan child process
    const child = spawn('sh', ['-c', commandString]);

    // Menambahkan child process ke dalam array runningProcesses
    runningProcesses.push(child);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `Menjalankan perintah: ${commandString}` }));

    // Event handler saat child process selesai
    child.on('close', (code) => {
      // Menghapus child process dari array runningProcesses
      runningProcesses = runningProcesses.filter(proc => proc.pid !== child.pid);
    });

    // Event handler jika ada error saat memulai child process
    child.on('error', (err) => {
      console.error(`Gagal memulai proses: ${err.message}`);
    });

  } else {
    // Merespons jika permintaan tidak valid
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Permintaan tidak valid' }));
  }
});

// Menjalankan server pada port 3000
server.listen(3000, () => {
  console.log('Server berjalan di port 3000');
});

// File watcher untuk memantau perubahan pada file skrip server
const file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file); // Menghentikan pemantauan file
  console.log(chalk.redBright(`Memperbarui ${__filename}`));
  delete require.cache[file]; // Menghapus cache modul dari file
  require(file); // Memuat ulang skrip server setelah perubahan
});
