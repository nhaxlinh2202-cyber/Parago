import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 0. Bootstrap Admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin Parago';

  if (adminEmail && adminPassword) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPassword, salt);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        systemRole: 'ADMIN',
        // In case password changed in env
        passwordHash: hash,
      },
      create: {
        name: adminName,
        email: adminEmail,
        passwordHash: hash,
        university: 'Parago HQ',
        faculty: 'Administration',
        verified: true,
        systemRole: 'ADMIN',
      }
    });
    console.log(`Admin account seeded: ${adminEmail}`);
  } else {
    console.log('Skipping Admin bootstrap: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
  }

  // 1. Seed Users
  const user1 = await prisma.user.upsert({
    where: { email: 'u1@hust.edu.vn' },
    update: {},
    create: {
      id: 'u1',
      name: 'Nguyễn Minh Anh',
      email: 'u1@hust.edu.vn',
      passwordHash: '$2b$10$xyz', // mock hash
      university: 'ĐH Bách Khoa Hà Nội',
      faculty: 'Công nghệ Thực phẩm',
      rating: 4.9,
      totalRides: 127,
      verified: true,
      isPremium: true,
      isDriver: true,
      trustScore: 95,
      ecoPoints: 2450,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'u2@hust.edu.vn' },
    update: {},
    create: {
      id: 'u2',
      name: 'Trần Đức Huy',
      email: 'u2@hust.edu.vn',
      passwordHash: '$2b$10$xyz',
      university: 'ĐH Bách Khoa Hà Nội',
      faculty: 'CNTT',
      rating: 4.8,
      totalRides: 89,
      verified: true,
      isPremium: false,
      isDriver: true,
      trustScore: 92,
      ecoPoints: 1800,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'u3@hust.edu.vn' },
    update: {},
    create: {
      id: 'u3',
      name: 'Lê Thị Hương',
      email: 'u3@hust.edu.vn',
      passwordHash: '$2b$10$xyz',
      university: 'ĐH Bách Khoa Hà Nội',
      faculty: 'Kinh tế',
      rating: 4.7,
      totalRides: 45,
      verified: true,
      isPremium: false,
      isDriver: false,
      trustScore: 88,
      ecoPoints: 960,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'u4@vnu.edu.vn' },
    update: {},
    create: {
      id: 'u4',
      name: 'Phạm Văn Đức',
      email: 'u4@vnu.edu.vn',
      passwordHash: '$2b$10$xyz',
      university: 'ĐH Quốc Gia Hà Nội',
      faculty: 'Luật',
      rating: 4.6,
      totalRides: 34,
      verified: true,
      isPremium: true,
      isDriver: true,
      trustScore: 85,
      ecoPoints: 720,
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'u5@hust.edu.vn' },
    update: {},
    create: {
      id: 'u5',
      name: 'Hoàng Thị Mai',
      email: 'u5@hust.edu.vn',
      passwordHash: '$2b$10$xyz',
      university: 'ĐH Bách Khoa Hà Nội',
      faculty: 'Sinh học',
      rating: 5.0,
      totalRides: 67,
      verified: true,
      isPremium: false,
      isDriver: false,
      trustScore: 98,
      ecoPoints: 1540,
    },
  });

  // Helper to create departure date
  const createDate = (daysOffset: number, timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // 2. Seed Rides
  const ride1 = await prisma.ride.upsert({
    where: { id: 'r1' },
    update: {},
    create: {
      id: 'r1',
      driverId: 'u2',
      pickupLocation: 'KTX Bách Khoa, Hai Bà Trưng, Hà Nội',
      destinationLocation: 'Đại học Bách Khoa Hà Nội, Đống Đa',
      departureAt: createDate(0, '07:30'),
      seatsAvailable: 2,
      price: 0,
      vehicleType: 'car',
      vehicleName: 'Toyota Vios 2022',
      mode: 'COMMUNITY',
      status: 'ACTIVE',
      genderPreference: 'any',
    },
  });

  const ride2 = await prisma.ride.upsert({
    where: { id: 'r2' },
    update: {},
    create: {
      id: 'r2',
      driverId: 'u4',
      pickupLocation: 'Cầu Giấy, Hà Nội',
      destinationLocation: 'ĐH Quốc Gia Hà Nội, Xuân Thủy',
      departureAt: createDate(0, '08:00'),
      seatsAvailable: 1,
      price: 15000,
      vehicleType: 'motorcycle',
      mode: 'GAS_TIP',
      status: 'ACTIVE',
      genderPreference: 'any',
    },
  });

  const ride3 = await prisma.ride.upsert({
    where: { id: 'r3' },
    update: {},
    create: {
      id: 'r3',
      driverId: 'u1',
      pickupLocation: 'Times City, Hai Bà Trưng',
      destinationLocation: 'ĐH Bách Khoa Hà Nội',
      departureAt: createDate(1, '06:45'),
      seatsAvailable: 3,
      price: 10000,
      vehicleType: 'car',
      vehicleName: 'Honda City 2023',
      mode: 'GAS_TIP',
      status: 'ACTIVE',
      genderPreference: 'any',
    },
  });

  const ride4 = await prisma.ride.upsert({
    where: { id: 'r4' },
    update: {},
    create: {
      id: 'r4',
      driverId: 'u5',
      pickupLocation: 'Thanh Xuân, Hà Nội',
      destinationLocation: 'ĐH Bách Khoa Hà Nội',
      departureAt: createDate(0, '07:15'),
      seatsAvailable: 1,
      price: 0,
      vehicleType: 'motorcycle',
      mode: 'COMMUNITY',
      status: 'ACTIVE',
      genderPreference: 'female',
    },
  });

  const ride5 = await prisma.ride.upsert({
    where: { id: 'r5' },
    update: {},
    create: {
      id: 'r5',
      driverId: 'u2',
      pickupLocation: 'Hà Đông, Hà Nội',
      destinationLocation: 'ĐH Bách Khoa Hà Nội',
      departureAt: createDate(0, '07:00'),
      seatsAvailable: 1,
      price: 20000,
      vehicleType: 'car',
      vehicleName: 'Mazda 3 2023',
      mode: 'GAS_TIP',
      status: 'ACTIVE',
      genderPreference: 'any',
    },
  });

  // 3. Seed Passengers
  await prisma.ridePassenger.upsert({
    where: { rideId_passengerId: { rideId: 'r1', passengerId: 'u3' } },
    update: {},
    create: { rideId: 'r1', passengerId: 'u3', status: 'ACCEPTED' },
  });
  await prisma.ridePassenger.upsert({
    where: { rideId_passengerId: { rideId: 'r5', passengerId: 'u3' } },
    update: {},
    create: { rideId: 'r5', passengerId: 'u3', status: 'ACCEPTED' },
  });
  await prisma.ridePassenger.upsert({
    where: { rideId_passengerId: { rideId: 'r5', passengerId: 'u5' } },
    update: {},
    create: { rideId: 'r5', passengerId: 'u5', status: 'ACCEPTED' },
  });

  // 4. Seed Conversations
  const c1 = await prisma.conversation.upsert({
    where: { id: 'c1' },
    update: {},
    create: { id: 'c1', rideId: 'r1' },
  });

  await prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: 'c1', userId: 'u1' } },
    update: {},
    create: { conversationId: 'c1', userId: 'u1' },
  });
  await prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: 'c1', userId: 'u2' } },
    update: {},
    create: { conversationId: 'c1', userId: 'u2' },
  });

  // 5. Seed Messages
  await prisma.message.upsert({
    where: { id: 'm1' },
    update: {},
    create: { id: 'm1', conversationId: 'c1', senderId: 'u2', text: 'Chào bạn! Mình đang tìm người đi chung', isRead: true },
  });
  await prisma.message.upsert({
    where: { id: 'm2' },
    update: {},
    create: { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'Chào bạn! Mình cũng đi tuyến đó', isRead: true },
  });
  await prisma.message.upsert({
    where: { id: 'm3' },
    update: {},
    create: { id: 'm3', conversationId: 'c1', senderId: 'u2', text: 'Tuyệt vời! Mình đi xe gì vậy bạn?', isRead: true },
  });
  await prisma.message.upsert({
    where: { id: 'm4' },
    update: {},
    create: { id: 'm4', conversationId: 'c1', senderId: 'u1', text: 'Mình đi Toyota Vios 🚗', isRead: true },
  });
  await prisma.message.upsert({
    where: { id: 'm5' },
    update: {},
    create: { id: 'm5', conversationId: 'c1', senderId: 'u2', text: 'Ok bạn, 7:30 mình đón nhé!', isRead: false },
  });
  await prisma.message.upsert({
    where: { id: 'm6' },
    update: {},
    create: { id: 'm6', conversationId: 'c1', senderId: null, text: '⚠️ Không chia sẻ số điện thoại cá nhân', type: 'system', isRead: true },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
