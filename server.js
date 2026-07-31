const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing (CORS) কনফিগারেশন
const io = new Server(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// public ফোল্ডারের ফাইলগুলোকে স্ট্যাটিক হিসেবে পরিবেশন করা
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('একটি নতুন ডিভাইস যুক্ত হয়েছে:', socket.id);

    // সিসি ক্যামেরা রেজিস্ট্রেশন
    socket.on('register-camera', (roomId) => {
        socket.join(roomId);
        console.log(`ক্যামেরা রেডি, রুম আইডি: ${roomId}`);
    });

    // ভিউয়ার/মনিটর যুক্ত হলে
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`ভিউয়ার যুক্ত হয়েছে রুম আইডি: ${roomId}`);
        socket.to(roomId).emit('viewer-joined', socket.id);
    });

    // WebRTC সিগন্যালিং আদান-প্রদান (P2P কানেকশনের জন্য)
    socket.on('signal', (data) => {
        io.to(data.target).emit('signal', {
            sender: socket.id,
            signal: data.signal
        });
    });

    socket.on('disconnect', () => {
        console.log('ডিভাইস ডিসকানেক্ট হয়েছে:', socket.id);
    });
});

// Render বা অন্যান্য অনলাইন ক্লাউড হোস্টের এনভায়রনমেন্ট পোর্ট ব্যবহার করা
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`==============================================`);
    console.log(`🚀 CCTV সার্ভার সফলভাবে চালু হয়েছে! Port: ${PORT}`);
    console.log(`==============================================`);
});