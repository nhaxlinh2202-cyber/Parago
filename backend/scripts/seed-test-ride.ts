import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const driver = await prisma.user.findFirst();
  const passenger = await prisma.user.findFirst({ where: { id: { not: driver?.id } } });

  if (!driver || !passenger) {
    console.log('Need at least 2 users');
    return;
  }

  const ride = await prisma.ride.create({
    data: {
      driverId: driver.id,
      pickupLocation: 'Hồ Gươm, Hà Nội',
      destinationLocation: 'ĐH Bách Khoa',
      departureAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      seatsAvailable: 4,
      vehicleType: 'car',
      mode: 'GAS_TIP',
      price: 15000,
      passengers: {
        create: {
          passengerId: passenger.id,
          status: 'ACCEPTED'
        }
      }
    }
  });

  console.log('Created test ride with passenger:', ride.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
