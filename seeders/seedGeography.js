const mongoose = require('mongoose');
const geographyModel = require('../models/geography');
const geopaphyData = require('../data/geography.json');

// เรียกใช้ที่ Server.js ด้วย
// node server.js ที่เทอร์มินอลด้วยคำสั่งนี้จะทำให้ seeding เกิดขึ้นทันทีหลังจากเชื่อมต่อ MongoDB สำเร็จแล้ว

const seedGrepgraphy = async () => {
    try {
        await geographyModel.deleteMany({});
        await geographyModel.insertMany(geopaphyData);
        console.log(`Geography data seeded สำเร็จแล้วน่ะจ๊ะ! จำนวนที่เพิ่มคือ ${geopaphyData.length} records.`);
        //ทำให้ Server ดับ
        //process.exit(0);
    }catch (error) {
        console.error('Error seeding geography data:', error);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB, starting seeding...');
    seedGrepgraphy();
});